import { useEffect, useState } from "react";
import * as api from "./api";
import ApplicationForm from "./ApplicationForm";
import ApplicationDetails from "./ApplicationDetails";
import "./App.css";
const STAGES = ["Applied", "Interview", "Offer", "Rejected"];
const COLUMNS = [
  ["company", "Company"],
  ["title", "Title"],
  ["stage", "Stage"],
  ["appliedDate", "Applied"],
];
const EMPTY = { items: [], totalCount: 0, totalPages: 0 };

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Tracker({ email, onLogout }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [stage, setStage] = useState("");
  const [sortBy, setSortBy] = useState("appliedDate");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: "", data: EMPTY });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);

  const requestKey = JSON.stringify({
    search,
    stage,
    sortBy,
    sortDir,
    page,
    pageSize,
    reloadKey,
  });
  const loading = result.key !== requestKey;
  const { items, totalCount, totalPages } = result.data;

  useEffect(() => {
    let cancelled = false;
    api
      .getApplications({ search, stage, sortBy, sortDir, page, pageSize })
      .then((raw) => {
        if (cancelled) return;
        const data = {
          items: Array.isArray(raw?.items) ? raw.items : [],
          totalCount: raw?.totalCount ?? 0,
          totalPages: raw?.totalPages ?? 0,
        };
        setError(
          Array.isArray(raw?.items)
            ? ""
            : "Unexpected response from the server. Is the API up to date?",
        );
        setResult({ key: requestKey, data });
        if (data.totalPages > 0 && page > data.totalPages)
          setPage(data.totalPages);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setResult({ key: requestKey, data: EMPTY });
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const reload = () => setReloadKey((k) => k + 1);

  const run = async (action) => {
    setError("");
    try {
      await action();
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const add = (data) =>
    run(async () => {
      await api.createApplication(data);
      setPage(1);
    });
  const save = (data) =>
    run(async () => {
      await api.updateApplication(editing.id, data);
      setEditing(null);
    });
  const changeStage = (id, newStage) =>
    run(() => api.updateStage(id, newStage));
  const remove = (app) => {
    if (!window.confirm(`Delete ${app.title} at ${app.company}?`)) return;
    if (selected?.id === app.id) setSelected(null);
    run(() => api.deleteApplication(app.id));
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <main className="wrap">
      <div className="topbar">
        <h1>Job Application Tracker</h1>
        <div className="row">
          <span>{email}</span>
          <button className="secondary" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

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
      {selected && (
        <ApplicationDetails
          key={selected.id}
          app={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="row filters">
        <input
          placeholder="Search company or title"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className={`tablewrap ${loading ? "loading" : ""}`}>
        <table>
          <thead>
            <tr>
              {COLUMNS.map(([field, label]) => (
                <th
                  key={field}
                  aria-sort={
                    sortBy === field
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button className="sort" onClick={() => toggleSort(field)}>
                    {label}{" "}
                    {sortBy === field ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </button>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
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
                  <button onClick={() => setSelected(a)}>Details</button>
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
        {!loading && items.length === 0 && !error && (
          <p className="empty">No applications found.</p>
        )}
        {loading && items.length === 0 && <p className="empty">Loading…</p>}
      </div>

      <div className="row pager">
        <span>{totalCount} results</span>
        <button
          className="secondary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </span>
        <button
          className="secondary"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>
    </main>
  );
}
