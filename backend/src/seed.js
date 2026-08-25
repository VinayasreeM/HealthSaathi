/**
 * Demo seed script.
 * Usage:  npm run seed   (from the backend folder)
 *
 * Creates:
 *   - Doctor account:  doctor@healthsaathi.com / doctor123
 *   - Patient account: patient@healthsaathi.com / patient123
 *   - One medical record, one prescription (+recommendations),
 *     one follow-up appointment, one AI triage result and notifications,
 *     all linked to the SAME patient so the Patient Dashboard has data.
 */
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("./models/User");
const PatientProfile = require("./models/PatientProfile");
const MedicalRecord = require("./models/MedicalRecord");
const Prescription = require("./models/Prescription");
const Appointment = require("./models/Appointment");
const Recommendation = require("./models/Recommendation");
const Triage = require("./models/Triage");
const Notification = require("./models/Notification");

async function upsertUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password, role });
  }
  return user;
}

async function seed() {
  await connectDB();

  const doctor = await upsertUser({
    name: "Dr. Rahul Sharma",
    email: "doctor@healthsaathi.com",
    password: "doctor123",
    role: "doctor",
  });

  const patient = await upsertUser({
    name: "Ravi Kumar",
    email: "patient@healthsaathi.com",
    password: "patient123",
    role: "patient",
  });

  await PatientProfile.updateOne(
    { user: patient._id },
    {
      $set: {
        user: patient._id,
        age: 45,
        gender: "Male",
        phone: "+91 98765 43210",
        bloodGroup: "B+",
        allergies: ["Penicillin"],
        address: "12 Gandhi Road, Bengaluru, Karnataka",
      },
    },
    { upsert: true }
  );

  const existing = await MedicalRecord.countDocuments({ patient: patient._id });
  if (existing === 0) {
    await MedicalRecord.create({
      patient: patient._id,
      doctor: doctor._id,
      visitDate: new Date(),
      symptoms: ["Fever", "Cough"],
      diagnosis: "Respiratory Infection",
      vitals: { bp: "120/80", temperature: "101 F", heartRate: "82 bpm" },
      testReports: "CBC - mild elevated WBC",
      notes: "Rest and maintain hydration.",
    });

    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,
      diagnosis: "Hypertension",
      medicines: [
        {
          name: "Metformin",
          dosage: "500 mg",
          frequency: "Twice daily",
          timing: "08:00 AM, 08:00 PM",
          duration: "30 days",
          instructions: "Take after food.",
        },
      ],
      recommendations: "Reduce salt intake.\nDrink sufficient water.\nTake medicines on time.",
      nextVisitDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // ~3 weeks out
    });

    await Recommendation.create({
      patient: patient._id,
      doctor: doctor._id,
      items: [
        "Reduce salt intake",
        "Drink sufficient water",
        "Take medicines on time",
        "Attend your follow-up appointment",
      ],
      sourcePrescription: prescription._id,
    });

    await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ~1 week out
      time: "10:30 AM",
      reason: "Follow-up consultation",
    });

    await Triage.create({
      patient: patient._id,
      priority: "MEDIUM",
      symptoms: ["Fever", "Cough"],
      possibleConditions: "Respiratory infection",
      recommendation:
        "Consult a healthcare professional if symptoms persist or worsen.",
      source: "whatsapp",
    });

    await Notification.create([
      {
        patient: patient._id,
        type: "prescription",
        title: "New Prescription",
        message: "Your doctor has added a new prescription.",
      },
      {
        patient: patient._id,
        type: "appointment",
        title: "Appointment Reminder",
        message: "Your appointment is coming up soon.",
      },
      {
        patient: patient._id,
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
