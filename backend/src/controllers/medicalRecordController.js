const MedicalRecord = require("../models/MedicalRecord");

const createMedicalRecord = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      visitDate,
      symptoms,
      vitals,
      diagnosis,
      testReports,
      doctorNotes,
    } = req.body;

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      visitDate,
      symptoms,
      vitals,
      diagnosis,
      testReports,
      doctorNotes,
    });

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create medical record",
      error: error.message,
    });
  }
};

const getPatientMedicalRecords = async (req, res) => {
  try {
    const { id } = req.params;

    const records = await MedicalRecord.find({
      patientId: id,
    })
      .populate("doctorId", "name specialization")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

const getMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id)
      .populate("patientId")
      .populate("doctorId", "name specialization");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical record",
      error: error.message,
    });
  }
};

module.exports = {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecord,
};