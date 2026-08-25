import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Activity,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  Heart,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (at least 10 digits)";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
      });

      const destination = user?.role === "doctor" ? "/doctor" : "/patient";
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(
        err.message || "Registration failed. Please verify details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-main)",
      padding: "2.5rem 1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "580px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        padding: "2.5rem 2.25rem",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--primary-50)",
            color: "var(--primary-700)",
            padding: "0.4rem 1rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: "700",
            marginBottom: "0.75rem",
          }}>
            <Activity size={18} /> HealthSaathi Registration
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: "700", color: "var(--slate-900)" }}>
            Create Your Account
          </h2>
          <p style={{ color: "var(--slate-500)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Join the connected digital healthcare companion network
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection Cards */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ marginBottom: "0.75rem" }}>
              Select Role
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {/* Patient Card */}
              <div
                onClick={() => handleRoleSelect("patient")}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-lg)",
                  border: formData.role === "patient"
                    ? "2px solid var(--emerald-600)"
                    : "1.5px solid var(--border-color)",
                  background: formData.role === "patient" ? "var(--emerald-50)" : "var(--bg-card)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                }}
              >
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-md)",
                  background: formData.role === "patient" ? "var(--emerald-500)" : "var(--slate-100)",
                  color: formData.role === "patient" ? "#ffffff" : "var(--slate-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Heart size={22} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: formData.role === "patient" ? "var(--emerald-900)" : "var(--slate-800)",
                  }}>
                    Patient
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                    Personal health access
                  </p>
                </div>
              </div>

              {/* Doctor Card */}
              <div
                onClick={() => handleRoleSelect("doctor")}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-lg)",
                  border: formData.role === "doctor"
                    ? "2px solid var(--primary-600)"
                    : "1.5px solid var(--border-color)",
                  background: formData.role === "doctor" ? "var(--primary-50)" : "var(--bg-card)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                }}
              >
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-md)",
                  background: formData.role === "doctor" ? "var(--primary-600)" : "var(--slate-100)",
                  color: formData.role === "doctor" ? "#ffffff" : "var(--slate-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: formData.role === "doctor" ? "var(--primary-900)" : "var(--slate-800)",
                  }}>
                    Doctor
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                    Practitioner portal
                  </p>
                </div>
              </div>
            </div>
            {errors.role && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.role}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="form-input-wrapper">
              <div className="form-input-icon">
                <User size={18} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={formData.role === "doctor" ? "Dr. Priya Sharma" : "Rajesh Patel"}
                className={`form-input has-left-icon ${errors.name ? "error" : ""}`}
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.name}
              </p>
            )}
          </div>

          {/* Email and Phone Grid */}
          <div className="grid-2" style={{ gap: "1rem" }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Mail size={18} />
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
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

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`form-input has-left-icon ${errors.phone ? "error" : ""}`}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="form-error">
                  <AlertCircle size={14} /> {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid-2" style={{ gap: "1rem" }}>
            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className={`form-input has-left-icon has-right-icon ${errors.confirmPassword ? "error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="form-input-right-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">
                  <AlertCircle size={14} /> {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.75rem" }}
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
                Registering...
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "1.75rem",
          textAlign: "center",
          fontSize: "0.925rem",
          color: "var(--slate-600)"
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: "700", color: "var(--primary-600)" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
