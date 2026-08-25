const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["patient", "bot", "doctor", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: "GENERAL",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "te"],
      default: null,
    },
    lastMenuState: {
      type: String,
      default: null,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
