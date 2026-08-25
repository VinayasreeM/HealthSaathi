const express = require("express");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function requireDoctor(req, res, next) {
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

router.use(authMiddleware, requireDoctor, async (req, res, next) => {
  // Doctor document for the logged-in user (created lazily if missing)
  req.doctorDoc = await Doctor.findOne({ userId: req.user.id });
  next();
});

function ok(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

async function getDoctorDoc(userId) {
  return Doctor.findOne({ userId });
}

async function notify(patientRefId, type, title, message) {
  try {
    await Notification.create({ patient: patientRefId, type, title, message });
  } catch {
    // Notifications are best-effort; never fail the main request
  }
}

// GET /api/doctors/me/patients - all patients (profile view)
router.get("/me/patients", async (req, res) => {
  const patients = await Patient.find().sort({ name: 1 }).lean();
  const users = await User.find({ role: "patient" }).select("email").lean();
  const emailByUser = Object.fromEntries(
    users.map((u) => [String(u._id), u.email])
  );
  ok(
    res,
    patients.map((p) => ({
      id: p._id,
      userId: p.userId,
      name: p.name,
      email: emailByUser[String(p.userId)] || null,
      age: p.age ?? null,
      gender: p.gender ?? null,
      phone: p.phone ?? null,
      bloodGroup: p.bloodGroup ?? null,
    }))
  );
});

// GET /api/doctors/me/patients/:id - one patient + all their data
router.get("/me/patients/:id", async (req, res) => {
  const patient = await Patient.findById(req.params.id).lean();
  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }
  const user = await User.findById(patient.userId).select("-password").lean();

  const records = await MedicalRecord.find({ patientId: patient._id })
    .sort({ visitDate: -1 })
    .populate("doctorId", "name")
    .lean();
  const prescriptions = await Prescription.find({ patientId: patient._id })
    .sort({ createdAt: -1 })
    .populate("doctorId", "name")
    .lean();
  const appointments = await Appointment.find({ patientId: patient._id })
    .sort({ appointmentDate: 1 })
    .populate("doctorId", "name")
    .lean();

  ok(res, {
    patient: {
      id: patient._id,
      name: patient.name,
      email: user?.email || null,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies || [],
      address: patient.address || null,
    },
    profile: patient,
    // Same mapped shapes the patient dashboard uses
    records: records.map((r) => ({
      _id: r._id,
      visitDate: r.visitDate,
      diagnosis: Array.isArray(r.diagnosis) ? r.diagnosis.join(", ") : r.diagnosis,
      symptoms: r.symptoms || [],
      doctorName: r.doctorId?.name || null,
    })),
    prescriptions: prescriptions.map((rx) => ({
      _id: rx._id,
      createdAt: rx.createdAt,
      diagnosis: rx.diagnosis,
      medicines: rx.medicines || [],
      doctorName: rx.doctorId?.name || null,
    })),
    appointments: appointments.map((a) => ({
      _id: a._id,
      date: a.appointmentDate,
      time: "",
      reason: a.reason,
      status: a.status,
      doctorName: a.doctorId?.name || null,
    })),
  });
});

// POST /api/doctors/me/medical-records
router.post("/me/medical-records", async (req, res) => {
  const { patientId, symptoms, diagnosis, vitals, testReports, notes, visitDate } =
    req.body;
  if (!patientId) {
    return res.status(400).json({ success: false, message: "patientId is required" });
  }
  const record = await MedicalRecord.create({
    patientId,
    doctorId: req.doctorDoc._id,
    visitDate: visitDate || new Date(),
    symptoms: symptoms || [],
    diagnosis: Array.isArray(diagnosis) ? diagnosis : diagnosis ? [diagnosis] : [],
    vitals: {
      bloodPressure: vitals?.bp ?? vitals?.bloodPressure,
      temperature: vitals?.temperature != null ? Number(vitals.temperature) : undefined,
      heartRate: vitals?.heartRate != null ? Number(vitals.heartRate) : undefined,
      weight: vitals?.weight != null ? Number(vitals.weight) : undefined,
    },
    testReports: testReports
      ? Array.isArray(testReports)
        ? testReports
        : [testReports]
      : [],
    doctorNotes: notes || "",
  });
  await notify(patientId, "general", "New Medical Record", "Your doctor has added a new medical record.");
  ok(res, record, 201);
});

// POST /api/doctors/me/prescriptions
router.post("/me/prescriptions", async (req, res) => {
  const {
    patientId,
    medicalRecordId,
    diagnosis,
    medicines,
    recommendations,
    nextVisitDate,
  } = req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: "patientId is required" });
  }

  let doctorDoc = req.doctorDoc;
  if (!doctorDoc) {
    doctorDoc = await Doctor.create({
      userId: req.user.id,
      doctorId: `DOC-${String(req.user.id).slice(-6).toUpperCase()}`,
      name: req.user.name || "Doctor",
      specialization: "General Medicine",
      phone: req.user.phone || "N/A",
    });
  }

  // The merged Prescription model requires medicalRecordId. When the doctor
  // UI does not supply one, attach a lightweight linked visit record so the
  // prescription stays consistent with the schema.
  let recordId = medicalRecordId;
  if (!recordId) {
    const stub = await MedicalRecord.create({
      patientId,
      doctorId: doctorDoc._id,
      visitDate: new Date(),
      symptoms: [],
      diagnosis: diagnosis ? [diagnosis] : [],
      doctorNotes: "Created along with prescription",
    });
    recordId = stub._id;
  }

  const cleanedMedicines = (Array.isArray(medicines) ? medicines : [])
    .filter((m) => m && m.name && String(m.name).trim())
    .map((m) => ({
      name: String(m.name).trim(),
      dosage: m.dosage || "As directed",
      frequency: m.frequency || "As directed",
      duration: m.duration || "Until next visit",
      instructions: m.instructions || "",
    }));

  if (cleanedMedicines.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "At least one medicine with a name is required" });
  }

  const prescription = await Prescription.create({
    patientId,
    doctorId: doctorDoc._id,
    medicalRecordId: recordId,
    diagnosis: diagnosis || "General consultation",
    medicines: cleanedMedicines,
    recommendations: Array.isArray(recommendations)
      ? recommendations
      : recommendations
      ? String(recommendations)
          .split("\n")
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean)
      : [],
    nextVisitDate: nextVisitDate || undefined,
  });

  // Keep the Medication collection in sync so reminders/status work
  await Medication.insertMany(
    cleanedMedicines.map((m) => ({
      patientId,
      prescriptionId: prescription._id,
      medicineName: m.name,
      dosage: m.dosage,
      times: m.timing ? [m.timing] : [],
      startDate: new Date(),
      endDate: nextVisitDate || new Date(Date.now() + 30 * 86400000),
      active: true,
    }))
  );

  await notify(
    patientId,
    "prescription",
    "New Prescription",
    `${doctorDoc.name} has added a new prescription for you.`
  );

  ok(res, prescription, 201);
});

