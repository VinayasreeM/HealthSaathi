const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointment");
const Triage = require("../models/Triage");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All endpoints here are JWT-scoped: the patient identity comes from the
// token (req.user.id = User._id) and is mapped to the Patient document.
// No patient ID is ever accepted from the browser.

function requirePatient(req, res, next) {
  if (!req.user || req.user.role !== "patient") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

function getPatientDoc(userId) {
  return Patient.findOne({ userId });
}

function ok(res, data) {
  res.json({ success: true, data });
}

// ---- Field mappers: teammate schemas -> patient dashboard shape ----

async function doctorName(doctorId) {
  if (!doctorId) return null;
  const doctor =
    typeof doctorId === "object" && doctorId.name
      ? doctorId
      : await Doctor.findById(doctorId).lean();
  return doctor ? doctor.name : null;
}

function mapRecord(r, dName) {
  const v = r.vitals || {};
  return {
    _id: r._id,
    visitDate: r.visitDate || r.createdAt,
    doctorName: dName,
    symptoms: r.symptoms || [],
    diagnosis: Array.isArray(r.diagnosis)
      ? r.diagnosis.join(", ")
      : r.diagnosis || "",
    vitals: {
      bp: v.bloodPressure || "",
      temperature: v.temperature != null ? `${v.temperature} F` : "",
      heartRate: v.heartRate != null ? `${v.heartRate} bpm` : "",
    },
    testReports: Array.isArray(r.testReports)
      ? r.testReports.join("; ")
      : r.testReports || "",
    notes: r.doctorNotes || "",
  };
}

function mapPrescription(rx, dName) {
  return {
    _id: rx._id,
    createdAt: rx.createdAt,
    doctorName: dName,
    diagnosis: rx.diagnosis || "",
    medicines: (rx.medicines || []).map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      timing: m.timing || "",
      duration: m.duration,
      instructions: m.instructions || "",
    })),
    recommendations: Array.isArray(rx.recommendations)
      ? rx.recommendations.join("\n")
      : rx.recommendations || "",
    nextVisitDate: rx.nextVisitDate || null,
  };
}

function mapMedication(m) {
  const active = m.active !== false && (!m.endDate || new Date(m.endDate) >= new Date());
  return {
    _id: m._id,
    prescriptionId: m.prescriptionId,
    name: m.medicineName || (m.name ?? ""),
    dosage: m.dosage || "",
    frequency: m.frequency || "",
    timing: Array.isArray(m.times) ? m.times.join(", ") : m.timing || "",
    duration:
      m.startDate && m.endDate
        ? `${Math.max(
            1,
            Math.round((new Date(m.endDate) - new Date(m.startDate)) / 86400000)
          )} days`
        : m.duration || "",
    instructions: m.instructions || "",
    startDate: m.startDate || null,
    endDate: m.endDate || null,
    active,
  };
}

function mapAppointment(a, dName) {
  const status = (a.status || "scheduled").toLowerCase();
  return {
    _id: a._id,
    date: a.appointmentDate || a.date,
    time: a.time || "",
    reason: a.reason || "",
    status: status.charAt(0).toUpperCase() + status.slice(1),
    doctorName: dName,
  };
}

// GET /api/patients/me - profile of the authenticated patient
router.get("/me", authMiddleware, requirePatient, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const p = await getPatientDoc(user._id).lean();

    ok(res, {
      id: user._id,
      patientRef: p?._id || null,
      name: user.name,
      email: user.email,
      role: user.role,
      age: p?.age ?? null,
      gender: p?.gender ?? null,
      phone: p?.phone ?? user.phone ?? null,
      bloodGroup: p?.bloodGroup ?? null,
      allergies: p?.allergies || [],
      address: p?.address ?? null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Resolve the Patient doc once for the data endpoints below
router.use("/me", authMiddleware, requirePatient, async (req, res, next) => {
  req.patientDoc = await getPatientDoc(req.user.id);
  if (!req.patientDoc) {
    // Registered but profile document not created yet - empty data, not an error
    req.patientDoc = null;
  }
  next();
});

// GET /api/patients/me/medical-history
router.get("/me/medical-history", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    const records = await MedicalRecord.find({ patientId: req.patientDoc._id })
      .sort({ visitDate: -1 })
      .populate("doctorId", "name")
      .lean();
    ok(
      res,
      await Promise.all(
        records.map(async (r) =>
          mapRecord(r, r.doctorId ? r.doctorId.name : await doctorName(r.doctorId))
        )
      )
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/prescriptions
router.get("/me/prescriptions", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    const list = await Prescription.find({ patientId: req.patientDoc._id })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name")
      .lean();
    ok(res, list.map((rx) => mapPrescription(rx, rx.doctorId?.name)));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/medications - from the Medication collection,
// derived from prescriptions when that collection is empty
router.get("/me/medications", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    let meds = await Medication.find({ patientId: req.patientDoc._id })
      .sort({ createdAt: -1 })
      .lean();

    if (meds.length === 0) {
      const prescriptions = await Prescription.find({
        patientId: req.patientDoc._id,
      }).lean();
      meds = prescriptions.flatMap((rx) =>
        (rx.medicines || []).map((m) => ({
          _id: `${rx._id}-${m.name}`,
          prescriptionId: rx._id,
          medicineName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          timing: m.timing ? [m.timing] : [],
          startDate: rx.createdAt,
          endDate: rx.nextVisitDate || null,
          active: true,
        }))
      );
    }
    ok(res, meds.map(mapMedication));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/appointments
router.get("/me/appointments", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    const list = await Appointment.find({ patientId: req.patientDoc._id })
      .sort({ appointmentDate: 1 })
      .populate("doctorId", "name")
      .lean();
    ok(res, list.map((a) => mapAppointment(a, a.doctorId?.name)));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/recommendations - derived from prescriptions
router.get("/me/recommendations", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    const list = await Prescription.find({
      patientId: req.patientDoc._id,
      recommendations: { $exists: true, $ne: [] },
    })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name")
      .lean();
    ok(
      res,
      list.map((rx) => ({
        _id: rx._id,
        items: rx.recommendations || [],
        createdAt: rx.createdAt,
        doctorName: rx.doctorId?.name,
      }))
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/triage
router.get("/me/triage", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    // Triage.patientId is Mixed: WhatsApp flows may store the User id,
    // dashboard flows the Patient id - match both.
    const list = await Triage.find({
      patientId: { $in: [req.patientDoc._id, new mongoose.Types.ObjectId(String(req.user.id))] },
    })
      .sort({ createdAt: -1 })
      .lean();
    ok(
      res,
      list.map((t) => ({
        ...t,
        possibleConditions: Array.isArray(t.possibleConditions)
          ? t.possibleConditions.join(", ")
          : t.possibleConditions || "",
      }))
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/me/notifications
router.get("/me/notifications", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, []);
    const list = await Notification.find({ patient: req.patientDoc._id }).sort({
      createdAt: -1,
    });
    ok(res, list);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/patients/me/notifications/:id/read
router.patch("/me/notifications/:id/read", async (req, res) => {
  try {
    if (!req.patientDoc) return ok(res, { updated: true });
    await Notification.updateOne(
      { _id: req.params.id, patient: req.patientDoc._id },
      { read: true }
    );
    ok(res, { updated: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
