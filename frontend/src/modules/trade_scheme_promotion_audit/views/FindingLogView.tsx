import { useState } from "react";

export default function FindingLogView() {
  const [findings] = useState([
    { id: "OBS-72-1", name: "Duplicate claim settlement without deduplication check — systemic control gap", grade: "Critical Control Deficiency", owner: "Trade Finance", date: "2026-07-01", status: "Open" },
    { id: "OBS-72-2", name: "Ghost outlets account for 3.2% of total scheme payouts", grade: "Significant Control Deficiency", owner: "Field Operations", date: "2026-07-08", status: "Under CAPA" },
    { id: "OBS-72-3", name: "Display visibility claims lack photographic proof-of-performance", grade: "Moderate Improvement", owner: "Merchandising Team", date: "2026-07-12", status: "Open" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Observation & Finding Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines trade-spend audit gaps identified during testing, complete with risk grades and corrective action plans.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Audit Observation</th>
              <th>Severity Grade</th>
              <th>Assigned Unit</th>
              <th>Logged Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.id}</strong></td>
                <td>{f.name}</td>
                <td>
                  <span className={`badge ${f.grade.includes("Critical") ? "badge-danger" : f.grade.includes("Significant") ? "badge-gold" : "badge-slate"}`}>
                    {f.grade}
                  </span>
                </td>
                <td>{f.owner}</td>
                <td>{f.date}</td>
                <td>
                  <span className={`badge ${f.status === "Open" ? "badge-gold" : "badge-slate"}`}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
