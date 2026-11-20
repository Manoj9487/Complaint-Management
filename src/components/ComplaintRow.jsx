import { Link } from "react-router-dom";
import { formatDate, statusClass } from "../constants";
import { PriorityTag, StatusBadge } from "./StatusBadge";

export default function ComplaintRow({ complaint: c, showPerson }) {
  return (
    <Link to={`/complaints/${c.id}`} className={`row row-${statusClass(c.status)}`}>
      <div className="row-main">
        <span className="row-title">{c.title}</span>
        <span className="row-meta">
          <span>{c.category}</span>
          <span>{c.location}</span>
          {showPerson && <span>From {c.userName}</span>}
          {showPerson && <span>{c.assigneeName ? `Assigned to ${c.assigneeName}` : "Not assigned"}</span>}
        </span>
      </div>
      <div className="row-side">
        <StatusBadge status={c.status} />
        <PriorityTag priority={c.priority} />
        <span className="row-date">{formatDate(c.createdAt)}</span>
      </div>
    </Link>
  );
}
