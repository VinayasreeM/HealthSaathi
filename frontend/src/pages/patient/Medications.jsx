import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import MedicineCard from "../../components/patient/MedicineCard";

export default function Medications() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/medications"),
    []
  );

  if (loading) return <p className="loading">Loading medications…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>💊 Medications</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load medications. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const medications = unwrap(data, []);
  const list = Array.isArray(medications) ? medications : [];

  return (
    <div>
      <h1 className="page-title">💊 Medications</h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">💊</span>No active medicines.
          <p>Medicines prescribed by your doctor will appear here.</p>
        </div>
      ) : (
        <div className="grid-2">
          {list.map((med) => (
            <MedicineCard key={med._id} medicine={med} />
          ))}
        </div>
      )}
    </div>
  );
}
