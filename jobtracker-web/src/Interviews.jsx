import { useState } from "react";
import * as api from "./api";
import { useLoad } from "./useLoad";

const TYPES = ["Phone", "Technical", "HR"];
const OUTCOMES = ["Pending", "Passed", "Failed"];
const pad = (n) => String(n).padStart(2, "0");

// ISO (UTC) string -> value for <input type="datetime-local"> in the user's own time zone
const toLocalInput = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function InterviewForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          scheduledAt: toLocalInput(initial.scheduledAt),
          type: initial.type,
          locationOrLink: initial.locationOrLink ?? "",
          outcome: initial.outcome,
        }
      : {
          scheduledAt: "",
          type: "Phone",
          locationOrLink: "",
          outcome: "Pending",
        },
  );
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      scheduledAt: new Date(form.scheduledAt).toISOString(), // local time -> UTC
      type: form.type,
      locationOrLink: form.locationOrLink.trim() || null,
      outcome: form.outcome,
    });
  };

  return (
    <form className="subform" onSubmit={submit}>
      <input
        type="datetime-local"
        name="scheduledAt"
        value={form.scheduledAt}
        onChange={change}
        required
      />
      <select name="type" value={form.type} onChange={change}>
        {TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <input
        name="locationOrLink"
        placeholder="Location or meeting link"
        maxLength={500}
        value={form.locationOrLink}
        onChange={change}
      />
      <select name="outcome" value={form.outcome} onChange={change}>
        {OUTCOMES.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <div className="row">
        <button type="submit">{initial ? "Save" : "Add interview"}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export const Place = ({ value }) =>
  !value ? null : /^https?:\/\//i.test(value) ? (
    <a href={value} target="_blank" rel="noreferrer">
      Join link
    </a>
  ) : (
    <span>{value}</span>
  );

export default function Interviews({ appId }) {
  const [reload, setReload] = useState(0);
  const {
    data: items,
    error,
    loading,
  } = useLoad(() => api.getInterviews(appId), `${appId}:${reload}`);
  const [editId, setEditId] = useState(null);
  const [actionError, setActionError] = useState("");

  const act = async (fn) => {
    setActionError("");
    try {
      await fn();
      setReload((r) => r + 1);
    } catch (e) {
      setActionError(e.message);
    }
  };

  const add = (data) => act(() => api.addInterview(appId, data));
  const save = (data) =>
    act(async () => {
      await api.updateInterview(appId, editId, data);
      setEditId(null);
    });
  const remove = (i) => {
    if (window.confirm("Delete this interview?"))
      act(() => api.deleteInterview(appId, i.id));
  };

  return (
    <div>
      <h3>Interviews</h3>
      {(error || actionError) && (
        <p className="error" role="alert">
          {error || actionError}
        </p>
      )}

      <InterviewForm key={reload} onSave={add} />

      {loading && !items ? (
        <p className="empty">Loading…</p>
      ) : (items ?? []).length === 0 ? (
        <p className="empty">No interviews scheduled.</p>
      ) : (
        <ul className="plainlist">
          {items.map((i) => (
            <li key={i.id} className="listitem">
              {editId === i.id ? (
                <InterviewForm
                  initial={i}
                  onSave={save}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <>
                  <strong>{new Date(i.scheduledAt).toLocaleString()}</strong>
                  <div className="meta">
                    {i.type} ·{" "}
                    <span className={`outcome ${i.outcome}`}>{i.outcome}</span>
                  </div>
                  <div className="meta">
                    <Place value={i.locationOrLink} />
                  </div>
                  <div className="row">
                    <button
                      className="secondary"
                      onClick={() => setEditId(i.id)}
                    >
                      Edit
                    </button>
                    <button className="danger" onClick={() => remove(i)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
