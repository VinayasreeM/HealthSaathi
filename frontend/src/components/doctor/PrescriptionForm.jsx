import React, { useState, useEffect } from "react";
import { FilePlusIcon, PillIcon, PlusIcon, TrashIcon, XIcon } from "../common/Icons";

export default function PrescriptionForm({
  isOpen,
  patient,
  existingPrescription,
  onClose,
  onSave,
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "5 days",
      instructions: "Take after food with water",
    },
  ]);
  const [instructions, setInstructions] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpReason, setNextFollowUpReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingPrescription) {
      setDiagnosis(existingPrescription.diagnosis || "");
      if (existingPrescription.medicines && existingPrescription.medicines.length > 0) {
        setMedicines(existingPrescription.medicines.map((m) => ({ ...m })));
      } else {
        setMedicines([
          {
            name: "",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "5 days",
            instructions: "Take after food with water",
          },
        ]);
      }
      setInstructions(existingPrescription.instructions || "");
      setRecommendations(existingPrescription.recommendations || "");
      setNextFollowUpDate(existingPrescription.nextFollowUpDate || "");
      setNextFollowUpReason(existingPrescription.nextFollowUpReason || "");
    } else {
      setDiagnosis("");
      setMedicines([
        {
          name: "",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "5 days",
          instructions: "Take after food with water",
        },
      ]);
      setInstructions("Take prescribed medicines regularly as directed.");
      setRecommendations("Maintain adequate rest and fluid intake.");
      setNextFollowUpDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      );
      setNextFollowUpReason("General Treatment Review");
    }
  }, [existingPrescription, isOpen]);

  if (!isOpen || !patient) return null;

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: "",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "5 days",
        instructions: "Take after meals",
      },
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length === 1) {
      setError("Please include at least one medicine.");
      return;
    }
    setError("");
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, val) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError("Please enter a diagnosis.");
      return;
    }

    const emptyMed = medicines.find((m) => !m.name.trim());
    if (emptyMed) {
      setError("Please enter medicine names for all rows.");
      return;
    }

    setError("");
    const prescriptionData = {
      diagnosis: diagnosis.trim(),
      medicines: medicines.map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        duration: m.duration.trim(),
        instructions: m.instructions.trim(),
      })),
      instructions: instructions.trim(),
      recommendations: recommendations.trim(),
      nextFollowUpDate,
      nextFollowUpReason: nextFollowUpReason.trim(),
    };

    onSave(prescriptionData);
  };

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div
        className="simple-modal-content prescription-modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="simple-modal-header">
          <div className="modal-title-with-icon">
            <FilePlusIcon size={20} />
            <div>
              <h3>
                {existingPrescription ? "Edit Prescription" : "Write Prescription"}
              </h3>
              <span className="modal-sub">
                Patient: <strong>{patient.name}</strong> ({patient.id})
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="simple-modal-body modal-scrollable">
            {error && <div className="modal-error-banner">{error}</div>}

            {/* Diagnosis */}
            <div className="form-group">
              <label className="form-label">Clinical Diagnosis *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Acute Bronchitis, Type 2 Diabetes, Stage 2 Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            {/* Medicines List */}
            <div className="prescription-meds-section">
              <div className="section-inline-head">
                <span className="form-label mb-0">Prescribed Medicines</span>
                <button
                  type="button"
                  className="btn-add-med"
                  onClick={handleAddMedicine}
                >
                  <PlusIcon size={14} />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="meds-rows-wrapper">
                {medicines.map((med, idx) => (
                  <div key={idx} className="med-row-card">
                    <div className="med-row-header">
                      <span className="med-index-label">
                        <PillIcon size={13} /> Medicine #{idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-med"
                          onClick={() => handleRemoveMedicine(idx)}
                          title="Remove Medicine"
                        >
                          <TrashIcon size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="med-fields-grid-simple">
                      <div className="form-group">
                        <label className="form-sublabel">Medicine Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Metformin, Paracetamol"
                          value={med.name}
                          onChange={(e) =>
                            handleMedicineChange(idx, "name", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-sublabel">Dosage *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 500mg, 1 tablet"
                          value={med.dosage}
                          onChange={(e) =>
                            handleMedicineChange(idx, "dosage", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-sublabel">Frequency *</label>
                        <select
                          className="form-control"
                          value={med.frequency}
                          onChange={(e) =>
                            handleMedicineChange(idx, "frequency", e.target.value)
                          }
                        >
                          <option value="Once daily">Once daily (Morning)</option>
                          <option value="Twice daily">Twice daily (1-0-1)</option>
                          <option value="Three times daily">Three times daily (1-1-1)</option>
                          <option value="At bedtime">At bedtime (0-0-1)</option>
                          <option value="As needed (SOS)">As needed (SOS)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-sublabel">Duration *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 5 days, 30 days"
                          value={med.duration}
                          onChange={(e) =>
                            handleMedicineChange(idx, "duration", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-group full-span">
                        <label className="form-sublabel">Specific Instructions</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Take after meals with warm water"
                          value={med.instructions}
                          onChange={(e) =>
                            handleMedicineChange(idx, "instructions", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Instructions & Recommendations */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">General Patient Instructions</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Drink plenty of fluids, avoid dusty areas"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor's Recommendations</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Low sodium diet, 30 min daily walking"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Next Follow-Up */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Next Follow-up Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Follow-up Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Blood Pressure Review, Glucose Check"
                  value={nextFollowUpReason}
                  onChange={(e) => setNextFollowUpReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="simple-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
