import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import {
  getPatientById,
  getPatients,
  savePrescription,
  currentDoctor,
} from "../../data/doctorMockData";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FilePlusIcon,
  FileTextIcon,
  PillIcon,
  PlusIcon,
  PrinterIcon,
  ShieldAlertIcon,
  SparklesIcon,
  StethoscopeIcon,
  TrashIcon,
} from "../../components/common/Icons";

const COMMON_DIAGNOSES = [
  "Stage 2 Essential Hypertension with borderline hyperglycemia",
  "Acute Bronchitis with productive cough & wheeze",
  "Type 2 Diabetes Mellitus with peripheral neuropathy",
  "Acute Gastroenteritis with mild dehydration",
  "Chronic Migraine with visual aura",
  "Upper Respiratory Tract Infection (Viral Rhinitis)",
  "Gastroesophageal Reflux Disease (GERD) with reflux esophagitis",
  "Dyslipidemia with elevated LDL-C",
  "Allergic Rhinitis & Seasonal Bronchospasm",
  "Stage 3a Chronic Kidney Disease with hypertensive nephrosclerosis",
];

const COMMON_MEDICINE_TEMPLATES = [
  { name: "Telmisartan 40mg", dosage: "1 tablet", frequency: "1-0-0 (Morning after breakfast)", duration: "30 days", instructions: "Take with full glass of water. Monitor morning BP." },
  { name: "Metformin ER 500mg", dosage: "1 tablet", frequency: "1-0-1 (With meals)", duration: "30 days", instructions: "Take immediately after meals." },
  { name: "Amoxicillin + Clavulanic Acid 625mg", dosage: "1 tablet", frequency: "1-0-1 (After food)", duration: "5 days", instructions: "Complete full antibiotic course." },
  { name: "Azithromycin 500mg", dosage: "1 tablet", frequency: "1-0-0 (Once daily)", duration: "3 days", instructions: "Take 1 hour before or 2 hours after meals." },
  { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "SOS (Max 3/day)", duration: "5 days", instructions: "Take for fever > 100°F or severe body ache." },
  { name: "Pantoprazole 40mg", dosage: "1 tablet", frequency: "1-0-0 (Fasting)", duration: "14 days", instructions: "Take early morning 30 min before breakfast." },
  { name: "Montelukast 10mg + Levocetirizine 5mg", dosage: "1 tablet", frequency: "0-0-1 (Night)", duration: "10 days", instructions: "Take at bedtime with water." },
  { name: "Atorvastatin 20mg", dosage: "1 tablet", frequency: "0-0-1 (Night)", duration: "30 days", instructions: "Take at night before sleep." },
  { name: "ORS (Oral Rehydration Salts)", dosage: "1 sachet in 1L water", frequency: "Frequent sips", duration: "3 days", instructions: "Drink continuously throughout the day." },
];

