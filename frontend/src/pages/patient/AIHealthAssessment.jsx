import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import TriageCard from "../../components/patient/TriageCard";

export default function AIHealthAssessment() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/triage"),
    []
  );

  if (loading) return <p className="loading">Loading AI assessment…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>🤖 AI Health Assessment</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load AI assessments. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const result = unwrap(data, []);
  const list = Array.isArray(result) ? result : [];

  return (
    <div className="stack">
      <h1 className="page-title" style={{ margin: 0 }}>
        🤖 AI Health Assessment
      </h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">🤖</span>No AI assessment available yet.
          <p>
            Assessments submitted through HealthSaathi (e.g. via WhatsApp)
            will appear here once processed.
          </p>
        </div>
      ) : (
        list.map((t) => <TriageCard key={t._id} triage={t} />)
      )}

      <p className="disclaimer">
        ⚠️ This is an AI-assisted preliminary assessment and is not a medical
        diagnosis. Please consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}
