/**
 * Reminder Service for RuralCare
 * 
 * Centralized Automated Scheduler for:
 * 1. Medication Reminders (based on dosage times & active date range)
 * 2. Appointment Reminders (24-hour advance notice window)
 * 
 * Strict Scope: Backend Member 3
 * Reuses: `notificationService.js`, `twilioService.js`
 * Prevents duplicates via `ReminderLog` and in-memory registry.
 */

const cron = require("node-cron");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const ReminderLog = require("../models/ReminderLog");
const {
  sendMedicationReminder,
  sendAppointmentNotification,
} = require("./notificationService");

const TIMEZONE = "Asia/Kolkata";

// In-memory fallback registry to guarantee duplicate prevention even in offline/stateless mode
const inMemoryReminderSet = new Set();

/**
 * Returns Indian Standard Time (IST) date details
 */
function getISTDetails(date = new Date()) {
  const d = new Date(date);
  
  // Format into Asia/Kolkata string
  const istFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = istFormatter.formatToParts(d);
  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = partMap.year;
  const month = partMap.month;
  const day = partMap.day;
  const hour = parseInt(partMap.hour || "0", 10);
  const minute = parseInt(partMap.minute || "0", 10);

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  // Determine period slot
  let slot = "Morning";
  if (hour >= 5 && hour < 12) {
    slot = "Morning";
  } else if (hour >= 12 && hour < 17) {
    slot = "Afternoon";
  } else if (hour >= 17 && hour < 21) {
    slot = "Evening";
  } else {
    slot = "Night";
  }

  return {
    date: d,
    year,
    month,
    day,
    hour,
    minute,
    dateStr,
    timeStr,
    slot,
  };
}

/**
 * Matches medication `times` array with the current IST slot / time
 * Supports: ["Morning", "Night"], ["08:00", "20:00"], ["Morning", "Afternoon", "Evening", "Night"]
 */
