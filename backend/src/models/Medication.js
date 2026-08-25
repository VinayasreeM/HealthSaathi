const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
    },

    dosage: {
      type: String,
      required: true,
    },

    times: {
      type: [String],
      default: [],
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Medication", medicationSchema);