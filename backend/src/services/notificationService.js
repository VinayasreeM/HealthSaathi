/**
 * Notification Service for RuralCare
 * 
 * Reusable outbound notification layer for triggering patient alerts across
 * WhatsApp and SMS channels.
 * 
 * Strict Scope: Backend Member 3
 * Uses existing `twilioService.js` without creating duplicate Twilio clients.
 */

const { sendWhatsAppMessage, sendSMS } = require("./twilioService");

const SUPPORTED_LANGUAGES = new Set(["en", "hi", "te"]);
const DEFAULT_LANGUAGE = "en";

/**
 * Normalizes and extracts patient contact details
 */
function extractPatientInfo(patient) {
  if (!patient) {
    return { phone: "", language: DEFAULT_LANGUAGE, name: "Patient" };
  }

  if (typeof patient === "string") {
    return {
      phone: patient.trim(),
      language: DEFAULT_LANGUAGE,
      name: "Patient",
    };
  }

  const phone =
    patient.phone ||
    patient.phoneNumber ||
    patient.contactNumber ||
    patient.mobile ||
    "";

  const rawLang = String(patient.language || patient.preferredLanguage || "").toLowerCase().trim();
  const language = SUPPORTED_LANGUAGES.has(rawLang) ? rawLang : DEFAULT_LANGUAGE;

  const name =
    patient.name ||
    (patient.firstName ? `${patient.firstName} ${patient.lastName || ""}`.trim() : "Patient");

  return { phone: String(phone).trim(), language, name };
}

/**
 * Formats dates nicely (e.g. 15 September 2026)
 */
