import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.55rem 0", borderBottom: "1px solid var(--hs-border)" }}>
      <span style={{ width: "140px", flexShrink: 0, color: "var(--hs-text-muted)", fontWeight: 600, fontSize: "0.88rem" }}>
        {label}
      </span>
      <span>{value || "—"}</span>
    </div>
  );
}

export default function PatientProfile() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch(() => api.get("/patients/me"), []);

  if (loading) return <p className="loading">Loading profile…</p>;

  if (error || !data) {
    return (
      <div>
        <h1 className="page-title">👤 Profile</h1>
        <div className="error-box card">
          <p>Unable to load your profile. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const p = Array.isArray(data) ? data[0] : data;

  return (
    <div>
      <h1 className="page-title">👤 Profile</h1>

      <div className="card" style={{ maxWidth: "640px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <span className="hs-avatar" style={{ width: "56px", height: "56px", fontSize: "1.2rem" }}>
            {(p.name || user?.name || "?").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 style={{ margin: 0 }}>{p.name || user?.name}</h2>
            <p className="muted">{p.email}</p>
          </div>
        </div>

        <ProfileRow label="Patient ID" value={p.id ? String(p.id).slice(-8).toUpperCase() : null} />
        <ProfileRow label="Age" value={p.age} />
        <ProfileRow label="Gender" value={p.gender} />
        <ProfileRow label="Phone" value={p.phone} />
        <ProfileRow label="Blood Group" value={p.bloodGroup} />
        <ProfileRow
          label="Allergies"
          value={Array.isArray(p.allergies) && p.allergies.length > 0 ? p.allergies.join(", ") : "None recorded"}
        />
        <ProfileRow label="Address" value={p.address} />

        <p className="muted" style={{ marginTop: "1rem" }}>
          To update your details, please contact your healthcare provider.
        </p>
      </div>
    </div>
  );
}
