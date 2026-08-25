const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: Number,
    gender: String,
    phone: String,
    bloodGroup: String,
    allergies: [String],
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PatientProfile", patientProfileSchema);
