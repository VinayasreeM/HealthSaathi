import { formatDate } from "../../utils/format";

export default function MedicalRecordCard({ record }) {
  const vitals = record.vitals || {};
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>📋 Visit — {formatDate(record.visitDate || record.createdAt)}</h3>
        <span className="muted">{record.doctor?.name || "Doctor"}</span>
      </div>

      {(record.symptoms?.length ?? 0) > 0 && (
        <>
          <p className="record-section-label">Symptoms</p>
          <ul style={{ margin: "0.15rem 0", paddingLeft: "1.2rem" }}>
            {record.symptoms.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {record.diagnosis && (
        <>
          <p className="record-section-label">Diagnosis</p>
          <p>{record.diagnosis}</p>
        </>
      )}

      {(vitals.bp || vitals.temperature || vitals.heartRate) && (
        <>
          <p className="record-section-label">Vitals</p>
          <div className="vitals-row">
            {vitals.bp && <span className="vital-chip">BP: {vitals.bp}</span>}
            {vitals.temperature && (
              <span className="vital-chip">Temperature: {vitals.temperature}</span>
            )}
            {vitals.heartRate && (
              <span className="vital-chip">Heart Rate: {vitals.heartRate}</span>
            )}
          </div>
        </>
      )}

      {record.testReports && (
        <>
          <p className="record-section-label">Test Reports</p>
          <p>{record.testReports}</p>
        </>
      )}

      {record.notes && (
        <>
          <p className="record-section-label">Doctor Notes</p>
          <p>{record.notes}</p>
        </>
      )}
    </article>
  );
}