export default function CreatePrescription() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const patientIdParam = params.patientId || params.id || searchParams.get("patientId");

  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdParam || "");
  const [patient, setPatient] = useState(null);

  // Form Fields
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "1 tablet",
      frequency: "1-0-1 (Twice daily after food)",
      duration: "5 days",
      instructions: "Take with water after meals",
    },
  ]);
  const [recommendations, setRecommendations] = useState(
    "Maintain adequate fluid intake. Avoid heavy lifting and salt-heavy processed foods. Follow regular light physical activity."
  );
  const [nextVisit, setNextVisit] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedRxResult, setSavedRxResult] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const list = getPatients();
    setPatientsList(list);

    if (patientIdParam) {
      const found = getPatientById(patientIdParam);
      if (found) {
        setPatient(found);
        setSelectedPatientId(found.id);
        // Pre-fill default diagnosis based on patient's condition
        if (found.conditionSummary) {
          setDiagnosis(found.conditionSummary);
        }
      }
    } else if (list.length > 0) {
      setPatient(list[0]);
      setSelectedPatientId(list[0].id);
      if (list[0].conditionSummary) {
        setDiagnosis(list[0].conditionSummary);
      }
    }
  }, [patientIdParam]);

  const handlePatientSelectChange = (id) => {
    setSelectedPatientId(id);
    const found = getPatientById(id);
    if (found) {
      setPatient(found);
      if (found.conditionSummary) {
        setDiagnosis(found.conditionSummary);
      }
    }
  };

  // Medicine list modifiers
  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "1 tablet",
        frequency: "1-0-0 (Once daily morning)",
        duration: "7 days",
        instructions: "Take after meals",
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      alert("A prescription must include at least one medication item.");
      return;
    }
    const updated = medicines.filter((_, idx) => idx !== index);
    setMedicines(updated);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleQuickAddTemplate = (tpl) => {
    // If the first item is empty, replace it, otherwise append
    if (medicines.length === 1 && !medicines[0].name.trim()) {
      setMedicines([{ ...tpl }]);
    } else {
      setMedicines([...medicines, { ...tpl }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!selectedPatientId) {
      setFormError("Please select a patient.");
      return;
    }

    if (!diagnosis.trim()) {
      setFormError("Please enter a clinical diagnosis.");
      return;
    }

    const invalidMed = medicines.find((m) => !m.name.trim());
    if (invalidMed) {
      setFormError("Please provide a medicine name for all medicine entries.");
      return;
    }

    setIsSubmitting(true);

    try {
      const rxData = {
        diagnosis: diagnosis.trim(),
        medicines: medicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
          instructions: m.instructions.trim(),
        })),
        recommendations: recommendations.trim(),
        nextVisit: nextVisit,
      };

      const result = savePrescription(selectedPatientId, rxData);
      setIsSubmitting(false);

      if (result) {
        setSavedRxResult(result);
      } else {
        setFormError("Failed to save prescription. Please verify patient ID.");
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setFormError("An unexpected error occurred while saving.");
    }
  };

  return (
    <DoctorLayout activePageTitle="Create Clinical Prescription">
      <div className="create-prescription-page">
        {/* Top Navigation Row */}
        <div className="details-top-nav">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              patient
                ? navigate(`/doctor/patients/${patient.id}`)
                : navigate("/doctor/patients")
            }
          >
            <ArrowLeftIcon size={16} />
            <span>{patient ? `Back to ${patient.name}` : "Back to Patients"}</span>
          </button>
        </div>

        {/* Prescription Builder Form Card */}
        <div className="doctor-card prescription-builder-card">
          <div className="prescription-form-header">
            <div className="rx-form-badge">
              <FilePlusIcon size={20} />
              <div>
                <h2>Digital Prescription & Treatment Plan</h2>
                <p>Authorized Medical Practitioner: {currentDoctor.name} • {currentDoctor.regNumber}</p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="alert-box alert-box-danger">
              <AlertTriangleIcon size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="prescription-main-form">
            {/* Section 1: Patient Selection & Summary */}
            <div className="form-section-block">
              <h3 className="form-section-title">
                <span className="section-step-num">1</span>
                <span>Patient Selection & Profile Information</span>
              </h3>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">Select Patient *</label>
                  <select
                    className="form-control"
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelectChange(e.target.value)}
                  >
                    {patientsList.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.id}) - {pt.age}y/{pt.gender} - {pt.status}
                      </option>
                    ))}
                  </select>
                </div>

                {patient && (
                  <div className="patient-selected-pill-card">
                    <div className="pill-card-top">
                      <strong>{patient.name}</strong>
                      <span className="pill-card-id">{patient.id}</span>
                      <span className="pill-card-tag">{patient.age} yrs • {patient.gender} • Blood {patient.bloodGroup || "N/A"}</span>
                    </div>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="pill-card-allergy-alert">
                        <ShieldAlertIcon size={14} />
                        <span>Allergies: <strong>{patient.allergies.join(", ")}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Clinical Diagnosis */}
            <div className="form-section-block">
              <h3 className="form-section-title">
                <span className="section-step-num">2</span>
                <span>Clinical Diagnosis *</span>
              </h3>

              <div className="form-group">
                <input
                  type="text"
                  className="form-control diagnosis-input"
                  placeholder="e.g. Acute Bronchitis with Bronchospasm or Stage 2 Hypertension..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>

              {/* Diagnosis Quick Suggestions */}
              <div className="quick-chip-suggestions">
                <span className="suggestions-label">Quick Suggestions:</span>
                {COMMON_DIAGNOSES.slice(0, 5).map((diag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-suggestion-chip"
                    onClick={() => setDiagnosis(diag)}
                  >
                    + {diag.split(" with ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Medication Formulation & Prescriptions */}
            <div className="form-section-block">
              <div className="section-header-flex">
                <h3 className="form-section-title">
                  <span className="section-step-num">3</span>
                  <span>Prescribed Medicines ({medicines.length})</span>
                </h3>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleAddMedicine}
                >
                  <PlusIcon size={16} />
                  <span>Add Another Medicine</span>
                </button>
              </div>

              {/* Medicine rows */}
              <div className="medicine-rows-list">
                {medicines.map((med, idx) => (
                  <div key={idx} className="medicine-row-card">
                    <div className="med-row-top-bar">
                      <div className="med-number-tag">
                        <PillIcon size={15} />
                        <span>Item #{idx + 1}</span>
                      </div>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          className="remove-med-btn"
                          onClick={() => handleRemoveMedicine(idx)}
                          title="Remove Medicine"
                        >
                          <TrashIcon size={15} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="med-fields-grid">
                      {/* Medicine Name */}
                      <div className="form-group med-name-field">
                        <label className="form-label">Medicine Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Amoxicillin 500mg, Telmisartan 40mg..."
                          value={med.name}
                          onChange={(e) =>
                            handleMedicineChange(idx, "name", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Dosage */}
                      <div className="form-group">
                        <label className="form-label">Dosage *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 1 tablet, 500 mg, 5 ml"
                          value={med.dosage}
                          onChange={(e) =>
                            handleMedicineChange(idx, "dosage", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Frequency */}
                      <div className="form-group">
                        <label className="form-label">Frequency *</label>
                        <select
                          className="form-control"
                          value={med.frequency}
                          onChange={(e) =>
                            handleMedicineChange(idx, "frequency", e.target.value)
                          }
                        >
                          <option value="1-0-0 (Once daily - Morning)">1-0-0 (Morning)</option>
                          <option value="0-0-1 (Once daily - Bedtime)">0-0-1 (Bedtime)</option>
                          <option value="1-0-1 (Twice daily after food)">1-0-1 (Twice daily)</option>
                          <option value="1-1-1 (Three times daily)">1-1-1 (Three times daily)</option>
                          <option value="SOS (As needed when symptomatic)">SOS (As needed)</option>
                          <option value="1-0-0 (Fasting / Empty stomach)">1-0-0 (Fasting / Empty stomach)</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="form-group">
                        <label className="form-label">Duration *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 5 days, 10 days, 1 month, Ongoing"
                          value={med.duration}
                          onChange={(e) =>
                            handleMedicineChange(idx, "duration", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Specific Instructions */}
                      <div className="form-group full-width-field">
                        <label className="form-label">Specific Instructions</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Take immediately after meals with warm water. Avoid antacids within 2 hours."
                          value={med.instructions}
                          onChange={(e) =>
                            handleMedicineChange(idx, "instructions", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Common Prescription Drug Templates Quick-Add */}
              <div className="quick-templates-box">
                <span className="templates-title">Quick Add Common Medications:</span>
                <div className="template-pills-row">
                  {COMMON_MEDICINE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      className="template-pill-btn"
                      onClick={() => handleQuickAddTemplate(tpl)}
                    >
                      + {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Recommendations, Diet & Next Visit */}
            <div className="form-section-block">
              <h3 className="form-section-title">
                <span className="section-step-num">4</span>
                <span>Doctor's Recommendations & Follow-Up Schedule</span>
              </h3>

              <div className="form-row-grid">
                {/* Recommendations */}
                <div className="form-group">
                  <label className="form-label">Clinical Advice / Recommendations</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Dietary precautions, hydration advice, exercise recommendations, warning signs to watch out for..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                  ></textarea>
                </div>

                {/* Next visit date */}
                <div className="form-group">
                  <label className="form-label">Next Review / Follow-Up Date *</label>
                  <input
                    type="date"
                    className="form-control date-input"
                    value={nextVisit}
                    onChange={(e) => setNextVisit(e.target.value)}
                    required
                  />
                  <span className="form-helper-text">
                    This automatically books a follow-up record in the doctor's calendar.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="prescription-actions-bar">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  patient
                    ? navigate(`/doctor/patients/${patient.id}`)
                    : navigate("/doctor/patients")
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddMedicine}
              >
                <PlusIcon size={18} />
                <span>Add Medicine</span>
              </button>

              <button
                type="submit"
                className="btn btn-primary btn-lg save-rx-submit-btn"
                disabled={isSubmitting}
              >
                <CheckCircleIcon size={20} />
                <span>{isSubmitting ? "Saving Prescription..." : "Save Prescription"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal Confirmation */}
        {savedRxResult && (
          <div className="modal-backdrop">
            <div className="modal-card rx-success-modal">
              <div className="success-icon-wrap">
                <CheckCircleIcon size={44} className="success-check-icon" />
              </div>
              <h3 className="success-modal-title">Prescription Saved Successfully!</h3>
              <p className="success-modal-desc">
                Prescription <strong>{savedRxResult.id}</strong> has been created for{" "}
                <strong>{patient?.name}</strong> and saved to the electronic medical record.
              </p>

              <div className="success-summary-box">
                <div className="summary-row">
                  <span>Diagnosis:</span>
                  <strong>{savedRxResult.diagnosis}</strong>
                </div>
                <div className="summary-row">
                  <span>Medicines Prescribed:</span>
                  <strong>{savedRxResult.medicines?.length} medications</strong>
                </div>
                <div className="summary-row">
                  <span>Next Follow-up:</span>
                  <strong>{savedRxResult.nextVisit}</strong>
                </div>
              </div>

              <div className="success-modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/doctor/patients/${patient?.id}`)}
                >
                  <FileTextIcon size={16} />
                  <span>View in Patient Profile</span>
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/doctor/follow-ups")}
                >
                  <CalendarIcon size={16} />
                  <span>View Follow-ups</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
