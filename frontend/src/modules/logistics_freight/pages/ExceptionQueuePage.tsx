import { useState } from "react";

export default function ExceptionQueuePage() {
  const [filter, setFilter] = useState("all");

  const exceptions = [
    { id: "EXC-001", type: "Overbilling", entity: "Cargo Express", ref: "SHP-002", amount: 2300, severity: "High", detected: "2025-06-10", status: "New" },
    { id: "EXC-002", type: "Overbilling", entity: "Speed Logistics", ref: "SHP-001", amount: 2860, severity: "High", detected: "2025-06-11", status: "New" },
    { id: "EXC-003", type: "Duplicate", entity: "Cargo Express", ref: "INV-2025-009", amount: 3800, severity: "High", detected: "2025-06-12", status: "Investigating" },
    { id: "EXC-004", type: "SLA Breach", entity: "SeaLine Shipping", ref: "SHP-005", amount: 25000, severity: "Medium", detected: "2025-06-13", status: "New" },
    { id: "EXC-005", type: "Weight Variance", entity: "Speed Logistics", ref: "SHP-004", amount: 1200, severity: "Medium", detected: "2025-06-14", status: "Investigating" },
    { id: "EXC-006", type: "Route Inflation", entity: "Cargo Express", ref: "SHP-009", amount: 2400, severity: "Medium", detected: "2025-06-15", status: "New" },
    { id: "EXC-007", type: "Detention", entity: "Cargo Express", ref: "SHP-006", amount: 4200, severity: "Low", detected: "2025-06-16", status: "Resolved" },
    { id: "EXC-008", type: "SLA Breach", entity: "Cargo Express", ref: "SHP-002", amount: 15000, severity: "Medium", detected: "2025-06-08", status: "Investigating" },
  ];

  const filtered = filter === "all" ? exceptions : exceptions.filter((e) => e.status === filter);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Exception & Red Flag Queue</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {["all", "New", "Investigating", "Resolved"].map((f) => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f} {f !== "all" ? `(${exceptions.filter((e) => e.status === f).length})` : `(${exceptions.length})`}
          </button>
        ))}
        <button className="btn btn-primary" style={{ marginLeft: "auto" }}>Run Auto-Detect</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Exception Type</th><th>Entity</th><th>Reference</th>
              <th>Amount</th><th>Severity</th><th>Detected</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.id}</strong></td>
                <td><span className="badge">{e.type}</span></td>
                <td>{e.entity}</td>
                <td style={{ fontSize: 12 }}>{e.ref}</td>
                <td>₹{e.amount.toLocaleString()}</td>
                <td><span className={`badge ${e.severity === "High" ? "badge-danger" : e.severity === "Medium" ? "badge" : "badge-success"}`}>{e.severity}</span></td>
                <td style={{ fontSize: 12 }}>{e.detected}</td>
                <td><span className={`badge ${e.status === "Resolved" ? "badge-success" : e.status === "Investigating" ? "badge" : "badge-danger"}`}>{e.status}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Exception Summary</h4>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Total Exceptions", value: exceptions.length, color: "var(--navy)" },
            { label: "High Severity", value: exceptions.filter((e) => e.severity === "High").length, color: "#dc2626" },
            { label: "Total Financial Impact", value: `₹${exceptions.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`, color: "var(--navy)" },
            { label: "Resolved", value: exceptions.filter((e) => e.status === "Resolved").length, color: "#059669" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
