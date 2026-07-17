import { useState } from "react";

export default function SlottingOptimisationReviewPage() {
  const [data] = useState([
    { item: "SKU-Fast", velocity: "High", currentZone: "Deep Storage", suggestion: "Move to Pick Face" },
    { item: "SKU-Slow", velocity: "Low", currentZone: "Pick Face", suggestion: "Move to Deep Storage" },
    { item: "SKU-Mid", velocity: "Medium", currentZone: "Aisle 2", suggestion: "Optimal" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Slotting Optimisation Review</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Sales Velocity</th>
            <th>Current Bin/Zone</th>
            <th>Re-slotting Suggestion</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.item}>
              <td><strong>{row.item}</strong></td>
              <td>{row.velocity}</td>
              <td>{row.currentZone}</td>
              <td>
                {row.suggestion !== 'Optimal' ? <span className="badge badge-gold">{row.suggestion}</span> : <span className="badge badge-success">Optimal</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
