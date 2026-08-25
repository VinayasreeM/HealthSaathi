import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth Pages & Components
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import { ProtectedRoute, PublicOnlyRoute } from "../components/ProtectedRoute";
import Loading from "../components/Loading";

// Icons for placeholder areas
import { Stethoscope, Heart, LogOut, Activity } from "lucide-react";

/**
 * Placeholder view for Doctor Area
 * (Actual Doctor Dashboard will be implemented by teammates later)
 */
function DoctorArea() {
  const { user, logout } = useAuth();
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-main)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--primary-100)",
          color: "var(--primary-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem"
        }}>
          <Stethoscope size={30} />
        </div>
        <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>
          Protected Role: Doctor
        </span>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--slate-900)", marginBottom: "0.5rem" }}>
          Doctor area
        </h1>
        <p style={{ color: "var(--slate-500)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Welcome, <strong>{user?.name}</strong> ({user?.email}).
          <br />
          Doctor dashboard placeholder for authentication & route testing.
        </p>
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Placeholder view for Patient Area
 * (Actual Patient Dashboard will be implemented by teammates later)
 */
function PatientArea() {
  const { user, logout } = useAuth();
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-main)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--emerald-100)",
          color: "var(--emerald-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem"
        }}>
          <Heart size={30} />
        </div>
        <span className="badge badge-success" style={{ marginBottom: "0.5rem" }}>
          Protected Role: Patient
        </span>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--slate-900)", marginBottom: "0.5rem" }}>
          Patient area
        </h1>
        <p style={{ color: "var(--slate-500)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Welcome, <strong>{user?.name}</strong> ({user?.email}).
          <br />
          Patient dashboard placeholder for authentication & route testing.
        </p>
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Root Landing Redirect
 */
function RootRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading message="Checking your session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Doctor Protected Route */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorArea />
            </ProtectedRoute>
          }
        />

        {/* Patient Protected Route */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientArea />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}