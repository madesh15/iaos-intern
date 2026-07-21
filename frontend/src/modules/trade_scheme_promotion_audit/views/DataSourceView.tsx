import { useState } from "react";

export default function DataSourceView() {
  const [sources] = useState([
    { name: "SAP ERP - Trade Promotion Management (TPM)", type: "API Pull", interval: "Hourly", status: "Connected" },
    { name: "Oracle ERP - Distributor Claims Register", type: "DB Direct (MySQL)", interval: "Real-time", status: "Connected" },
    { name: "Field Force App - Display Photo Uploads", type: "SFTP Fetch", interval: "Daily", status: "Connected" },
    { name: "Outlet Master - Geo-tagged Outlet Database", type: "API Pull", interval: "Daily", status: "Connected" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Data Source & Connector Setup</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the data sync endpoints that feed trade scheme, claims, outlet and promo spend data into this audit module.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Data Source Name</th>
              <th>Integration Method</th>
              <th>Sync Frequency</th>
              <th>Connection Status</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, idx) => (
              <tr key={idx}>
                <td><strong>{s.name}</strong></td>
                <td>{s.type}</td>
                <td>{s.interval}</td>
                <td><span className="badge badge-success">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
