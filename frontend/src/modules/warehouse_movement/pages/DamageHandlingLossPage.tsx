import { useState } from "react";

export default function DamageHandlingLossPage() {
  const [incidents] = useState([
    { id: "DMG-01", item: "Glassware", cause: "Forklift Handling", value: 1500, date: "2026-07-10" },
    { id: "DMG-02", item: "Electronics", cause: "Water Leak", value: 5000, date: "2026-07-12" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card" style={{ padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: "var(--navy)", margin: "0 0 8px 0" }}>Total Loss Value (MTD)</h2>
          <h1 style={{ margin: 0, color: "var(--red)" }}>$6,500</h1>
        </div>
        <div style={{ width: 200, height: 60, background: "linear-gradient(90deg, #ffebee 0%, #ffcdd2 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", fontWeight: "bold" }}>
          +12% vs Last Month
        </div>
      </div>
      
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Damage Incidents</h2>
        <table>
          <thead>
            <tr>
              <th>Incident</th>
              <th>Item</th>
              <th>Cause Tag</th>
              <th>Loss Value</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(row => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.item}</td>
                <td><span className="badge badge-gold">{row.cause}</span></td>
                <td>${row.value}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
