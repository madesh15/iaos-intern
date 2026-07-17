import { useState } from "react";

export default function ObservationFindingLogPage() {
  const [findings] = useState([
    { id: "OB-01", title: "Inadequate CCTV coverage at Dispatch", severity: "High", routing: "Sent to Management" },
    { id: "OB-02", title: "Minor delays in Putaway", severity: "Low", routing: "Draft" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Observation & Finding Log</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Severity</th>
            <th>Routing Status</th>
          </tr>
        </thead>
        <tbody>
          {findings.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.title}</td>
              <td><span className={`badge ${row.severity === 'High' ? 'badge-danger' : 'badge-success'}`}>{row.severity}</span></td>
              <td>{row.routing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
