const express = require("express");

const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create an appointment
router.post("/", authMiddleware, createAppointment);

// Get all appointments for a patient
router.get("/patient/:id", authMiddleware, getPatientAppointments);

// Get all appointments for a doctor
router.get("/doctor/:id", authMiddleware, getDoctorAppointments);

// Update appointment status
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

module.exports = router;