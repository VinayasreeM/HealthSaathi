import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/doctors/me/patients"),
    []
  );

  const patients = Array.isArray(unwrap(data, [])) ? unwrap(data, []) : [];

  return (
    <div className="page">
      <div className="welcome-banner">
        <h1>Welcome, Dr. {user?.name?.replace(/^Dr\.?\s*/i, "") || "Doctor"} 👋</h1>
        <p>Doctor Dashboard — manage your patients.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <Link to="/doctor/prescription" className="card overview-link">
          📄 Create Prescription →
        </Link>
        <Link to="/doctor/follow-ups" className="card overview-link">
          📅 Schedule Follow-up →
        </Link>
        <Link to="/doctor/patients" className="card overview-link">
          👥 All Patients →
        </Link>
      </div>

      <h2 className="section-heading" style={{ marginTop: 0 }}>Patients</h2>
      {loading ? (
        <p className="loading">Loading patients…</p>
      ) : error ? (
        <div className="error-box card">
          <p>Unable to load patients. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      ) : patients.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">👥</span>No registered patients yet.
        </div>
      ) : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Blood Group</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.email}</td>
                  <td>{p.bloodGroup || "—"}</td>
                  <td>
                    <Link to={`/doctor/patients/${p.id}`}>View</Link>
                    {" · "}
                    <Link to={`/doctor/prescription?patientId=${p.id}`}>
                      Prescribe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
