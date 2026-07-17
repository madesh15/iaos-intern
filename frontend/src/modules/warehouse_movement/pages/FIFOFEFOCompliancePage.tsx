import { useState } from "react";

export default function FIFOFEFOCompliancePage() {
  const [issues] = useState([
    { id: "ISS-11", item: "Dairy Milk", pickedBatch: "B-202", olderBatch: "B-101", risk: "High (Expires in 2 days)" },
    { id: "ISS-12", item: "Cereals", pickedBatch: "C-99", olderBatch: "C-98", risk: "Low (Expires in 6 months)" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>FIFO/FEFO Compliance</h2>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>Items picked out of sequence.</p>
      <table>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Item</th>
            <th>Picked Batch</th>
            <th>Older Batch Available</th>
            <th>Expiry Risk</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.item}</td>
              <td>{row.pickedBatch}</td>
              <td>{row.olderBatch}</td>
              <td><span className={`badge ${row.risk.includes('High') ? 'badge-danger' : 'badge-gold'}`}>{row.risk}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
