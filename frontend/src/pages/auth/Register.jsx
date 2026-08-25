import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/auth/register", form);

      // Auto sign-in: store token/user exactly like AuthContext.login does
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      // Reload so AuthContext picks up the new user from localStorage
      window.location.assign(form.role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      setError(err.message || "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏥 HealthSaathi</div>
        <p className="auth-sub">Create your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Your name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">I am a</label>
            <select id="role" value={form.role} onChange={update("role")}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: "100%", padding: "0.75rem" }}
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
