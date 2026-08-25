import React, { useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  PillIcon,
  PrinterIcon,
  StethoscopeIcon,
  XIcon,
} from "../common/Icons";

export default function PrescriptionCard({ prescriptions = [], patientName = "", patientId = "" }) {
  const [selectedRxForPrint, setSelectedRxForPrint] = useState(null);

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="empty-rx-card">
        <FileTextIcon size={24} className="rx-empty-icon" />
        <p>No previous prescriptions recorded for this patient.</p>
      </div>
    );
  }

  const handlePrint = (rx) => {
    setSelectedRxForPrint(rx);
  };

  const executePrintWindow = () => {
    window.print();
  };

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-list">
        {prescriptions.map((rx, idx) => (
          <div key={rx.id || idx} className="rx-history-card">
            <div className="rx-card-header">
              <div className="rx-header-left">
                <div className="rx-badge-id">
                  <FileTextIcon size={16} />
                  <span>{rx.id}</span>
                </div>
                <div className="rx-meta-info">
                  <span className="rx-date">
                    <CalendarIcon size={14} />
                    {rx.date}
                  </span>
                  <span className="rx-doctor">
                    <StethoscopeIcon size={14} />
                    {rx.doctor || "Consulting Physician"}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline-secondary btn-sm print-rx-btn"
                onClick={() => handlePrint(rx)}
                title="Print or View Full Prescription"
              >
                <PrinterIcon size={15} />
                <span>View Rx Slip</span>
              </button>
            </div>

            <div className="rx-diagnosis-strip">
              <span className="rx-diagnosis-label">Diagnosis:</span>
              <strong className="rx-diagnosis-val">{rx.diagnosis}</strong>
            </div>

            <div className="rx-medicines-table-wrap">
              <table className="rx-medicines-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {rx.medicines?.map((m, mIdx) => (
                    <tr key={mIdx}>
                      <td className="med-name-cell">
                        <div className="med-table-title">
                          <PillIcon size={14} className="med-bullet-icon" />
                          <span>{m.name}</span>
                        </div>
                      </td>
                      <td>{m.dosage}</td>
                      <td>
                        <span className="frequency-pill">{m.frequency}</span>
                      </td>
                      <td>{m.duration}</td>
                      <td className="instructions-cell">{m.instructions || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(rx.notes || rx.recommendations) && (
              <div className="rx-notes-footer">
                <span className="rx-notes-title">Doctor's Advice & Recommendations:</span>
                <p className="rx-notes-body">{rx.notes || rx.recommendations}</p>
              </div>
            )}

            {rx.nextVisit && (
              <div className="rx-next-visit-row">
                <ClockIcon size={14} />
                <span>Next Scheduled Review: <strong>{rx.nextVisit}</strong></span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Printable Prescription Modal Slip */}
      {selectedRxForPrint && (
        <div className="modal-backdrop" onClick={() => setSelectedRxForPrint(null)}>
          <div className="modal-card print-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-actions no-print">
              <button
                className="btn btn-primary btn-sm"
                onClick={executePrintWindow}
              >
                <PrinterIcon size={15} />
                <span>Print Document</span>
              </button>
              <button
                className="icon-btn"
                onClick={() => setSelectedRxForPrint(null)}
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Official Medical Rx Slip layout */}
            <div className="printable-rx-slip">
              <div className="rx-slip-header">
                <div className="rx-hospital-brand">
                  <h2 className="hospital-name">HealthSaathi Medical Center</h2>
                  <p className="hospital-address">
                    Digital Healthcare & Triage Network • National Health Registry
                  </p>
                  <p className="hospital-phone">Helpline: 1800-SAATHI-CARE | info@healthsaathi.org</p>
                </div>
                <div className="rx-doctor-credentials">
                  <h3 className="doc-name">{selectedRxForPrint.doctor || "Dr. Ananya Sharma"}</h3>
                  <p className="doc-degree">MD, Internal Medicine & Cardiology</p>
                  <p className="doc-reg">Reg No: MCI-IND-2011-8842</p>
                </div>
              </div>

              <div className="rx-slip-patient-bar">
                <div>
                  <strong>Patient:</strong> {patientName || "Rajesh Kumar"} (ID: {patientId || "HS-8901"})
                </div>
                <div>
                  <strong>Rx Number:</strong> {selectedRxForPrint.id}
                </div>
                <div>
                  <strong>Date:</strong> {selectedRxForPrint.date}
                </div>
              </div>

              <div className="rx-slip-diagnosis">
                <h4>Clinical Diagnosis:</h4>
                <p>{selectedRxForPrint.diagnosis}</p>
              </div>

              <div className="rx-symbol-row">
                <span className="rx-symbol">℞</span>
              </div>

              <table className="rx-slip-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medication Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRxForPrint.medicines?.map((med, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{med.name}</strong></td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(selectedRxForPrint.notes || selectedRxForPrint.recommendations) && (
                <div className="rx-slip-advice">
                  <h4>Dietary & Lifestyle Advice:</h4>
                  <p>{selectedRxForPrint.notes || selectedRxForPrint.recommendations}</p>
                </div>
              )}

              <div className="rx-slip-footer">
                <div className="rx-next-date">
                  <strong>Next Review Date:</strong> {selectedRxForPrint.nextVisit || "As directed"}
                </div>
                <div className="rx-doc-signature">
                  <div className="signature-line"></div>
                  <span>Authorized Medical Practitioner Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
