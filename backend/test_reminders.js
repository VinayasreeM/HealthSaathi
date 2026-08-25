require("dotenv").config();
const assert = require("assert");
const mongoose = require("mongoose");
const {
  processMedicationReminders,
  processAppointmentReminders,
  processAllReminders,
  isMedicationDue,
  getISTDetails,
  clearInMemoryReminderCache,
  TIMEZONE,
} = require("./src/services/reminderService");
const ReminderLog = require("./src/models/ReminderLog");

let passedCount = 0;
let failedCount = 0;

async function test(name, fn) {
  try {
    process.stdout.write(`⏳ Test: ${name}\n`);
    await fn();
    passedCount++;
    console.log(`✅ PASSED: ${name}\n`);
  } catch (err) {
    failedCount++;
    console.error(`❌ FAILED: ${name}`);
    console.error(err.stack || err.message, "\n");
  }
}

async function runReminderTests() {
  console.log("==================================================");
  console.log("⏰ RUNNING AUTOMATED REMINDER SCHEDULER TESTS");
  console.log("==================================================\n");

  // 1. Timezone & IST details test
  await test("Timezone is configured to Asia/Kolkata and extracts correct slot", async () => {
    assert.strictEqual(TIMEZONE, "Asia/Kolkata");

    // Morning slot (08:30 IST)
    const morningDate = new Date("2026-08-25T03:00:00.000Z"); // 08:30 IST
    const istMorning = getISTDetails(morningDate);
    assert.strictEqual(istMorning.hour, 8);
    assert.strictEqual(istMorning.minute, 30);
    assert.strictEqual(istMorning.slot, "Morning");

    // Afternoon slot (13:15 IST)
    const afternoonDate = new Date("2026-08-25T07:45:00.000Z"); // 13:15 IST
    const istAfternoon = getISTDetails(afternoonDate);
    assert.strictEqual(istAfternoon.hour, 13);
    assert.strictEqual(istAfternoon.slot, "Afternoon");

    // Night slot (21:30 IST)
    const nightDate = new Date("2026-08-25T16:00:00.000Z"); // 21:30 IST
    const istNight = getISTDetails(nightDate);
    assert.strictEqual(istNight.hour, 21);
    assert.strictEqual(istNight.slot, "Night");
  });

  // 2. isMedicationDue slot matching test
  await test("isMedicationDue matches both keyword slots and HH:MM formats", async () => {
    const istMorning = { slot: "Morning", hour: 8, minute: 0 };
    const istNight = { slot: "Night", hour: 20, minute: 45 };

    // Matches keywords
    assert.strictEqual(isMedicationDue(["Morning", "Night"], istMorning), true);
    assert.strictEqual(isMedicationDue(["Afternoon"], istMorning), false);
    assert.strictEqual(isMedicationDue(["Night"], istNight), true);

    // Matches HH:MM strings (within 30 mins)
    assert.strictEqual(isMedicationDue(["08:15"], istMorning), true);
    assert.strictEqual(isMedicationDue(["14:00"], istMorning), false);
    assert.strictEqual(isMedicationDue(["21:00"], istNight), true);
  });

  // Connect to DB if configured
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (mongoUri && mongoUri.startsWith("mongodb")) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB for reminder tests.");
    } catch (e) {
      console.warn("MongoDB connection skipped for local test runner:", e.message);
    }
  }

  // Clear caches
  clearInMemoryReminderCache();

  // 3. Medication Reminder End-to-End Simulation
  await test("Medication Reminder processes active medications and resolves patient language", async () => {
    clearInMemoryReminderCache();

    // Create a mock Medication object with populated patient
    const mockMedication = {
      _id: new mongoose.Types.ObjectId(),
      medicineName: "Metformin",
      dosage: "500mg",
      times: ["Morning", "Night"],
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      active: true,
      patientId: {
        _id: new mongoose.Types.ObjectId(),
        name: "Ramesh Babu",
        phone: "+919876543210",
        language: "te", // Telugu
      },
    };

    // Test the medication processor with custom mock
    const Medication = require("./src/models/Medication");
    const originalFind = Medication.find;

    // Stub Medication.find
    Medication.find = function () {
      return {
        populate: function () {
          return Promise.resolve([mockMedication]);
        },
      };
    };

    try {
      const result = await processMedicationReminders({
        now: new Date("2026-08-25T03:00:00.000Z"), // 08:30 IST (Morning)
      });

      assert.strictEqual(result.scanned, 1);
      assert.strictEqual(result.due, 1);
      assert.strictEqual(result.sent, 1);
      assert.strictEqual(result.skippedDuplicates, 0);
      assert.strictEqual(result.results[0].medicineName, "Metformin");
      assert.strictEqual(result.results[0].phone, "+919876543210");
    } finally {
      Medication.find = originalFind;
    }
  });

  // 4. Duplicate Prevention Test
  await test("Duplicate Prevention: Second execution for same slot/day skips sending", async () => {
    const mockMedication = {
      _id: new mongoose.Types.ObjectId(),
      medicineName: "Amlodipine",
      dosage: "5mg",
      times: ["Morning"],
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      active: true,
      patientId: {
        _id: new mongoose.Types.ObjectId(),
        name: "Sunita Devi",
        phone: "+919876543211",
        language: "hi", // Hindi
      },
    };

    const Medication = require("./src/models/Medication");
    const originalFind = Medication.find;

    Medication.find = function () {
      return {
        populate: function () {
          return Promise.resolve([mockMedication]);
        },
      };
    };

    try {
      const testTime = new Date("2026-08-25T03:00:00.000Z");

      // Run 1 -> Sent
      const firstRun = await processMedicationReminders({ now: testTime });
      assert.strictEqual(firstRun.sent, 1);
      assert.strictEqual(firstRun.skippedDuplicates, 0);

      // Run 2 -> Skipped duplicate
      const secondRun = await processMedicationReminders({ now: testTime });
      assert.strictEqual(secondRun.sent, 0);
      assert.strictEqual(secondRun.skippedDuplicates, 1);
    } finally {
      Medication.find = originalFind;
    }
  });

  // 5. Appointment Reminder End-to-End Test (24-hour advance notice window)
  await test("Appointment Reminder dispatches for appointments scheduled in next 24 hours", async () => {
    clearInMemoryReminderCache();

    const now = new Date("2026-08-25T04:30:00.000Z");
    const tomorrowAppt = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours ahead

    const mockAppointment = {
      _id: new mongoose.Types.ObjectId(),
      appointmentDate: tomorrowAppt,
      reason: "Post-surgery checkup",
      status: "scheduled",
      patientId: {
        _id: new mongoose.Types.ObjectId(),
        name: "John Doe",
        phone: "+919876543212",
        language: "en",
      },
      doctorId: {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Rahul Sharma",
        specialization: "General Physician",
      },
    };

    const Appointment = require("./src/models/Appointment");
    const originalFind = Appointment.find;

    Appointment.find = function () {
      return {
        populate: function () {
          return {
            populate: function () {
              return Promise.resolve([mockAppointment]);
            },
          };
        },
      };
    };

    try {
      // First run: dispatches
      const result1 = await processAppointmentReminders({ now });
      assert.strictEqual(result1.scanned, 1);
      assert.strictEqual(result1.due, 1);
      assert.strictEqual(result1.sent, 1);
      assert.strictEqual(result1.skippedDuplicates, 0);

      // Second run: duplicate prevented
      const result2 = await processAppointmentReminders({ now });
      assert.strictEqual(result2.sent, 0);
      assert.strictEqual(result2.skippedDuplicates, 1);
    } finally {
      Appointment.find = originalFind;
    }
  });

  // 6. Centralized processAllReminders test
  await test("processAllReminders executes both medication and appointment reminder cycles", async () => {
    clearInMemoryReminderCache();
    const result = await processAllReminders({
      now: new Date("2026-08-25T03:00:00.000Z"),
    });

    assert.ok(result.timestamp);
    assert.ok(result.medications);
    assert.ok(result.appointments);
    assert.strictEqual(typeof result.medications.sent, "number");
    assert.strictEqual(typeof result.appointments.sent, "number");
  });

  console.log("==================================================");
  console.log(`🏁 FINISHED: ${passedCount} passed, ${failedCount} failed`);
  console.log("==================================================");

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

runReminderTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
