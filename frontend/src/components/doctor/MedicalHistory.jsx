import React from "react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  HeartPulseIcon,
  ShieldAlertIcon,
} from "../common/Icons";

export default function MedicalHistory({
  medicalHistory = [],
  surgeries = [],
  familyHistory = "",
  allergies = [],
}) {
  return (
    <div className="medical-history-container">
      {/* Allergies Highlight Banner */}
      {allergies && allergies.length > 0 && (
        <div className="alert-card alert-danger-card">
          <div className="alert-card-header">
            <ShieldAlertIcon size={20} className="alert-danger-icon" />
            <div>
              <h4 className="alert-card-title">Documented Allergies & Drug Hypersensitivity</h4>
              <p className="alert-card-sub">
                Always verify before prescribing any antimicrobial, NSAID, or contrast agent.
              </p>
            </div>
          </div>
          <div className="allergy-tags-list">
            {allergies.map((allergy, idx) => (
              <span key={idx} className="allergy-badge-pill">
                ⚠️ {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chronic Conditions & Timeline */}
      <div className="history-section-card">
        <div className="section-title-row">
          <div className="section-title-icon-wrap">
            <ActivityIcon size={18} />
          </div>
          <div>
            <h3 className="section-card-title">Medical Conditions & Chronology</h3>
            <p className="section-card-sub">Past and ongoing diagnoses documented in HealthSaathi</p>
          </div>
        </div>

        {medicalHistory && medicalHistory.length > 0 ? (
          <div className="timeline-wrapper">
            {medicalHistory.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  {idx !== medicalHistory.length - 1 && <div className="timeline-line"></div>}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-year-tag">{item.year}</span>
                    <h4 className="timeline-condition">{item.condition}</h4>
                  </div>
                  {item.details && <p className="timeline-details">{item.details}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state-text">No prior chronic medical conditions documented.</p>
        )}
      </div>

      {/* Surgical History & Family History Grid */}
      <div className="history-two-col-grid">
        {/* Surgeries */}
        <div className="history-section-card">
          <div className="section-title-row">
            <div className="section-title-icon-wrap">
              <HeartPulseIcon size={18} />
            </div>
            <div>
              <h3 className="section-card-title">Past Surgeries & Procedures</h3>
              <p className="section-card-sub">Major and minor operative history</p>
            </div>
          </div>

          {surgeries && surgeries.length > 0 ? (
            <ul className="surgical-list">
              {surgeries.map((surg, idx) => (
                <li key={idx} className="surgical-list-item">
                  <div className="surg-icon-bullet">
                    <CheckCircleIcon size={16} />
                  </div>
                  <div>
                    <strong className="surg-name">{surg.procedure}</strong>
                    <div className="surg-meta">
                      <span>Year: {surg.year}</span>
                      {surg.hospital && <span> • Hospital: {surg.hospital}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state-text">No previous surgical procedures recorded.</p>
          )}
        </div>

        {/* Family History */}
        <div className="history-section-card">
          <div className="section-title-row">
            <div className="section-title-icon-wrap">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className="section-card-title">Family Medical History</h3>
              <p className="section-card-sub">Hereditary and familial predispositions</p>
            </div>
          </div>

          {familyHistory ? (
            <div className="family-history-content">
              <p className="family-history-text">{familyHistory}</p>
              <div className="family-history-tip">
                <AlertTriangleIcon size={16} />
                <span>Screen for early cardiovascular or metabolic markers.</span>
              </div>
            </div>
          ) : (
            <p className="empty-state-text">No notable family history on record.</p>
          )}
        </div>
      </div>
    </div>
  );
}
