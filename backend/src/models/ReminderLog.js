const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    reminderType: {
      type: String,
      enum: ["medication", "appointment", "general"],
      required: true,
    },

    referenceId: {
      type: String,
      required: true,
      trim: true,
    },

    slot: {
      type: String,
      default: "default",
      trim: true,
    },

    scheduledDate: {
      type: String,
      required: true,
      trim: true,
    },

    channels: {
      whatsapp: {
        attempted: { type: Boolean, default: false },
        sent: { type: Boolean, default: false },
        sid: { type: String, default: null },
        error: { type: String, default: null },
      },
      sms: {
        attempted: { type: Boolean, default: false },
        sent: { type: Boolean, default: false },
        sid: { type: String, default: null },
        error: { type: String, default: null },
      },
    },

    status: {
      type: String,
      enum: ["sent", "partial", "failed"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee no duplicates for the same reminder, slot, and day
reminderLogSchema.index(
  { reminderType: 1, referenceId: 1, slot: 1, scheduledDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("ReminderLog", reminderLogSchema);
