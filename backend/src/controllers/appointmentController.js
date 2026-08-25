const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const {
  sendAppointmentNotification,
} = require("../services/notificationService");

// Create an appointment
const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      reason,
      status,
    } = req.body;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      reason,
      status,
    });

    // Send WhatsApp/SMS notification after appointment is created
    // Notification failure should not fail the appointment creation.
    try {
      const patient = await Patient.findById(patientId);

      if (patient) {
        await sendAppointmentNotification(patient, appointment);
      }
    } catch (notificationError) {
      console.warn(
        "Appointment notification warning:",
        notificationError.message
      );
    }

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

// Get all appointments for a patient
const getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    const appointments = await Appointment.find({
      patientId: id,
    })
      .populate("doctorId", "name specialization")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// Get all appointments for a doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    const appointments = await Appointment.find({
      doctorId: id,
    })
      .populate("patientId", "name phone")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};