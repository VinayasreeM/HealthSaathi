const express = require("express");
const router = express.Router();
const { handleWhatsAppWebhook } = require("../controllers/twilioController");

// Twilio WhatsApp Webhook endpoint (POST /api/twilio/webhook)
router.post("/webhook", handleWhatsAppWebhook);

module.exports = router;
