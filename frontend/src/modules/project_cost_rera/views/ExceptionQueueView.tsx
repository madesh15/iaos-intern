import { useState } from "react";

export default function ExceptionQueueView() {
  const [exceptions] = useState([
    { id: "EX-77-01", description: "Escrow withdrawal of ₹2.4 Cr exceeds 70% eligible limit", asset: "HDFC Escrow A/c — Skyline Phase 2", date: "2026-07-14", severity: "Critical", status: "New" },
    { id: "EX-77-02", description: "Inter-project fund transfer ₹85L without dual approval", asset: "ICICI Project A → Project B", date: "2026-07-13", severity: "High", status: "Under Review" },
    { id: "EX-77-03", description: "Budget overrun >15% on MEP cost head without escalation", asset: "Greenview Towers — MEP", date: "2026-07-12", severity: "Major", status: "Acknowledged" },
    { id: "EX-77-04", description: "Withdrawal certificate from non-registered architect", asset: "WC-2026-038 — Sunrise Enclave", date: "2026-07-11", severity: "Critical", status: "New" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Exception & Red-Flag Queue</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists anomalies detected by automated CAAT rules. Exceptions require documented justification or closure.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Exception ID</th><th>Flagged Anomaly</th><th>Relevant Asset</th><th>Detected</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>
            {exceptions.map((ex) => (
              <tr key={ex.id}>
                <td><strong>{ex.id}</strong></td>
                <td>{ex.description}</td>
                <td style={{ fontSize: 12 }}>{ex.asset}</td>
                <td>{ex.date}</td>
                <td><span className={`badge ${ex.severity === "Critical" ? "badge-danger" : "badge-gold"}`}>{ex.severity}</span></td>
                <td><span className="badge badge-slate">{ex.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
