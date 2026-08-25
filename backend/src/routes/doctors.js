const express = require("express");
const PatientProfile = require("../models/PatientProfile");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Recommendation = require("../models/Recommendation");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// All doctor routes require an authenticated doctor
router.use(protect, requireRole("doctor"));

function ok(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

async function notify(patientId, type, title, message) {
  await Notification.create({ patient: patientId, type, title, message });
}

// GET /api/doctors/me/patients - list of the doctor's patients
router.get("/me/patients", async (req, res) => {
  const patients = await User.find({ role: "patient" })
    .select("name email createdAt")
    .sort({ name: 1 })
    .lean();

  const profiles = await PatientProfile.find({
    user: { $in: patients.map((p) => p._id) },
  }).lean();

  const byUser = Object.fromEntries(profiles.map((pr) => [String(pr.user), pr]));
  ok(
    res,
    patients.map((p) => ({
      id: p._id,
      name: p.name,
      email: p.email,
      age: byUser[String(p._id)]?.age ?? null,
      gender: byUser[String(p._id)]?.gender ?? null,
      phone: byUser[String(p._id)]?.phone ?? null,
      bloodGroup: byUser[String(p._id)]?.bloodGroup ?? null,
    }))
  );
});

// GET /api/doctors/me/patients/:id - one patient with all their records
router.get("/me/patients/:id", async (req, res) => {
  const patient = await User.findById(req.params.id).select("name email");
  if (!patient || patient.role !== "patient") {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }
  const profile = await PatientProfile.findOne({ user: patient._id });
  const records = await MedicalRecord.find({ patient: patient._id })
    .sort({ visitDate: -1 })
    .populate("doctor", "name");
  const prescriptions = await Prescription.find({ patient: patient._id })
    .sort({ createdAt: -1 })
    .populate("doctor", "name");
  const appointments = await Appointment.find({ patient: patient._id })
    .sort({ date: 1 })
    .populate("doctor", "name");

  ok(res, { patient: { id: patient._id, name: patient.name, email: patient.email }, profile, records, prescriptions, appointments });
});

// POST /api/doctors/me/medical-records
router.post("/me/medical-records", async (req, res) => {
  const { patientId, symptoms, diagnosis, vitals, testReports, notes, visitDate } =
    req.body;
  if (!patientId) {
    return res.status(400).json({ success: false, message: "patientId is required" });
  }
  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: req.user.id,
    symptoms,
    diagnosis,
    vitals,
    testReports,
    notes,
    visitDate,
  });
  await notify(patientId, "general", "New Medical Record", "Your doctor has added a new medical record.");
  ok(res, record, 201);
});

// POST /api/doctors/me/prescriptions
router.post("/me/prescriptions", async (req, res) => {
  const { patientId, diagnosis, medicines, recommendations, nextVisitDate } =
    req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: "patientId is required" });
  }

  const prescription = await Prescription.create({
    patient: patientId,
    doctor: req.user.id,
    diagnosis,
    medicines: Array.isArray(medicines) ? medicines : [],
    recommendations,
    nextVisitDate,
  });

  // Store recommendations as a first-class document so the patient's
  // Recommendations page can display them.
  if (recommendations && String(recommendations).trim()) {
    const items = String(recommendations)
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    if (items.length > 0) {
      await Recommendation.create({
        patient: patientId,
        doctor: req.user.id,
        items,
        sourcePrescription: prescription._id,
      });
    }
  }

  // Notify the patient so it shows up in their Notifications page
  await notify(
    patientId,
    "prescription",
    "New Prescription",
    `Dr. ${req.user.name} has added a new prescription for you.`
  );

  ok(res, prescription, 201);
});

// GET /api/doctors/me/appointments - appointments scheduled by this doctor
router.get("/me/appointments", async (req, res) => {
  const appointments = await Appointment.find({ doctor: req.user.id })
    .sort({ date: 1 })
    .populate("patient", "name");
  ok(res, appointments);
});

// POST /api/doctors/me/appointments
router.post("/me/appointments", async (req, res) => {
  const { patientId, date, time, reason } = req.body;
  if (!patientId || !date) {
    return res
      .status(400)
      .json({ success: false, message: "patientId and date are required" });
  }
  const appointment = await Appointment.create({
    patient: patientId,
    doctor: req.user.id,
    date,
    time,
    reason,
  });
  await notify(
    patientId,
    "appointment",
    "Appointment Scheduled",
    `An appointment has been scheduled for you on ${new Date(date).toDateString()}${time ? ` at ${time}` : ""}.`
  );
  ok(res, appointment, 201);
});

module.exports = router;
