import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import PatientForm from "../../components/doctor/PatientForm";
import {
  addNewPatient,
  getDoctorStats,
  getFollowUps,
  getPatients,
} from "../../data/doctorMockData";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  PillIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
} from "../../components/common/Icons";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 20,
    todayAppointments: 8,
    highPriorityCount: 4,
    newPatientsCount: 6,
  });

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const refreshData = () => {
    const pts = getPatients();
    setPatients(pts);
    setFollowUps(getFollowUps());
    setStats(getDoctorStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSavePatient = (newPatientData) => {
    const saved = addNewPatient(newPatientData);
    setIsAddPatientOpen(false);
    refreshData();
    setToastMessage(`Patient ${saved.name} (${saved.id}) added successfully. Total patients: ${getPatients().length}`);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // High Priority Patients derived directly from shared patients state
  const highPriorityPatients = patients.filter((p) => p.risk === "HIGH");

  // Newest patients (up to 5)
  const newPatientsList = patients.filter((p) => p.status === "New").slice(0, 5);
  const displayNewPatients = newPatientsList.length > 0 ? newPatientsList : patients.slice(0, 5);

  return (
    <DoctorLayout activePageTitle="Doctor Dashboard">
      <div className="dashboard-view-wrapper">
        {/* Success Alert Banner */}
        {toastMessage && (
          <div className="toast-success-banner">
            <CheckCircleIcon size={18} />
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setToastMessage("")}>
              ✕
            </button>
          </div>
        )}

        {/* 1. TOP STATISTICS (4 DYNAMIC CARDS) */}
        <section className="stats-grid-row">
          {/* Card 1: Total Patients (Dynamic, initially 20) */}
          <div className="stat-box">
            <div className="stat-icon-wrap bg-blue-light text-blue">
              <UsersIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Total Patients</span>
              <span className="stat-val">{stats.totalPatients}</span>
            </div>
          </div>

          {/* Card 2: Today's Appointments */}
          <div className="stat-box">
            <div className="stat-icon-wrap bg-teal-light text-teal">
              <CalendarIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Today's Appointments</span>
              <span className="stat-val">{stats.todayAppointments}</span>
            </div>
          </div>

          {/* Card 3: High Priority (Highlighted Red) */}
          <div className="stat-box stat-box-priority-highlight">
            <div className="stat-icon-wrap bg-red-light text-red">
              <AlertTriangleIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title text-red">High Priority</span>
              <span className="stat-val text-red">{stats.highPriorityCount}</span>
            </div>
          </div>

          {/* Card 4: New Patients */}
          <div className="stat-box">
            <div className="stat-icon-wrap bg-purple-light text-purple">
              <UserIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">New Patients</span>
              <span className="stat-val">{stats.newPatientsCount}</span>
            </div>
          </div>
        </section>

        {/* 2. HIGH PRIORITY CASES (WITH CURRENT PRESCRIPTION & NEXT FOLLOW-UP) */}
        <section className="dashboard-card priority-container-card">
          <div className="card-header-flex">
            <div className="header-title-flex text-red">
              <AlertTriangleIcon size={20} />
              <h2 className="card-heading text-red">High Priority Cases</h2>
            </div>
            <span className="badge-pill-red">{highPriorityPatients.length} Patients Require Immediate Attention</span>
          </div>

          <div className="priority-cards-grid">
            {highPriorityPatients.map((item) => {
              const rxSummary = item.prescription?.medicines && item.prescription.medicines.length > 0
                ? item.prescription.medicines.map((m) => `${m.name} ${m.dosage}`).join(" • ")
                : "No prescription yet";

              const followUpDate = item.prescription?.nextFollowUpDate || item.nextFollowUp?.date || "None";

              return (
                <div key={item.id} className="priority-item-box">
                  <div className="priority-item-top">
                    <div>
                      <h3 className="patient-name-heading">{item.name}</h3>
                      <span className="patient-sub-meta">
                        {item.id} • {item.age} yrs • {item.gender}
                      </span>
                    </div>
                    <span className="badge-priority-solid">HIGH</span>
                  </div>

                  <div className="priority-issue-strip">
                    <span className="issue-label-text">Main Issue:</span>
                    <p className="issue-desc-text">{item.mainIssue}</p>
                  </div>

                  {/* Prescription Summary */}
                  <div className="priority-rx-preview">
                    <span className="rx-preview-label">
                      <PillIcon size={13} /> Current Prescription:
                    </span>
                    <p className="rx-preview-text">{rxSummary}</p>
                  </div>

                  {/* Next Follow-up & Action Button */}
                  <div className="priority-footer-flex">
                    <span className="priority-followup-tag">
                      <ClockIcon size={12} /> Follow-up: <strong>{followUpDate}</strong>
                    </span>
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => navigate(`/doctor/patients/${item.id}`)}
                    >
                      View Patient
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. TWO-COLUMN: NEW PATIENTS & TODAY'S FOLLOW-UPS */}
        <div className="dashboard-columns-split">
          {/* Left Column: New Patients Section */}
          <section className="dashboard-card column-card">
            <div className="card-header-flex">
              <div className="header-title-flex">
                <UsersIcon size={18} />
                <h2 className="card-heading">New Patients</h2>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddPatientOpen(true)}
              >
                <PlusIcon size={15} />
                <span>+ Add New Patient</span>
              </button>
            </div>

            <div className="clean-table-responsive">
              <table className="clean-data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Patient ID</th>
                    <th>Age</th>
                    <th>Risk</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayNewPatients.map((pt) => (
                    <tr key={pt.id}>
                      <td>
                        <strong>{pt.name}</strong>
                      </td>
                      <td>
                        <span className="id-code-tag">{pt.id}</span>
                      </td>
                      <td>{pt.age} yrs • {pt.gender}</td>
                      <td>
                        <span
                          className={`risk-badge-pill ${
                            pt.risk === "HIGH"
                              ? "risk-high"
                              : pt.risk === "MEDIUM"
                              ? "risk-medium"
                              : "risk-low"
                          }`}
                        >
                          {pt.risk || "LOW"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-view-link"
                          onClick={() => navigate(`/doctor/patients/${pt.id}`)}
                          title={`View details for ${pt.name}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Column: Today's Follow-ups Preview */}
          <section className="dashboard-card column-card">
            <div className="card-header-flex">
              <div className="header-title-flex">
                <CalendarIcon size={18} />
                <h2 className="card-heading">Today's Follow-ups</h2>
              </div>
              <Link to="/doctor/follow-ups" className="view-all-link-btn">
                <span>View All Follow-ups</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>

            <div className="clean-table-responsive">
              <table className="clean-data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.slice(0, 5).map((fu) => (
                    <tr key={fu.id}>
                      <td>
                        <span className="time-badge-pill">{fu.time || "10:00 AM"}</span>
                      </td>
                      <td>
                        <strong>{fu.patientName}</strong>
                      </td>
                      <td>
                        <span className="followup-reason-text">{fu.reason}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Add New Patient Modal */}
        <PatientForm
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
          onSave={handleSavePatient}
        />
      </div>
    </DoctorLayout>
  );
}
