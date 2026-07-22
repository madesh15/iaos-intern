import { useState } from "react";

type DataSource = {
  name: string;
  type: string;
  status: string;
  lastSync: string;
  records: string;
};

export default function DataSourceView() {
  const [sources] = useState<DataSource[]>([
    { name: "SAP S/4HANA - Material Master", type: "API (OData)", status: "Connected", lastSync: "2026-07-22 06:30", records: "15,420" },
    { name: "ERP - Finance Valuation View", type: "DB Direct (MSSQL)", status: "Connected", lastSync: "2026-07-22 06:15", records: "14,800" },
    { name: "Tax Portal - HSN Master", type: "API (REST)", status: "Connected", lastSync: "2026-07-21 23:00", records: "12,500" },
    { name: "Warehouse WMS - Inventory Snapshot", type: "SFTP File", status: "Connected", lastSync: "2026-07-22 05:45", records: "18,230" },
    { name: "Supplier Portal - Item Cross-Reference", type: "API (SOAP)", status: "Disconnected", lastSync: "2026-07-19 12:00", records: "3,200" },
    { name: "Legacy AS400 - Historical Items", type: "DB Direct (DB2)", status: "Disconnected", lastSync: "2026-06-30 00:00", records: "42,100" },
  ]);

  const total = sources.length;
  const connected = sources.filter((s) => s.status === "Connected").length;
  const disconnected = total - connected;
  const lastSync = Math.min(...sources.map((s) => Date.now() - new Date(s.lastSync).getTime()));
  const lastSyncStr = lastSync < 3600000 ? "Within 1 hour" : lastSync < 86400000 ? "Within 24 hours" : "Over 24 hours";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Total Sources", value: total, color: "var(--navy)" },
          { label: "Connected", value: connected, color: "var(--success)" },
          { label: "Disconnected", value: disconnected, color: "var(--danger)" },
          { label: "Last Sync", value: lastSyncStr, color: "var(--gold)" },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color, fontSize: typeof c.value === "number" ? undefined : 16 }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Source Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Records</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, idx) => (
              <tr key={idx}>
                <td><strong>{s.name}</strong></td>
                <td><span className="badge badge-slate">{s.type}</span></td>
                <td><span className={`badge ${s.status === "Connected" ? "badge-success" : "badge-danger"}`}>{s.status}</span></td>
                <td style={{ fontSize: 13, color: "var(--slate)" }}>{s.lastSync}</td>
                <td style={{ fontWeight: 600 }}>{s.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
