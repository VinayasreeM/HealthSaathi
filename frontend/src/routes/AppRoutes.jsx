import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth Pages & Components
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import { ProtectedRoute, PublicOnlyRoute } from "../components/ProtectedRoute";
import Loading from "../components/Loading";

// Doctor Pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientList from "../pages/doctor/PatientList";
import PatientDetails from "../pages/doctor/PatientDetails";
import CreatePrescription from "../pages/doctor/CreatePrescription";
import Appointments from "../pages/doctor/Appointments";
import FollowUps from "../pages/doctor/FollowUps";

// Patient Pages
import PatientDashboard from "../pages/patient/PatientDashboard";

/**
 * Root Landing Redirect
 * Sends users to the correct dashboard based on their role,
 * or to login if not authenticated.
 */
function RootRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading message="Checking your session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "doctor" ? "/doctor/dashboard" : "/patient"} replace />;
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

        {/* Doctor Protected Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <Navigate to="/doctor/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId/prescription"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <CreatePrescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescription"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <CreatePrescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/follow-ups"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <FollowUps />
            </ProtectedRoute>
          }
        />

        {/* Patient Protected Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Navigate to="/patient/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}