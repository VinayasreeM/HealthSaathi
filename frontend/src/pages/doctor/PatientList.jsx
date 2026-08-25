import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import PatientForm from "../../components/doctor/PatientForm";
import { addNewPatient, getPatients } from "../../data/doctorMockData";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  FilePlusIcon,
  PillIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "../../components/common/Icons";

export default function PatientList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [riskFilter, setRiskFilter] = useState("all"); // 'all' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const refreshPatients = () => {
    setPatients(getPatients());
  };

  useEffect(() => {
    refreshPatients();
  }, []);

  const handleSavePatient = (newPatientData) => {
    const saved = addNewPatient(newPatientData);
    setIsAddPatientOpen(false);
    refreshPatients();
    setToastMessage(`Patient ${saved.name} (${saved.id}) added successfully as ${saved.risk} Risk.`);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Filter patients based on Search and Risk Filter
  const filteredPatients = patients.filter((pt) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      pt.name.toLowerCase().includes(term) ||
      pt.id.toLowerCase().includes(term) ||
      (pt.phone && pt.phone.includes(term)) ||
      (pt.mainIssue && pt.mainIssue.toLowerCase().includes(term));

    const matchesRisk =
      riskFilter === "all" ||
      pt.risk?.toUpperCase() === riskFilter.toUpperCase();

    return matchesSearch && matchesRisk;
  });

  // Strict sorting by Risk: HIGH (1) -> MEDIUM (2) -> LOW (3)
  const riskPriority = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const pA = riskPriority[a.risk?.toUpperCase()] || 4;
    const pB = riskPriority[b.risk?.toUpperCase()] || 4;
    if (pA !== pB) return pA - pB;
    return a.name.localeCompare(b.name);
  });

  // Group by risk
  const highRiskList = sortedPatients.filter((p) => p.risk?.toUpperCase() === "HIGH");
  const mediumRiskList = sortedPatients.filter((p) => p.risk?.toUpperCase() === "MEDIUM");
  const lowRiskList = sortedPatients.filter((p) => p.risk?.toUpperCase() === "LOW");

  const highCount = patients.filter((p) => p.risk === "HIGH").length;
  const medCount = patients.filter((p) => p.risk === "MEDIUM").length;
  const lowCount = patients.filter((p) => p.risk === "LOW").length;

  return (
    <DoctorLayout activePageTitle="Patients Directory">
      <div className="patients-page-wrapper">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="toast-success-banner">
            <CheckCircleIcon size={18} />
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setToastMessage("")}>
              ✕
            </button>
          </div>
        )}

        {/* Top Control Bar: Search & Filters */}
        <div className="patients-filter-card">
          <div className="filter-controls-row">
            {/* Search Input */}
            <div className="search-box-wrap">
              <SearchIcon size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search patients by name or ID (e.g. Ravi Kumar or P1001)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-field"
              />
              {searchTerm && (
                <button className="clear-search-x" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>

            {/* Risk Filter Buttons */}
            <div className="risk-filter-pills-group">
              <button
                className={`filter-btn-pill ${riskFilter === "all" ? "active" : ""}`}
                onClick={() => setRiskFilter("all")}
              >
                All ({patients.length})
              </button>
              <button
                className={`filter-btn-pill pill-high ${riskFilter === "HIGH" ? "active" : ""}`}
                onClick={() => setRiskFilter("HIGH")}
              >
                🔴 High Risk ({highCount})
              </button>
              <button
                className={`filter-btn-pill pill-med ${riskFilter === "MEDIUM" ? "active" : ""}`}
                onClick={() => setRiskFilter("MEDIUM")}
              >
                🟠 Medium Risk ({medCount})
              </button>
              <button
                className={`filter-btn-pill pill-low ${riskFilter === "LOW" ? "active" : ""}`}
                onClick={() => setRiskFilter("LOW")}
              >
                🟢 Low Risk ({lowCount})
              </button>
            </div>

            {/* Add Patient Button */}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddPatientOpen(true)}
            >
              <PlusIcon size={16} />
              <span>+ Add Patient</span>
            </button>
          </div>
        </div>

        {/* Patients List Grouped by Risk Order */}
        {sortedPatients.length > 0 ? (
          <div className="risk-grouped-container">
            {/* 1. HIGH RISK SECTION */}
            {(riskFilter === "all" || riskFilter === "HIGH") && highRiskList.length > 0 && (
              <section className="risk-category-section section-high-risk">
                <div className="risk-section-header header-high">
                  <div className="section-title-flex">
                    <span className="risk-indicator-dot dot-high"></span>
                    <h3>HIGH RISK PATIENTS</h3>
                  </div>
                  <span className="risk-section-count-badge badge-high">
                    {highRiskList.length} Patient{highRiskList.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="patient-cards-clean-grid">
                  {highRiskList.map((pt) => (
                    <PatientCardRow key={pt.id} patient={pt} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. MEDIUM RISK SECTION */}
            {(riskFilter === "all" || riskFilter === "MEDIUM") && mediumRiskList.length > 0 && (
              <section className="risk-category-section section-med-risk">
                <div className="risk-section-header header-med">
                  <div className="section-title-flex">
                    <span className="risk-indicator-dot dot-med"></span>
                    <h3>MEDIUM RISK PATIENTS</h3>
                  </div>
                  <span className="risk-section-count-badge badge-med">
                    {mediumRiskList.length} Patient{mediumRiskList.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="patient-cards-clean-grid">
                  {mediumRiskList.map((pt) => (
                    <PatientCardRow key={pt.id} patient={pt} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. LOW RISK SECTION */}
            {(riskFilter === "all" || riskFilter === "LOW") && lowRiskList.length > 0 && (
              <section className="risk-category-section section-low-risk">
                <div className="risk-section-header header-low">
                  <div className="section-title-flex">
                    <span className="risk-indicator-dot dot-low"></span>
                    <h3>LOW RISK PATIENTS</h3>
                  </div>
                  <span className="risk-section-count-badge badge-low">
                    {lowRiskList.length} Patient{lowRiskList.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="patient-cards-clean-grid">
                  {lowRiskList.map((pt) => (
                    <PatientCardRow key={pt.id} patient={pt} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="empty-state-box">
            <UsersIcon size={44} className="text-muted" />
            <h3>No Patients Found</h3>
            <p>No patients match the current search or risk filter.</p>
            <button
              className="btn btn-outline mt-3"
              onClick={() => {
                setSearchTerm("");
                setRiskFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Add Patient Modal */}
        <PatientForm
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
          onSave={handleSavePatient}
        />
      </div>
    </DoctorLayout>
  );
}

// Subcomponent for each patient row card
function PatientCardRow({ patient, navigate }) {
  const rxSummary = patient.prescription?.medicines && patient.prescription.medicines.length > 0
    ? patient.prescription.medicines.map((m) => `${m.name} ${m.dosage}`).join(" • ")
    : "No prescription yet";

  const followUpDate = patient.prescription?.nextFollowUpDate || patient.nextFollowUp?.date || "None";

  const riskClass =
    patient.risk === "HIGH"
      ? "risk-high"
      : patient.risk === "MEDIUM"
      ? "risk-medium"
      : "risk-low";

  return (
    <div className={`patient-item-card card-${riskClass}`}>
      <div className="patient-item-main-row">
        {/* Left: Patient Identity */}
        <div className="pt-info-col">
          <div className="pt-title-line">
            <strong className="pt-name-text">{patient.name}</strong>
            <span className="id-code-tag">{patient.id}</span>
            <span className={`risk-badge-pill ${riskClass}`}>{patient.risk}</span>
          </div>
          <span className="pt-sub-details">
            {patient.age} yrs • {patient.gender} • Blood: {patient.bloodGroup || "N/A"} • Phone: {patient.phone}
          </span>
          <p className="pt-issue-line">
            <span className="issue-tag-prefix">Main Issue:</span> {patient.mainIssue}
          </p>
        </div>

        {/* Middle: Prescription & Follow-up */}
        <div className="pt-rx-col">
          <div className="rx-preview-compact">
            <span className="rx-label-tiny">
              <PillIcon size={12} /> Current Prescription:
            </span>
            <p className="rx-text-compact">{rxSummary}</p>
          </div>
          {followUpDate !== "None" && (
            <span className="followup-badge-tiny">
              <ClockIcon size={12} /> Next Follow-up: <strong>{followUpDate}</strong>
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="pt-action-col">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/doctor/patients/${patient.id}`)}
          >
            <span>View Patient</span>
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
