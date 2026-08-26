import React, { useState, useEffect } from "react";
import { UserIcon, XIcon } from "../common/Icons";

/**
 * PatientForm - Supports both Add New Patient and Edit Patient modes
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - onSave: function(patientData) — receives the form data
 *  - editPatient: object | null — if provided, form is pre-filled for editing
 */
export default function PatientForm({ isOpen, onClose, onSave, editPatient = null }) {
  const isEditMode = !!editPatient;

  const getInitialData = () => {
    if (editPatient) {
      return {
        name: editPatient.name || "",
        age: editPatient.age || "",
        gender: editPatient.gender || "Male",
        risk: editPatient.risk || "MEDIUM",
        phone: editPatient.phone || "",
        address: editPatient.address || "",
        bloodGroup: editPatient.bloodGroup || "O+",
        allergies: editPatient.allergies || "None",
        mainIssue: editPatient.mainIssue || "",
      };
    }
    return {
      name: "",
      age: "",
      gender: "Male",
      risk: "MEDIUM",
      phone: "",
      address: "",
      bloodGroup: "O+",
      allergies: "None",
      mainIssue: "",
    };
  };

  const [formData, setFormData] = useState(getInitialData());
  const [error, setError] = useState("");

  // Reset form when modal opens/closes or editPatient changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialData());
      setError("");
    }
  }, [isOpen, editPatient]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter the patient's full name.");
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      setError("Please enter a valid age.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter a contact phone number.");
      return;
    }

    setError("");
    onSave({
      ...formData,
      age: parseInt(formData.age) || 30,
      mainIssue: formData.mainIssue.trim() || "General Clinical Consultation",
    });
  };

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div className="simple-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="simple-modal-header">
          <div className="modal-title-with-icon">
            <UserIcon size={20} />
            <div>
              <h3>{isEditMode ? "Edit Patient Details" : "Add New Patient"}</h3>
              {isEditMode && (
                <span className="modal-sub">
                  Patient: <strong>{editPatient.name}</strong> ({editPatient.id})
                </span>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="simple-modal-body">
            {error && <div className="modal-error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Ramesh Verma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  name="age"
                  className="form-control"
                  placeholder="e.g. 42"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Clinical Risk Level *</label>
                <select
                  name="risk"
                  className="form-control"
                  value={formData.risk}
                  onChange={handleChange}
                >
                  <option value="HIGH">HIGH Risk (Priority)</option>
                  <option value="MEDIUM">MEDIUM Risk</option>
                  <option value="LOW">LOW Risk (Routine)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  className="form-control"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Main Health Issue / Chief Complaint</label>
              <input
                type="text"
                name="mainIssue"
                className="form-control"
                placeholder="e.g. Fever with productive cough, Elevated BP"
                value={formData.mainIssue}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="e.g. Koramangala 4th Block, Bengaluru"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Known Allergies</label>
              <input
                type="text"
                name="allergies"
                className="form-control"
                placeholder="e.g. Penicillin, Sulfa drugs, None"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="simple-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Save Changes" : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
