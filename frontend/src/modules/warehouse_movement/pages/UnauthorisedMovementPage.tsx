import { useState } from "react";

export default function UnauthorisedMovementPage() {
  const [data] = useState([
    { id: "MV-441", item: "Laptop", from: "Storage", to: "Dock", severity: "High", date: "2026-07-16" },
    { id: "MV-442", item: "Monitors", from: "Bin-A", to: "Bin-B", severity: "Medium", date: "2026-07-15" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Unauthorised Movement</h2>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>Stock movements missing a linked document.</p>
      <table>
        <thead>
          <tr>
            <th>Movement ID</th>
            <th>Item</th>
            <th>From</th>
            <th>To</th>
            <th>Severity</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.item}</td>
              <td>{row.from}</td>
              <td>{row.to}</td>
              <td><span className={`badge ${row.severity === 'High' ? 'badge-danger' : 'badge-gold'}`}>{row.severity}</span></td>
              <td>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
