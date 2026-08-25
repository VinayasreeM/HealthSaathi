import { formatDateTime } from "../../utils/format";

const PRIORITY_STYLES = {
  LOW: "status-green",
  MEDIUM: "status-orange",
  HIGH: "status-red",
};

export default function TriageCard({ triage }) {
  const t = triage;
  const pill = PRIORITY_STYLES[t.priority] || "status-gray";
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>🤖 AI Health Assessment</h3>
        <span className="muted">{formatDateTime(t.createdAt)}</span>
      </div>

      <p style={{ margin: "0.5rem 0" }}>
        <strong>Priority:</strong>{" "}
        <span className={`status-pill ${pill}`}>
          {t.priority === "HIGH" ? "🔴" : t.priority === "MEDIUM" ? "🟠" : "🟢"} {t.priority}
        </span>
      </p>

      {(t.symptoms?.length ?? 0) > 0 && (
        <>
          <p className="record-section-label">Symptoms</p>
          <ul style={{ margin: "0.15rem 0", paddingLeft: "1.2rem" }}>
            {t.symptoms.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {t.possibleConditions && (
        <>
          <p className="record-section-label">Possible Conditions</p>
          <p>{t.possibleConditions}</p>
        </>
      )}

      {t.recommendation && (
        <>
          <p className="record-section-label">Recommendation</p>
          <p>{t.recommendation}</p>
        </>
      )}
    </article>
  );
}
