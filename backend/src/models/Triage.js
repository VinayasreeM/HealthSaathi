const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      required: true,
      default: "MEDIUM",
    },
    possibleConditions: {
      type: [String],
      default: [],
    },
    redFlags: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "te"],
      default: "en",
    },
    source: {
      type: String,
      enum: ["whatsapp", "website"],
      default: "whatsapp",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Triage = mongoose.models.Triage || mongoose.model("Triage", triageSchema);

module.exports = Triage;
