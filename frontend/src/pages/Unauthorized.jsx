import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isDoctor = user?.role === "doctor";
  const userHome = user ? (isDoctor ? "/doctor" : "/patient") : "/login";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-main)",
      padding: "2rem 1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "500px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        padding: "3rem 2.5rem",
        textAlign: "center"
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "var(--rose-50)",
          color: "var(--rose-600)",
          border: "2px solid var(--rose-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem"
        }}>
          <ShieldAlert size={36} />
        </div>

        <div style={{
          fontSize: "1.25rem",
          fontWeight: "800",
          color: "var(--rose-600)",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem"
        }}>
          403
        </div>

        <h1 style={{ fontSize: "1.85rem", fontWeight: "700", color: "var(--slate-900)", marginBottom: "0.75rem" }}>
          Access Denied
        </h1>

        <p style={{ color: "var(--slate-600)", fontSize: "1rem", lineHeight: 1.5, marginBottom: "1.75rem" }}>
          You don't have permission to access this page.
        </p>

        {user && (
          <div style={{
            background: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
            marginBottom: "1.75rem",
            fontSize: "0.875rem",
            color: "var(--slate-600)"
          }}>
            Logged in as <strong style={{ textTransform: "capitalize", color: "var(--slate-800)" }}>{user.role}</strong> ({user.email})
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => navigate(userHome)}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.8rem" }}
          >
            <Home size={18} />
            <span>Go Back</span>
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: "100%", padding: "0.8rem" }}
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
