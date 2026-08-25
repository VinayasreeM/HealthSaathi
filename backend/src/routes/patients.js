const express = require("express");
const PatientProfile = require("../models/PatientProfile");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Recommendation = require("../models/Recommendation");
const Triage = require("../models/Triage");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// All patient routes require an authenticated patient.
// The patient identity is ALWAYS derived from the JWT (req.user.id),
// never from a patient ID sent by the browser.
router.use(protect, requireRole("patient"));

function ok(res, data) {
  res.json({ success: true, data });
}

// GET /api/patients/me - authenticated user + profile
router.get("/me", async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const profile =
    (await PatientProfile.findOne({ user: user._id })) ||
    (await PatientProfile.create({ user: user._id }));

  ok(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    age: profile.age,
    gender: profile.gender,
    phone: profile.phone,
    bloodGroup: profile.bloodGroup,
    allergies: profile.allergies || [],
    address: profile.address,
  });
});

// GET /api/patients/me/medical-history
router.get("/me/medical-history", async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user.id })
    .sort({ visitDate: -1 })
    .populate("doctor", "name");
  ok(res, records);
});

// GET /api/patients/me/prescriptions
router.get("/me/prescriptions", async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user.id })
    .sort({ createdAt: -1 })
    .populate("doctor", "name");
  ok(res, prescriptions);
});

// GET /api/patients/me/medications - derived from doctor-created prescriptions
router.get("/me/medications", async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user.id }).sort({
    createdAt: -1,
  });

  // Flatten medicines out of prescriptions; each medicine keeps its
  // prescription context so the frontend has a single source of truth.
  const medications = [];
  for (const rx of prescriptions) {
    for (const med of rx.medicines || []) {
      medications.push({
        _id: `${rx._id}-${med.name}`,
        prescriptionId: rx._id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        timing: med.timing,
        duration: med.duration,
        instructions: med.instructions,
        startDate: rx.createdAt,
        endDate: rx.nextVisitDate || null,
      });
    }
  }
  ok(res, medications);
});

// GET /api/patients/me/appointments
router.get("/me/appointments", async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .sort({ date: 1 })
    .populate("doctor", "name");
  ok(res, appointments);
});

// GET /api/patients/me/recommendations
router.get("/me/recommendations", async (req, res) => {
  const recommendations = await Recommendation.find({ patient: req.user.id })
    .sort({ createdAt: -1 })
    .populate("doctor", "name");
  ok(res, recommendations);
});

// GET /api/patients/me/triage - AI assessment results created by the backend
router.get("/me/triage", async (req, res) => {
  const triage = await Triage.find({ patient: req.user.id }).sort({
    createdAt: -1,
  });
  ok(res, triage);
});

// GET /api/patients/me/notifications
router.get("/me/notifications", async (req, res) => {
  const notifications = await Notification.find({ patient: req.user.id }).sort({
    createdAt: -1,
  });
  ok(res, notifications);
});

// PATCH /api/patients/me/notifications/:id/read
router.patch("/me/notifications/:id/read", async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, patient: req.user.id },
    { read: true }
  );
  ok(res, { updated: true });
});

module.exports = router;
