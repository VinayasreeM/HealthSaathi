import { formatDate, isUpcoming } from "../../utils/format";

export default function MedicineCard({ medicine }) {
  const active =
    medicine.endDate == null || isUpcoming(medicine.endDate);
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>💊 {medicine.name}</h3>
        <span
          className={`status-pill ${active ? "status-green" : "status-gray"}`}
        >
          {active ? "🟢 Active" : "⚪ Inactive"}
        </span>
      </div>

      <p>
        {[medicine.dosage, medicine.frequency].filter(Boolean).join(" • ") || "—"}
      </p>
      {medicine.timing && <p className="muted">⏰ {medicine.timing}</p>}
      {medicine.duration && <p className="muted">For {medicine.duration}</p>}
      {medicine.instructions && (
        <p className="muted" style={{ marginTop: "0.4rem" }}>
          📝 {medicine.instructions}
        </p>
      )}
      <p className="muted" style={{ marginTop: "0.4rem" }}>
        Start: {formatDate(medicine.startDate)}
        {medicine.endDate ? ` · End: ${formatDate(medicine.endDate)}` : ""}
      </p>
    </article>
  );
}
