const express = require("express");

const {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
} = require("../controllers/prescriptionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a prescription
router.post("/", authMiddleware, createPrescription);

// Get all prescriptions for a patient
router.get("/patient/:id", authMiddleware, getPatientPrescriptions);

// Get one prescription
router.get("/:id", authMiddleware, getPrescription);

module.exports = router;