function formatDisplayDate(dateInput) {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats dates for concise SMS (e.g. 15 Sep 2026)
 */
function formatShortDate(dateInput) {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

// ==========================================
// 1. PRESCRIPTION NOTIFICATION TEMPLATES
// ==========================================

function buildPrescriptionWhatsApp(prescription, language) {
  const medicines = Array.isArray(prescription?.medicines)
    ? prescription.medicines
    : Array.isArray(prescription?.medications)
    ? prescription.medications
    : prescription?.medicine
    ? [{ name: prescription.medicine, dosage: prescription.dosage || "", frequency: prescription.frequency || "" }]
    : [];

  const nextVisit = formatDisplayDate(prescription?.nextVisitDate || prescription?.followUpDate);
  const doctorName = prescription?.doctorName || prescription?.doctor?.name || "";

  if (language === "te") {
    let medList = "";
    if (medicines.length > 0) {
      medList = medicines
        .map(
          (m) =>
            `💊 ఔషధం:\n${m.name || m.medicineName || "మందు"} ${m.dosage || ""}\n\n🕐 మోతాదు / సమయం:\n${m.frequency || m.instructions || "డాక్టర్ సూచించిన విధంగా"}`
        )
        .join("\n\n");
    } else {
      medList = `💊 ఔషధ వివరాలు:\nప్రిస్క్రిప్షన్ పోర్టల్ చూడండి.`;
    }

    let msg = `🏥 *RuralCare*\n\nమీ డాక్టర్ ${doctorName ? `(${doctorName}) ` : ""}మీ ప్రిస్క్రిప్షన్‌ను అప్‌డేట్ చేశారు.\n\n${medList}`;
    if (nextVisit) {
      msg += `\n\n📅 తదుపరి సంప్రదింపు తేదీ:\n${nextVisit}`;
    }
    msg += `\n\nదయచేసి మీ డాక్టర్ సూచనలను పాటించండి.`;
    return msg;
  }

  if (language === "hi") {
    let medList = "";
    if (medicines.length > 0) {
      medList = medicines
        .map(
          (m) =>
            `💊 दवा:\n${m.name || m.medicineName || "दवा"} ${m.dosage || ""}\n\n🕐 समय / आवृत्ति:\n${m.frequency || m.instructions || "डॉक्टर के निर्देशानुसार"}`
        )
        .join("\n\n");
    } else {
      medList = `💊 दवा विवरण:\nकृपया पोर्टल में देखें।`;
    }

    let msg = `🏥 *RuralCare*\n\nआपके डॉक्टर ${doctorName ? `(${doctorName}) ` : ""}द्वारा आपका प्रिस्क्रिप्शन अपडेट कर दिया गया है।\n\n${medList}`;
    if (nextVisit) {
      msg += `\n\n📅 अगली मुलाकात:\n${nextVisit}`;
    }
    msg += `\n\nकृपया अपने डॉक्टर के निर्देशों का पालन करें।`;
    return msg;
  }

  // Default English
  let medList = "";
  if (medicines.length > 0) {
    medList = medicines
      .map(
        (m) =>
          `💊 Medicine:\n${m.name || m.medicineName || "Medicine"} ${m.dosage || ""}\n\n🕐 Frequency:\n${m.frequency || m.instructions || "As prescribed"}`
      )
      .join("\n\n");
  } else {
    medList = `💊 Medicine:\nPrescription details updated.`;
  }

  let msg = `🏥 *RuralCare*\n\nYour prescription has been updated by your doctor${doctorName ? ` (${doctorName})` : ""}.\n\n${medList}`;
  if (nextVisit) {
    msg += `\n\n📅 Next visit:\n${nextVisit}`;
  }
  msg += `\n\nPlease follow your doctor's instructions.`;
  return msg;
}

function buildPrescriptionSMS(prescription, language) {
  const medicines = Array.isArray(prescription?.medicines)
    ? prescription.medicines
    : Array.isArray(prescription?.medications)
    ? prescription.medications
    : [];

  const firstMed = medicines[0];
  const medSummary = firstMed
    ? `${firstMed.name || firstMed.medicineName || "Medicine"} ${firstMed.dosage || ""}`.trim()
    : "Medicines updated";

  const nextVisit = formatShortDate(prescription?.nextVisitDate || prescription?.followUpDate);

  if (language === "te") {
    return `RuralCare: మీ ప్రిస్క్రిప్షన్ అప్‌డేట్ చేయబడింది. మందు: ${medSummary}.${nextVisit ? ` తదుపరి సందర్శన: ${nextVisit}.` : ""} డాక్టర్ సూచన పాటించండి.`;
  }
  if (language === "hi") {
    return `RuralCare: आपका प्रिस्क्रिप्शन अपडेट हो गया है। दवा: ${medSummary}.${nextVisit ? ` अगली मुलाकात: ${nextVisit}.` : ""} डॉक्टर के निर्देश मानें।`;
  }
  return `RuralCare: Your prescription has been updated. Medicine: ${medSummary}.${nextVisit ? ` Next visit: ${nextVisit}.` : ""} Please follow doctor's advice.`;
}

// ==========================================
// 2. APPOINTMENT NOTIFICATION TEMPLATES
// ==========================================

function buildAppointmentWhatsApp(appointment, language) {
  const appDate = formatDisplayDate(appointment?.appointmentDate || appointment?.date);
  const doctorName =
    appointment?.doctorName ||
    appointment?.doctor?.name ||
    (appointment?.doctor ? `Dr. ${appointment.doctor}` : "Assigned Doctor");

  if (language === "te") {
    return `🏥 *RuralCare*\n\nమీ అపాయింట్‌మెంట్ ఖరారైంది.\n\n📅 తేదీ:\n${appDate || "త్వరలో తెలియజేయబడుతుంది"}\n\n👨‍⚕️ డాక్టర్:\n${doctorName}\n\nదయచేసి మీ నిర్ణీత సమయానికి సంప్రదింపులకు హాజరవ్వండి.`;
  }

  if (language === "hi") {
    return `🏥 *RuralCare*\n\nआपका अपॉइंटमेंट निर्धारित कर दिया गया है।\n\n📅 तारीख:\n${appDate || "जल्द सूचित किया जाएगा"}\n\n👨‍⚕️ डॉक्टर:\n${doctorName}\n\nकृपया अपने निर्धारित परामर्श में उपस्थित रहें।`;
  }

  // Default English
  return `🏥 *RuralCare*\n\nYour appointment has been scheduled.\n\n📅 Date:\n${appDate || "To be announced"}\n\n👨‍⚕️ Doctor:\n${doctorName}\n\nPlease attend your scheduled consultation.`;
}

function buildAppointmentSMS(appointment, language) {
  const appDate = formatShortDate(appointment?.appointmentDate || appointment?.date);
  const doctorName =
    appointment?.doctorName ||
    appointment?.doctor?.name ||
    "Doctor";

  if (language === "te") {
    return `RuralCare: మీ అపాయింట్‌మెంట్ ${appDate} న ${doctorName} తో నిర్ణయించబడింది. దయచేసి హాజరవ్వండి.`;
  }
  if (language === "hi") {
    return `RuralCare: आपका अपॉइंटमेंट ${appDate} को ${doctorName} के साथ निर्धारित है। कृपया समय पर पहुंचें।`;
  }
  return `RuralCare: Your appointment is scheduled for ${appDate} with ${doctorName}. Please attend your consultation.`;
}

// ==========================================
// 3. MEDICATION REMINDER TEMPLATES
// ==========================================

function buildMedicationReminderWhatsApp(medication, language) {
  const medName =
    medication?.medicineName ||
    medication?.name ||
    medication?.medicine ||
    "Prescribed Medicine";
  const dosage = medication?.dosage || "";
  const fullMed = `${medName} ${dosage}`.trim();

  if (language === "te") {
    return `💊 *RuralCare ఔషధ రిమైండర్*\n\nమందు:\n${fullMed}\n\nమీరు సూచించిన మందు తీసుకునే సమయం అయింది.\n\nదయచేసి మీ డాక్టర్ ప్రిస్క్రిప్షన్‌ను పాటించండి.`;
  }

  if (language === "hi") {
    return `💊 *RuralCare दवा रिमाइंडर*\n\nदवा:\n${fullMed}\n\nआपकी निर्धारित दवा लेने का समय हो गया है।\n\nकृपया अपने डॉक्टर के प्रिस्क्रिप्शन का पालन करें।`;
  }

  // Default English
  return `💊 *RuralCare Medication Reminder*\n\nMedicine:\n${fullMed}\n\nIt is time to take your prescribed medicine.\n\nPlease follow your doctor's prescription.`;
}

function buildMedicationReminderSMS(medication, language) {
  const medName =
    medication?.medicineName ||
    medication?.name ||
    medication?.medicine ||
    "Prescribed Medicine";
  const dosage = medication?.dosage || "";
  const fullMed = `${medName} ${dosage}`.trim();

  if (language === "te") {
    return `RuralCare: మీ మందు ${fullMed} తీసుకునే సమయం అయింది. డాక్టర్ సూచన పాటించండి.`;
  }
  if (language === "hi") {
    return `RuralCare: अपनी दवा ${fullMed} लेने का समय हो गया है। प्रिस्क्रिप्शन का पालन करें।`;
  }
  return `RuralCare: Reminder to take your medicine ${fullMed}. Please follow doctor's prescription.`;
}

// ==========================================
// 4. GENERAL HEALTH NOTIFICATION TEMPLATES
// ==========================================

function buildGeneralHealthWhatsApp(messageContent, language) {
  let text = "";
  if (typeof messageContent === "string") {
    text = messageContent;
  } else if (messageContent && typeof messageContent === "object") {
    text = messageContent[language] || messageContent.text || messageContent.message || messageContent.body || messageContent.en || "";
  }

  if (language === "te") {
    return `🏥 *RuralCare ఆరోగ్య సమాచారం*\n\n${text}\n\nRuralCare తో ఆరోగ్యంగా ఉండండి!`;
  }

  if (language === "hi") {
    return `🏥 *RuralCare स्वास्थ्य सूचना*\n\n${text}\n\nRuralCare के साथ स्वस्थ रहें!`;
  }

  // Default English
  return `🏥 *RuralCare Health Update*\n\n${text}\n\nStay healthy with RuralCare!`;
}

function buildGeneralHealthSMS(messageContent, language) {
  let text = "";
  if (typeof messageContent === "string") {
    text = messageContent;
  } else if (messageContent && typeof messageContent === "object") {
    text = messageContent[language] || messageContent.shortText || messageContent.sms || messageContent.text || messageContent.en || "";
  }

  // Cap SMS length safely
  const cleanText = text.length > 130 ? `${text.slice(0, 127)}...` : text;
  return `RuralCare: ${cleanText}`;
}

// ==========================================
// CORE DISPATCHER ENGINE
// ==========================================

/**
 * Dispatches notifications across requested channels with resilient error handling
 * 
 * @param {Object|string} patient - Patient document or phone string
 * @param {Object} payload - Data payload (prescription, appointment, etc.)
 * @param {Function} buildWhatsAppFn - Formatter for WhatsApp body
 * @param {Function} buildSmsFn - Formatter for SMS body
 * @param {Object} options - { channels: ['whatsapp', 'sms'] }
 * @returns {Promise<Object>} Structured result
 */
async function dispatchNotification(patient, payload, buildWhatsAppFn, buildSmsFn, options = {}) {
  const { phone, language, name } = extractPatientInfo(patient);

  const channels = Array.isArray(options.channels)
    ? options.channels.map((c) => String(c).toLowerCase().trim())
    : options.channel
    ? [String(options.channel).toLowerCase().trim()]
    : ["whatsapp", "sms"]; // Default to both channels

  const result = {
    success: false,
    patient: {
      phone,
      language,
      name,
    },
    whatsapp: {
      attempted: false,
      sent: false,
      sid: null,
      error: null,
    },
    sms: {
      attempted: false,
      sent: false,
      sid: null,
      error: null,
    },
  };

  if (!phone) {
    const errorMsg = "Patient phone number is missing or invalid";
    console.warn(`[NotificationService] ${errorMsg}`);
    result.whatsapp.error = errorMsg;
    result.sms.error = errorMsg;
    return result;
  }

  // 1. WhatsApp Dispatch
  if (channels.includes("whatsapp")) {
    result.whatsapp.attempted = true;
    try {
      const waBody = buildWhatsAppFn(payload, language);
      console.log(`[NotificationService] Dispatching WhatsApp notification to ${phone} (Lang: ${language})`);
      const waRes = await sendWhatsAppMessage(phone, waBody);
      if (waRes.success) {
        result.whatsapp.sent = true;
        result.whatsapp.sid = waRes.sid;
      } else {
        result.whatsapp.error = waRes.error?.message || waRes.error || waRes.reason || "Failed to send WhatsApp message";
        console.warn(`[NotificationService] WhatsApp send warning:`, result.whatsapp.error);
      }
    } catch (err) {
      result.whatsapp.error = err.message || "Unexpected WhatsApp dispatch error";
      console.error(`[NotificationService] WhatsApp dispatch error:`, result.whatsapp.error);
    }
  }

  // 2. SMS Dispatch
  if (channels.includes("sms")) {
    result.sms.attempted = true;
    try {
      const smsBody = buildSmsFn(payload, language);
      console.log(`[NotificationService] Dispatching SMS notification to ${phone} (Lang: ${language})`);
      const smsRes = await sendSMS(phone, smsBody);
      if (smsRes.success) {
        result.sms.sent = true;
        result.sms.sid = smsRes.sid;
      } else {
        result.sms.error = smsRes.error?.message || smsRes.error || smsRes.reason || "Failed to send SMS";
        console.warn(`[NotificationService] SMS send warning (e.g. trial limitation):`, result.sms.error);
      }
    } catch (err) {
      result.sms.error = err.message || "Unexpected SMS dispatch error";
      console.error(`[NotificationService] SMS dispatch error:`, result.sms.error);
    }
  }

  // Mark success if at least one attempted channel succeeded, or if no errors thrown
  result.success =
    (result.whatsapp.sent || !result.whatsapp.attempted) &&
    (result.sms.sent || !result.sms.attempted);

  // Partial success: if at least one channel delivered
  if (!result.success && (result.whatsapp.sent || result.sms.sent)) {
    result.partialSuccess = true;
  }

  return result;
}

// ==========================================
// EXPORTED REUSABLE FUNCTIONS
// ==========================================

/**
 * Trigger notification after prescription creation/update
 * @param {Object|string} patient - Patient object ({ phone, language, name }) or phone string
 * @param {Object} prescription - Prescription details ({ medicines, nextVisitDate, doctorName })
 * @param {Object} [options] - { channels: ['whatsapp', 'sms'] }
 * @returns {Promise<Object>}
 */
async function sendPrescriptionNotification(patient, prescription, options = {}) {
  return dispatchNotification(
    patient,
    prescription,
    buildPrescriptionWhatsApp,
    buildPrescriptionSMS,
    options
  );
}

/**
 * Trigger notification after appointment scheduling
 * @param {Object|string} patient - Patient object ({ phone, language, name }) or phone string
 * @param {Object} appointment - Appointment details ({ appointmentDate, doctorName })
 * @param {Object} [options] - { channels: ['whatsapp', 'sms'] }
 * @returns {Promise<Object>}
 */
async function sendAppointmentNotification(patient, appointment, options = {}) {
  return dispatchNotification(
    patient,
    appointment,
    buildAppointmentWhatsApp,
    buildAppointmentSMS,
    options
  );
}

/**
 * Trigger reminder for medication schedule
 * @param {Object|string} patient - Patient object ({ phone, language, name }) or phone string
 * @param {Object} medication - Medication details ({ medicineName, dosage, times })
 * @param {Object} [options] - { channels: ['whatsapp', 'sms'] }
 * @returns {Promise<Object>}
 */
async function sendMedicationReminder(patient, medication, options = {}) {
  return dispatchNotification(
    patient,
    medication,
    buildMedicationReminderWhatsApp,
    buildMedicationReminderSMS,
    options
  );
}

/**
 * Trigger general health announcement, camp notice, or health tip
 * @param {Object|string} patient - Patient object ({ phone, language, name }) or phone string
 * @param {string|Object} message - Health message string or { en, hi, te }
 * @param {Object} [options] - { channels: ['whatsapp', 'sms'] }
 * @returns {Promise<Object>}
 */
async function sendGeneralHealthNotification(patient, message, options = {}) {
  return dispatchNotification(
    patient,
    message,
    buildGeneralHealthWhatsApp,
    buildGeneralHealthSMS,
    options
  );
}

module.exports = {
  sendPrescriptionNotification,
  sendAppointmentNotification,
  sendMedicationReminder,
  sendGeneralHealthNotification,
  // Template builders exported for unit testing & customization
  buildPrescriptionWhatsApp,
  buildPrescriptionSMS,
  buildAppointmentWhatsApp,
  buildAppointmentSMS,
  buildMedicationReminderWhatsApp,
  buildMedicationReminderSMS,
  buildGeneralHealthWhatsApp,
  buildGeneralHealthSMS,
  extractPatientInfo,
};
