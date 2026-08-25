const express = require("express");
const cors = require("cors");


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

// Allow ngrok to skip its browser warning interstitial for API requests
// Twilio does NOT send this header, so we set it server-side via middleware
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HealthSaathi backend is running",
  });
});


app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/appointments", appointmentRoutes);

// Twilio WhatsApp routes
app.use("/api/twilio", twilioRoutes);

// Triage routes
app.use("/api/triage", triageRoutes);
app.get("/api/patients/:id/triage", getPatientTriage);


module.exports = app;