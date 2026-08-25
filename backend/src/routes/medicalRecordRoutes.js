const express = require("express");

const {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecord,
} = require("../controllers/medicalRecordController");

const router = express.Router();

router.post("/", createMedicalRecord);

router.get("/patient/:id", getPatientMedicalRecords);

router.get("/:id", getMedicalRecord);

module.exports = router;