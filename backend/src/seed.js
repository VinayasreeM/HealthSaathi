/**
 * Demo seed script - aligned with the merged backend models
 * (User + Patient/Doctor profile docs, MedicalRecord, Prescription,
 *  Medication, Triage, Notification).
 *
 * Usage: npm run seed   (from the backend folder)
 */
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const MedicalRecord = require("./models/MedicalRecord");
const Prescription = require("./models/Prescription");
const Medication = require("./models/Medication");
const Appointment = require("./models/Appointment");
const Triage = require("./models/Triage");
const Notification = require("./models/Notification");

async function upsertUser({ name, email, phone, password, role }) {
  // The merged User model has no pre-save hook - the auth controller
  // hashes manually, so we do the same here.
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, email, phone, password: hashed, role } },
    { new: true, upsert: true }
  );
  return user;
}

async function seed() {
  await connectDB();

  // ---- Doctor ----
  const doctorUser = await upsertUser({
    name: "Dr. Rahul Sharma",
    email: "doctor@healthsaathi.com",
    phone: "+91 90000 00001",
    password: "doctor123",
    role: "doctor",
  });

  let doctorDoc = await Doctor.findOne({ userId: doctorUser._id });
  if (!doctorDoc) {
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      doctorId: "DOC-000001",
      name: "Dr. Rahul Sharma",
      specialization: "General Medicine",
      phone: "+91 90000 00001",
    });
  }

  // ---- Patient ----
  const patientUser = await upsertUser({
    name: "Ravi Kumar",
    email: "patient@healthsaathi.com",
    phone: "+91 98765 43210",
    password: "patient123",
    role: "patient",
  });

  let patientDoc = await Patient.findOne({ userId: patientUser._id });
  if (!patientDoc) {
    patientDoc = await Patient.create({
      userId: patientUser._id,
      patientId: "PAT-000001",
      name: "Ravi Kumar",
      age: 45,
      gender: "Male",
      phone: "+91 98765 43210",
      address: "12 Gandhi Road, Bengaluru, Karnataka",
      bloodGroup: "B+",
      allergies: ["Penicillin"],
    });
  }

  const existing = await MedicalRecord.countDocuments({ patientId: patientDoc._id });
  if (existing === 0) {
    const record = await MedicalRecord.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      visitDate: new Date(),
      symptoms: ["Fever", "Cough"],
      vitals: { bloodPressure: "120/80", temperature: 101, heartRate: 82 },
      diagnosis: ["Respiratory Infection"],
      testReports: ["CBC - mild elevated WBC"],
      doctorNotes: "Rest and maintain hydration.",
    });

    const prescription = await Prescription.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      medicalRecordId: record._id,
      diagnosis: "Hypertension",
      medicines: [
        {
          name: "Metformin",
          dosage: "500 mg",
          frequency: "Twice daily",
          duration: "30 days",
          instructions: "Take after food.",
        },
      ],
      recommendations: [
        "Reduce salt intake",
        "Drink sufficient water",
        "Take medicines on time",
        "Attend your follow-up appointment",
      ],
      nextVisitDate: new Date(Date.now() + 21 * 86400000),
    });

    await Medication.create([
      {
        patientId: patientDoc._id,
        prescriptionId: prescription._id,
        medicineName: "Metformin",
        dosage: "500 mg",
        times: ["08:00 AM", "08:00 PM"],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
        active: true,
      },
    ]);

    await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      appointmentDate: new Date(Date.now() + 7 * 86400000),
      reason: "Follow-up consultation",
      status: "scheduled",
    });

    await Triage.create({
      patientId: patientDoc._id,
      priority: "MEDIUM",
      symptoms: ["Fever", "Cough"],
      possibleConditions: ["Respiratory infection"],
      recommendation:
        "Consult a healthcare professional if symptoms persist or worsen.",
      source: "whatsapp",
    });

    await Notification.create([
      {
        patient: patientDoc._id,
        type: "prescription",
        title: "New Prescription",
        message: "Your doctor has added a new prescription.",
      },
      {
        patient: patientDoc._id,
        type: "appointment",
        title: "Appointment Reminder",
        message: "Your appointment is coming up soon.",
      },
      {
        patient: patientDoc._id,
        type: "assessment",
        title: "AI Assessment",
        message: "Your latest assessment is available.",
      },
    ]);
  } else {
    console.log("Demo data already exists, skipping record creation.");
  }

  console.log("\nSeed complete. Demo accounts:");
  console.log("  Doctor  -> doctor@healthsaathi.com / doctor123");
  console.log("  Patient -> patient@healthsaathi.com / patient123\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
