const express = require("express");
const cors = require("cors");

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

// Twilio WhatsApp routes
app.use("/api/twilio", twilioRoutes);

// Triage routes
app.use("/api/triage", triageRoutes);
app.get("/api/patients/:id/triage", getPatientTriage);

module.exports = app;