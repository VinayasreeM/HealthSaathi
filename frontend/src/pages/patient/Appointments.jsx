import api from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { unwrap, isUpcoming } from "../../utils/format";
import AppointmentCard from "../../components/patient/AppointmentCard";

export default function Appointments() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/patients/me/appointments"),
    []
  );

  if (loading) return <p className="loading">Loading appointments…</p>;

  if (error) {
    return (
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>📅 Appointments</h1>
        <br />
        <div className="error-box card">
          <p>Unable to load appointments. {error}</p>
          <button type="button" className="btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const result = unwrap(data, []);
  const list = Array.isArray(result) ? result : [];
  const isPast = (a) =>
    !isUpcoming(a.date) || a.status === "Completed" || a.status === "Cancelled";

  const upcoming = list.filter((a) => !isPast(a));
  const past = list.filter(isPast);

  return (
    <div>
      <h1 className="page-title">📅 Appointments</h1>

      <h2 className="section-heading" style={{ marginTop: 0 }}>
        Upcoming
      </h2>
      {upcoming.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-icon">📅</span>No upcoming appointments.
        </div>
      ) : (
        <div className="grid-2">
          {upcoming.map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
        </div>
      )}

      <h2 className="section-heading">Past</h2>
      {past.length === 0 ? (
        <p className="muted">No past appointments yet.</p>
      ) : (
        <div className="grid-2">
          {past.map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
