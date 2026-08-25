const express = require("express");

const {
  createMedication,
  getPatientMedications,
  getActiveMedications,
  updateMedicationStatus,
} = require("../controllers/medicationController");

const router = express.Router();

// Create a medication
router.post("/", createMedication);

// Get all medications for a patient
router.get("/patient/:id", getPatientMedications);

// Get active medications for a patient
router.get("/patient/:id/active", getActiveMedications);

// Update medication active/inactive status
router.patch("/:id/status", updateMedicationStatus);

module.exports = router;