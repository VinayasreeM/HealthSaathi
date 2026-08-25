const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const twilioRoutes = require("./routes/twilioRoutes");
const triageRoutes = require("./routes/triageRoutes");

const { getPatientTriage } = require("./controllers/triageController");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HealthSaathi backend is running",
  });
});

// Authentication
app.use("/api/auth", authRoutes);

// Patient and doctor
// NOTE: patientsMeRoutes (JWT-scoped /me endpoints) must be mounted BEFORE
// patientRoutes so /api/patients/me/* is not captured by /:id.
const patientsMeRoutes = require("./routes/patients");
const doctorsMeRoutes = require("./routes/doctors");
app.use("/api/patients", patientsMeRoutes, patientRoutes);
app.use("/api/doctors", doctorsMeRoutes, doctorRoutes);

// Medical system
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/appointments", appointmentRoutes);

// Twilio WhatsApp
app.use("/api/twilio", twilioRoutes);

// AI triage
app.use("/api/triage", triageRoutes);
app.get("/api/patients/:id/triage", getPatientTriage);

module.exports = app;