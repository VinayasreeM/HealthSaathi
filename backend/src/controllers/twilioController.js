const mongoose = require("mongoose");
const Triage = require("../models/Triage");
const Conversation = require("../models/Conversation");
const { analyzeSymptoms } = require("../services/geminiService");
const {
  MESSAGES,
  formatWhatsAppResponse,
  generateTwiMLMessage,
  sendWhatsAppMessage,
} = require("../services/twilioService");

// In-memory fallback in case MongoDB is temporarily disconnected during tests
const memoryConversations = new Map();

function normalizePhone(rawPhone) {
  if (!rawPhone) return "";
  return String(rawPhone).replace(/^whatsapp:/i, "").trim();
}

function detectScriptLanguage(text) {
  if (!text) return "en";
  // Telugu Unicode range \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  // Devanagari (Hindi) Unicode range \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) return "hi";

  // Common transliterated Telugu words
  const teluguKeywords = /\b(jwaram|vastundi|undi|daggu|talanoppi|kadupu|nopi|badhaga|aayasam)\b/i;
  if (teluguKeywords.test(text)) return "te";

  // Common transliterated Hindi words
  const hindiKeywords = /\b(bukhar|hai|dard|khasi|tabiyat|sar|pet|saans)\b/i;
  if (hindiKeywords.test(text)) return "hi";

  return "en";
}

async function findExistingPatient(phone) {
  try {
    const cleanPhone = normalizePhone(phone);
    const digitsOnly = cleanPhone.replace(/\D/g, "");

    // Check if Patient or User model is registered
    const PatientModel =
      mongoose.models.Patient ||
      mongoose.models.User ||
      (mongoose.modelNames().includes("Patient") ? mongoose.model("Patient") : null) ||
      (mongoose.modelNames().includes("User") ? mongoose.model("User") : null);

    if (!PatientModel) {
      return null;
    }

    const patient = await PatientModel.findOne({
      $or: [
        { phone: cleanPhone },
        { phoneNumber: cleanPhone },
        { phone: digitsOnly },
        { phoneNumber: digitsOnly },
        { phone: { $regex: digitsOnly.slice(-10) + "$" } },
      ],
    });

    return patient;
  } catch (err) {
    console.warn("Patient lookup failed gracefully:", err.message);
    return null;
  }
}

async function getOrCreateConversation(phone, patientId = null) {
  const cleanPhone = normalizePhone(phone);
  try {
    if (mongoose.connection.readyState === 1) {
      let conv = await Conversation.findOne({ phone: cleanPhone });
      if (!conv) {
        conv = await Conversation.create({
          phone: cleanPhone,
          patientId: patientId || cleanPhone,
          language: null,
          messages: [],
        });
      } else if (patientId && !conv.patientId) {
        conv.patientId = patientId;
        await conv.save();
      }
      return conv;
    }
  } catch (err) {
    console.warn("MongoDB conversation lookup failed, using memory store:", err.message);
  }

  // Memory fallback
  if (!memoryConversations.has(cleanPhone)) {
    memoryConversations.set(cleanPhone, {
      phone: cleanPhone,
      patientId: patientId || cleanPhone,
      language: null,
      messages: [],
      save: async function () {
        memoryConversations.set(this.phone, this);
        return this;
      },
    });
  }
  return memoryConversations.get(cleanPhone);
}

async function saveTriageRecord(data) {
  try {
    if (mongoose.connection.readyState === 1) {
      return await Triage.create(data);
    }
  } catch (err) {
    console.warn("MongoDB triage save failed:", err.message);
  }
  return data;
}

