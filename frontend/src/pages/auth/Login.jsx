import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const user = await login(formData.email, formData.password);
      const destination =
        location.state?.from?.pathname ||
        (user?.role === "doctor" ? "/doctor" : "/patient");
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(
        err.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "stretch",
      background: "var(--bg-main)",
    }}>
      {/* Left Branding / Trust Panel */}
      <div style={{
        flex: "1 1 45%",
        background: "linear-gradient(145deg, #075985 0%, #0369a1 45%, #0284c7 100%)",
        color: "white",
        padding: "3.5rem 3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
      className="login-left-panel"
      >
        {/* Decorative Circles */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none"
        }} />

        {/* Top Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", zIndex: 2 }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-md)",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            <Activity size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
              HealthSaathi
            </h2>
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.8)" }}>
              Digital Healthcare Companion
            </p>
          </div>
        </div>

        {/* Center Tagline */}
        <div style={{ margin: "3rem 0", zIndex: 2 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.85rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            fontSize: "0.8rem",
            fontWeight: "600",
            marginBottom: "1.25rem"
          }}>
            <ShieldCheck size={16} /> Secure Health Information Network
          </span>

          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: "800",
            color: "#ffffff",
            lineHeight: 1.2,
            marginBottom: "1rem",
            letterSpacing: "-0.03em"
          }}>
            Your Connected Digital Healthcare Companion.
          </h1>

          <p style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.85)",
            lineHeight: 1.6,
            maxWidth: "460px",
            marginBottom: "2rem"
          }}>
            Secure, role-based access for healthcare practitioners and patients with encrypted record management.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: "0.925rem" }}>Role-based medical portal protection</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: "0.925rem" }}>Persistent JWT authentication & secure sessions</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.65)", zIndex: 2 }}>
          © 2026 HealthSaathi. All rights reserved.
        </div>
      </div>

      {/* Right Login Card */}
      <div style={{
        flex: "1 1 55%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 2rem",
      }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "700", color: "var(--slate-900)" }}>
              Welcome back
            </h2>
            <p style={{ color: "var(--slate-500)", marginTop: "0.35rem", fontSize: "0.95rem" }}>
              Sign in to continue to HealthSaathi
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`form-input has-left-icon ${errors.email ? "error" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="form-error">
                  <AlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>
                  Password
                </label>
              </div>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`form-input has-left-icon has-right-icon ${errors.password ? "error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="form-input-right-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">
                  <AlertCircle size={14} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In to HealthSaathi</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.925rem",
            color: "var(--slate-600)"
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: "700", color: "var(--primary-600)" }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
