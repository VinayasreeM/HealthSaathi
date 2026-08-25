import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ActivityIcon,
  ChevronRightIcon,
  FilePlusIcon,
  HeartPulseIcon,
  ShieldAlertIcon,
} from "../common/Icons";

export default function PatientCard({ patient, compact = false, onSelect }) {
  const navigate = useNavigate();

  if (!patient) return null;

  const getStatusBadge = (status, triageLevel) => {
    const level = triageLevel || status;
    if (level?.toLowerCase().includes("high") || level?.toLowerCase().includes("critical")) {
      return <span className="status-badge status-critical">High Priority</span>;
    }
    if (level?.toLowerCase().includes("mod") || status?.toLowerCase().includes("pending")) {
      return <span className="status-badge status-warning">Moderate</span>;
    }
    return <span className="status-badge status-stable">Stable</span>;
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "PT";
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(patient);
    } else {
      navigate(`/doctor/patients/${patient.id}`);
    }
  };

  const handlePrescribe = (e) => {
    e.stopPropagation();
    navigate(`/doctor/patients/${patient.id}/prescription`);
  };

  if (compact) {
    return (
      <div className="patient-card-compact" onClick={handleView}>
        <div className="patient-avatar-circle">{getInitials(patient.name)}</div>
        <div className="patient-compact-info">
          <div className="patient-compact-top">
            <h4 className="patient-name">{patient.name}</h4>
            <span className="patient-id-tag">{patient.id}</span>
          </div>
          <p className="patient-compact-sub">
            {patient.age} yrs • {patient.gender} • Last visit: {patient.lastVisit}
          </p>
        </div>
        <div className="patient-compact-action">
          {getStatusBadge(patient.status, patient.triageLevel)}
          <button className="icon-btn-subtle" title="View Patient" onClick={handleView}>
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-card patient-card-full" onClick={handleView}>
      <div className="patient-card-header">
        <div className="patient-id-row">
          <div className="patient-avatar-circle">{getInitials(patient.name)}</div>
          <div>
            <h3 className="patient-name-title">{patient.name}</h3>
            <div className="patient-meta-chips">
              <span className="patient-chip id-chip">{patient.id}</span>
              <span className="patient-chip">{patient.age} yrs</span>
              <span className="patient-chip">{patient.gender}</span>
              {patient.bloodGroup && (
                <span className="patient-chip blood-chip">{patient.bloodGroup}</span>
              )}
            </div>
          </div>
        </div>
        <div>{getStatusBadge(patient.status, patient.triageLevel)}</div>
      </div>

      <div className="patient-card-body">
        {patient.conditionSummary && (
          <p className="patient-condition-summary">
            <strong>Condition:</strong> {patient.conditionSummary}
          </p>
        )}

        {patient.vitals && (
          <div className="patient-vitals-strip">
            <div className="vital-item">
              <span className="vital-label">BP</span>
              <span className="vital-val">{patient.vitals.bp || "--"}</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">SpO2</span>
              <span className="vital-val">{patient.vitals.spo2 || "--"}</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Pulse</span>
              <span className="vital-val">{patient.vitals.pulse || "--"}</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Temp</span>
              <span className="vital-val">{patient.vitals.temperature || "--"}</span>
            </div>
          </div>
        )}

        {patient.allergies && patient.allergies.length > 0 && (
          <div className="patient-allergy-row">
            <ShieldAlertIcon size={14} className="allergy-icon" />
            <span className="allergy-text">
              Allergies: <strong>{patient.allergies.join(", ")}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="patient-card-footer">
        <span className="last-visit-tag">Last Visit: {patient.lastVisit}</span>
        <div className="patient-actions-group">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handlePrescribe}
            title="Create Prescription"
          >
            <FilePlusIcon size={15} />
            <span>Prescribe</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleView}>
            <span>View Details</span>
            <ChevronRightIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
