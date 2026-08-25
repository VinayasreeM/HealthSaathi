import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap } from "../../utils/format";
import NotificationCard from "../../components/patient/NotificationCard";

export default function Notifications() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/notifications"),
    []
  );

  if (loading) return <p className="loading">Loading notifications…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>🔔 Notifications</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load notifications. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const result = unwrap(data, []);
  const list = Array.isArray(result) ? result : [];

  const markRead = async (n) => {
    try {
      await api.patch(`/patients/me/notifications/${n._id}/read`);
      refetch();
    } catch {
      // Non-critical; keep the notification as-is on failure
    }
  };

  return (
    <div className="stack">
      <h1 className="page-title" style={{ margin: 0 }}>
        🔔 Notifications
      </h1>

      {list.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">🔔</span>No notifications yet.
          <p>You'll be notified when your doctor adds prescriptions or schedules appointments.</p>
        </div>
      ) : (
        list.map((n) => (
          <NotificationCard key={n._id} notification={n} onMarkRead={markRead} />
        ))
      )}
    </div>
  );
}
