const express = require("express");

const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
} = require("../controllers/patientController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getPatients);
router.get("/:id", authMiddleware, getPatientById);
router.post("/", authMiddleware, createPatient);
router.put("/:id", authMiddleware, updatePatient);

module.exports = router;