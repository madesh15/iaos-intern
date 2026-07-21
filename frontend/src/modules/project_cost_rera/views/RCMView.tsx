import { useState } from "react";

export default function RCMView() {
  const [risks] = useState([
    { id: "RCM-01", risk: "Escrow withdrawal exceeding 70% eligible limit", assertion: "Compliance", control: "Automated threshold check", owner: "Finance Head", residual: "Medium" },
    { id: "RCM-02", risk: "Inter-project fund diversion without approval", assertion: "Existence", control: "Dual-signature transfer approval", owner: "Treasury", residual: "Low" },
    { id: "RCM-03", risk: "Cost budget overrun without escalation", assertion: "Valuation", control: "Variance reporting with auto-alert", owner: "Project Director", residual: "Medium" },
    { id: "RCM-04", risk: "Delayed buyer possession beyond RERA deadline", assertion: "Completeness", control: "Possession-date tracking & penalty auto-calc", owner: "Legal Head", residual: "High" },
    { id: "RCM-05", risk: "Invalid withdrawal certificates from uncertified professionals", assertion: "Rights & Obligations", control: "Certifier license verification", owner: "Compliance Officer", residual: "Medium" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Risk & Control Matrix (RCM)</h3>
        <p style={{ color: "var(--slate)" }}>
          Catalogues key risks, associated controls, audit assertions, and residual risk ratings for the domain.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>ID</th><th>Risk Description</th><th>Assertion</th><th>Key Control</th><th>Owner</th><th>Residual</th></tr></thead>
          <tbody>
            {risks.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.risk}</td>
                <td>{r.assertion}</td>
                <td>{r.control}</td>
                <td>{r.owner}</td>
                <td><span className={`badge ${r.residual === "High" ? "badge-danger" : r.residual === "Medium" ? "badge-gold" : "badge-success"}`}>{r.residual}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
