import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientList from "../pages/doctor/PatientList";
import PatientDetails from "../pages/doctor/PatientDetails";
import CreatePrescription from "../pages/doctor/CreatePrescription";
import FollowUps from "../pages/doctor/FollowUps";

import PatientDashboard from "../pages/patient/PatientDashboard";
import MedicalHistory from "../pages/patient/MedicalHistory";
import Prescriptions from "../pages/patient/Prescriptions";
import Medications from "../pages/patient/Medications";
import Appointments from "../pages/patient/Appointments";
import Recommendations from "../pages/patient/Recommendations";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Doctor */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/patients/:id" element={<PatientDetails />} />
        <Route
          path="/doctor/prescription"
          element={<CreatePrescription />}
        />
        <Route path="/doctor/follow-ups" element={<FollowUps />} />

        {/* Patient */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route
          path="/patient/medical-history"
          element={<MedicalHistory />}
        />
        <Route
          path="/patient/prescriptions"
          element={<Prescriptions />}
        />
        <Route path="/patient/medications" element={<Medications />} />
        <Route path="/patient/appointments" element={<Appointments />} />
        <Route
          path="/patient/recommendations"
          element={<Recommendations />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;