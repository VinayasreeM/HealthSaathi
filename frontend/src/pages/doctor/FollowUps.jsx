import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import {
  getFollowUps,
  updateFollowUpStatus,
  getPatients,
} from "../../data/doctorMockData";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  PillIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from "../../components/common/Icons";

export default function FollowUps() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Today' | 'Upcoming' | 'Completed' | 'High Risk'

  useEffect(() => {
    setFollowUps(getFollowUps());
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updated = updateFollowUpStatus(id, newStatus);
    setFollowUps(updated);
  };

  // Filter follow-ups
  const filteredFollowUps = followUps.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.patientName.toLowerCase().includes(term) ||
      item.patientId.toLowerCase().includes(term) ||
      item.reason.toLowerCase().includes(term) ||
      (item.prescriptionSummary && item.prescriptionSummary.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Today" && (item.date?.toLowerCase().includes("today") || item.date?.includes("2026-02"))) ||
      (statusFilter === "Upcoming" && item.status === "Scheduled") ||
      (statusFilter === "Completed" && item.status === "Completed") ||
      (statusFilter === "High Risk" && item.risk?.toUpperCase() === "HIGH");

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = followUps.length;
  const dueTodayCount = followUps.filter(
    (f) => f.date?.toLowerCase().includes("today") || f.date?.includes("28 Feb") || f.status === "Scheduled"
  ).length;
  const highRiskCount = followUps.filter((f) => f.risk === "HIGH").length;
  const completedCount = followUps.filter((f) => f.status === "Completed").length;

  return (
    <DoctorLayout activePageTitle="Patient Follow-ups & Continuing Care">
      <div className="followups-page-wrapper">
        {/* Page Header */}
        <div className="page-intro-header">
          <div>
            <h2 className="intro-title">Follow-ups</h2>
            <p className="intro-subtitle">
              Track patients who need continued care and clinical review.
            </p>
          </div>
        </div>

        {/* 1. Top Summary Cards (4 Cards) */}
        <section className="stats-grid-row">
          <div className="stat-box">
            <div className="stat-icon-wrap bg-blue-light text-blue">
              <CalendarIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Total Follow-ups</span>
              <span className="stat-val">{totalCount}</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap bg-teal-light text-teal">
              <ClockIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Due Today</span>
              <span className="stat-val">{dueTodayCount}</span>
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
            <div className="stat-icon-wrap bg-purple-light text-purple">
              <CheckCircleIcon size={22} />
            </div>
            <div className="stat-text-group">
              <span className="stat-title">Completed</span>
              <span className="stat-val">{completedCount}</span>
            </div>
          </div>
        </section>

        {/* 2. Search & Filters Card */}
        <div className="patients-filter-card">
          <div className="filter-controls-row">
            {/* Search */}
            <div className="search-box-wrap">
              <SearchIcon size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search follow-ups by patient name, ID, or clinical reason..."
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

            {/* Filter Buttons */}
            <div className="risk-filter-pills-group">
              <button
                className={`filter-btn-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({followUps.length})
              </button>
              <button
                className={`filter-btn-pill ${statusFilter === "Today" ? "active" : ""}`}
                onClick={() => setStatusFilter("Today")}
              >
                Today
              </button>
              <button
                className={`filter-btn-pill ${statusFilter === "Upcoming" ? "active" : ""}`}
                onClick={() => setStatusFilter("Upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`filter-btn-pill ${statusFilter === "Completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("Completed")}
              >
                Completed
              </button>
              <button
                className={`filter-btn-pill pill-high ${statusFilter === "High Risk" ? "active" : ""}`}
                onClick={() => setStatusFilter("High Risk")}
              >
                🔴 High Risk ({highRiskCount})
              </button>
            </div>
          </div>
        </div>

        {/* 3. Polished, Well-Spaced Follow-Up Cards */}
        {filteredFollowUps.length > 0 ? (
          <div className="followup-cards-grid-spacious">
            {filteredFollowUps.map((item) => {
              const riskClass =
                item.risk === "HIGH"
                  ? "risk-high"
                  : item.risk === "MEDIUM"
                  ? "risk-medium"
                  : "risk-low";

              return (
                <div key={item.id} className={`followup-card-clean card-${riskClass}`}>
                  {/* Card Header: Patient Identity & Risk */}
                  <div className="fu-card-header">
                    <div>
                      <h3 className="fu-patient-name">{item.patientName}</h3>
                      <div className="fu-meta-line">
                        <span className="id-code-tag">{item.patientId}</span>
                        {item.age && <span>• {item.age} yrs</span>}
                      </div>
                    </div>
                    <span className={`risk-badge-pill ${riskClass}`}>{item.risk || "MEDIUM"}</span>
                  </div>

                  {/* Follow-up Reason */}
                  <div className="fu-reason-block">
                    <span className="fu-section-label">Clinical Follow-up Reason</span>
                    <p className="fu-reason-text">{item.reason}</p>
                  </div>

                  {/* Date & Time Strip */}
                  <div className="fu-datetime-strip">
                    <div className="fu-date-item">
                      <CalendarIcon size={14} />
                      <span>{item.date}</span>
                    </div>
                    <div className="fu-time-item">
                      <ClockIcon size={14} />
                      <span>{item.time || "10:00 AM"}</span>
                    </div>
                  </div>

                  {/* Prescription Summary */}
                  {item.prescriptionSummary && (
                    <div className="fu-rx-block">
                      <span className="fu-section-label">
                        <PillIcon size={13} /> Prescription
                      </span>
                      <p className="fu-rx-text">{item.prescriptionSummary}</p>
                    </div>
                  )}

                  {/* Status & Actions Footer */}
                  <div className="fu-card-footer">
                    <div className="fu-status-indicator">
                      {item.status === "Completed" ? (
                        <span className="status-badge-completed">✓ Completed</span>
                      ) : item.status === "Cancelled" ? (
                        <span className="status-badge-cancelled">✕ Cancelled</span>
                      ) : (
                        <span className="status-badge-scheduled">🟢 Scheduled</span>
                      )}
                    </div>

                    <div className="fu-actions-group">
                      {item.status !== "Completed" ? (
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleStatusChange(item.id, "Completed")}
                          title="Mark Follow-up as Completed"
                        >
                          <CheckCircleIcon size={13} />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleStatusChange(item.id, "Scheduled")}
                        >
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/doctor/patients/${item.patientId}`)}
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
            <h3>No Follow-ups Found</h3>
            <p>No patient follow-ups match the selected filter criteria.</p>
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
