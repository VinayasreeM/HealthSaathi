import { formatDate, isUpcoming } from "../../utils/format";

export default function AppointmentCard({ appointment }) {
  const a = appointment;
  const upcoming = isUpcoming(a.date) && a.status !== "Completed" && a.status !== "Cancelled";
  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3>📅 {upcoming ? "Upcoming Appointment" : "Past Appointment"}</h3>
        <span
          className={
            "status-pill " +
            (a.status === "Cancelled"
              ? "status-red"
              : a.status === "Completed"
              ? "status-gray"
              : "status-green")
          }
        >
          {a.status === "Confirmed" || a.status === "Scheduled"
            ? `🟢 ${a.status}`
            : `${a.status === "Completed" ? "⚪" : "🔴"} ${a.status}`}
        </span>
      </div>

      <p style={{ fontSize: "1.05rem", fontWeight: 600 }}>
        {formatDate(a.date)}{a.time ? `, ${a.time}` : ""}
      </p>
      <p><strong>Doctor:</strong> {a.doctor?.name || "—"}</p>
      {a.reason && <p><strong>Reason:</strong> {a.reason}</p>}
    </article>
  );
}
