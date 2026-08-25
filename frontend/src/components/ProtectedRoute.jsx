import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * ProtectedRoute Guard
 * - Shows loading indicator while restoring auth from localStorage
 * - Redirects unauthenticated users to /login
 * - Enforces role-based access: redirects unauthorized roles to /unauthorized
 */
export function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking your session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children || <Outlet />;
}

/**
 * PublicOnlyRoute Guard
 * Prevents logged-in users from accessing /login or /register unnecessarily,
 * redirecting them to their respective role area (/doctor or /patient).
 */
export function PublicOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading message="Checking your session..." />;
  }

  if (isAuthenticated && user) {
    const destination = user.role === "doctor" ? "/doctor" : "/patient";
    return <Navigate to={destination} replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
