const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitDate: { type: Date, default: Date.now },
    symptoms: [String],
    diagnosis: String,
    vitals: {
      bp: String, // e.g. "120/80"
      temperature: String, // e.g. "101 F"
      heartRate: String, // e.g. "82 bpm"
    },
    testReports: String,
    notes: String, // doctor notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