async function handleWhatsAppWebhook(req, res) {
  try {
    const rawFrom = req.body.From || req.body.from || req.query.From || "";
    const rawBody = req.body.Body || req.body.body || req.query.Body || "";

    const phone = normalizePhone(rawFrom);
    const body = String(rawBody).trim();

    if (!phone) {
      const responseText = "Invalid request: Missing sender phone number.";
      return res.type("text/xml").send(generateTwiMLMessage(responseText));
    }

    // Check if patient exists (if Patient model exists)
    const patient = await findExistingPatient(phone);
    const patientId = patient ? patient._id : phone;

    const conversation = await getOrCreateConversation(phone, patientId);
    let replyText = "";
    let messageIntent = "GENERAL";

    const upperBody = body.toUpperCase();

    // 1. Check for Language Change Command
    if (["LANG", "LANGUAGE", "CHANGE LANGUAGE", "భాష", "भाषा"].includes(upperBody)) {
      conversation.language = null;
      conversation.lastMenuState = "AWAITING_LANGUAGE";
      replyText = MESSAGES.welcomeLanguagePrompt;
    }
    // 2. Language is not set yet
    else if (!conversation.language) {
      if (["HI", "HELLO", "HEY", "NAMASTE", "START", "MENU", "HELP"].includes(upperBody)) {
        conversation.lastMenuState = "AWAITING_LANGUAGE";
        replyText = MESSAGES.welcomeLanguagePrompt;
      } else if (["1", "ENGLISH"].includes(upperBody) || upperBody === "EN") {
        conversation.language = "en";
        conversation.lastMenuState = "MAIN_MENU";
        replyText = MESSAGES.menus.en;
      } else if (["2", "HINDI", "हिन्दी", "हिंदी"].includes(upperBody)) {
        conversation.language = "hi";
        conversation.lastMenuState = "MAIN_MENU";
        replyText = MESSAGES.menus.hi;
      } else if (["3", "TELUGU", "తెలుగు"].includes(upperBody) || upperBody === "TE") {
        conversation.language = "te";
        conversation.lastMenuState = "MAIN_MENU";
        replyText = MESSAGES.menus.te;
      } else {
        // Check if direct symptom input before language was explicitly selected
        const detected = detectScriptLanguage(body);
        if (body.length > 3 && (body.includes(" ") || detected !== "en")) {
          // Direct symptoms sent right away
          conversation.language = detected;
          messageIntent = "SYMPTOM";
          try {
            const assessment = await analyzeSymptoms(body, detected);
            messageIntent = assessment.intent || "SYMPTOM";

            // Save Triage
            await saveTriageRecord({
              patientId,
              symptoms: assessment.symptoms,
              priority: assessment.priority,
              possibleConditions: assessment.possibleConditions,
              redFlags: assessment.redFlags,
              recommendation: assessment.recommendation,
              language: detected,
              source: "whatsapp",
            });

            replyText = formatWhatsAppResponse(assessment, detected);
          } catch (err) {
            console.error("Gemini triage error:", err);
            replyText = MESSAGES.fallbackError[detected] || MESSAGES.fallbackError.en;
          }
        } else {
          // Standard welcome & language prompt
          replyText = MESSAGES.welcomeLanguagePrompt;
        }
      }
    }
    // 3. Language is set, check for menu selection or direct symptoms
    else {
      const lang = conversation.language;

      if (["1", "2", "3", "4", "5"].includes(body)) {
        // Menu item selected
        const optionNum = parseInt(body, 10);
        replyText = MESSAGES.menuOptions[lang]?.[optionNum] || MESSAGES.menus[lang];
        messageIntent = optionNum === 1 ? "SYMPTOM_REQUEST" : "MENU_NAVIGATION";
      } else if (["HI", "HELLO", "NAMASTE", "MENU", "START"].includes(upperBody)) {
        // Re-show localized menu
        replyText = MESSAGES.menus[lang];
        messageIntent = "GREETING";
      } else {
        // Direct symptom message or inquiry
        messageIntent = "SYMPTOM";
        try {
          const assessment = await analyzeSymptoms(body, lang);
          messageIntent = assessment.intent || "SYMPTOM";

          // Save Triage record
          await saveTriageRecord({
            patientId,
            symptoms: assessment.symptoms,
            priority: assessment.priority,
            possibleConditions: assessment.possibleConditions,
            redFlags: assessment.redFlags,
            recommendation: assessment.recommendation,
            language: lang,
            source: "whatsapp",
          });

          replyText = formatWhatsAppResponse(assessment, lang);
        } catch (err) {
          console.error("Gemini triage error in chatbot:", err);
          replyText = MESSAGES.fallbackError[lang] || MESSAGES.fallbackError.en;
        }
      }
    }

    // Save message history to conversation
    if (conversation.messages) {
      conversation.messages.push({
        sender: "patient",
        message: body,
        intent: messageIntent,
        timestamp: new Date(),
      });
      conversation.messages.push({
        sender: "bot",
        message: replyText,
        intent: messageIntent,
        timestamp: new Date(),
      });
      await conversation.save();
    }

    // Return TwiML XML response
    res.type("text/xml");
    return res.status(200).send(generateTwiMLMessage(replyText));
  } catch (error) {
    console.error("Twilio Webhook Critical Error:", error);
    res.type("text/xml");
    return res.status(200).send(generateTwiMLMessage(MESSAGES.fallbackError.en));
  }
}

module.exports = {
  handleWhatsAppWebhook,
  findExistingPatient,
  getOrCreateConversation,
};
