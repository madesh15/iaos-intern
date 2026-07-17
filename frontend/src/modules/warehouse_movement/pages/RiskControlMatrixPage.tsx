import { useState } from "react";

export default function RiskControlMatrixPage() {
  const [data] = useState([
    { id: "R-01", risk: "Inventory shrinkage during putaway", control: "Barcode scanning required", assertion: "Completeness", owner: "Warehouse Mgr" },
    { id: "R-02", risk: "Unauthorised dispatches", control: "Gate pass verification", assertion: "Validity", owner: "Security" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Risk & Control Matrix (RCM)</h2>
      <table>
        <thead>
          <tr>
            <th>Risk ID</th>
            <th>Risk Description</th>
            <th>Key Control</th>
            <th>Assertion</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.risk}</td>
              <td>{row.control}</td>
              <td><span className="badge badge-navy">{row.assertion}</span></td>
              <td>{row.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
