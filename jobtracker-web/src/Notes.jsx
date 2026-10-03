import { useState } from "react";
import * as api from "./api";
import { useLoad } from "./useLoad";

export default function Notes({ appId }) {
  const [reload, setReload] = useState(0);
  const {
    data: notes,
    error,
    loading,
  } = useLoad(() => api.getNotes(appId), `${appId}:${reload}`);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
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

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    act(async () => {
      await api.addNote(appId, text.trim());
      setText("");
    });
  };
  const saveEdit = () =>
    act(async () => {
      await api.updateNote(appId, editId, editText.trim());
      setEditId(null);
    });
  const remove = (n) => {
    if (window.confirm("Delete this note?"))
      act(() => api.deleteNote(appId, n.id));
  };

  return (
    <div>
      <h3>Notes</h3>
      {(error || actionError) && (
        <p className="error" role="alert">
          {error || actionError}
        </p>
      )}

      <form className="subform" onSubmit={add}>
        <textarea
          rows={3}
          maxLength={2000}
          placeholder="Questions asked, feedback, things to remember…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add note</button>
      </form>

      {loading && !notes ? (
        <p className="empty">Loading…</p>
      ) : (notes ?? []).length === 0 ? (
        <p className="empty">No notes yet.</p>
      ) : (
        <ul className="plainlist">
          {notes.map((n) => (
            <li key={n.id} className="listitem">
              {editId === n.id ? (
                <>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="row">
                    <button onClick={saveEdit} disabled={!editText.trim()}>
                      Save
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="notetext">{n.text}</p>
                  <div className="meta">
                    {new Date(n.createdAt).toLocaleString()}
                    {n.updatedAt !== n.createdAt && " (edited)"}
                  </div>
                  <div className="row">
                    <button
                      className="secondary"
                      onClick={() => {
                        setEditId(n.id);
                        setEditText(n.text);
                      }}
                    >
                      Edit
                    </button>
                    <button className="danger" onClick={() => remove(n)}>
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
