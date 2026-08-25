const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: String, // e.g. "500 mg"
    frequency: String, // e.g. "Twice daily"
    timing: String, // e.g. "08:00 AM, 08:00 PM"
    duration: String, // e.g. "30 days"
    instructions: String, // e.g. "Take after food"
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    diagnosis: String,
    medicines: [medicineSchema],
    recommendations: String,
    nextVisitDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
