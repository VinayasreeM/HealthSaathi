const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const { protect } = require("../middleware/auth");

const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "doctor" ? "doctor" : "patient",
    });

    if (user.role === "patient") {
      // Ensure every patient has a profile document
      await PatientProfile.create({ user: user._id });
    }

    res.status(201).json({
      success: true,
      token: issueToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.comparePassword(password || ""))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.role === "patient") {
      // Make sure profile exists even for pre-seeded users
      await PatientProfile.updateOne(
        { user: user._id },
        { $setOnInsert: { user: user._id } },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      token: issueToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - current authenticated user
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
