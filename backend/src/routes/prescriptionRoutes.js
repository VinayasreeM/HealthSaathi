const express = require("express");

const {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
} = require("../controllers/prescriptionController");

const router = express.Router();

// Create a prescription
router.post("/", createPrescription);

// Get all prescriptions for a patient
router.get("/patient/:id", getPatientPrescriptions);

// Get one prescription
router.get("/:id", getPrescription);

module.exports = router;