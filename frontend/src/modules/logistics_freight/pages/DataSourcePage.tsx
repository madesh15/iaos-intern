import { useState } from "react";

export default function DataSourcePage() {
  const [connectors] = useState([
    { name: "ERP System", type: "API", status: "Connected", lastSync: "Today 06:30 AM", records: "12,450", icon: "🖥️" },
    { name: "Transport Management System", type: "API", status: "Connected", lastSync: "Today 06:45 AM", records: "8,230", icon: "🚚" },
    { name: "Fuel Index Database", type: "API", status: "Connected", lastSync: "Yesterday 11:00 PM", records: "365", icon: "⛽" },
    { name: "Claims Database", type: "Database", status: "Connected", lastSync: "Today 05:00 AM", records: "156", icon: "📋" },
    { name: "GPS Tracking System", type: "API", status: "Disconnected", lastSync: "3 days ago", records: "45,678", icon: "📍" },
    { name: "Vendor Portal", type: "Web Scraper", status: "Pending", lastSync: "Never", records: "0", icon: "🌐" },
  ]);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Data Source & Connector Setup</h2>
      <button className="btn btn-primary" style={{ marginBottom: 16 }}>+ Add Data Source</button>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Source</th><th>Type</th><th>Status</th><th>Last Sync</th><th>Records</th><th></th>
            </tr>
          </thead>
          <tbody>
            {connectors.map((c) => (
              <tr key={c.name}>
                <td><strong>{c.icon} {c.name}</strong></td>
                <td><span className="badge">{c.type}</span></td>
                <td><span className={`badge ${c.status === "Connected" ? "badge-success" : c.status === "Disconnected" ? "badge-danger" : "badge"}`}>{c.status}</span></td>
                <td style={{ fontSize: 12 }}>{c.lastSync}</td>
                <td>{c.records}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Sync</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Config</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h4 style={{ marginBottom: 12 }}>Data Mapping Configuration</h4>
        <div style={{ display: "grid", gap: 8 }}>
          {[{ field: "Shipment Number", source: "TMS → shipments.shipment_number", status: "Mapped" },
            { field: "Invoice Amount", source: "ERP → invoices.total_amount", status: "Mapped" },
            { field: "Actual Weight", source: "TMS → shipments.actual_weight", status: "Mapped" },
            { field: "GPS Distance", source: "GPS → tracking.distance_km", status: "Pending" },
          ].map((m) => (
            <div key={m.field} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg)", borderRadius: 6, fontSize: 13 }}>
              <span><strong>{m.field}</strong>: <span style={{ color: "var(--slate)" }}>{m.source}</span></span>
              <span className={`badge ${m.status === "Mapped" ? "badge-success" : "badge"}`}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
