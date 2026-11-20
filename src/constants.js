export const STATUSES = ["Submitted", "Assigned", "In progress", "Resolved"];
export const CATEGORIES = ["Infrastructure", "Service", "Billing", "Safety", "IT & network", "Other"];
export const PRIORITIES = ["Low", "Medium", "High"];

export const statusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

// Which complaints a signed-in person is allowed to list.
export function scopeParams(user) {
  if (user.role === "user") return { userId: user.id };
  if (user.role === "staff") return { assignedTo: user.id };
  return {};
}
