import { formatDate } from "../../utils/format";

export default function PrescriptionCard({ prescription }) {
  const rx = prescription;
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>📄 Prescription</h3>
        <span className="muted">Date: {formatDate(rx.createdAt)}</span>
      </div>

      <p><strong>Doctor:</strong> {rx.doctor?.name || "—"}</p>
      {rx.diagnosis && <p><strong>Diagnosis:</strong> {rx.diagnosis}</p>}

      {(rx.medicines?.length ?? 0) > 0 && (
        <>
          <p className="record-section-label">Medicines</p>
          <div className="stack" style={{ gap: "0.6rem" }}>
            {rx.medicines.map((med, i) => (
              <div key={`${med.name}-${i}`} className="med-line">
                <strong>💊 {med.name}</strong>
                {med.dosage && <span>{med.dosage}</span>}
                {med.frequency && <span>{med.frequency}</span>}
                {med.timing && <span>{med.timing}</span>}
                {med.duration && <span>{med.duration}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {rx.medicines?.some((m) => m.instructions) && (
        <>
          <p className="record-section-label">Instructions</p>
          {rx.medicines
            .filter((m) => m.instructions)
            .map((m, i) => (
              <p key={i}>
                💊 {m.name}: {m.instructions}
              </p>
            ))}
        </>
      )}

      {rx.recommendations && (
        <>
          <p className="record-section-label">Recommendations</p>
          {String(rx.recommendations)
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <p key={i}>• {line.replace(/^[-•*]\s*/, "")}</p>
            ))}
        </>
      )}

      {rx.nextVisitDate && (
        <p style={{ marginTop: "0.75rem" }}>
          <strong>Next Visit:</strong> {formatDate(rx.nextVisitDate)}
        </p>
      )}
    </article>
  );
}
