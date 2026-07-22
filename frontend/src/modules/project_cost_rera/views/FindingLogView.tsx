import { useState } from "react";

export default function FindingLogView() {
  const [findings] = useState([
    { id: "F-77-01", title: "Escrow withdrawal exceeding RERA 70% limit", severity: "High", category: "Compliance", status: "Open", owner: "Finance Head" },
    { id: "F-77-02", title: "Incomplete withdrawal certificates for 3 projects", severity: "Medium", category: "Documentation", status: "Remediation", owner: "Projects Lead" },
    { id: "F-77-03", title: "Fund diversion without board approval", severity: "High", category: "Governance", status: "Open", owner: "CFO" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Observation & Finding Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Raise, grade, and route audit findings specific to this module's domain.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Finding ID</th><th>Title</th><th>Severity</th><th>Category</th><th>Status</th><th>Owner</th></tr></thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.id}</strong></td>
                <td>{f.title}</td>
                <td><span className={`badge ${f.severity === "High" ? "badge-danger" : "badge-gold"}`}>{f.severity}</span></td>
                <td>{f.category}</td>
                <td><span className={`badge ${f.status === "Open" ? "badge-danger" : f.status === "Remediation" ? "badge-gold" : "badge-success"}`}>{f.status}</span></td>
                <td>{f.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
