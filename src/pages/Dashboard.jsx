import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { STATUSES, scopeParams, statusClass } from "../constants";
import ComplaintRow from "../components/ComplaintRow";

const HEADINGS = {
  user: ["Your complaints", "Track what you've reported and who is working on it."],
  staff: ["Your assigned work", "Complaints assigned to you, newest first."],
  admin: ["All complaints", "See what's open, assign it, and keep it moving."],
};

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listComplaints(scopeParams(user)).then(setComplaints).catch((e) => setError(e.message));
  }, [user]);

  const [title, subtitle] = HEADINGS[user.role];

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!complaints) return <p className="muted">Loading complaints</p>;

  const unassigned = complaints.filter((c) => !c.assignedTo && c.status === "Submitted").length;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        {user.role === "user" && (
          <Link to="/complaints/new" className="btn btn-primary">New complaint</Link>
        )}
      </header>

      <div className="counts">
        {STATUSES.map((s) => (
          <Link
            key={s}
            to={`/complaints?status=${encodeURIComponent(s)}`}
            className={`count count-${statusClass(s)}`}
          >
            <strong>{complaints.filter((c) => c.status === s).length}</strong>
            <span>{s}</span>
          </Link>
        ))}
      </div>

      {user.role === "admin" && unassigned > 0 && (
        <p className="notice">
          {unassigned} {unassigned === 1 ? "complaint needs" : "complaints need"} an assignee.{" "}
          <Link to="/complaints?status=Submitted">Review them</Link>
        </p>
      )}

      <h2 className="section-title">Recent</h2>
      {complaints.length === 0 ? (
        <div className="empty">
          <p>
            {user.role === "user"
              ? "You haven't filed a complaint yet."
              : "Nothing has been assigned to you yet."}
          </p>
          {user.role === "user" && <Link to="/complaints/new" className="btn btn-primary">File your first complaint</Link>}
        </div>
      ) : (
        <div className="rows">
          {complaints.slice(0, 5).map((c) => (
            <ComplaintRow key={c.id} complaint={c} showPerson={user.role !== "user"} />
          ))}
        </div>
      )}
    </>
  );
}
