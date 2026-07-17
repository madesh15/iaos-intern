import { useState } from "react";

export default function CycleCountSystemPage() {
  const [data] = useState([
    { item: "SKU-X", systemQty: 100, countQty: 90, variance: -10 },
    { item: "SKU-Y", systemQty: 50, countQty: 55, variance: 10 },
    { item: "SKU-Z", systemQty: 200, countQty: 200, variance: 0 },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Cycle-Count vs System</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>System Qty</th>
            <th>Count Qty</th>
            <th>Variance Qty</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {data.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)).map(row => {
            const pct = row.systemQty ? ((row.countQty - row.systemQty) / row.systemQty * 100).toFixed(1) : 0;
            return (
              <tr key={row.item}>
                <td><strong>{row.item}</strong></td>
                <td>{row.systemQty}</td>
                <td>{row.countQty}</td>
                <td>{row.variance}</td>
                <td>
                  <span className={`badge ${row.variance === 0 ? 'badge-success' : 'badge-danger'}`}>
                    {row.variance > 0 ? '+' : ''}{pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
