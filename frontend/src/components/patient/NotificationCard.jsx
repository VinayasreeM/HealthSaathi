import { formatDateTime } from "../../utils/format";

const TYPE_ICONS = {
  prescription: "💊",
  appointment: "📅",
  medication: "💊",
  assessment: "🤖",
  general: "🔔",
};

export default function NotificationCard({ notification, onMarkRead }) {
  const n = notification;
  return (
    <article
      className={`card${n.read ? "" : " notif-unread"}`}
      style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
    >
      <div>
        <h3 style={{ fontSize: "1rem" }}>
          {TYPE_ICONS[n.type] || "🔔"} {n.title || "Notification"}
          {!n.read && (
            <span className="status-pill status-green" style={{ marginLeft: "0.5rem" }}>
              New
            </span>
          )}
        </h3>
        {n.message && <p className="muted">{n.message}</p>}
        <p className="muted">{formatDateTime(n.createdAt)}</p>
      </div>

      {!n.read && onMarkRead && (
        <button type="button" className="btn-secondary" onClick={() => onMarkRead(n)}>
          Mark as read
        </button>
      )}
    </article>
  );
}
