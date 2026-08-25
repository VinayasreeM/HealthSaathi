import { formatDate } from "../../utils/format";

export default function RecommendationCard({ recommendation }) {
  const r = recommendation;
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>💡 Doctor Recommendations</h3>
        <span className="muted">{formatDate(r.createdAt)}</span>
      </div>

      {(r.items?.length ?? 0) > 0 ? (
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.2rem" }}>
          {r.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No items.</p>
      )}

      <p className="muted">Recommended by: {r.doctor?.name || "Doctor"}</p>
    </article>
  );
}
