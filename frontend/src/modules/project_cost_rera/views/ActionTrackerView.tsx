import { useState } from "react";

export default function ActionTrackerView() {
  const [actions] = useState([
    { id: "CAPA-77-01", finding: "F-77-01", action: "Implement automated escrow threshold alerts", owner: "Finance Head", due: "2026-08-15", status: "In Progress", retest: "Pending" },
    { id: "CAPA-77-02", finding: "F-77-02", action: "Mandate architect license verification for all new certificates", owner: "Projects Lead", due: "2026-08-01", status: "Completed", retest: "Scheduled" },
    { id: "CAPA-77-03", finding: "F-77-03", action: "Add board-resolution attachment as mandatory field for inter-project transfers", owner: "CFO", due: "2026-09-01", status: "Open", retest: "Pending" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Remediation / Action Tracker</h3>
        <p style={{ color: "var(--slate)" }}>
          Track CAPA items, owners, due dates, and re-testing status through to closure.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>CAPA ID</th><th>Finding</th><th>Action</th><th>Owner</th><th>Due Date</th><th>Status</th><th>Retest</th></tr></thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.id}</strong></td>
                <td>{a.finding}</td>
                <td>{a.action}</td>
                <td>{a.owner}</td>
                <td>{a.due}</td>
                <td><span className={`badge ${a.status === "Completed" ? "badge-success" : a.status === "In Progress" ? "badge-gold" : "badge-slate"}`}>{a.status}</span></td>
                <td><span className="badge badge-slate">{a.retest}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
