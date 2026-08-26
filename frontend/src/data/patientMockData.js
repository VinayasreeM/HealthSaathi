// Patient Mock Data Store — connected to the same data the doctor sees
// Pulls from localStorage so patient sees what the doctor entered

const STORAGE_KEYS = {
  PATIENTS: "healthsaathi_doc_patients_v3",
  FOLLOW_UPS: "healthsaathi_doc_followups_v3",
  APPOINTMENTS: "healthsaathi_doc_appointments_v3",
};

// ==========================================
// APPOINTMENTS (shared with doctor)
// ==========================================

export const getAppointments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==========================================
// FOLLOW-UPS (shared with doctor)
// ==========================================

export const getFollowUps = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==========================================
// PATIENTS (shared with doctor)
// ==========================================

export const getPatients = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==========================================
// PATIENT VIEWS — filter by current user
// ==========================================

/**
 * Returns data specific to the logged-in patient.
 * Since the mock data uses IDs like P1001, P1002, etc.
 * and the auth system uses MongoDB IDs, we match by name
 * or use the first patient as a demo.
 */
export const getCurrentPatientData = (user) => {
  if (!user) return null;

  const patients = getPatients();
  const appointments = getAppointments();
  const followUps = getFollowUps();

  // Try to find patient matching the logged-in user's name
  let patient = patients.find(
    (p) => p.name.toLowerCase() === (user.name || "").toLowerCase()
  );

  // If no exact match, try partial match (e.g. "Dr. Test" matches "Test Patient")
  if (!patient && user.name) {
    const nameParts = user.name.toLowerCase().split(" ");
    patient = patients.find((p) =>
      nameParts.some((part) => part.length > 2 && p.name.toLowerCase().includes(part))
    );
  }

  // If still no match, use the first patient as demo data
  if (!patient && patients.length > 0) {
    patient = patients[0];
  }

  if (!patient) return null;

  // Get patient-specific appointments
  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === patient.id
  );

  // Get patient-specific follow-ups
  const patientFollowUps = followUps.filter(
    (fu) => fu.patientId === patient.id
  );

  // Get medications from prescription
  const medications = patient.currentMedications || [];
  const prescription = patient.prescription;

  // Medical history
  const history = patient.history || [];

  return {
    patient,
    appointments: patientAppointments,
    followUps: patientFollowUps,
    medications,
    prescription,
    history,
  };
};

/**
 * Mark an appointment as completed
 */
export const markAppointmentDone = (appointmentId) => {
  const appointments = getAppointments();
  const updated = appointments.map((apt) =>
    apt.id === appointmentId ? { ...apt, status: "Completed" } : apt
  );
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
  return updated;
};

/**
 * Mark a follow-up as completed
 */
export const markFollowUpDone = (followUpId) => {
  const followUps = getFollowUps();
  const updated = followUps.map((fu) =>
    fu.id === followUpId ? { ...fu, status: "Completed" } : fu
  );
  localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(updated));
  return updated;
};

/**
 * Get all patients for the directory view
 */
export const getAllPatients = () => getPatients();
