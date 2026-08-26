const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
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

    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: false,
    },

    diagnosis: {
      type: String,
      required: true,
    },

    medicines: [
      {
        name: {
          type: String,
          required: true,
        },

        dosage: {
          type: String,
          required: true,
        },

        frequency: {
          type: String,
          required: true,
        },

        duration: {
          type: String,
          required: true,
        },

        instructions: {
          type: String,
          default: "",
        },
      },
    ],

    recommendations: {
      type: [String],
      default: [],
    },

    nextVisitDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);