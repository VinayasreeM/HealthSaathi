const express = require("express");

const {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecord,
} = require("../controllers/medicalRecordController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createMedicalRecord);

router.get("/patient/:id", authMiddleware, getPatientMedicalRecords);

router.get("/:id", authMiddleware, getMedicalRecord);

module.exports = router;