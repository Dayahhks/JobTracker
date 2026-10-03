import * as api from "./api";
import { useLoad } from "./useLoad";
import { Place } from "./Interviews";

export default function Upcoming() {
  const { data, error, loading } = useLoad(() => api.getUpcoming(7), "7");

  return (
    <section className="card">
      <h2>Upcoming interviews (next 7 days)</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="empty">No interviews in the next 7 days.</p>
      ) : (
        <ul className="plainlist">
          {data.map((i) => (
            <li key={i.id} className="listitem">
              <strong>{new Date(i.scheduledAt).toLocaleString()}</strong>
              <div>
                {i.title} at {i.company}
              </div>
              <div className="meta">
                {i.type} · <Place value={i.locationOrLink} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
