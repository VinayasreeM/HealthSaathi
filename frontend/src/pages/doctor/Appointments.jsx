import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import {
  getAppointments,
  updateAppointmentStatus,
  getPatients,
} from "../../data/doctorMockData";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  SearchIcon,
  UsersIcon,
} from "../../components/common/Icons";

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Upcoming' | 'Completed' | 'HIGH'

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updated = updateAppointmentStatus(id, newStatus);
    setAppointments(updated);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      apt.patientName.toLowerCase().includes(term) ||
      apt.patientId.toLowerCase().includes(term) ||
      apt.reason.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Upcoming" && apt.status === "Upcoming") ||
      (statusFilter === "Completed" && apt.status === "Completed") ||
      (statusFilter === "HIGH" && apt.risk?.toUpperCase() === "HIGH");

    return matchesSearch && matchesStatus;
  });

  // Strict sorting: Risk (HIGH -> MEDIUM -> LOW), then Time
  const riskPriority = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const rA = riskPriority[a.risk?.toUpperCase()] || 4;
    const rB = riskPriority[b.risk?.toUpperCase()] || 4;
    if (rA !== rB) return rA - rB;
    return a.time.localeCompare(b.time);
  });

  // Summary Metrics
  const totalCount = appointments.length;
  const highRiskCount = appointments.filter((a) => a.risk === "HIGH").length;
  const upcomingCount = appointments.filter((a) => a.status === "Upcoming").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  return (
    <DoctorLayout activePageTitle="Today's Clinical Appointments">
      <div className="appointments-page-wrapper">
        {/* Top Summary Cards (4 Cards) */}
        <section className="stats-grid-row">
          <div className="stat-box">
            <div className="stat-icon-wrap bg-blue-light text-blue">
              <CalendarIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Today's Appointments</span>
              <span className="stat-val">{totalCount}</span>
            </div>
          </div>

          <div className="stat-box stat-box-priority-highlight">
            <div className="stat-icon-wrap bg-red-light text-red">
              <AlertTriangleIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title text-red">High Risk</span>
              <span className="stat-val text-red">{highRiskCount}</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap bg-teal-light text-teal">
              <ClockIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Upcoming</span>
              <span className="stat-val">{upcomingCount}</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap bg-purple-light text-purple">
              <CheckCircleIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Completed</span>
              <span className="stat-val">{completedCount}</span>
            </div>
          </div>
        </section>

        {/* Filter Controls Card */}
        <div className="patients-filter-card">
          <div className="filter-controls-row">
            <div className="search-box-wrap">
              <SearchIcon size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search appointments by patient name, ID, or clinical reason..."
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

            <div className="risk-filter-pills-group">
              <button
                className={`filter-btn-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({appointments.length})
              </button>
              <button
                className={`filter-btn-pill pill-high ${statusFilter === "HIGH" ? "active" : ""}`}
                onClick={() => setStatusFilter("HIGH")}
              >
                🔴 High Risk ({highRiskCount})
              </button>
              <button
                className={`filter-btn-pill ${statusFilter === "Upcoming" ? "active" : ""}`}
                onClick={() => setStatusFilter("Upcoming")}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                className={`filter-btn-pill ${statusFilter === "Completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("Completed")}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List - Grouped/Sorted by Risk (HIGH -> MEDIUM -> LOW) */}
        {sortedAppointments.length > 0 ? (
          <div className="appointments-list-container">
            {sortedAppointments.map((apt) => {
              const riskClass =
                apt.risk === "HIGH"
                  ? "risk-high"
                  : apt.risk === "MEDIUM"
                  ? "risk-medium"
                  : "risk-low";

              return (
                <div key={apt.id} className={`appointment-card-item card-${riskClass}`}>
                  <div className="appointment-card-main">
                    {/* Time & Risk Badge */}
                    <div className="apt-time-badge-col">
                      <div className="apt-time-box">
                        <ClockIcon size={14} />
                        <strong>{apt.time}</strong>
                      </div>
                      <span className={`risk-badge-pill ${riskClass}`}>{apt.risk}</span>
                    </div>

                    {/* Patient Info & Reason */}
                    <div className="apt-details-col">
                      <div className="apt-pt-name-row">
                        <h4 className="apt-patient-name">{apt.patientName}</h4>
                        <span className="id-code-tag">{apt.patientId}</span>
                      </div>
                      <p className="apt-reason-text">
                        <span className="reason-label-tiny">Clinical Reason:</span> {apt.reason}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="apt-status-col">
                      <span
                        className={`status-pill-badge ${
                          apt.status === "Completed"
                            ? "status-completed"
                            : "status-upcoming"
                        }`}
                      >
                        {apt.status === "Completed" ? "✓ Completed" : "Upcoming"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="apt-actions-col">
                      {apt.status === "Upcoming" ? (
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleStatusChange(apt.id, "Completed")}
                          title="Mark Appointment Done"
                        >
                          <CheckCircleIcon size={14} />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleStatusChange(apt.id, "Upcoming")}
                          title="Reopen Appointment"
                        >
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}
                      >
                        <span>View Patient</span>
                        <ChevronRightIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-box">
            <CalendarIcon size={44} className="text-muted" />
            <h3>No Appointments Found</h3>
            <p>No appointments match your search or status filter.</p>
            <button
              className="btn btn-outline mt-3"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
