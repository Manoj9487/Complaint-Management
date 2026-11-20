const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Can't reach the server. Check that the API is running.");
  }
  if (!res.ok) {
    const error = new Error(`The server returned an error (${res.status}). Try again.`);
    error.status = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });
const toPublicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const normalizeEmail = (email) => email.trim().toLowerCase();

export const api = {
  async login(email, password) {
    const users = await request(`/users?email=${encodeURIComponent(normalizeEmail(email))}`);
    const match = users.find((u) => u.password === password);
    if (!match) throw new Error("Email or password is incorrect.");
    return toPublicUser(match);
  },

  async register({ name, email, password }) {
    const clean = normalizeEmail(email);
    const existing = await request(`/users?email=${encodeURIComponent(clean)}`);
    if (existing.length) throw new Error("An account with this email already exists.");
    const created = await request("/users", send("POST", { name: name.trim(), email: clean, password, role: "user" }));
    return toPublicUser(created);
  },

  async listStaff() {
    const staff = await request("/users?role=staff");
    return staff.map(toPublicUser);
  },

  listComplaints(scope = {}) {
    const params = new URLSearchParams({ ...scope, _sort: "createdAt", _order: "desc" });
    return request(`/complaints?${params}`);
  },
  getComplaint: (id) => request(`/complaints/${id}`),
  createComplaint: (data) => request("/complaints", send("POST", data)),
  updateComplaint: (id, data) => request(`/complaints/${id}`, send("PATCH", data)),
  deleteComplaint: (id) => request(`/complaints/${id}?_dependent=comments`, { method: "DELETE" }),

  listComments: (complaintId) =>
    request(`/comments?complaintId=${complaintId}&_sort=createdAt&_order=asc`),
  addComment: (data) => request("/comments", send("POST", data)),
};
