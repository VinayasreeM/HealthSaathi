import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import MedicalRecordCard from "../../components/patient/MedicalRecordCard";

export default function MedicalHistory() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/medical-history"),
    []
  );

  if (loading) return <p className="loading">Loading medical history…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title">📋 Medical History</h1>
        <div className="error-box card">
          <p>Unable to load medical history. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const records = unwrap(data, []);
  const list = Array.isArray(records) ? records : [];

  return (
    <div className="stack">
      <h1 className="page-title" style={{ margin: 0 }}>
        📋 Medical History
      </h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">📋</span>No medical history available.
          <p>Your doctor-created visit records will appear here.</p>
        </div>
      ) : (
        list.map((record) => (
          <MedicalRecordCard key={record._id} record={record} />
        ))
      )}
    </div>
  );
}
