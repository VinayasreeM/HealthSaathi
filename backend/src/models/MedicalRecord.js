const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    symptoms: {
      type: [String],
      default: [],
    },

    vitals: {
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      weight: Number,
    },

    diagnosis: {
      type: [String],
      default: [],
    },

    testReports: {
      type: [String],
      default: [],
    },

    doctorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);