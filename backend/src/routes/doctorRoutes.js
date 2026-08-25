const express = require("express");

const {
  getDoctors,
  getDoctorById,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getDoctors);
router.get("/:id", authMiddleware, getDoctorById);

module.exports = router;