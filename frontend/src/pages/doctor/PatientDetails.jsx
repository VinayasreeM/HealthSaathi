import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap, formatDate } from "../../utils/format";

export default function PatientDetails() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(
    () => api.get(`/doctors/me/patients/${id}`),
    [id]
  );

  if (loading) return <p className="page loading">Loading patient…</p>;

  if (error || !data) {
    return (
      <div className="page">
        <div className="error-box card">
          <p>Unable to load patient. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const d = data.data ?? data;
  const { patient, profile, records = [], prescriptions = [], appointments = [] } = d;

  return (
    <div className="page stack">
      <Link to="/doctor/patients">← Back to Patients</Link>

      <div className="card">
        <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
          {patient?.name}
        </h1>
        <p className="muted">{patient?.email}</p>
        {profile && (
          <p className="muted">
            {[profile.age && `${profile.age} yrs`, profile.gender, profile.bloodGroup && `Blood: ${profile.bloodGroup}`, profile.phone]
              .filter(Boolean)
              .join(" · ") || ""}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <Link
            to={`/doctor/prescription?patientId=${id}`}
            className="btn"
            style={{ color: "#fff" }}
          >
            Create Prescription
          </Link>
          <Link to={`/doctor/follow-ups?patientId=${id}`} className="btn-secondary">
            Schedule Follow-up
          </Link>
        </div>
      </div>

      <h2 className="section-heading" style={{ marginTop: 0 }}>Medical Records</h2>
      {records.length === 0 ? (
        <p className="muted">No records yet.</p>
      ) : (
        records.map((r) => (
          <div key={r._id} className="card">
            <strong>{formatDate(r.visitDate)}</strong> — {r.diagnosis || "Visit"}
            <p className="muted">{(r.symptoms || []).join(", ")}</p>
          </div>
        ))
      )}

      <h2 className="section-heading">Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <p className="muted">No prescriptions yet.</p>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx._id} className="card">
            <strong>{formatDate(rx.createdAt)}</strong> — {rx.diagnosis || "Prescription"}
            <p className="muted">
              {(rx.medicines || []).map((m) => `${m.name} ${m.dosage || ""}`).join(", ")}
            </p>
          </div>
        ))
      )}

      <h2 className="section-heading">Appointments</h2>
      {appointments.length === 0 ? (
        <p className="muted">No appointments yet.</p>
      ) : (
        appointments.map((a) => (
          <div key={a._id} className="card">
            <strong>{formatDate(a.date)}{a.time ? `, ${a.time}` : ""}</strong> —{" "}
            {a.reason || a.status}
          </div>
        ))
      )}
    </div>
  );
}
