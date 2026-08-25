const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["prescription", "appointment", "medication", "assessment", "general"],
      default: "general",
    },
    title: String,
    message: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
