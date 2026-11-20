import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { CATEGORIES, PRIORITIES } from "../constants";

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    priority: "Medium",
    location: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user.role !== "user") return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const next = {};
    if (form.title.trim().length < 5) next.title = "Enter a title of at least 5 characters.";
    if (!form.location.trim()) next.location = "Say where the problem is.";
    if (form.description.trim().length < 20) next.description = "Describe the problem in at least 20 characters.";
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setServerError("");
    try {
      const now = new Date().toISOString();
      const created = await api.createComplaint({
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        location: form.location.trim(),
        description: form.description.trim(),
        status: "Submitted",
        userId: user.id,
        userName: user.name,
        assignedTo: null,
        assigneeName: null,
        createdAt: now,
        updatedAt: now,
      });
      await api.addComment({
        complaintId: created.id,
        userId: user.id,
        userName: user.name,
        type: "event",
        text: "Complaint submitted",
        createdAt: now,
      });
      navigate(`/complaints/${created.id}`);
    } catch (err) {
      setServerError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>New complaint</h1>
          <p className="muted">The more specific you are, the faster it can be resolved.</p>
        </div>
      </header>

      <form className="panel form" onSubmit={onSubmit} noValidate>
        <label className="field">
          Title
          <input value={form.title} onChange={set("title")} placeholder="Short summary of the problem" />
          {errors.title && <span className="error">{errors.title}</span>}
        </label>

        <div className="form-grid">
          <label className="field">
            Category
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            Priority
            <select value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        <label className="field">
          Location
          <input value={form.location} onChange={set("location")} placeholder="Building, floor or area" />
          {errors.location && <span className="error">{errors.location}</span>}
        </label>

        <label className="field">
          Description
          <textarea rows={6} value={form.description} onChange={set("description")} placeholder="What happened, since when, and how it affects you" />
          {errors.description && <span className="error">{errors.description}</span>}
        </label>

        {serverError && <p className="error" role="alert">{serverError}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Submitting" : "Submit complaint"}
          </button>
        </div>
      </form>
    </>
  );
}
