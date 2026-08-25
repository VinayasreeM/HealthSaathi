const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const {
  sendPrescriptionNotification,
} = require("../services/notificationService");

// Create a prescription
const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      medicalRecordId,
      diagnosis,
      medicines,
      recommendations,
      nextVisitDate,
    } = req.body;

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      medicalRecordId,
      diagnosis,
      medicines,
      recommendations,
      nextVisitDate,
    });

    // Send WhatsApp/SMS notification after prescription is saved
    try {
      const patient = await Patient.findById(patientId);

      if (patient) {
        await sendPrescriptionNotification(patient, prescription);
      }
    } catch (notificationError) {
      console.warn(
        "Prescription notification warning:",
        notificationError.message
      );
    }

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};

// Get all prescriptions for a patient
const getPatientPrescriptions = async (req, res) => {
  try {
    const { id } = req.params;

    const prescriptions = await Prescription.find({
      patientId: id,
    })
      .populate("doctorId", "name specialization")
      .populate("medicalRecordId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// Get one prescription
const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate("patientId")
      .populate("doctorId", "name specialization")
      .populate("medicalRecordId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
};