function isMedicationDue(timesArray, istDetails) {
  if (!Array.isArray(timesArray) || timesArray.length === 0) {
    // If no specific times are provided, default to due in Morning slot
    return istDetails.slot === "Morning";
  }

  const currentSlotLower = istDetails.slot.toLowerCase();
  const currentHour = istDetails.hour;
  const currentMinute = istDetails.minute;
  const currentTotalMins = currentHour * 60 + currentMinute;

  for (const t of timesArray) {
    const timeStr = String(t).trim().toLowerCase();

    // 1. Direct slot keyword match
    if (
      timeStr === currentSlotLower ||
      (currentSlotLower === "morning" && (timeStr.includes("morn") || timeStr.includes("breakfast"))) ||
      (currentSlotLower === "afternoon" && (timeStr.includes("afternoon") || timeStr.includes("noon") || timeStr.includes("lunch"))) ||
      (currentSlotLower === "evening" && (timeStr.includes("even") || timeStr.includes("dinner"))) ||
      (currentSlotLower === "night" && (timeStr.includes("night") || timeStr.includes("bed")))
    ) {
      return true;
    }

    // 2. Direct HH:MM match (within ±30 minutes window)
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const targetHour = parseInt(timeMatch[1], 10);
      const targetMin = parseInt(timeMatch[2], 10);
      const targetTotalMins = targetHour * 60 + targetMin;
      const diffMins = Math.abs(currentTotalMins - targetTotalMins);
      if (diffMins <= 30) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a reminder was already sent
 */
async function hasReminderBeenSent(reminderType, referenceId, slot, scheduledDate) {
  const memoryKey = `${reminderType}:${referenceId}:${slot}:${scheduledDate}`;
  if (inMemoryReminderSet.has(memoryKey)) {
    return true;
  }

  try {
    const existing = await ReminderLog.findOne({
      reminderType,
      referenceId: String(referenceId),
      slot,
      scheduledDate,
    });
    if (existing) {
      inMemoryReminderSet.add(memoryKey);
      return true;
    }
  } catch (err) {
    // If MongoDB query fails, rely on in-memory set
    console.warn(`[ReminderService] ReminderLog query warning:`, err.message);
  }

  return false;
}

/**
 * Records a dispatched reminder to prevent duplicate sends
 */
async function recordReminderSent(patientId, phone, reminderType, referenceId, slot, scheduledDate, result) {
  const memoryKey = `${reminderType}:${referenceId}:${slot}:${scheduledDate}`;
  inMemoryReminderSet.add(memoryKey);

  try {
    await ReminderLog.create({
      patientId: patientId || null,
      phone: String(phone),
      reminderType,
      referenceId: String(referenceId),
      slot,
      scheduledDate,
      channels: {
        whatsapp: {
          attempted: result?.whatsapp?.attempted || false,
          sent: result?.whatsapp?.sent || false,
          sid: result?.whatsapp?.sid || null,
          error: result?.whatsapp?.error || null,
        },
        sms: {
          attempted: result?.sms?.attempted || false,
          sent: result?.sms?.sent || false,
          sid: result?.sms?.sid || null,
          error: result?.sms?.error || null,
        },
      },
      status: result?.success ? "sent" : result?.partialSuccess ? "partial" : "failed",
    });
  } catch (err) {
    console.warn(`[ReminderService] ReminderLog record warning:`, err.message);
  }
}

/**
 * Process all active medication reminders for the current time
 * @param {Object} [options] - { now: Date, forceSlot: string }
 */
async function processMedicationReminders(options = {}) {
  const ist = getISTDetails(options.now || new Date());
  const activeSlot = options.forceSlot || ist.slot;
  const istDateObj = ist.date;

  console.log(`[ReminderService] Checking medication reminders for ${ist.dateStr} (Slot: ${activeSlot}, Time: ${ist.timeStr} IST)...`);

  const summary = {
    scanned: 0,
    due: 0,
    sent: 0,
    skippedDuplicates: 0,
    errors: 0,
    results: [],
  };

  try {
    // Find active medications overlapping today's date
    const medications = await Medication.find({
      active: true,
      startDate: { $lte: istDateObj },
      endDate: { $gte: new Date(istDateObj.getTime() - 24 * 60 * 60 * 1000) },
    }).populate("patientId");

    summary.scanned = medications.length;

    for (const med of medications) {
      // 1. Check date boundaries strictly
      const start = new Date(med.startDate);
      const end = new Date(med.endDate);
      // Extend end date to 23:59:59 of that day
      end.setHours(23, 59, 59, 999);

      if (istDateObj < start || istDateObj > end) {
        continue;
      }

      // 2. Check if due for current slot
      const isDue = options.forceSlot
        ? (Array.isArray(med.times) && med.times.some((t) => String(t).toLowerCase() === activeSlot.toLowerCase()))
        : isMedicationDue(med.times, ist);

      if (!isDue) {
        continue;
      }

      summary.due++;

      // 3. Resolve Patient info
      let patient = med.patientId;
      if (!patient || !patient.phone) {
        // Fallback: lookup by ID if not populated
        if (med.patientId) {
          patient = await Patient.findById(med.patientId);
        }
      }

      if (!patient || !patient.phone) {
        console.warn(`[ReminderService] Skipping medication ${med._id}: No patient phone found.`);
        continue;
      }

      // 4. Duplicate Check
      const isDuplicate = await hasReminderBeenSent(
        "medication",
        med._id,
        activeSlot,
        ist.dateStr
      );

      if (isDuplicate) {
        console.log(`[ReminderService] Duplicate prevented for medication ${med.medicineName} (${med._id}) - slot ${activeSlot} already sent.`);
        summary.skippedDuplicates++;
        continue;
      }

      // 5. Dispatch via NotificationService
      console.log(`[ReminderService] Dispatching medication reminder for ${med.medicineName} to ${patient.phone}...`);
      const notifRes = await sendMedicationReminder(patient, {
        medicineName: med.medicineName,
        dosage: med.dosage,
        times: med.times,
      });

      // 6. Record in ReminderLog
      await recordReminderSent(
        patient._id,
        patient.phone,
        "medication",
        med._id,
        activeSlot,
        ist.dateStr,
        notifRes
      );

      summary.sent++;
      summary.results.push({
        medicationId: med._id,
        medicineName: med.medicineName,
        phone: patient.phone,
        slot: activeSlot,
        notifRes,
      });
    }
  } catch (error) {
    console.error(`[ReminderService] Error processing medication reminders:`, error.message);
    summary.errors++;
  }

  console.log(`[ReminderService] Medication reminders complete: Scanned ${summary.scanned}, Due ${summary.due}, Sent ${summary.sent}, Duplicates Skipped ${summary.skippedDuplicates}`);
  return summary;
}

/**
 * Process appointment reminders (24-hour advance notice window)
 * @param {Object} [options] - { now: Date, windowHours: 24 }
 */
async function processAppointmentReminders(options = {}) {
  const ist = getISTDetails(options.now || new Date());
  const now = options.now ? new Date(options.now) : new Date();
  const windowHours = options.windowHours || 24;

  // Window: appointments scheduled between (now) and (now + 24 hours + 1 hour buffer)
  const windowStart = new Date(now.getTime());
  const windowEnd = new Date(now.getTime() + (windowHours + 1) * 60 * 60 * 1000);

  console.log(`[ReminderService] Checking appointment reminders between ${windowStart.toISOString()} and ${windowEnd.toISOString()}...`);

  const summary = {
    scanned: 0,
    due: 0,
    sent: 0,
    skippedDuplicates: 0,
    errors: 0,
    results: [],
  };

  try {
    const appointments = await Appointment.find({
      status: "scheduled",
      appointmentDate: { $gte: windowStart, $lte: windowEnd },
    })
      .populate("patientId")
      .populate("doctorId");

    summary.scanned = appointments.length;

    for (const appt of appointments) {
      summary.due++;

      // 1. Resolve Patient
      let patient = appt.patientId;
      if (!patient || !patient.phone) {
        if (appt.patientId) {
          patient = await Patient.findById(appt.patientId);
        }
      }

      if (!patient || !patient.phone) {
        console.warn(`[ReminderService] Skipping appointment ${appt._id}: No patient phone found.`);
        continue;
      }

      // 2. Resolve Doctor Name
      const doctorName =
        appt.doctorId?.name ||
        (appt.doctorId?.specialization ? `Dr. (${appt.doctorId.specialization})` : "Your Doctor");

      // 3. Duplicate Check
      // Slot key uses the appointment target date string so 1 reminder per appointment
      const apptDateDetails = getISTDetails(appt.appointmentDate);
      const slotKey = `24h-reminder-${apptDateDetails.dateStr}`;

      const isDuplicate = await hasReminderBeenSent(
        "appointment",
        appt._id,
        slotKey,
        ist.dateStr
      );

      if (isDuplicate) {
        console.log(`[ReminderService] Duplicate prevented for appointment ${appt._id} - reminder already sent.`);
        summary.skippedDuplicates++;
        continue;
      }

      // 4. Dispatch via NotificationService
      console.log(`[ReminderService] Dispatching appointment reminder for ${appt._id} to ${patient.phone}...`);
      const notifRes = await sendAppointmentNotification(patient, {
        appointmentDate: appt.appointmentDate,
        doctorName,
        reason: appt.reason,
      });

      // 5. Record in ReminderLog
      await recordReminderSent(
        patient._id,
        patient.phone,
        "appointment",
        appt._id,
        slotKey,
        ist.dateStr,
        notifRes
      );

      summary.sent++;
      summary.results.push({
        appointmentId: appt._id,
        appointmentDate: appt.appointmentDate,
        phone: patient.phone,
        doctorName,
        notifRes,
      });
    }
  } catch (error) {
    console.error(`[ReminderService] Error processing appointment reminders:`, error.message);
    summary.errors++;
  }

  console.log(`[ReminderService] Appointment reminders complete: Scanned ${summary.scanned}, Due ${summary.due}, Sent ${summary.sent}, Duplicates Skipped ${summary.skippedDuplicates}`);
  return summary;
}

/**
 * Runs both medication and appointment reminder cycles
 */
async function processAllReminders(options = {}) {
  console.log("==================================================");
  console.log("⏰ RUNNING CENTRALIZED REMINDER CYCLE");
  console.log("==================================================");

  const medResults = await processMedicationReminders(options);
  const apptResults = await processAppointmentReminders(options);

  return {
    timestamp: new Date().toISOString(),
    medications: medResults,
    appointments: apptResults,
  };
}

// ==========================================
// SCHEDULER LIFECYCLE
// ==========================================

let _scheduledTask = null;

/**
 * Initializes and starts the centralized reminder cron job
 * Runs periodically (default: every 5 minutes in Asia/Kolkata timezone)
 * @param {string} [cronPattern="* /5 * * * *"]
 */
function startReminderScheduler(cronPattern = "*/5 * * * *") {
  if (_scheduledTask) {
    console.log("[ReminderService] Scheduler is already running. Avoiding duplicate initialization.");
    return _scheduledTask;
  }

  console.log(`[ReminderService] 🚀 Starting automated reminder scheduler (Pattern: '${cronPattern}', Timezone: ${TIMEZONE})...`);

  _scheduledTask = cron.schedule(
    cronPattern,
    async () => {
      try {
        await processAllReminders();
      } catch (err) {
        console.error("[ReminderService] Unhandled error during scheduled cycle:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: TIMEZONE,
    }
  );

  return _scheduledTask;
}

/**
 * Stops the running cron scheduler (useful for graceful shutdown or test teardown)
 */
function stopReminderScheduler() {
  if (_scheduledTask) {
    _scheduledTask.stop();
    _scheduledTask = null;
    console.log("[ReminderService] ⏹️ Reminder scheduler stopped.");
  }
}

/**
 * Clears the in-memory duplicate tracker (used in unit tests)
 */
function clearInMemoryReminderCache() {
  inMemoryReminderSet.clear();
}

module.exports = {
  processMedicationReminders,
  processAppointmentReminders,
  processAllReminders,
  startReminderScheduler,
  stopReminderScheduler,
  clearInMemoryReminderCache,
  isMedicationDue,
  getISTDetails,
  hasReminderBeenSent,
  recordReminderSent,
  TIMEZONE,
};
