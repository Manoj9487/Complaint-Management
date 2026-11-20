import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { PRIORITIES, STATUSES, formatDate, formatDateTime } from "../constants";
import StatusPipeline from "../components/StatusPipeline";
import { PriorityTag } from "../components/StatusBadge";

const toDraft = (c) => ({
  status: c.status,
  priority: c.priority,
  assignedTo: c.assignedTo ? String(c.assignedTo) : "",
});

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getComplaint(id),
      api.listComments(id),
      user.role === "admin" ? api.listStaff() : [],
    ])
      .then(([c, cm, st]) => {
        if (!active) return;
        setComplaint(c);
        setComments(cm);
        setStaff(st);
        setDraft(toDraft(c));
      })
      .catch((e) => {
        if (active) setLoadError(e.status === 404 ? "We couldn't find that complaint." : e.message);
      });
    return () => {
      active = false;
    };
  }, [id, user]);

  if (loadError) return <p className="error" role="alert">{loadError}</p>;
  if (!complaint) return <p className="muted">Loading complaint</p>;

  const isOwner = complaint.userId === user.id;
  const allowed =
    user.role === "admin" ||
    (user.role === "staff" && complaint.assignedTo === user.id) ||
    (user.role === "user" && isOwner);

  if (!allowed) return <p className="error" role="alert">You don't have access to this complaint.</p>;

  const isAdmin = user.role === "admin";
  const canManage = isAdmin || user.role === "staff";
  const canDelete = isAdmin || (isOwner && complaint.status === "Submitted");

  async function postComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setNotice("");
    try {
      const created = await api.addComment({
        complaintId: complaint.id,
        userId: user.id,
        userName: user.name,
        type: "comment",
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      setComments((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveChanges() {
    const next = {
      status: draft.status,
      priority: draft.priority,
      assignedTo: draft.assignedTo ? Number(draft.assignedTo) : null,
    };
    const assignee = staff.find((s) => s.id === next.assignedTo);
    next.assigneeName = assignee ? assignee.name : null;

    // Assigning a fresh complaint moves it forward automatically.
    if (next.assignedTo && next.assignedTo !== complaint.assignedTo && next.status === "Submitted") {
      next.status = "Assigned";
    }

    const events = [];
    if (next.assignedTo !== complaint.assignedTo) {
      events.push(next.assignedTo ? `Assigned to ${next.assigneeName}` : "Assignment removed");
    }
    if (next.status !== complaint.status) events.push(`Status changed to ${next.status}`);
    if (next.priority !== complaint.priority) events.push(`Priority changed to ${next.priority}`);

    if (!events.length) {
      setNotice("There are no changes to save.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const now = new Date().toISOString();
      const updated = await api.updateComplaint(complaint.id, { ...next, updatedAt: now });
      const created = [];
      for (const eventText of events) {
        created.push(
          await api.addComment({
            complaintId: complaint.id,
            userId: user.id,
            userName: user.name,
            type: "event",
            text: eventText,
            createdAt: now,
          }),
        );
      }
      setComplaint(updated);
      setComments((prev) => [...prev, ...created]);
      setDraft(toDraft(updated));
      setNotice("Changes saved.");
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = window.confirm("Delete this complaint and its activity? This can't be undone.");
    if (!ok) return;
    try {
      await api.deleteComplaint(complaint.id);
      navigate("/complaints", { replace: true });
    } catch (err) {
      setNotice(err.message);
    }
  }

  return (
    <>
      <p className="crumb"><Link to="/complaints">Back to complaints</Link></p>

      <header className="page-head">
        <div>
          <h1>{complaint.title}</h1>
          <p className="muted">
            Filed by {complaint.userName} on {formatDate(complaint.createdAt)}
          </p>
        </div>
        <PriorityTag priority={complaint.priority} />
      </header>

      <section className="panel">
        <StatusPipeline status={complaint.status} />
        <dl className="facts">
          <div><dt>Category</dt><dd>{complaint.category}</dd></div>
          <div><dt>Location</dt><dd>{complaint.location}</dd></div>
          <div><dt>Assigned to</dt><dd>{complaint.assigneeName || "Not assigned yet"}</dd></div>
          <div><dt>Last updated</dt><dd>{formatDate(complaint.updatedAt)}</dd></div>
        </dl>
        <p className="description">{complaint.description}</p>
      </section>

      {canManage && draft && (
        <section className="panel">
          <h2>Manage this complaint</h2>
          <div className="manage">
            <label className="field">
              Status
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {isAdmin && (
              <>
                <label className="field">
                  Priority
                  <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label className="field">
                  Assign to
                  <select value={draft.assignedTo} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })}>
                    <option value="">Nobody</option>
                    {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>
          <button type="button" className="btn btn-primary" onClick={saveChanges} disabled={busy}>
            Save changes
          </button>
        </section>
      )}

      <section className="panel">
        <h2>Activity</h2>
        <ul className="activity">
          {comments.map((c) =>
            c.type === "event" ? (
              <li key={c.id} className="event">
                <span>{c.text}</span>
                <span className="muted">{c.userName}, {formatDateTime(c.createdAt)}</span>
              </li>
            ) : (
              <li key={c.id} className="comment">
                <div className="comment-head">
                  <strong>{c.userName}</strong>
                  <span className="muted">{formatDateTime(c.createdAt)}</span>
                </div>
                <p>{c.text}</p>
              </li>
            ),
          )}
        </ul>

        <form onSubmit={postComment} className="comment-form">
          <label className="field">
            Add a comment
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>
            Post comment
          </button>
        </form>
      </section>

      {notice && <p className="notice" role="status">{notice}</p>}

      {canDelete && (
        <div className="danger-zone">
          <button type="button" className="btn btn-danger" onClick={remove}>
            {isAdmin ? "Delete complaint" : "Withdraw complaint"}
          </button>
        </div>
      )}
    </>
  );
}
