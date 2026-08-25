const express = require("express");
const router = express.Router();
const {
  createTriage,
  getPatientTriage,
  getTriageById,
} = require("../controllers/triageController");

// POST /api/triage - Create or calculate triage assessment
router.post("/", createTriage);

// GET /api/triage/patient/:id - Get patient triage history
router.get("/patient/:id", getPatientTriage);

// GET /api/triage/:id - Get specific triage record
router.get("/:id", getTriageById);

module.exports = router;
