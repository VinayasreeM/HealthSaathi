const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    symptoms: [String],
    possibleConditions: String,
    recommendation: String,
    source: {
      type: String,
      enum: ["whatsapp", "web", "system"],
      default: "system",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Triage", triageSchema);
