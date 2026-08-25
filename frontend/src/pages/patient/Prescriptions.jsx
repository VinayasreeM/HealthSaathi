import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import PrescriptionCard from "../../components/patient/PrescriptionCard";

export default function Prescriptions() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/prescriptions"),
    []
  );

  if (loading) return <p className="loading">Loading prescriptions…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>📄 Prescriptions</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load prescriptions. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const result = unwrap(data, []);
  const list = Array.isArray(result) ? result : [];

  return (
    <div className="stack">
      <h1 className="page-title" style={{ margin: 0 }}>
        📄 Prescriptions
      </h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">📄</span>
          No prescriptions available yet.
          <p>Your prescriptions will appear here after your doctor creates them.</p>
        </div>
      ) : (
        list.map((rx) => <PrescriptionCard key={rx._id} prescription={rx} />)
      )}
    </div>
  );
}
