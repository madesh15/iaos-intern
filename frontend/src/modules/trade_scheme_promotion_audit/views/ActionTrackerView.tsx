import { useState } from "react";

export default function ActionTrackerView() {
  const [actions] = useState([
    { id: "ACT-72-1", task: "Implement automated claim deduplication engine in TPM module", owner: "Trade Finance Lead", due: "2026-08-30", status: "In Progress" },
    { id: "ACT-72-2", task: "Conduct physical verification of all flagged ghost outlets", owner: "Field Audit Lead", due: "2026-08-15", status: "In Progress" },
    { id: "ACT-72-3", task: "Add scheme-overlap detection rule to ERP approval workflow", owner: "IT Systems Team", due: "2026-09-01", status: "Not Started" },
    { id: "ACT-72-4", task: "Mandate photographic proof-of-display for all visibility claims", owner: "Merchandising Manager", due: "2026-07-31", status: "Completed" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Remediation / CAPA Action Tracker</h3>
        <p style={{ color: "var(--slate)" }}>
          Tracks the closure of corrective and preventive action items linked to trade-spend audit findings.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Action ID</th>
              <th>Task Action Plan</th>
              <th>Action Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.id}</strong></td>
                <td>{a.task}</td>
                <td>{a.owner}</td>
                <td>{a.due}</td>
                <td>
                  <span className={`badge ${a.status === "Completed" ? "badge-success" : a.status === "In Progress" ? "badge-gold" : "badge-slate"}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
