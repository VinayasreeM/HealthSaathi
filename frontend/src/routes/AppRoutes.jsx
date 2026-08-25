import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientList from "../pages/doctor/PatientList";
import PatientDetails from "../pages/doctor/PatientDetails";
import CreatePrescription from "../pages/doctor/CreatePrescription";
import Appointments from "../pages/doctor/Appointments";
import FollowUps from "../pages/doctor/FollowUps";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to Doctor Dashboard */}
        <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/patients/:patientId" element={<PatientDetails />} />
        <Route path="/doctor/patients/:patientId/prescription" element={<CreatePrescription />} />
        <Route path="/doctor/prescription" element={<CreatePrescription />} />
        <Route path="/doctor/appointments" element={<Appointments />} />
        <Route path="/doctor/follow-ups" element={<FollowUps />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;