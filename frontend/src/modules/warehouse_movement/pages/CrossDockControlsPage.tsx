import { useState } from "react";

export default function CrossDockControlsPage() {
  const [data] = useState([
    { tx: "XD-01", inward: "IN-99", outward: "OUT-101", complete: true },
    { tx: "XD-02", inward: "IN-100", outward: "Missing", complete: false },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Cross-Dock Controls</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Inward Doc</th>
            <th>Outward Doc</th>
            <th>Document Completeness</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.tx}>
              <td><strong>{row.tx}</strong></td>
              <td>{row.inward}</td>
              <td>{row.outward}</td>
              <td>{row.complete ? <span className="badge badge-success">Complete</span> : <span className="badge badge-danger">Incomplete</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
