import { useState } from "react";

export default function PutawayBinAccuracyPage() {
  const [showMismatchOnly, setShowMismatchOnly] = useState(false);
  const [data] = useState([
    { id: "PA-100", item: "SKU-A", expected: "A-12", actual: "A-12", status: "Match" },
    { id: "PA-101", item: "SKU-B", expected: "B-05", actual: "C-01", status: "Mismatch" },
    { id: "PA-102", item: "SKU-C", expected: "A-01", actual: "A-01", status: "Match" },
  ]);

  const filtered = data.filter(d => !showMismatchOnly || d.status === "Mismatch");

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ color: "var(--navy)", margin: 0 }}>Put-away & Bin Accuracy</h2>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={showMismatchOnly} onChange={e => setShowMismatchOnly(e.target.checked)} />
          Show Mismatches Only
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Item</th>
            <th>Expected Bin</th>
            <th>Actual Bin</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.item}</td>
              <td>{row.expected}</td>
              <td>{row.actual}</td>
              <td><span className={`badge ${row.status === 'Match' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
