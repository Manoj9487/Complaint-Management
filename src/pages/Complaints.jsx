import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { CATEGORIES, PRIORITIES, STATUSES, scopeParams } from "../constants";
import ComplaintRow from "../components/ComplaintRow";

const TITLES = { user: "My complaints", staff: "Assigned to me", admin: "All complaints" };

export default function Complaints() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [complaints, setComplaints] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    api.listComplaints(scopeParams(user)).then(setComplaints).catch((e) => setError(e.message));
  }, [user]);

  const visible = useMemo(() => {
    if (!complaints) return [];
    const q = query.trim().toLowerCase();
    return complaints.filter(
      (c) =>
        (!status || c.status === status) &&
        (!category || c.category === category) &&
        (!priority || c.priority === priority) &&
        (!q || `${c.title} ${c.description} ${c.location} ${c.userName}`.toLowerCase().includes(q)),
    );
  }, [complaints, query, status, category, priority]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!complaints) return <p className="muted">Loading complaints</p>;

  const clearFilters = () => {
    setQuery("");
    setStatus("");
    setCategory("");
    setPriority("");
  };

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{TITLES[user.role]}</h1>
          <p className="muted">
            Showing {visible.length} of {complaints.length}
          </p>
        </div>
      </header>

      <div className="filters">
        <label className="field">
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, location or name" />
        </label>
        <label className="field">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="field">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field">
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All</option>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>No complaints match these filters.</p>
          <button type="button" className="btn btn-quiet" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="rows">
          {visible.map((c) => (
            <ComplaintRow key={c.id} complaint={c} showPerson={user.role !== "user"} />
          ))}
        </div>
      )}
    </>
  );
}