// POST /api/doctors/me/appointments
router.post("/me/appointments", async (req, res) => {
  const { patientId, date, time, reason } = req.body;
  if (!patientId || !date) {
    return res
      .status(400)
      .json({ success: false, message: "patientId and date are required" });
  }

  let doctorDoc = req.doctorDoc;
  if (!doctorDoc) {
    doctorDoc = await Doctor.create({
      userId: req.user.id,
      doctorId: `DOC-${String(req.user.id).slice(-6).toUpperCase()}`,
      name: req.user.name || "Doctor",
      specialization: "General Medicine",
      phone: req.user.phone || "N/A",
    });
  }

  const when = new Date(date);
  if (!time) when.setHours(10, 0, 0, 0);

  const appointment = await Appointment.create({
    patientId,
    doctorId: doctorDoc._id,
    appointmentDate: when,
    reason: reason || "",
    status: "scheduled",
  });

  await notify(
    patientId,
    "appointment",
    "Appointment Scheduled",
    `An appointment has been scheduled for you on ${when.toDateString()}.`
  );

  ok(res, appointment, 201);
});

// GET /api/doctors/me/appointments - appointments by this doctor
router.get("/me/appointments", async (req, res) => {
  const list = await Appointment.find({ doctorId: req.doctorDoc?._id })
    .sort({ appointmentDate: 1 })
    .populate("patientId", "name")
    .lean();
  ok(
    res,
    list.map((a) => ({
      _id: a._id,
      date: a.appointmentDate,
      time: "",
      reason: a.reason,
      status: a.status,
      patientName: a.patientId?.name || "Patient",
    }))
  );
});

module.exports = router;
