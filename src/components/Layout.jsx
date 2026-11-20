import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

const LIST_LABEL = { user: "My complaints", staff: "Assigned to me", admin: "All complaints" };

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Complaint Desk</div>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>Overview</NavLink>
          <NavLink to="/complaints" end>{LIST_LABEL[user.role]}</NavLink>
          {user.role === "user" && <NavLink to="/complaints/new">New complaint</NavLink>}
        </nav>
        <div className="account">
          <div className="account-name">{user.name}</div>
          <div className="account-role">{user.role}</div>
          <button type="button" className="btn btn-quiet" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
