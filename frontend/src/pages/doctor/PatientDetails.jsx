import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import PrescriptionForm from "../../components/doctor/PrescriptionForm";
import {
  getPatientById,
  savePatientPrescription,
} from "../../data/doctorMockData";
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FilePlusIcon,
  FileTextIcon,
  PillIcon,
  ShieldAlertIcon,
  UserIcon,
} from "../../components/common/Icons";

export default function PatientDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const patientIdParam = params.patientId || params.id;

  const [patient, setPatient] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const refreshPatient = () => {
    if (patientIdParam) {
      const found = getPatientById(patientIdParam);
      setPatient(found);
    }
  };

  useEffect(() => {
    refreshPatient();
  }, [patientIdParam]);

  if (!patient) {
    return (
      <DoctorLayout activePageTitle="Patient Record">
        <div className="empty-state-box">
          <h3>Patient not found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/doctor/patients")}>
            Back to Patients
          </button>
        </div>
      </DoctorLayout>
    );
  }

  const handleSavePrescription = (prescriptionData) => {
    const updated = savePatientPrescription(patient.id, prescriptionData);
    setIsPrescriptionModalOpen(false);
    refreshPatient();
    setSuccessToast("Prescription saved successfully.");
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  const hasPrescription = !!patient.prescription;
  const riskClass =
    patient.risk === "HIGH"
      ? "risk-high"
      : patient.risk === "MEDIUM"
      ? "risk-medium"
      : "risk-low";

  return (
    <DoctorLayout activePageTitle={`Patient - ${patient.name}`}>
      <div className="patient-details-wrapper">
        {/* Top Action Nav */}
        <div className="details-header-nav">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={16} />
            <span>Back</span>
          </button>

          {/* Action Button: Edit or Add / Update Prescription */}
          <button
            className="btn btn-primary"
            onClick={() => setIsPrescriptionModalOpen(true)}
          >
            <FilePlusIcon size={16} />
            <span>
              {hasPrescription ? "Edit Prescription" : "Add / Update Prescription"}
            </span>
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="toast-success-banner">
            <CheckCircleIcon size={18} />
            <span>{successToast}</span>
            <button className="toast-close" onClick={() => setSuccessToast("")}>
              ✕
            </button>
          </div>
        )}

        {/* 1. PATIENT PROFILE CARD (WITH RISK LEVEL & MAIN ISSUE) */}
        <section className={`dashboard-card profile-summary-card card-${riskClass}`}>
          <div className="profile-top-row">
            <div className="profile-avatar-box">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-identity-info">
              <div className="profile-name-row">
                <h2 className="patient-main-name">{patient.name}</h2>
                <span className="id-code-tag">{patient.id}</span>
                <span className={`risk-badge-pill ${riskClass}`}>{patient.risk || "MEDIUM"} RISK</span>
                <span className="badge-status-new">{patient.status}</span>
              </div>
              <div className="profile-chips-wrap">
                <span className="profile-chip">{patient.age} Years</span>
                <span className="profile-chip">{patient.gender}</span>
                <span className="profile-chip blood-chip">Blood: {patient.bloodGroup || "N/A"}</span>
                <span className="profile-chip">Phone: {patient.phone}</span>
              </div>
            </div>
          </div>

          <div className="profile-extra-grid">
            <div>
              <span className="label-subtle">Primary Health Issue / Chief Complaint</span>
              <p className="val-text-prominent">{patient.mainIssue || "Routine Clinical Consultation"}</p>
            </div>
            <div>
              <span className="label-subtle">Address</span>
              <p className="val-text">{patient.address || "Bengaluru, Karnataka"}</p>
            </div>
            <div>
              <span className="label-subtle">Known Allergies</span>
              <p className="val-text text-danger-alert">
                <ShieldAlertIcon size={14} />
                <strong>{patient.allergies || "None documented"}</strong>
              </p>
            </div>
            <div>
              <span className="label-subtle">Last Clinical Visit</span>
              <p className="val-text">{patient.lastVisit || "Today"}</p>
            </div>
          </div>
        </section>

        <div className="details-two-columns">
          {/* Left Column: Medical History & Current Medications */}
          <div className="details-sub-col">
            {/* 2. MEDICAL HISTORY */}
            <section className="dashboard-card">
              <div className="card-header-flex">
                <div className="header-title-flex">
                  <ActivityIcon size={18} />
                  <h3 className="card-heading">Medical History</h3>
                </div>
              </div>

              {patient.history && patient.history.length > 0 ? (
                <div className="history-timeline-list">
                  {patient.history.map((hist, idx) => (
                    <div key={idx} className="history-entry-item">
                      <div className="history-date-badge">{hist.date}</div>
                      <div className="history-text-body">
                        <strong>{hist.condition}</strong>
                        <p>{hist.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-sub-text">No previous visit records found.</p>
              )}
            </section>

            {/* 3. CURRENT MEDICATIONS */}
            <section className="dashboard-card">
              <div className="card-header-flex">
                <div className="header-title-flex">
                  <PillIcon size={18} />
                  <h3 className="card-heading">Current Medications</h3>
                </div>
              </div>

              {patient.currentMedications && patient.currentMedications.length > 0 ? (
                <div className="medications-compact-list">
                  {patient.currentMedications.map((m, idx) => (
                    <div key={idx} className="med-compact-card">
                      <div className="med-compact-top">
                        <strong>{m.name}</strong>
                        <span className="dosage-pill">{m.dosage}</span>
                      </div>
                      <div className="med-compact-sub">
                        <span>{m.frequency}</span> • <span>{m.duration}</span>
                      </div>
                      {m.instructions && (
                        <p className="med-compact-inst">{m.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-sub-text">No current medications recorded.</p>
              )}
            </section>
          </div>

          {/* Right Column: PRESCRIPTION, RECOMMENDATIONS & NEXT FOLLOW-UP */}
          <div className="details-sub-col">
            {/* 4. CURRENT PRESCRIPTION */}
            <section className="dashboard-card prescription-card-highlight">
              <div className="card-header-flex">
                <div className="header-title-flex">
                  <FileTextIcon size={18} />
                  <h3 className="card-heading">Current Prescription</h3>
                </div>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setIsPrescriptionModalOpen(true)}
                >
                  {hasPrescription ? "Edit Prescription" : "+ Add Prescription"}
                </button>
              </div>

              {hasPrescription ? (
                <div className="prescription-display-body">
                  {/* Diagnosis */}
                  <div className="rx-diagnosis-box">
                    <span className="label-subtle">Diagnosis:</span>
                    <h4 className="rx-diagnosis-title">{patient.prescription.diagnosis}</h4>
                    <span className="rx-date-sub">
                      Prescribed on {patient.prescription.prescriptionDate}
                    </span>
                  </div>

                  {/* Medicines Table */}
                  <div className="rx-table-wrap">
                    <table className="clean-data-table rx-medicines-data-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.prescription.medicines?.map((med, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{med.name}</strong>
                              {med.instructions && (
                                <span className="table-sub-inst">{med.instructions}</span>
                              )}
                            </td>
                            <td>{med.dosage}</td>
                            <td>
                              <span className="frequency-tag">{med.frequency}</span>
                            </td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Instructions & Recommendations */}
                  {patient.prescription.instructions && (
                    <div className="rx-advice-item">
                      <span className="label-subtle">Patient Instructions:</span>
                      <p>{patient.prescription.instructions}</p>
                    </div>
                  )}

                  {patient.prescription.recommendations && (
                    <div className="rx-advice-item">
                      <span className="label-subtle">Doctor's Recommendations:</span>
                      <p>{patient.prescription.recommendations}</p>
                    </div>
                  )}

                  {/* 5. NEXT FOLLOW-UP */}
                  {(patient.prescription.nextFollowUpDate || patient.nextFollowUp?.date) && (
                    <div className="rx-followup-alert-box">
                      <div className="followup-alert-top">
                        <ClockIcon size={16} />
                        <strong>Next Follow-up Scheduled</strong>
                      </div>
                      <p className="followup-alert-date">
                        Date: <strong>{patient.prescription.nextFollowUpDate || patient.nextFollowUp?.date}</strong>
                      </p>
                      {(patient.prescription.nextFollowUpReason || patient.nextFollowUp?.reason) && (
                        <p className="followup-alert-reason">
                          Reason: {patient.prescription.nextFollowUpReason || patient.nextFollowUp?.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-rx-prompt">
                  <FilePlusIcon size={32} className="text-muted" />
                  <h4>No active prescription recorded</h4>
                  <p>Click below to write a new prescription for {patient.name}.</p>
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => setIsPrescriptionModalOpen(true)}
                  >
                    + Add Prescription
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Modal: Write or Edit Prescription */}
        <PrescriptionForm
          isOpen={isPrescriptionModalOpen}
          patient={patient}
          existingPrescription={patient.prescription}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSave={handleSavePrescription}
        />
      </div>
    </DoctorLayout>
  );
}
