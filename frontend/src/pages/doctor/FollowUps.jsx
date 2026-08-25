import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap, formatDate } from "../../utils/format";

export default function FollowUps() {
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(searchParams.get("patientId") || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const patientsReq = useFetch(() => api.get("/doctors/me/patients"), []);
  const apptsReq = useFetch(() => api.get("/doctors/me/appointments"), []);

  const patients = unwrap(patientsReq.data, []);
  const appointments = Array.isArray(unwrap(apptsReq.data, []))
    ? unwrap(apptsReq.data, [])
    : [];
  const patientList = Array.isArray(patients) ? patients : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!patientId || !date) {
      setError("Please select a patient and a date.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/doctors/me/appointments", { patientId, date, time, reason });
      setDate("");
      setTime("");
      setReason("");
      apptsReq.refetch();
    } catch (err) {
      setError(err.message || "Failed to schedule appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>📅 Follow-ups</h1>
        <Link to="/doctor">← Back to Dashboard</Link>
      </div>
      <br />

      <div className="grid-2">
        <form onSubmit={handleSubmit} className="card">
          <h3>Schedule an appointment</h3>
          {error && <div className="auth-error">{error}</div>}

          <div className="stack">
            <div>
              <label htmlFor="fpatient">Patient</label>
              <select id="fpatient" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">— Select a patient —</option>
                {(Array.isArray(patientList) ? patientList : []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid">
              <div>
                <label htmlFor="fdate">Date</label>
                <input id="fdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="ftime">Time</label>
                <input id="ftime" placeholder="10:30 AM" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="freason">Reason</label>
              <input
                id="freason"
                placeholder="Follow-up consultation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Scheduling…" : "Schedule Appointment"}
            </button>
          </div>
        </form>

        <div className="card">
          <h3>All appointments</h3>
          {apptsReq.loading ? (
            <p className="loading">Loading…</p>
          ) : apptsReq.error ? (
            <p className="muted">{apptsReq.error}</p>
          ) : appointments.length === 0 ? (
            <p className="muted">No appointments scheduled yet.</p>
          ) : (
            <div className="stack" style={{ gap: "0.6rem" }}>
              {appointments.map((a) => (
                <div key={a._id} style={{ borderBottom: "1px solid var(--hs-border)", paddingBottom: "0.5rem" }}>
                  <strong>{formatDate(a.date)}{a.time ? `, ${a.time}` : ""}</strong>
                  <p className="muted">
                    Patient: {a.patient?.name || "—"} · {a.reason || "Visit"} · {a.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
