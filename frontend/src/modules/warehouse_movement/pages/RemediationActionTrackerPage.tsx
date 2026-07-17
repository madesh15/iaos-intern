import { useState } from "react";

export default function RemediationActionTrackerPage() {
  const [actions] = useState([
    { id: "CAPA-01", finding: "OB-01", action: "Install 2 new cameras", owner: "Facility Mgr", due: "2026-08-30", status: "In Progress" },
    { id: "CAPA-02", finding: "OB-02", action: "Retrain forklift drivers", owner: "Ops Lead", due: "2026-07-20", status: "Completed" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Remediation / Action Tracker</h2>
      <table>
        <thead>
          <tr>
            <th>CAPA ID</th>
            <th>Related Finding</th>
            <th>Action Plan</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.finding}</td>
              <td>{row.action}</td>
              <td>{row.owner}</td>
              <td>{row.due}</td>
              <td><span className={`badge ${row.status === 'Completed' ? 'badge-success' : 'badge-gold'}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
