require("dotenv").config();
const assert = require("assert");
const {
  sendPrescriptionNotification,
  sendAppointmentNotification,
  sendMedicationReminder,
  sendGeneralHealthNotification,
  buildPrescriptionWhatsApp,
  buildPrescriptionSMS,
  buildAppointmentWhatsApp,
  buildAppointmentSMS,
  buildMedicationReminderWhatsApp,
  buildMedicationReminderSMS,
  buildGeneralHealthWhatsApp,
  buildGeneralHealthSMS,
  extractPatientInfo,
} = require("./src/services/notificationService");

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
    console.error(err.message, "\n");
  }
}

async function runNotificationTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING NOTIFICATION SERVICE UNIT TESTS");
  console.log("==================================================\n");

  // 1. extractPatientInfo tests
  await test("extractPatientInfo parses string phone and defaults language to en", async () => {
    const info = extractPatientInfo("+919876543210");
    assert.strictEqual(info.phone, "+919876543210");
    assert.strictEqual(info.language, "en");
    assert.strictEqual(info.name, "Patient");
  });

  await test("extractPatientInfo parses object with phone, language, name", async () => {
    const info = extractPatientInfo({
      phone: "+919876543210",
      language: "te",
      name: "Ramesh Babu",
    });
    assert.strictEqual(info.phone, "+919876543210");
    assert.strictEqual(info.language, "te");
    assert.strictEqual(info.name, "Ramesh Babu");
  });

  await test("extractPatientInfo handles alternative field names (phoneNumber, preferredLanguage, firstName)", async () => {
    const info = extractPatientInfo({
      phoneNumber: "+919876543210",
      preferredLanguage: "hi",
      firstName: "Suresh",
      lastName: "Sharma",
    });
    assert.strictEqual(info.phone, "+919876543210");
    assert.strictEqual(info.language, "hi");
    assert.strictEqual(info.name, "Suresh Sharma");
  });

  // 2. Prescription Template Tests (en, hi, te)
  const samplePrescription = {
    medicines: [
      {
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "Twice daily",
      },
    ],
    nextVisitDate: "2026-09-15",
    doctorName: "Dr. Rahul",
  };

  await test("Prescription WhatsApp format - English", async () => {
    const msg = buildPrescriptionWhatsApp(samplePrescription, "en");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("Your prescription has been updated"));
    assert.ok(msg.includes("Paracetamol 500mg"));
    assert.ok(msg.includes("Twice daily"));
    assert.ok(msg.includes("15 September 2026"));
    assert.ok(msg.includes("Dr. Rahul"));
  });

  await test("Prescription WhatsApp format - Hindi", async () => {
    const msg = buildPrescriptionWhatsApp(samplePrescription, "hi");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("प्रिस्क्रिप्शन अपडेट"));
    assert.ok(msg.includes("Paracetamol 500mg"));
    assert.ok(msg.includes("15 September 2026"));
  });

  await test("Prescription WhatsApp format - Telugu", async () => {
    const msg = buildPrescriptionWhatsApp(samplePrescription, "te");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("ప్రిస్క్రిప్షన్‌ను అప్‌డేట్"));
    assert.ok(msg.includes("Paracetamol 500mg"));
    assert.ok(msg.includes("15 September 2026"));
  });

  await test("Prescription SMS format - English, Hindi, Telugu", async () => {
    const smsEn = buildPrescriptionSMS(samplePrescription, "en");
    assert.ok(smsEn.startsWith("RuralCare:"));
    assert.ok(smsEn.includes("Paracetamol 500mg"));

    const smsHi = buildPrescriptionSMS(samplePrescription, "hi");
    assert.ok(smsHi.startsWith("RuralCare:"));
    assert.ok(smsHi.includes("Paracetamol 500mg"));

    const smsTe = buildPrescriptionSMS(samplePrescription, "te");
    assert.ok(smsTe.startsWith("RuralCare:"));
    assert.ok(smsTe.includes("Paracetamol 500mg"));
  });

  // 3. Appointment Template Tests (en, hi, te)
  const sampleAppointment = {
    appointmentDate: "2026-09-15T10:30:00.000Z",
    doctorName: "Dr. Rahul",
    reason: "General Consultation",
  };

  await test("Appointment WhatsApp format - English", async () => {
    const msg = buildAppointmentWhatsApp(sampleAppointment, "en");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("appointment has been scheduled"));
    assert.ok(msg.includes("15 September 2026"));
    assert.ok(msg.includes("Dr. Rahul"));
  });

  await test("Appointment WhatsApp format - Hindi", async () => {
    const msg = buildAppointmentWhatsApp(sampleAppointment, "hi");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("अपॉइंटमेंट निर्धारित"));
    assert.ok(msg.includes("15 September 2026"));
    assert.ok(msg.includes("Dr. Rahul"));
  });

  await test("Appointment WhatsApp format - Telugu", async () => {
    const msg = buildAppointmentWhatsApp(sampleAppointment, "te");
    assert.ok(msg.includes("RuralCare"));
    assert.ok(msg.includes("అపాయింట్‌మెంట్ ఖరారైంది"));
    assert.ok(msg.includes("15 September 2026"));
    assert.ok(msg.includes("Dr. Rahul"));
  });

  await test("Appointment SMS format - English, Hindi, Telugu", async () => {
    const smsEn = buildAppointmentSMS(sampleAppointment, "en");
    assert.ok(smsEn.startsWith("RuralCare:"));
    assert.ok(smsEn.includes("Dr. Rahul"));

    const smsHi = buildAppointmentSMS(sampleAppointment, "hi");
    assert.ok(smsHi.startsWith("RuralCare:"));
    assert.ok(smsHi.includes("Dr. Rahul"));

    const smsTe = buildAppointmentSMS(sampleAppointment, "te");
    assert.ok(smsTe.startsWith("RuralCare:"));
    assert.ok(smsTe.includes("Dr. Rahul"));
  });

  // 4. Medication Reminder Template Tests (en, hi, te)
  const sampleMedication = {
    medicineName: "Metformin",
    dosage: "500mg",
    times: ["Morning", "Night"],
  };

  await test("Medication Reminder WhatsApp format - English", async () => {
    const msg = buildMedicationReminderWhatsApp(sampleMedication, "en");
    assert.ok(msg.includes("Medication Reminder"));
    assert.ok(msg.includes("Metformin 500mg"));
    assert.ok(msg.includes("take your prescribed medicine"));
  });

  await test("Medication Reminder WhatsApp format - Hindi", async () => {
    const msg = buildMedicationReminderWhatsApp(sampleMedication, "hi");
    assert.ok(msg.includes("दवा रिमाइंडर"));
    assert.ok(msg.includes("Metformin 500mg"));
  });

  await test("Medication Reminder WhatsApp format - Telugu", async () => {
    const msg = buildMedicationReminderWhatsApp(sampleMedication, "te");
    assert.ok(msg.includes("ఔషధ రిమైండర్"));
    assert.ok(msg.includes("Metformin 500mg"));
  });

  await test("Medication Reminder SMS format - English, Hindi, Telugu", async () => {
    const smsEn = buildMedicationReminderSMS(sampleMedication, "en");
    assert.ok(smsEn.startsWith("RuralCare:"));
    assert.ok(smsEn.includes("Metformin 500mg"));

    const smsHi = buildMedicationReminderSMS(sampleMedication, "hi");
    assert.ok(smsHi.startsWith("RuralCare:"));
    assert.ok(smsHi.includes("Metformin 500mg"));

    const smsTe = buildMedicationReminderSMS(sampleMedication, "te");
    assert.ok(smsTe.startsWith("RuralCare:"));
    assert.ok(smsTe.includes("Metformin 500mg"));
  });

  // 5. General Health Notification Template Tests
  const healthMsgObj = {
    en: "Free eye checkup camp this Sunday at Community Hall.",
    hi: "इस रविवार सामुदायिक भवन में निःशुल्क नेत्र जांच शिविर।",
    te: "ఈ ఆదివారం కమ్యూనిటీ హాల్‌లో ఉచిత నేత్ర వైద్య శిబిరం.",
  };

  await test("General Health WhatsApp format - multilingual string and object", async () => {
    const msgEn = buildGeneralHealthWhatsApp(healthMsgObj, "en");
    assert.ok(msgEn.includes("Health Update"));
    assert.ok(msgEn.includes("Free eye checkup"));

    const msgTe = buildGeneralHealthWhatsApp(healthMsgObj, "te");
    assert.ok(msgTe.includes("ఆరోగ్య సమాచారం"));
    assert.ok(msgTe.includes("ఉచిత నేత్ర"));
  });

  // 6. Graceful failure / Validation tests
  await test("Missing patient phone returns structured error without throwing exception", async () => {
    const result = await sendPrescriptionNotification(null, samplePrescription);
    assert.strictEqual(result.success, false);
    assert.ok(result.whatsapp.error.includes("missing or invalid"));
    assert.ok(result.sms.error.includes("missing or invalid"));
  });

  await test("Channel selection options are respected (e.g. only whatsapp or only sms)", async () => {
    // Only WhatsApp
    const waOnly = await sendAppointmentNotification(
      { phone: "+919876500001", language: "en" },
      sampleAppointment,
      { channels: ["whatsapp"] }
    );
    assert.strictEqual(waOnly.whatsapp.attempted, true);
    assert.strictEqual(waOnly.sms.attempted, false);

    // Only SMS
    const smsOnly = await sendMedicationReminder(
      { phone: "+919876500001", language: "en" },
      sampleMedication,
      { channels: ["sms"] }
    );
    assert.strictEqual(smsOnly.whatsapp.attempted, false);
    assert.strictEqual(smsOnly.sms.attempted, true);
  });

  console.log("==================================================");
  console.log(`🏁 FINISHED: ${passedCount} passed, ${failedCount} failed`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runNotificationTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
