import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientList from "../pages/doctor/PatientList";
import PatientDetails from "../pages/doctor/PatientDetails";
import CreatePrescription from "../pages/doctor/CreatePrescription";
import FollowUps from "../pages/doctor/FollowUps";

import PatientLayout from "../components/patient/PatientLayout";
import PatientDashboard from "../pages/patient/PatientDashboard";
import MedicalHistory from "../pages/patient/MedicalHistory";
import Prescriptions from "../pages/patient/Prescriptions";
import Medications from "../pages/patient/Medications";
import Appointments from "../pages/patient/Appointments";
import Recommendations from "../pages/patient/Recommendations";
import AIHealthAssessment from "../pages/patient/AIHealthAssessment";
import Notifications from "../pages/patient/Notifications";
import PatientProfile from "../pages/patient/PatientProfile";

// Guards a route: requires login and (optionally) a specific role.
function RequireRole({ role, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  // Only enforce role when BOTH sides provide one. If the merged login
  // backend does not include a `role` field on the user object, we let the
  // request through instead of trapping the user in a redirect loop.
  if (role && user.role && user.role !== role) {
    // Signed-in users land on the dashboard matching their own role
    return (
      <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />
    );
  }
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <RequireRole role="doctor">
              <DoctorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <RequireRole role="doctor">
              <PatientList />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <RequireRole role="doctor">
              <PatientDetails />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/prescription"
          element={
            <RequireRole role="doctor">
              <CreatePrescription />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/follow-ups"
          element={
            <RequireRole role="doctor">
              <FollowUps />
            </RequireRole>
          }
        />

        {/* Patient - shared sidebar/navbar layout */}
        <Route
          path="/patient"
          element={
            <RequireRole role="patient">
              <PatientLayout />
            </RequireRole>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="medical-history" element={<MedicalHistory />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="medications" element={<Medications />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="ai-assessment" element={<AIHealthAssessment />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;