import { useState } from "react";

const empty = {
  company: "",
  title: "",
  link: "",
  appliedDate: new Date().toISOString().slice(0, 10),
};

export default function ApplicationForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          link: initial.link ?? "",
          appliedDate: initial.appliedDate.slice(0, 10),
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      company: form.company.trim(),
      title: form.title.trim(),
      link: form.link.trim() || null,
      appliedDate: `${form.appliedDate}T00:00:00Z`,
    });
    setSaving(false);
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{initial ? "Edit application" : "Add application"}</h2>
      <input
        name="company"
        placeholder="Company"
        value={form.company}
        onChange={change}
        required
        maxLength={200}
      />
      <input
        name="title"
        placeholder="Job title"
        value={form.title}
        onChange={change}
        required
        maxLength={200}
      />
      <input
        name="link"
        type="url"
        placeholder="Job link (optional)"
        value={form.link}
        onChange={change}
      />
      <input
        name="appliedDate"
        type="date"
        value={form.appliedDate}
        onChange={change}
        required
      />
      <div className="row">
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
