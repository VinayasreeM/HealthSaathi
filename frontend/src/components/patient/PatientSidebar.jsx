import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/patient", icon: "🏠", label: "Dashboard", end: true },
  { to: "/patient/medical-history", icon: "📋", label: "Medical History" },
  { to: "/patient/medications", icon: "💊", label: "Medications" },
  { to: "/patient/prescriptions", icon: "📄", label: "Prescriptions" },
  { to: "/patient/appointments", icon: "📅", label: "Appointments" },
  { to: "/patient/recommendations", icon: "💡", label: "Recommendations" },
  { to: "/patient/ai-assessment", icon: "🤖", label: "AI Health Assessment" },
  { to: "/patient/notifications", icon: "🔔", label: "Notifications" },
  { to: "/patient/profile", icon: "👤", label: "Profile" },
];

export default function PatientSidebar({ onNavigate }) {
  const { logout } = useAuth();

  return (
    <aside className="hs-sidebar">
      <div className="hs-sidebar-brand">🏥 HealthSaathi</div>
      <nav>
        {links.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `hs-nav-link${isActive ? " active" : ""}`
            }
            onClick={onNavigate}
          >
            {icon} {label}
          </NavLink>
        ))}
      </nav>
      <div className="hs-sidebar-footer">
        <button
          type="button"
          className="hs-nav-link"
          style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
