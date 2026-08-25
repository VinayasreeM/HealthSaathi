import { Link } from "react-router-dom";
import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";

export default function PatientList() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/doctors/me/patients"),
    []
  );

  const patients = Array.isArray(unwrap(data, [])) ? unwrap(data, []) : [];

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>👥 Patients</h1>
        <Link to="/doctor">← Back to Dashboard</Link>
      </div>
      <br />

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
                <th>Age</th>
                <th>Blood Group</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.email}</td>
                  <td>{p.age ?? "—"}</td>
                  <td>{p.bloodGroup || "—"}</td>
                  <td>
                    <Link to={`/doctor/patients/${p.id}`}>Details</Link>
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
