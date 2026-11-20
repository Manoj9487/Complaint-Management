import { statusClass } from "../constants";

export function StatusBadge({ status }) {
  return <span className={`badge badge-${statusClass(status)}`}>{status}</span>;
}

export function PriorityTag({ priority }) {
  return <span className={`priority priority-${priority.toLowerCase()}`}>{priority} priority</span>;
}
