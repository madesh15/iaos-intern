import { useState } from "react";

export default function GateEntryMatchPage() {
  const [filter, setFilter] = useState("All");
  const [data] = useState([
    { id: "GE-001", grn: "GRN-101", vehicle: "Truck A", status: "Matched", reason: "" },
    { id: "GE-002", grn: "GRN-102", vehicle: "Truck B", status: "Mismatched", reason: "Quantity Variance" },
    { id: "GE-003", grn: "GRN-103", vehicle: "Van C", status: "Matched", reason: "" },
    { id: "GE-004", grn: "Pending", vehicle: "Truck D", status: "Mismatched", reason: "Missing GRN" },
  ]);

  const filtered = data.filter(d => filter === "All" || d.status === filter);

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ color: "var(--navy)", margin: 0 }}>Gate-Entry to GRN Match</h2>
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Matched">Matched</option>
          <option value="Mismatched">Mismatched</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Gate Entry</th>
            <th>GRN</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Mismatch Reason</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.grn}</td>
              <td>{row.vehicle}</td>
              <td><span className={`badge ${row.status === 'Matched' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span></td>
              <td style={{ color: "var(--slate)" }}>{row.reason || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
