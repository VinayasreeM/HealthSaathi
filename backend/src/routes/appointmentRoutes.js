const express = require("express");

const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

// Create an appointment
router.post("/", createAppointment);

// Get all appointments for a patient
router.get("/patient/:id", getPatientAppointments);

// Get all appointments for a doctor
router.get("/doctor/:id", getDoctorAppointments);

// Update appointment status
router.patch("/:id/status", updateAppointmentStatus);

module.exports = router;