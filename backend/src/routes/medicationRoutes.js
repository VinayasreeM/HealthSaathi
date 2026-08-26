const express = require("express");

const {
  createMedication,
  getPatientMedications,
  getActiveMedications,
  updateMedicationStatus,
} = require("../controllers/medicationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a medication
router.post("/", authMiddleware, createMedication);

// Get all medications for a patient
router.get("/patient/:id", authMiddleware, getPatientMedications);

// Get active medications for a patient
router.get("/patient/:id/active", authMiddleware, getActiveMedications);

// Update medication active/inactive status
router.patch("/:id/status", authMiddleware, updateMedicationStatus);

module.exports = router;