const Medication = require("../models/Medication");

// Create a medication
const createMedication = async (req, res) => {
  try {
    const {
      patientId,
      prescriptionId,
      medicineName,
      dosage,
      times,
      startDate,
      endDate,
      active,
    } = req.body;

    const medication = await Medication.create({
      patientId,
      prescriptionId,
      medicineName,
      dosage,
      times,
      startDate,
      endDate,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Medication created successfully",
      medication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create medication",
      error: error.message,
    });
  }
};

// Get all medications for a patient
const getPatientMedications = async (req, res) => {
  try {
    const { id } = req.params;

    const medications = await Medication.find({
      patientId: id,
    })
      .populate("prescriptionId")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      medications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch medications",
      error: error.message,
    });
  }
};

// Get active medications for a patient
const getActiveMedications = async (req, res) => {
  try {
    const { id } = req.params;

    const medications = await Medication.find({
      patientId: id,
      active: true,
    }).populate("prescriptionId");

    res.status(200).json({
      success: true,
      count: medications.length,
      medications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active medications",
      error: error.message,
    });
  }
};

// Update medication status
const updateMedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const medication = await Medication.findByIdAndUpdate(
      id,
      { active },
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medication status updated successfully",
      medication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update medication status",
      error: error.message,
    });
  }
};

module.exports = {
  createMedication,
  getPatientMedications,
  getActiveMedications,
  updateMedicationStatus,
};