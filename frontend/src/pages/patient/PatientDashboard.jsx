import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getCurrentPatientData,
  markAppointmentDone,
  markFollowUpDone,
} from "../../data/patientMockData";
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  LogOut,
  Bell,
  Pill,
  Clock,
  User,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user) {
      setData(getCurrentPatientData(user));
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/login");
    }
  };

  const handleMarkAppointmentDone = (aptId) => {
    markAppointmentDone(aptId);
    setData(getCurrentPatientData(user));
  };

  const handleMarkFollowUpDone = (fuId) => {
    markFollowUpDone(fuId);
    setData(getCurrentPatientData(user));
  };

  // Derive real stats from data
  const patient = data?.patient;
  const appointments = data?.appointments || [];
  const followUps = data?.followUps || [];
  const medications = data?.medications || [];
  const prescription = data?.prescription;
  const history = data?.history || [];

  const upcomingAppointments = appointments.filter((a) => a.status === "Upcoming");
  const completedAppointments = appointments.filter((a) => a.status === "Completed");
  const scheduledFollowUps = followUps.filter((f) => f.status === "Scheduled");
  const completedFollowUps = followUps.filter((f) => f.status === "Completed");

  // Calculate next appointment
  const nextAppointment = upcomingAppointments[0];

  // Time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main, #f8fafc)" }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Heart size={24} color="#0284c7" />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
            Health<span style={{ color: "#0284c7" }}>Saathi</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b", marginLeft: "0.5rem" }}>
              Patient Portal
            </span>
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, #0284c7, #0369a1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.8rem",
            }}>
              {(user?.name || "PT").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>
              {user?.name || "Patient"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "none", border: "1px solid #e2e8f0", borderRadius: "8px",
              padding: "0.4rem 0.75rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.4rem",
              color: "#64748b", fontSize: "0.85rem", fontWeight: 500,
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Welcome Card */}
        <section style={{
          background: "linear-gradient(135deg, #0284c7, #0369a1)",
          borderRadius: "16px", padding: "2rem", color: "#fff", marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                {greeting}, {user?.name || "Patient"}!
              </h2>
              <p style={{ opacity: 0.85, margin: "0.25rem 0 0", fontSize: "0.95rem" }}>
                {patient
                  ? `Your health summary — ${patient.mainIssue || "General checkup"}`
                  : "Welcome to your HealthSaathi dashboard."}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem", marginBottom: "1.5rem",
        }}>
          {[
            { icon: <Calendar size={22} />, label: "Upcoming Appointments", value: upcomingAppointments.length, color: "#0284c7", bg: "#e0f2fe" },
            { icon: <Pill size={22} />, label: "Active Medications", value: medications.length, color: "#7c3aed", bg: "#ede9fe" },
            { icon: <FileText size={22} />, label: "Prescriptions", value: prescription ? 1 : 0, color: "#059669", bg: "#d1fae5" },
            { icon: <ClipboardList size={22} />, label: "Follow-ups Due", value: scheduledFollowUps.length, color: "#ea580c", bg: "#fff7ed" },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: "#fff", borderRadius: "12px", padding: "1.25rem",
              display: "flex", alignItems: "center", gap: "1rem",
              border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color, flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Patient Info Card */}
            {patient && (
              <div style={{
                background: "#fff", borderRadius: "12px", padding: "1.25rem",
                border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Stethoscope size={18} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>My Health Info</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { label: "Patient ID", value: patient.id },
                    { label: "Age/Gender", value: `${patient.age} yrs • ${patient.gender}` },
                    { label: "Blood Group", value: patient.bloodGroup || "N/A" },
                    { label: "Risk Level", value: patient.risk || "LOW" },
                    { label: "Phone", value: patient.phone },
                    { label: "Main Issue", value: patient.mainIssue || "General checkup" },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "#1e293b", fontWeight: 600 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {patient.allergies && patient.allergies !== "None" && (
                  <div style={{ marginTop: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertTriangle size={14} color="#dc2626" />
                    <span style={{ fontSize: "0.82rem", color: "#991b1b", fontWeight: 600 }}>Allergies: {patient.allergies}</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Medications */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "1.25rem",
              border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Pill size={18} color="#7c3aed" />
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>My Medications</h3>
                </div>
              </div>
              {medications.length > 0 ? (
                medications.map((med, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.65rem 0.75rem", borderRadius: "8px",
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    marginBottom: idx < medications.length - 1 ? "0.5rem" : 0,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>{med.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                        {med.dosage} • {med.frequency} • {med.duration}
                      </p>
                    </div>
                    <CheckCircle2 size={18} color="#059669" />
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No active medications</p>
              )}
            </div>

            {/* Medical History */}
            {history.length > 0 && (
              <div style={{
                background: "#fff", borderRadius: "12px", padding: "1.25rem",
                border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Activity size={18} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>Medical History</h3>
                </div>
                {history.map((h, idx) => (
                  <div key={idx} style={{
                    display: "flex", gap: "0.75rem", padding: "0.5rem 0",
                    borderBottom: idx < history.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, color: "#0284c7",
                      background: "#e0f2fe", padding: "2px 6px", borderRadius: "4px",
                      height: "fit-content", whiteSpace: "nowrap",
                    }}>{h.date}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{h.condition}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>{h.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Next Appointment */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "1.25rem",
              border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Calendar size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>Upcoming Appointments</h3>
              </div>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map((apt, idx) => (
                  <div key={apt.id} style={{
                    background: "#f0f9ff", borderRadius: "8px", padding: "0.75rem",
                    borderLeft: "4px solid #0284c7", marginBottom: idx < upcomingAppointments.length - 1 ? "0.5rem" : 0,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{apt.reason}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem" }}>
                          <Clock size={13} color="#0284c7" />
                          <span style={{ fontSize: "0.82rem", color: "#0284c7", fontWeight: 600 }}>{apt.time}</span>
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700,
                            background: apt.risk === "HIGH" ? "#fee2e2" : apt.risk === "MEDIUM" ? "#fff7ed" : "#f0fdf4",
                            color: apt.risk === "HIGH" ? "#dc2626" : apt.risk === "MEDIUM" ? "#ea580c" : "#16a34a",
                            padding: "1px 6px", borderRadius: "4px",
                          }}>{apt.risk}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkAppointmentDone(apt.id)}
                        style={{
                          background: "#fff", border: "1px solid #0284c7", borderRadius: "6px",
                          padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.72rem",
                          fontWeight: 600, color: "#0284c7", whiteSpace: "nowrap",
                        }}
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No upcoming appointments</p>
              )}
            </div>

            {/* Current Prescription */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "1.25rem",
              border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <FileText size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>Current Prescription</h3>
              </div>
              {prescription ? (
                <div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "0.75rem", marginBottom: "0.75rem" }}>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Diagnosis</p>
                    <p style={{ margin: "2px 0 0", fontWeight: 700, color: "#166534", fontSize: "0.9rem" }}>{prescription.diagnosis}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>Prescribed: {prescription.prescriptionDate}</p>
                  </div>
                  {prescription.medicines && prescription.medicines.length > 0 && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <p style={{ margin: "0 0 0.35rem", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Medicines</p>
                      {prescription.medicines.map((med, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: idx < prescription.medicines.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{med.name}</span>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{med.dosage} • {med.frequency}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {prescription.instructions && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "0.5rem 0.75rem" }}>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>Instructions</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#334155" }}>{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No active prescription</p>
              )}
            </div>

            {/* Follow-ups */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "1.25rem",
              border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <ClipboardList size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>Follow-ups</h3>
              </div>
              {followUps.length > 0 ? (
                followUps.slice(0, 3).map((fu, idx) => (
                  <div key={fu.id} style={{
                    padding: "0.65rem 0.75rem", borderRadius: "8px",
                    background: fu.status === "Completed" ? "#f0fdf4" : "#fff7ed",
                    border: `1px solid ${fu.status === "Completed" ? "#bbf7d0" : "#fed7aa"}`,
                    marginBottom: idx < followUps.length - 1 ? "0.5rem" : 0,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>{fu.reason}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <Calendar size={12} color={fu.status === "Completed" ? "#16a34a" : "#ea580c"} />
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{fu.date} • {fu.time}</span>
                        </div>
                        {fu.prescriptionSummary && (
                          <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#0d9488", fontWeight: 600 }}>
                            Rx: {fu.prescriptionSummary}
                          </p>
                        )}
                      </div>
                      {fu.status !== "Completed" ? (
                        <button
                          onClick={() => handleMarkFollowUpDone(fu.id)}
                          style={{
                            background: "#fff", border: "1px solid #ea580c", borderRadius: "6px",
                            padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.72rem",
                            fontWeight: 600, color: "#ea580c", whiteSpace: "nowrap",
                          }}
                        >
                          ✓ Done
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16a34a" }}>✓ Completed</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No follow-ups scheduled</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
