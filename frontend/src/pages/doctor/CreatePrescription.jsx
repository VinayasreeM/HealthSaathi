import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";

const emptyMedicine = {
  name: "",
  dosage: "",
  frequency: "",
  timing: "",
  duration: "",
  instructions: "",
};

export default function CreatePrescription() {
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(searchParams.get("patientId") || "");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [recommendations, setRecommendations] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { data, loading } = useFetch(() => api.get("/doctors/me/patients"), []);
  const patients = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const updateMedicine = (index, field) => (e) => {
    setMedicines((meds) =>
      meds.map((m, i) => (i === index ? { ...m, [field]: e.target.value } : m))
    );
  };

  const addMedicine = () => setMedicines((meds) => [...meds, { ...emptyMedicine }]);
  const removeMedicine = (index) =>
    setMedicines((meds) => meds.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    const cleaned = medicines.filter((m) => m.name.trim());
    if (cleaned.length === 0) {
      setError("Please add at least one medicine with a name.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/doctors/me/prescriptions", {
        patientId,
        diagnosis,
        medicines: cleaned,
        recommendations,
        nextVisitDate: nextVisitDate || undefined,
      });
      navigate(`/doctor/patients/${patientId}`);
    } catch (err) {
      setError(err.message || "Failed to save prescription");
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>📄 Create Prescription</h1>
        <Link to="/doctor">← Back to Dashboard</Link>
      </div>
      <br />

      {loading ? (
        <p className="loading">Loading patients…</p>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-grid">
            <div className="full">
              <label htmlFor="patient">Patient</label>
              <select
                id="patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="">— Select a patient —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="full">
              <label htmlFor="diagnosis">Diagnosis</label>
              <input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension"
              />
            </div>
          </div>

          <h3>Medicines</h3>
          {medicines.map((med, i) => (
            <fieldset key={i} className="med-row" style={{ border: "1px dashed var(--hs-border)" }}>
              <div className="form-grid" style={{ marginBottom: 0 }}>
                <input
                  placeholder="Name *"
                  value={med.name}
                  onChange={updateMedicine(i, "name")}
                  required
                />
                <input placeholder="Dosage (500 mg)" value={med.dosage} onChange={updateMedicine(i, "dosage")} />
                <input placeholder="Frequency (Twice daily)" value={med.frequency} onChange={updateMedicine(i, "frequency")} />
                <input placeholder="Timing (08:00 AM)" value={med.timing} onChange={updateMedicine(i, "timing")} />
                <input placeholder="Duration (30 days)" value={med.duration} onChange={updateMedicine(i, "duration")} />
                <input placeholder="Instructions (after food)" value={med.instructions} onChange={updateMedicine(i, "instructions")} />
              </div>
              {medicines.length > 1 && (
                <button type="button" className="btn-secondary" style={{ marginTop: "0.5rem" }} onClick={() => removeMedicine(i)}>
                  Remove medicine
                </button>
              )}
            </fieldset>
          ))}
          <button type="button" className="btn-secondary" onClick={addMedicine}>
            + Add another medicine
          </button>

          <div className="form-grid" style={{ marginTop: "1.25rem" }}>
            <div className="full">
              <label htmlFor="recs">Recommendations (one per line)</label>
              <textarea
                id="recs"
                rows={3}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder={"Reduce salt intake\nTake medicines on time"}
              />
            </div>
            <div className="full">
              <label htmlFor="nextVisit">Next Visit Date (optional)</label>
              <input
                id="nextVisit"
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={saving} style={{ marginTop: "0.5rem", padding: "0.7rem 1.5rem" }}>
            {saving ? "Saving…" : "Save Prescription"}
          </button>
        </form>
      )}
    </div>
  );
}
