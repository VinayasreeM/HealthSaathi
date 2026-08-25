// HealthSaathi Doctor Mock Data Store (20 Initial Patients, Synchronized State)

const STORAGE_KEYS = {
  PATIENTS: "healthsaathi_doc_patients_v3",
  FOLLOW_UPS: "healthsaathi_doc_followups_v3",
  APPOINTMENTS: "healthsaathi_doc_appointments_v3",
};

export const currentDoctor = {
  name: "Dr. Rahul",
  title: "General Physician",
  hospital: "HealthSaathi Medical Center",
  avatarInitials: "DR",
};

// Exactly 20 Initial Patients: 4 HIGH, 7 MEDIUM, 9 LOW
export const initialPatients = [
  // 1. HIGH RISK (4 patients)
  {
    id: "P1001",
    name: "Ravi Kumar",
    age: 45,
    gender: "Male",
    risk: "HIGH",
    status: "New",
    phone: "+91 98765 43210",
    address: "12th Cross, Indiranagar, Bengaluru",
    bloodGroup: "B+",
    allergies: "Penicillin",
    mainIssue: "Fever + difficulty breathing",
    lastVisit: "25 Feb 2026",
    history: [
      { date: "15 Jan 2026", condition: "Seasonal Allergies", notes: "Prescribed antihistamines. Recovered." },
      { date: "10 Aug 2025", condition: "Annual Health Checkup", notes: "Normal ECG, elevated systolic BP (138/88)." },
    ],
    currentMedications: [
      { name: "Amoxicillin + Clavulanate", dosage: "625mg", frequency: "Twice daily", duration: "5 days", instructions: "Take after meals with warm water" },
      { name: "Paracetamol", dosage: "650mg", frequency: "Three times daily", duration: "3 days", instructions: "For fever > 100°F" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
    ],
    prescription: {
      diagnosis: "Acute Bronchial Hyperreactivity & Upper Respiratory Tract Infection",
      medicines: [
        { name: "Amoxicillin + Clavulanate", dosage: "625mg", frequency: "Twice daily", duration: "5 days", instructions: "Take after meals with warm water" },
        { name: "Paracetamol", dosage: "650mg", frequency: "Three times daily", duration: "3 days", instructions: "For fever > 100°F" },
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
      ],
      instructions: "Drink plenty of warm fluids, steam inhalation twice daily, and monitor temperature.",
      recommendations: "Avoid cold items and air conditioned rooms. Strict rest for 3 days.",
      prescriptionDate: "25 Feb 2026",
      nextFollowUpDate: "2026-03-02",
      nextFollowUpReason: "Blood Pressure & Chest Review",
    },
    nextFollowUp: {
      date: "15 Sep 2026",
      time: "10:00 AM",
      reason: "Blood Pressure & Chest Review",
    },
  },
  {
    id: "P1003",
    name: "Suresh Rao",
    age: 56,
    gender: "Male",
    risk: "HIGH",
    status: "New",
    phone: "+91 97654 32109",
    address: "77, 4th Main, Malleshwaram, Bengaluru",
    bloodGroup: "A+",
    allergies: "None",
    mainIssue: "Severe Blood Pressure Spike (155/95 mmHg)",
    lastVisit: "22 Feb 2026",
    history: [
      { date: "12 Dec 2025", condition: "Stage 2 Hypertension", notes: "BP recorded 150/92. Dose titration recommended." },
      { date: "15 Apr 2024", condition: "Dyslipidemia", notes: "Borderline high LDL-C (142 mg/dL)." },
    ],
    currentMedications: [
      { name: "Telmisartan", dosage: "40mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning after breakfast" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take at bedtime" },
    ],
    prescription: {
      diagnosis: "Stage 2 Essential Hypertension with uncontrolled systolic elevation",
      medicines: [
        { name: "Telmisartan", dosage: "40mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning after breakfast" },
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take at bedtime" },
      ],
      instructions: "Check and log morning and evening BP readings daily.",
      recommendations: "Restrict sodium intake to < 2g/day. Avoid salty fried snacks.",
      prescriptionDate: "22 Feb 2026",
      nextFollowUpDate: "2026-02-28",
      nextFollowUpReason: "BP Medication Titration Review",
    },
    nextFollowUp: {
      date: "28 Feb 2026",
      time: "02:00 PM",
      reason: "BP Medication Titration Review",
    },
  },
  {
    id: "P1005",
    name: "Harish Verma",
    age: 62,
    gender: "Male",
    risk: "HIGH",
    status: "New",
    phone: "+91 94480 12399",
    address: "24, 7th Cross, Jayanagar, Bengaluru",
    bloodGroup: "O+",
    allergies: "Aspirin (Causes Gastritis)",
    mainIssue: "Acute Chest Discomfort on Exertion",
    lastVisit: "24 Feb 2026",
    history: [
      { date: "02 Nov 2025", condition: "Ischemic Heart Disease Evaluation", notes: "Treadmill test borderline positive. Advised cardiological follow-up." },
    ],
    currentMedications: [
      { name: "Metoprolol Succinate ER", dosage: "25mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days", instructions: "Take at night before sleep" },
      { name: "Clopidogrel", dosage: "75mg", frequency: "Once daily", duration: "30 days", instructions: "Take after lunch" },
    ],
    prescription: {
      diagnosis: "Stable Angina Pectoris with Moderate Exertional Dyspnea",
      medicines: [
        { name: "Metoprolol Succinate ER", dosage: "25mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast" },
        { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days", instructions: "Take at night before sleep" },
        { name: "Clopidogrel", dosage: "75mg", frequency: "Once daily", duration: "30 days", instructions: "Take after lunch" },
      ],
      instructions: "Avoid strenuous heavy lifting. Seek emergency room if chest pain lasts > 15 mins.",
      recommendations: "Schedule 2D Echocardiogram and Lipid Profile in 1 week.",
      prescriptionDate: "24 Feb 2026",
      nextFollowUpDate: "2026-03-04",
      nextFollowUpReason: "2D Echo & Cardiac Symptom Review",
    },
    nextFollowUp: {
      date: "04 Mar 2026",
      time: "09:30 AM",
      reason: "2D Echo & Cardiac Symptom Review",
    },
  },
  {
    id: "P1007",
    name: "Sunita Patil",
    age: 52,
    gender: "Female",
    risk: "HIGH",
    status: "New",
    phone: "+91 98112 34567",
    address: "Flat 12, Sunrise Apts, Koramangala, Bengaluru",
    bloodGroup: "AB-",
    allergies: "Sulfa Drugs",
    mainIssue: "Uncontrolled Blood Glucose & Foot Ulcer",
    lastVisit: "23 Feb 2026",
    history: [
      { date: "14 Oct 2025", condition: "Type 2 Diabetes (Uncontrolled)", notes: "HbA1c 9.2%. Insulin initiation advised." },
    ],
    currentMedications: [
      { name: "Metformin ER", dosage: "1000mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with breakfast and dinner" },
      { name: "Insulin Glargine", dosage: "10 Units", frequency: "Once daily (Bedtime)", duration: "30 days", instructions: "Subcutaneous injection at 10 PM" },
      { name: "Mupirocin Ointment 2%", dosage: "Apply topically", frequency: "Twice daily", duration: "10 days", instructions: "Apply on cleaned foot ulcer dressing" },
    ],
    prescription: {
      diagnosis: "Uncontrolled Type 2 Diabetes Mellitus with Grade 1 Neuropathic Plantar Ulcer",
      medicines: [
        { name: "Metformin ER", dosage: "1000mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with breakfast and dinner" },
        { name: "Insulin Glargine", dosage: "10 Units", frequency: "Once daily (Bedtime)", duration: "30 days", instructions: "Subcutaneous injection at 10 PM" },
        { name: "Mupirocin Ointment 2%", dosage: "Apply topically", frequency: "Twice daily", duration: "10 days", instructions: "Apply on cleaned foot ulcer dressing" },
      ],
      instructions: "Daily diabetic foot inspection. Keep ulcer area dry and clean.",
      recommendations: "Strict diabetic diet (<1500 kcal). Daily fasting blood sugar log.",
      prescriptionDate: "23 Feb 2026",
      nextFollowUpDate: "2026-03-01",
      nextFollowUpReason: "Diabetic Foot Dressing & Fasting Glucose Review",
    },
    nextFollowUp: {
      date: "01 Mar 2026",
      time: "11:00 AM",
      reason: "Diabetic Foot Dressing & Fasting Glucose Review",
    },
  },

  // 2. MEDIUM RISK (7 patients)
  {
    id: "P1002",
    name: "Anjali Reddy",
    age: 32,
    gender: "Female",
    risk: "MEDIUM",
    status: "New",
    phone: "+91 98123 45678",
    address: "Flat 4B, Green Meadows, Koramangala, Bengaluru",
    bloodGroup: "O+",
    allergies: "None",
    mainIssue: "Diabetes Follow-up & Routine Monitoring",
    lastVisit: "20 Feb 2026",
    history: [{ date: "04 Nov 2025", condition: "Type 2 Diabetes Mellitus", notes: "HbA1c 7.1%. Initiated on Metformin." }],
    currentMedications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "With breakfast & dinner" }],
    prescription: {
      diagnosis: "Type 2 Diabetes Mellitus (Stable Glycemic Control)",
      medicines: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take immediately after meals" }],
      instructions: "Maintain fasting blood sugar log every alternate day.",
      recommendations: "Low carbohydrate diet and 30 min daily brisk walking.",
      prescriptionDate: "20 Feb 2026",
      nextFollowUpDate: "2026-03-10",
      nextFollowUpReason: "Fasting Blood Sugar & HbA1c Review",
    },
    nextFollowUp: { date: "11:30 AM", time: "11:30 AM", reason: "Diabetes Follow-up" },
  },
  {
    id: "P1006",
    name: "Vikram Malhotra",
    age: 48,
    gender: "Male",
    risk: "MEDIUM",
    status: "New",
    phone: "+91 96111 22334",
    address: "18, 5th Cross, HSR Layout, Bengaluru",
    bloodGroup: "B+",
    allergies: "NSAIDs (Causes Gastric Upset)",
    mainIssue: "Chronic Migraine with Visual Aura",
    lastVisit: "18 Feb 2026",
    history: [{ date: "10 Oct 2025", condition: "Recurrent Migraine Attacks", notes: "Precipitated by sleep deprivation and screen glare." }],
    currentMedications: [{ name: "Zolmitriptan", dosage: "2.5mg", frequency: "SOS at aura onset", duration: "SOS", instructions: "Take immediately when visual aura starts" }],
    prescription: {
      diagnosis: "Chronic Migraine with Visual Aura",
      medicines: [{ name: "Zolmitriptan", dosage: "2.5mg", frequency: "SOS", duration: "SOS", instructions: "Take at aura onset" }],
      instructions: "Keep a headache trigger diary.",
      recommendations: "Maintain consistent sleep cycle and use anti-glare screen filters.",
      prescriptionDate: "18 Feb 2026",
      nextFollowUpDate: "2026-03-12",
      nextFollowUpReason: "Migraine Frequency Diary Review",
    },
    nextFollowUp: { date: "12 Mar 2026", time: "03:00 PM", reason: "Migraine Frequency Review" },
  },
  {
    id: "P1008",
    name: "Meera Joshi",
    age: 41,
    gender: "Female",
    risk: "MEDIUM",
    status: "Follow-up",
    phone: "+91 98800 33441",
    address: "32, 14th Main, Banashankari 2nd Stage, Bengaluru",
    bloodGroup: "A+",
    allergies: "None",
    mainIssue: "Hypothyroidism & Persistent Fatigue",
    lastVisit: "15 Feb 2026",
    history: [{ date: "20 Jul 2025", condition: "Hashimoto's Hypothyroidism", notes: "TSH 6.8 mIU/L. On Levothyroxine 50mcg." }],
    currentMedications: [{ name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily (Fasting)", duration: "60 days", instructions: "Take on empty stomach with water" }],
    prescription: {
      diagnosis: "Primary Hypothyroidism on Hormone Replacement Therapy",
      medicines: [{ name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily (Fasting)", duration: "60 days", instructions: "Take 30 mins before morning tea" }],
      instructions: "Strict fasting intake in the morning.",
      recommendations: "Repeat Serum TSH and Free T4 in 6 weeks.",
      prescriptionDate: "15 Feb 2026",
      nextFollowUpDate: "2026-03-15",
      nextFollowUpReason: "Thyroid Profile (TSH/FT4) Review",
    },
    nextFollowUp: { date: "15 Mar 2026", time: "11:45 AM", reason: "Thyroid Profile Review" },
  },
  {
    id: "P1009",
    name: "Kavita Desai",
    age: 36,
    gender: "Female",
    risk: "MEDIUM",
    status: "Follow-up",
    phone: "+91 99887 66554",
    address: "Flat 202, Palm Springs, Whitefield, Bengaluru",
    bloodGroup: "B-",
    allergies: "Dust Mites & Strong Fragrances",
    mainIssue: "Mild Bronchial Asthma Exacerbation",
    lastVisit: "12 Feb 2026",
    history: [{ date: "05 Aug 2025", condition: "Bronchial Asthma", notes: "Triggered during winter weather transitions." }],
    currentMedications: [{ name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "2 puffs SOS", duration: "As needed", instructions: "Rinse mouth with water after inhalation" }],
    prescription: {
      diagnosis: "Extrinsic Bronchial Asthma with Intermittent Bronchospasm",
      medicines: [{ name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "2 puffs SOS", duration: "As needed", instructions: "Use with spacer" }],
      instructions: "Avoid exposure to cold winds and dusty environments.",
      recommendations: "Monitor Peak Expiratory Flow Rate (PEFR).",
      prescriptionDate: "12 Feb 2026",
      nextFollowUpDate: "2026-03-18",
      nextFollowUpReason: "Asthma Control & Inhaler Technique Review",
    },
    nextFollowUp: { date: "18 Mar 2026", time: "02:30 PM", reason: "Asthma Control Review" },
  },
  {
    id: "P1010",
    name: "Arun Nayak",
    age: 58,
    gender: "Male",
    risk: "MEDIUM",
    status: "Follow-up",
    phone: "+91 97401 23890",
    address: "No. 45, Koramangala 4th Block, Bengaluru",
    bloodGroup: "O-",
    allergies: "None",
    mainIssue: "Stage 1 Hypertension Routine Review",
    lastVisit: "10 Feb 2026",
    history: [{ date: "18 Nov 2025", condition: "Hypertension", notes: "BP 142/88. Recommended lifestyle modification." }],
    currentMedications: [{ name: "Enalapril", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" }],
    prescription: {
      diagnosis: "Stage 1 Essential Hypertension",
      medicines: [{ name: "Enalapril", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" }],
      instructions: "Maintain low sodium diet.",
      recommendations: "Regular daily walking 45 mins.",
      prescriptionDate: "10 Feb 2026",
      nextFollowUpDate: "2026-03-20",
      nextFollowUpReason: "BP & Renal Function Check",
    },
    nextFollowUp: { date: "20 Mar 2026", time: "10:15 AM", reason: "BP & Renal Function Check" },
  },
  {
    id: "P1011",
    name: "Pooja Hegde",
    age: 29,
    gender: "Female",
    risk: "MEDIUM",
    status: "New",
    phone: "+91 96112 33445",
    address: "10th Main, Malleshwaram, Bengaluru",
    bloodGroup: "AB+",
    allergies: "None",
    mainIssue: "Post-Viral Arthralgia & Joint Pain",
    lastVisit: "08 Feb 2026",
    history: [{ date: "22 Jan 2026", condition: "Viral Fever (Chikungunya-like)", notes: "Acute phase resolved, persistent joint aches." }],
    currentMedications: [{ name: "Paracetamol", dosage: "650mg", frequency: "Twice daily", duration: "7 days", instructions: "After meals" }],
    prescription: {
      diagnosis: "Post-Viral Reactive Arthralgia",
      medicines: [{ name: "Paracetamol", dosage: "650mg", frequency: "Twice daily", duration: "7 days", instructions: "After meals" }],
      instructions: "Warm water fomentation for knee and wrist joints.",
      recommendations: "Adequate calcium and hydration.",
      prescriptionDate: "08 Feb 2026",
      nextFollowUpDate: "2026-03-22",
      nextFollowUpReason: "Joint Mobility & Inflammatory Markers Review",
    },
    nextFollowUp: { date: "22 Mar 2026", time: "04:15 PM", reason: "Joint Mobility Review" },
  },
  {
    id: "P1012",
    name: "Rohan Sen",
    age: 50,
    gender: "Male",
    risk: "MEDIUM",
    status: "Follow-up",
    phone: "+91 94490 88776",
    address: "55, 2nd Stage, Indiranagar, Bengaluru",
    bloodGroup: "A-",
    allergies: "None",
    mainIssue: "Dyslipidemia & Borderline Fatty Liver",
    lastVisit: "05 Feb 2026",
    history: [{ date: "15 Sep 2025", condition: "Dyslipidemia", notes: "Triglycerides 220 mg/dL, LDL 148 mg/dL." }],
    currentMedications: [{ name: "Rosuvastatin", dosage: "10mg", frequency: "Once daily (Bedtime)", duration: "30 days", instructions: "Take at night" }],
    prescription: {
      diagnosis: "Mixed Hyperlipidemia & Grade 1 Hepatic Steatosis",
      medicines: [{ name: "Rosuvastatin", dosage: "10mg", frequency: "Once daily (Bedtime)", duration: "30 days", instructions: "Take at bedtime" }],
      instructions: "Avoid alcohol and fried foods.",
      recommendations: "Repeat Fasting Lipid Profile in 3 months.",
      prescriptionDate: "05 Feb 2026",
      nextFollowUpDate: "2026-03-25",
      nextFollowUpReason: "Lipid Profile & Liver Function Review",
    },
    nextFollowUp: { date: "25 Mar 2026", time: "09:00 AM", reason: "Lipid Profile Review" },
  },

  // 3. LOW RISK (9 patients)
  {
    id: "P1004",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    risk: "LOW",
    status: "New",
    phone: "+91 99012 34567",
    address: "HSR Layout Sector 1, Bengaluru",
    bloodGroup: "AB+",
    allergies: "Aspirin (Mild rash)",
    mainIssue: "General Check-up & Mild Fatigue",
    lastVisit: "18 Feb 2026",
    history: [{ date: "18 Sep 2025", condition: "Tension Headache", notes: "Manage with stress reduction and hydration." }],
    currentMedications: [],
    prescription: null,
    nextFollowUp: { date: "04:00 PM", time: "04:00 PM", reason: "General Check-up" },
  },
  {
    id: "P1013",
    name: "Sneha Nair",
    age: 24,
    gender: "Female",
    risk: "LOW",
    status: "Stable",
    phone: "+91 98860 11223",
    address: "Villa 14, Palm Meadows, Whitefield, Bengaluru",
    bloodGroup: "B+",
    allergies: "Pollen",
    mainIssue: "Seasonal Allergic Rhinitis (Sneezing & Watery Eyes)",
    lastVisit: "14 Feb 2026",
    history: [{ date: "10 Oct 2025", condition: "Allergic Rhinitis", notes: "Responds well to Levocetirizine." }],
    currentMedications: [{ name: "Levocetirizine", dosage: "5mg", frequency: "Once daily (Bedtime)", duration: "10 days", instructions: "Take at night" }],
    prescription: {
      diagnosis: "Seasonal Allergic Rhinitis",
      medicines: [{ name: "Levocetirizine", dosage: "5mg", frequency: "Once daily (Bedtime)", duration: "10 days", instructions: "Take at bedtime" }],
      instructions: "Avoid outdoor morning walks during high pollen count.",
      recommendations: "Steam inhalation as needed.",
      prescriptionDate: "14 Feb 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
  {
    id: "P1014",
    name: "Deepak Menon",
    age: 31,
    gender: "Male",
    risk: "LOW",
    status: "Stable",
    phone: "+91 97311 22446",
    address: "88, 3rd Block, Koramangala, Bengaluru",
    bloodGroup: "O+",
    allergies: "None",
    mainIssue: "Annual Corporate Wellness Health Screening",
    lastVisit: "11 Feb 2026",
    history: [{ date: "11 Feb 2026", condition: "Routine Wellness Checkup", notes: "All routine blood parameters within normal limits." }],
    currentMedications: [{ name: "Multivitamin + Zinc", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", instructions: "After breakfast" }],
    prescription: {
      diagnosis: "Normal Clinical Status - Annual Health Screening",
      medicines: [{ name: "Multivitamin + Zinc", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast" }],
      instructions: "Maintain healthy balanced lifestyle and daily hydration.",
      recommendations: "Regular annual health checkup.",
      prescriptionDate: "11 Feb 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
  {
    id: "P1015",
    name: "Kiran Bedi",
    age: 26,
    gender: "Female",
    risk: "LOW",
    status: "Stable",
    phone: "+91 99002 44556",
    address: "303, Skyline Apts, Bellandur, Bengaluru",
    bloodGroup: "A+",
    allergies: "None",
    mainIssue: "Mild Vitamin D Deficiency & Muscle Cramps",
    lastVisit: "09 Feb 2026",
    history: [{ date: "09 Feb 2026", condition: "Vitamin D Deficiency (18 ng/mL)", notes: "Advised weekly oral Cholecalciferol course." }],
    currentMedications: [{ name: "Cholecalciferol (Vit D3)", dosage: "60,000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take with warm milk after lunch" }],
    prescription: {
      diagnosis: "Hypovitaminosis D",
      medicines: [{ name: "Cholecalciferol (Vit D3)", dosage: "60,000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take with warm milk after lunch" }],
      instructions: "15-20 minutes morning sun exposure daily.",
      recommendations: "Repeat 25-OH Vitamin D test after 2 months.",
      prescriptionDate: "09 Feb 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
  {
    id: "P1016",
    name: "Manoj Tiwari",
    age: 34,
    gender: "Male",
    risk: "LOW",
    status: "Stable",
    phone: "+91 98450 77889",
    address: "12, 1st Cross, BTM Layout, Bengaluru",
    bloodGroup: "B+",
    allergies: "None",
    mainIssue: "Mild Acid Reflux & Epigastric Burning",
    lastVisit: "07 Feb 2026",
    history: [{ date: "07 Feb 2026", condition: "Functional Dyspepsia", notes: "Dietary trigger related acid reflux." }],
    currentMedications: [{ name: "Pantoprazole", dosage: "40mg", frequency: "Once daily (Fasting)", duration: "14 days", instructions: "Take 30 mins before breakfast" }],
    prescription: {
      diagnosis: "Mild Gastroesophageal Reflux Disease (GERD)",
      medicines: [{ name: "Pantoprazole", dosage: "40mg", frequency: "Once daily (Fasting)", duration: "14 days", instructions: "Take 30 mins before breakfast" }],
      instructions: "Avoid spicy and deep-fried foods. Avoid lying down immediately after meals.",
      recommendations: "Small frequent meals.",
      prescriptionDate: "07 Feb 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
  {
    id: "P1017",
    name: "Neha Kulkarni",
    age: 27,
    gender: "Female",
    risk: "LOW",
    status: "Stable",
    phone: "+91 96200 33441",
    address: "21, 6th Main, Sadashivanagar, Bengaluru",
    bloodGroup: "O-",
    allergies: "None",
    mainIssue: "Pre-Travel Immunization & Health Consultation",
    lastVisit: "04 Feb 2026",
    history: [{ date: "04 Feb 2026", condition: "Travel Health Check", notes: "Vaccination schedule reviewed and updated." }],
    currentMedications: [],
    prescription: null,
    nextFollowUp: null,
  },
  {
    id: "P1018",
    name: "Aditya Kapoor",
    age: 22,
    gender: "Male",
    risk: "LOW",
    status: "Stable",
    phone: "+91 95350 88990",
    address: "Hostel 4, IISc Campus, Bengaluru",
    bloodGroup: "A+",
    allergies: "None",
    mainIssue: "Sports Sprain (Right Ankle Ligament Strain)",
    lastVisit: "02 Feb 2026",
    history: [{ date: "02 Feb 2026", condition: "Ankle Inversion Sprain", notes: "X-ray negative for fracture. Soft tissue rest." }],
    currentMedications: [{ name: "Diclofenac Gel", dosage: "Topical application", frequency: "Twice daily", duration: "5 days", instructions: "Apply gently without vigorous massage" }],
    prescription: {
      diagnosis: "Grade 1 Right Lateral Ankle Ligament Sprain",
      medicines: [{ name: "Diclofenac Gel", dosage: "Topical application", frequency: "Twice daily", duration: "5 days", instructions: "Apply gently without vigorous massage" }],
      instructions: "RICE Protocol: Rest, Ice application 15 mins, Compression with crepe bandage, Elevation.",
      recommendations: "Avoid running and jumping for 1 week.",
      prescriptionDate: "02 Feb 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
  {
    id: "P1019",
    name: "Divya Iyer",
    age: 30,
    gender: "Female",
    risk: "LOW",
    status: "Stable",
    phone: "+91 98801 22334",
    address: "74, 5th Main, JP Nagar 3rd Phase, Bengaluru",
    bloodGroup: "AB-",
    allergies: "Nickel (Contact dermatitis)",
    mainIssue: "Mild Contact Dermatitis on Wrist",
    lastVisit: "01 Feb 2026",
    history: [{ date: "01 Feb 2026", condition: "Contact Dermatitis", notes: "Watch strap allergy. Calamine lotion advised." }],
    currentMedications: [],
    prescription: null,
    nextFollowUp: null,
  },
  {
    id: "P1020",
    name: "Gaurav Mehta",
    age: 35,
    gender: "Male",
    risk: "LOW",
    status: "Stable",
    phone: "+91 97410 55667",
    address: "102, Green Glen Layout, Bellandur, Bengaluru",
    bloodGroup: "O+",
    allergies: "None",
    mainIssue: "Routine Computer Vision Syndrome & Dry Eyes",
    lastVisit: "28 Jan 2026",
    history: [{ date: "28 Jan 2026", condition: "Computer Vision Syndrome", notes: "Prescribed lubricating eye drops." }],
    currentMedications: [{ name: "Carboxymethylcellulose Eye Drops", dosage: "1 drop each eye", frequency: "Three times daily", duration: "30 days", instructions: "Instill when eyes feel dry" }],
    prescription: {
      diagnosis: "Asthenopia & Mild Dry Eye Syndrome",
      medicines: [{ name: "Carboxymethylcellulose Eye Drops", dosage: "1 drop each eye", frequency: "Three times daily", duration: "30 days", instructions: "Instill when eyes feel dry" }],
      instructions: "Follow 20-20-20 rule: Every 20 minutes look at an object 20 feet away for 20 seconds.",
      recommendations: "Adjust monitor height and brightness.",
      prescriptionDate: "28 Jan 2026",
      nextFollowUpDate: "",
      nextFollowUpReason: "",
    },
    nextFollowUp: null,
  },
];

// Initial 8 Appointments for Today (Ordered by Risk: HIGH -> MEDIUM -> LOW, then Time)
export const initialAppointments = [
  // HIGH RISK Appointments
  {
    id: "APT-101",
    time: "10:00 AM",
    patientId: "P1001",
    patientName: "Ravi Kumar",
    risk: "HIGH",
    reason: "Blood Pressure & Fever Review",
    status: "Upcoming",
  },
  {
    id: "APT-102",
    time: "02:00 PM",
    patientId: "P1003",
    patientName: "Suresh Rao",
    risk: "HIGH",
    reason: "BP Medication Titration Review",
    status: "Upcoming",
  },
  {
    id: "APT-103",
    time: "04:30 PM",
    patientId: "P1005",
    patientName: "Harish Verma",
    risk: "HIGH",
    reason: "Cardiac Symptom & ECG Follow-up",
    status: "Upcoming",
  },
  // MEDIUM RISK Appointments
  {
    id: "APT-104",
    time: "11:30 AM",
    patientId: "P1002",
    patientName: "Anjali Reddy",
    risk: "MEDIUM",
    reason: "Diabetes Follow-up",
    status: "Upcoming",
  },
  {
    id: "APT-105",
    time: "03:00 PM",
    patientId: "P1006",
    patientName: "Vikram Malhotra",
    risk: "MEDIUM",
    reason: "Migraine Frequency Review",
    status: "Upcoming",
  },
  // LOW RISK Appointments
  {
    id: "APT-106",
    time: "09:00 AM",
    patientId: "P1014",
    patientName: "Deepak Menon",
    risk: "LOW",
    reason: "Annual Wellness Checkup",
    status: "Completed",
  },
  {
    id: "APT-107",
    time: "01:00 PM",
    patientId: "P1016",
    patientName: "Manoj Tiwari",
    risk: "LOW",
    reason: "Acid Reflux Follow-up",
    status: "Completed",
  },
  {
    id: "APT-108",
    time: "04:00 PM",
    patientId: "P1004",
    patientName: "Priya Sharma",
    risk: "LOW",
    reason: "General Check-up",
    status: "Upcoming",
  },
];

// Initial Follow-ups list
export const initialFollowUps = [
  {
    id: "FU-01",
    patientId: "P1001",
    patientName: "Ravi Kumar",
    age: 45,
    risk: "HIGH",
    date: "15 Sep 2026",
    time: "10:00 AM",
    reason: "Blood Pressure & Fever Review",
    prescriptionSummary: "Amoxicillin 625mg + Amlodipine 5mg • Twice daily",
    status: "Scheduled",
  },
  {
    id: "FU-02",
    patientId: "P1003",
    patientName: "Suresh Rao",
    age: 56,
    risk: "HIGH",
    date: "28 Feb 2026",
    time: "02:00 PM",
    reason: "Severe BP Titration Review",
    prescriptionSummary: "Telmisartan 40mg + Amlodipine 5mg • Once daily",
    status: "Scheduled",
  },
  {
    id: "FU-03",
    patientId: "P1002",
    patientName: "Anjali Reddy",
    age: 32,
    risk: "MEDIUM",
    date: "10 Mar 2026",
    time: "11:30 AM",
    reason: "Diabetes Glycemic Control Follow-up",
    prescriptionSummary: "Metformin 500mg • Twice daily",
    status: "Scheduled",
  },
  {
    id: "FU-04",
    patientId: "P1006",
    patientName: "Vikram Malhotra",
    age: 48,
    risk: "MEDIUM",
    date: "12 Mar 2026",
    time: "03:00 PM",
    reason: "Migraine Frequency Diary Review",
    prescriptionSummary: "Zolmitriptan 2.5mg • SOS",
    status: "Scheduled",
  },
  {
    id: "FU-05",
    patientId: "P1004",
    patientName: "Priya Sharma",
    age: 28,
    risk: "LOW",
    date: "04 Apr 2026",
    time: "04:00 PM",
    reason: "General Health Review",
    prescriptionSummary: "No prescription yet",
    status: "Scheduled",
  },
];

// High Priority Cases on Dashboard
export const highPriorityCases = initialPatients.filter((p) => p.risk === "HIGH");

// Helper functions with localStorage synchronization
export const getPatients = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));
      return initialPatients;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPatients;
  } catch (err) {
    return initialPatients;
  }
};

export const getPatientById = (id) => {
  const list = getPatients();
  return list.find((p) => String(p.id).toLowerCase() === String(id).toLowerCase()) || list[0] || null;
};

export const addNewPatient = (patientData) => {
  const list = getPatients();
  const nextNum = 1001 + list.length;
  const newId = `P${nextNum}`;

  const newPatient = {
    id: newId,
    name: patientData.name || "New Patient",
    age: parseInt(patientData.age) || 30,
    gender: patientData.gender || "Male",
    risk: patientData.risk || "MEDIUM",
    status: "New",
    phone: patientData.phone || "+91 90000 00000",
    address: patientData.address || "Bengaluru, Karnataka",
    bloodGroup: patientData.bloodGroup || "O+",
    allergies: patientData.allergies || "None",
    mainIssue: patientData.mainIssue || "Routine Clinical Consultation",
    lastVisit: "Today",
    history: [
      {
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        condition: "New Patient Registration",
        notes: "Registered as new patient at HealthSaathi.",
      },
    ],
    currentMedications: [],
    prescription: null,
    nextFollowUp: null,
  };

  const updated = [newPatient, ...list];
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updated));
  return newPatient;
};

export const getFollowUps = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(initialFollowUps));
      return initialFollowUps;
    }
    return JSON.parse(data);
  } catch (err) {
    return initialFollowUps;
  }
};

export const getAppointments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
      return initialAppointments;
    }
    return JSON.parse(data);
  } catch (err) {
    return initialAppointments;
  }
};

export const savePatientPrescription = (patientId, prescriptionData) => {
  const patients = getPatients();
  const idx = patients.findIndex(
    (p) => String(p.id).toLowerCase() === String(patientId).toLowerCase()
  );

  if (idx === -1) return null;

  const updatedPrescription = {
    diagnosis: prescriptionData.diagnosis || "Clinical Consultation",
    medicines: prescriptionData.medicines || [],
    instructions: prescriptionData.instructions || "",
    recommendations: prescriptionData.recommendations || "",
    prescriptionDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    nextFollowUpDate: prescriptionData.nextFollowUpDate || "",
    nextFollowUpReason: prescriptionData.nextFollowUpReason || "",
  };

  patients[idx].prescription = updatedPrescription;

  // Sync active medications
  if (prescriptionData.medicines && prescriptionData.medicines.length > 0) {
    patients[idx].currentMedications = prescriptionData.medicines.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions,
    }));
  }

  // Update next follow-up in patient object
  if (prescriptionData.nextFollowUpDate) {
    patients[idx].nextFollowUp = {
      date: prescriptionData.nextFollowUpDate,
      time: "10:00 AM",
      reason: prescriptionData.nextFollowUpReason || "Clinical Review",
    };
  }

  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));

  // If next follow-up date is provided, create/update follow-up and appointment
  if (prescriptionData.nextFollowUpDate && prescriptionData.nextFollowUpReason) {
    const followUps = getFollowUps();
    const existingFuIdx = followUps.findIndex(
      (fu) => String(fu.patientId).toLowerCase() === String(patientId).toLowerCase()
    );

    const medSummary = prescriptionData.medicines && prescriptionData.medicines.length > 0
      ? prescriptionData.medicines.map((m) => `${m.name} ${m.dosage}`).join(" + ")
      : "Prescription Recorded";

    const followUpItem = {
      id: existingFuIdx !== -1 ? followUps[existingFuIdx].id : `FU-${Math.floor(10 + Math.random() * 90)}`,
      patientId: patients[idx].id,
      patientName: patients[idx].name,
      age: patients[idx].age,
      risk: patients[idx].risk || "MEDIUM",
      date: prescriptionData.nextFollowUpDate,
      time: "10:00 AM",
      reason: prescriptionData.nextFollowUpReason,
      prescriptionSummary: medSummary,
      status: "Scheduled",
    };

    let updatedFollowUps;
    if (existingFuIdx !== -1) {
      updatedFollowUps = [...followUps];
      updatedFollowUps[existingFuIdx] = followUpItem;
    } else {
      updatedFollowUps = [followUpItem, ...followUps];
    }
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(updatedFollowUps));

    // Also update appointment list
    const appointments = getAppointments();
    const existingAptIdx = appointments.findIndex(
      (apt) => String(apt.patientId).toLowerCase() === String(patientId).toLowerCase()
    );

    const aptItem = {
      id: existingAptIdx !== -1 ? appointments[existingAptIdx].id : `APT-${Math.floor(100 + Math.random() * 900)}`,
      time: "10:00 AM",
      patientId: patients[idx].id,
      patientName: patients[idx].name,
      risk: patients[idx].risk || "MEDIUM",
      reason: prescriptionData.nextFollowUpReason,
      status: "Upcoming",
    };

    let updatedAppointments;
    if (existingAptIdx !== -1) {
      updatedAppointments = [...appointments];
      updatedAppointments[existingAptIdx] = aptItem;
    } else {
      updatedAppointments = [aptItem, ...appointments];
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
  }

  return updatedPrescription;
};

export const getDoctorStats = () => {
  const patients = getPatients();
  const appointments = getAppointments();
  const highPriority = patients.filter((p) => p.risk === "HIGH").length;
  const newPatientsCount = patients.filter((p) => p.status === "New").length;

  return {
    totalPatients: patients.length,
    todayAppointments: appointments.length,
    highPriorityCount: highPriority,
    newPatientsCount: newPatientsCount,
  };
};

export const updateFollowUpStatus = (id, newStatus) => {
  const followUps = getFollowUps();
  const updated = followUps.map((fu) => (fu.id === id ? { ...fu, status: newStatus } : fu));
  localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(updated));
  return updated;
};

export const updateAppointmentStatus = (id, newStatus) => {
  const appointments = getAppointments();
  const updated = appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
  return updated;
};

export const notificationsList = [
  {
    id: "NOTIF-01",
    title: "High Priority Alert",
    message: "Ravi Kumar (P1001) flagged with fever & difficulty breathing",
    time: "10 mins ago",
    type: "critical",
    read: false,
  },
  {
    id: "NOTIF-02",
    title: "Follow-up Scheduled",
    message: "Anjali Reddy scheduled for Diabetes follow-up",
    time: "30 mins ago",
    type: "info",
    read: false,
  },
];

export const getNotifications = () => notificationsList;
export const savePrescription = savePatientPrescription;
