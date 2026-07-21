import { useState } from "react";

export default function ExceptionQueueView() {
  const [exceptions] = useState([
    { id: "EX-72-01", description: "Duplicate claim detected: CLM-003 matches CLM-001 for same distributor + scheme", item: "Distributor: Reliance Retail", date: "2026-07-15", severity: "Critical", status: "New" },
    { id: "EX-72-02", description: "Ghost outlet payout: OUT-KIR-452 shows zero sales for 6 consecutive months", item: "Outlet: Kirana Store #452", date: "2026-07-14", severity: "Critical", status: "Under Review" },
    { id: "EX-72-03", description: "Scheme overlap: SCH-015 and SCH-016 both active for Modern Trade channel in same period", item: "Modern Trade Channel", date: "2026-07-13", severity: "Major", status: "New" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Exception & Red-Flag Queue</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists anomalies detected by automated CAAT rules. Exceptions require documented justification or closure to restore compliant status.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Exception ID</th>
              <th>Flagged Anomaly / Violation</th>
              <th>Relevant Entity</th>
              <th>Detected Date</th>
              <th>Severity</th>
              <th>Triage Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((ex) => (
              <tr key={ex.id}>
                <td><strong>{ex.id}</strong></td>
                <td>{ex.description}</td>
                <td>{ex.item}</td>
                <td>{ex.date}</td>
                <td>
                  <span className={`badge ${ex.severity === "Critical" ? "badge-danger" : "badge-gold"}`}>
                    {ex.severity}
                  </span>
                </td>
                <td><span className="badge badge-slate">{ex.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
