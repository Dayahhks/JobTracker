import { useEffect, useState } from "react";
import * as api from "./api";
import ApplicationForm from "./ApplicationForm";
import "./App.css";

const STAGES = ["Applied", "Interview", "Offer", "Rejected"];

export default function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    let cancelled = false;

    api
      .getApplications()
      .then((data) => {
        if (!cancelled) setApps(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const add = (data) =>
    run(async () => {
      const created = await api.createApplication(data);
      setApps((prev) => [created, ...prev]);
    });

  const save = (data) =>
    run(async () => {
      const updated = await api.updateApplication(editing.id, data);
      setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditing(null);
    });

  const changeStage = (id, stage) =>
    run(async () => {
      const updated = await api.updateStage(id, stage);
      setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
    });

  const remove = (app) => {
    if (!window.confirm(`Delete ${app.title} at ${app.company}?`)) return;
    run(async () => {
      await api.deleteApplication(app.id);
      setApps((prev) => prev.filter((a) => a.id !== app.id));
    });
  };

  const visible = apps.filter(
    (a) =>
      (!stageFilter || a.stage === stageFilter) &&
      `${a.company} ${a.title}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="wrap">
      <h1>Job Application Tracker</h1>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {editing ? (
        <ApplicationForm
          key={editing.id}
          initial={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <ApplicationForm onSave={add} />
      )}

      <div className="row filters">
        <input
          placeholder="Search company or title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : visible.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Title</th>
                <th>Stage</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noreferrer">
                        {a.company}
                      </a>
                    ) : (
                      a.company
                    )}
                  </td>
                  <td>{a.title}</td>
                  <td>
                    <select
                      className={`stage ${a.stage}`}
                      value={a.stage}
                      onChange={(e) => changeStage(a.id, e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(a.appliedDate).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="secondary" onClick={() => setEditing(a)}>
                      Edit
                    </button>
                    <button className="danger" onClick={() => remove(a)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
