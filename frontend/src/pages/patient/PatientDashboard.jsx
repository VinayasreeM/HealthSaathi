import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { unwrap, formatDate } from "../../utils/format";
import HealthOverviewCard from "../../components/patient/HealthOverviewCard";
import MedicalRecordCard from "../../components/patient/MedicalRecordCard";
import PrescriptionCard from "../../components/patient/PrescriptionCard";
import AppointmentCard from "../../components/patient/AppointmentCard";

function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box card">
      <p>Unable to load dashboard: {message}</p>
      <button type="button" className="btn" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const profile = useFetch(() => api.get("/patients/me"), []);
  const history = useFetch(() => api.get("/patients/me/medical-history"), []);
  const rx = useFetch(() => api.get("/patients/me/prescriptions"), []);
  const appts = useFetch(() => api.get("/patients/me/appointments"), []);
  const triage = useFetch(() => api.get("/patients/me/triage"), []);

  const records = Array.isArray(unwrap(history.data, [])) ? unwrap(history.data, []) : [];
  const prescriptions = Array.isArray(unwrap(rx.data, [])) ? unwrap(rx.data, []) : [];
  const appointments = Array.isArray(unwrap(appts.data, [])) ? unwrap(appts.data, []) : [];
  const assessments = Array.isArray(unwrap(triage.data, [])) ? unwrap(triage.data, []) : [];

  const activeMedicines = prescriptions.reduce(
    (count, p) => count + (p.medicines?.length ?? 0),
    0
  );
  const nextAppointment =
    appointments.find((a) => new Date(a.date) >= new Date(new Date().toDateString())) ||
    null;
  const latestRecord = records[0] || null;
  const latestRx = prescriptions[0] || null;
  const latestTriage = assessments[0] || null;

  if (profile.error || history.error || rx.error || appts.error || triage.error) {
    const message =
      profile.error || history.error || rx.error || appts.error || triage.error;
    return (
      <ErrorBox
        message={message}
        onRetry={() =>
          [profile, history, rx, appts, triage].forEach((h) => h.refetch())
        }
      />
    );
  }

  if (profile.loading || history.loading || rx.loading || appts.loading || triage.loading) {
    return <p className="loading">Loading your health overview…</p>;
  }

  const patientId = profile.data?.id;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <div className="welcome-banner">
        <h1>Welcome, {firstName} 👋</h1>
        <p>Here's your health overview.</p>
        {patientId && (
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)" }}>
            Patient ID: {String(patientId).slice(-8).toUpperCase()}
          </p>
        )}
      </div>

      <h2 className="section-heading" style={{ marginTop: 0 }}>
        Your Health Overview
      </h2>
      <div className="grid-3">
        <HealthOverviewCard icon="❤️" title="Health Status">
          🟢 Stable
          <div className="muted" style={{ fontWeight: 400, fontSize: "0.82rem" }}>
            Based on your recent records
          </div>
        </HealthOverviewCard>

        <HealthOverviewCard
          icon="💊"
          title="Active Medicines"
          to="/patient/medications"
          linkLabel="View Medicines"
        >
          {activeMedicines}
        </HealthOverviewCard>

        <HealthOverviewCard
          icon="📅"
          title="Next Appointment"
          to="/patient/appointments"
          linkLabel="View Appointments"
        >
          {nextAppointment ? (
            <>
              {formatDate(nextAppointment.date)}
              {nextAppointment.time ? `, ${nextAppointment.time}` : ""}
              <div className="muted" style={{ fontWeight: 400 }}>
                {nextAppointment.doctor?.name}
              </div>
            </>
          ) : (
            "No upcoming appointment"
          )}
        </HealthOverviewCard>
      </div>

      <h2 className="section-heading">Recent Medical History</h2>
      {latestRecord ? (
        <>
          <MedicalRecordCard record={latestRecord} />
          {records.length > 1 && (
            <Link to="/patient/medical-history" className="overview-link">
              View full medical history →
            </Link>
          )}
        </>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon">📋</span>No medical history available.
        </div>
      )}

      <h2 className="section-heading">Latest Prescription</h2>
      {latestRx ? (
        <>
          <PrescriptionCard prescription={latestRx} />
          <br />
          <Link to="/patient/prescriptions" className="overview-link">
            View all prescriptions →
          </Link>
        </>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon">📄</span>
          No prescriptions available yet.
          <p>Your prescriptions will appear here after your doctor creates them.</p>
        </div>
      )}

      <h2 className="section-heading">AI Assessment</h2>
      {latestTriage ? (
        <>
          <div className="card">
            Priority:{" "}
            <strong>
              {latestTriage.priority === "HIGH"
                ? "🔴 HIGH"
                : latestTriage.priority === "MEDIUM"
                ? "🟠 MEDIUM"
                : "🟢 LOW"}
            </strong>
            <div className="muted">{latestTriage.possibleConditions}</div>
          </div>
          <br />
          <Link to="/patient/ai-assessment" className="overview-link">
            View full assessment →
          </Link>
        </>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon">🤖</span>
          No AI assessment available yet.
          <p>Your WhatsApp-based assessments will appear here once processed.</p>
        </div>
      )}
    </div>
  );
}
