import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import RecommendationCard from "../../components/patient/RecommendationCard";

export default function Recommendations() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/recommendations"),
    []
  );

  if (loading) return <p className="loading">Loading recommendations…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>💡 Recommendations</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load recommendations. {error}</p>
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
        💡 Doctor Recommendations
      </h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">💡</span>No recommendations available yet.
          <p>Health recommendations from your doctor will appear here.</p>
        </div>
      ) : (
        list.map((r) => <RecommendationCard key={r._id} recommendation={r} />)
      )}
    </div>
  );
}
