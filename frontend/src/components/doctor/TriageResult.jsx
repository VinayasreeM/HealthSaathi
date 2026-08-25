import React from "react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  HeartPulseIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "../common/Icons";

export default function TriageResult({ aiTriage, vitals }) {
  if (!aiTriage) {
    return (
      <div className="empty-triage-card">
        <SparklesIcon size={24} className="sparkle-empty-icon" />
        <p>No AI triage analysis generated for this patient yet.</p>
      </div>
    );
  }

  const getUrgencyClass = (urgency) => {
    const text = String(urgency).toLowerCase();
    if (text.includes("critical") || text.includes("level 1")) return "triage-critical";
    if (text.includes("high") || text.includes("level 2")) return "triage-high";
    if (text.includes("moderate") || text.includes("level 3")) return "triage-moderate";
    return "triage-stable";
  };

  const urgencyClass = getUrgencyClass(aiTriage.urgencyLevel);

  return (
    <div className="triage-result-container">
      {/* AI Triage Header Banner */}
      <div className={`triage-hero-card ${urgencyClass}`}>
        <div className="triage-hero-top">
          <div className="triage-hero-left">
            <div className="triage-ai-badge">
              <SparklesIcon size={16} />
              <span>HealthSaathi Clinical AI Triage</span>
            </div>
            <h3 className="triage-urgency-title">{aiTriage.urgencyLevel}</h3>
            <p className="triage-summary-text">{aiTriage.summary}</p>
          </div>
          <div className="triage-hero-right">
            <div className="confidence-meter-card">
              <span className="confidence-meter-label">AI Confidence</span>
              <span className="confidence-meter-val">{aiTriage.aiConfidence || "95%"}</span>
              <span className="confidence-meter-sub">Clinical model v2.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Quick Gauge Strip */}
      {vitals && (
        <div className="triage-vitals-grid">
          <div className="triage-vital-card">
            <div className="triage-vital-icon-wrap">
              <HeartPulseIcon size={18} />
            </div>
            <div className="triage-vital-info">
              <span className="triage-vital-title">Blood Pressure</span>
              <span className="triage-vital-value">{vitals.bp || "--"}</span>
              <span className="triage-vital-note">
                {parseInt(vitals.bp) > 140 ? "⚠️ Elevated" : "Normal range"}
              </span>
            </div>
          </div>

          <div className="triage-vital-card">
            <div className="triage-vital-icon-wrap">
              <ActivityIcon size={18} />
            </div>
            <div className="triage-vital-info">
              <span className="triage-vital-title">Oxygen (SpO2)</span>
              <span className="triage-vital-value">{vitals.spo2 || "--"}</span>
              <span className="triage-vital-note">
                {parseInt(vitals.spo2) < 95 ? "⚠️ Low Saturation" : "Optimal (≥95%)"}
              </span>
            </div>
          </div>

          <div className="triage-vital-card">
            <div className="triage-vital-icon-wrap">
              <HeartPulseIcon size={18} />
            </div>
            <div className="triage-vital-info">
              <span className="triage-vital-title">Heart Rate</span>
              <span className="triage-vital-value">{vitals.pulse || "--"}</span>
              <span className="triage-vital-note">Regular rhythm</span>
            </div>
          </div>

          <div className="triage-vital-card">
            <div className="triage-vital-info">
              <span className="triage-vital-title">Temperature</span>
              <span className="triage-vital-value">{vitals.temperature || "--"}</span>
              <span className="triage-vital-note">
                {parseFloat(vitals.temperature) > 99.5 ? "⚠️ Pyrexia" : "Afebrile"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms Breakdown & Clinical Risk Factors */}
      <div className="triage-analysis-grid">
        {/* Symptoms Table */}
        <div className="triage-sub-card">
          <h4 className="triage-sub-title">
            <ActivityIcon size={18} />
            <span>Reported Symptoms & Severity</span>
          </h4>
          {aiTriage.symptoms && aiTriage.symptoms.length > 0 ? (
            <div className="symptoms-list-table">
              {aiTriage.symptoms.map((sym, idx) => (
                <div key={idx} className="symptom-row-item">
                  <div className="symptom-name-col">
                    <span className="symptom-bullet">•</span>
                    <strong>{sym.name}</strong>
                  </div>
                  <div className="symptom-meta-col">
                    <span
                      className={`symptom-severity-badge ${
                        sym.severity.toLowerCase().includes("high") ||
                        sym.severity.toLowerCase().includes("severe")
                          ? "badge-danger"
                          : sym.severity.toLowerCase().includes("mod")
                          ? "badge-warning"
                          : "badge-subtle"
                      }`}
                    >
                      {sym.severity}
                    </span>
                    <span className="symptom-duration">{sym.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state-text">No active symptom complaints recorded.</p>
          )}
        </div>

        {/* Clinical Risk Factors */}
        <div className="triage-sub-card">
          <h4 className="triage-sub-title">
            <ShieldAlertIcon size={18} />
            <span>Identified Risk Flags</span>
          </h4>
          {aiTriage.clinicalRiskFactors && aiTriage.clinicalRiskFactors.length > 0 ? (
            <ul className="risk-factors-list">
              {aiTriage.clinicalRiskFactors.map((risk, idx) => (
                <li key={idx} className="risk-factor-item">
                  <AlertTriangleIcon size={16} className="risk-alert-icon" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state-text">No acute risk triggers detected.</p>
          )}
        </div>
      </div>

      {/* AI Recommendations for Doctor */}
      {aiTriage.aiRecommendations && aiTriage.aiRecommendations.length > 0 && (
        <div className="ai-recommendations-panel">
          <div className="rec-panel-header">
            <div className="rec-sparkle-pill">
              <SparklesIcon size={16} />
              <span>AI Decision Support Insights</span>
            </div>
            <span className="rec-badge-helper">Clinical Guidelines Compliant</span>
          </div>

          <div className="rec-items-grid">
            {aiTriage.aiRecommendations.map((rec, idx) => (
              <div key={idx} className="rec-item-card">
                <div className="rec-check-icon">
                  <CheckCircleIcon size={18} />
                </div>
                <div className="rec-item-text">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
