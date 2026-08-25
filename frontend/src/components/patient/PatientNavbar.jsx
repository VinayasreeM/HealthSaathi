import { Link } from "react-router-dom";
import { initials } from "../../utils/format";

export default function PatientNavbar({ userName, unreadCount = 0, onMenuClick }) {
  return (
    <header className="hs-navbar">
      <div className="hs-navbar-left">
        <button
          type="button"
          className="hs-burger"
          aria-label="Toggle menu"
          onClick={onMenuClick}
        >
          ☰
        </button>
        <strong>HealthSaathi</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link
          to="/patient/notifications"
          className="hs-bell"
          aria-label={`Notifications (${unreadCount} unread)`}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className="hs-dot" />}
        </Link>
        <span className="muted">{userName}</span>
        <Link to="/patient/profile" className="hs-avatar" title="Patient Profile">
          {initials(userName)}
        </Link>
      </div>
    </header>
  );
}
