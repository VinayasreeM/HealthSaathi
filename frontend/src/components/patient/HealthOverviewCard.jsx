import { Link } from "react-router-dom";

export default function HealthOverviewCard({ icon, title, children, to, linkLabel = "View" }) {
  return (
    <div className="card overview-card">
      <h3>
        {icon} {title}
      </h3>
      <div className="overview-value">{children}</div>
      {to && (
        <Link to={to} className="overview-link">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
