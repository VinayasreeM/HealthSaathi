import React from "react";
import { ClockIcon, PillIcon, CheckCircleIcon } from "../common/Icons";

export default function MedicationCard({ medications = [] }) {
  if (!medications || medications.length === 0) {
    return (
      <div className="empty-med-card">
        <PillIcon size={24} className="pill-empty-icon" />
        <p>No active medications recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="medications-grid">
      {medications.map((med, idx) => (
        <div key={idx} className="med-item-card">
          <div className="med-card-top">
            <div className="med-pill-icon-wrap">
              <PillIcon size={20} />
            </div>
            <div className="med-title-block">
              <h4 className="med-name">{med.name}</h4>
              <span className="med-dosage-tag">{med.dosage}</span>
            </div>
            <span
              className={`med-status-badge ${
                med.duration?.toLowerCase().includes("ongoing")
                  ? "status-active"
                  : "status-temporary"
              }`}
            >
              {med.duration?.toLowerCase().includes("ongoing") ? "Active / Long-term" : "Short-term"}
            </span>
          </div>

          <div className="med-card-details">
            <div className="med-detail-row">
              <ClockIcon size={15} className="detail-icon" />
              <span className="detail-label">Frequency:</span>
              <strong className="detail-val">{med.frequency}</strong>
            </div>

            {med.duration && (
              <div className="med-detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-val">{med.duration}</span>
              </div>
            )}

            {med.instructions && (
              <div className="med-instructions-box">
                <span className="instructions-label">Instructions:</span>
                <p className="instructions-text">{med.instructions}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
