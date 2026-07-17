import { useState } from "react";

export default function ThirdPLReconciliationPage() {
  const [data] = useState([
    { item: "Pallet A", ourQty: 50, thirdPlQty: 50, variance: 0 },
    { item: "Pallet B", ourQty: 100, thirdPlQty: 95, variance: -5 },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>3PL Reconciliation</h2>
      <table>
        <thead>
          <tr>
            <th>Item / Stock Unit</th>
            <th>Internal System Qty</th>
            <th>3PL Reported Qty</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.item}>
              <td><strong>{row.item}</strong></td>
              <td>{row.ourQty}</td>
              <td>{row.thirdPlQty}</td>
              <td>
                <span className={`badge ${row.variance === 0 ? 'badge-success' : 'badge-danger'}`}>
                  {row.variance}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
