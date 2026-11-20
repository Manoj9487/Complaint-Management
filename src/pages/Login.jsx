import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@desk.test", password: "admin123" },
  { label: "Staff", email: "ravi@desk.test", password: "staff123" },
  { label: "Complainant", email: "karan@desk.test", password: "user123" },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (isRegister && form.name.trim().length < 2) return setError("Enter your name.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Use a password with at least 6 characters.");

    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <section className="login-intro">
        <h1>Report a problem. Watch it get fixed.</h1>
        <p>
          File a complaint in a minute, see who it's assigned to, and follow every status change until
          it's resolved.
        </p>
      </section>

      <section className="login-card">
        <h2>{isRegister ? "Create your account" : "Sign in"}</h2>
        <form onSubmit={onSubmit} noValidate>
          {isRegister && (
            <label className="field">
              Full name
              <input value={form.name} onChange={set("name")} autoComplete="name" />
            </label>
          )}
          <label className="field">
            Email
            <input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Please wait" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          className="link-button"
          onClick={() => { setMode(isRegister ? "signin" : "register"); setError(""); }}
        >
          {isRegister ? "I already have an account" : "Create an account"}
        </button>

        {!isRegister && (
          <div className="demo">
            <p>Try a demo account</p>
            <div className="demo-list">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setForm({ name: "", email: a.email, password: a.password })}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
