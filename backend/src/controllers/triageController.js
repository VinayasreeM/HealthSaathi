const mongoose = require("mongoose");
const Triage = require("../models/Triage");
const { analyzeSymptoms } = require("../services/geminiService");

async function createTriage(req, res) {
  try {
    const {
      patientId,
      message,
      language = "en",
      source = "website",
      symptoms,
      priority,
      possibleConditions,
      redFlags,
      recommendation,
    } = req.body;

    let assessmentData = {};

    if (message && (!symptoms || !recommendation)) {
      // Analyze symptoms via Gemini
      const aiResult = await analyzeSymptoms(message, language);
      assessmentData = {
        patientId: patientId || null,
        symptoms: aiResult.symptoms || [],
        priority: aiResult.priority || "MEDIUM",
        possibleConditions: aiResult.possibleConditions || [],
        redFlags: aiResult.redFlags || [],
        recommendation: aiResult.recommendation || "",
        language: aiResult.language || language,
        source: source || "website",
      };
    } else {
      assessmentData = {
        patientId: patientId || null,
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
        priority: ["HIGH", "MEDIUM", "LOW"].includes(String(priority).toUpperCase())
          ? String(priority).toUpperCase()
          : "MEDIUM",
        possibleConditions: Array.isArray(possibleConditions) ? possibleConditions : [],
        redFlags: Array.isArray(redFlags) ? redFlags : [],
        recommendation: recommendation || "Consult a doctor for advice.",
        language: ["en", "hi", "te"].includes(language) ? language : "en",
        source: source || "website",
      };
    }

    let savedRecord = assessmentData;
    if (mongoose.connection.readyState === 1) {
      savedRecord = await Triage.create(assessmentData);
    }

    return res.status(201).json({
      success: true,
      message: "Triage assessment completed successfully",
      data: savedRecord,
    });
  } catch (error) {
    console.error("Error creating triage:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create triage assessment",
      code: error.code || "TRIAGE_ERROR",
    });
  }
}

async function getPatientTriage(req, res) {
  try {
    const patientId = req.params.id || req.params.patientId;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    let records = [];
    if (mongoose.connection.readyState === 1) {
      records = await Triage.find({ patientId }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching patient triage:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch triage records",
    });
  }
}

async function getTriageById(req, res) {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const record = await Triage.findById(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Triage record not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: record,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Database not connected",
    });
  } catch (error) {
    console.error("Error fetching triage record:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch triage record",
    });
  }
}

module.exports = {
  createTriage,
  getPatientTriage,
  getTriageById,
};
