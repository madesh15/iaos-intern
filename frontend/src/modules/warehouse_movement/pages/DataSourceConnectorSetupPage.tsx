import { useState } from "react";

export default function DataSourceConnectorSetupPage() {
  const [sources, setSources] = useState([
    { name: "ERP Warehouse Module", type: "API", status: "Connected", sync: "10 mins ago" },
    { name: "3PL Partner Portal", type: "SFTP", status: "Failed", sync: "2 days ago" },
  ]);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Data Sources</h2>
        <table>
          <thead>
            <tr>
              <th>Source Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {sources.map(row => (
              <tr key={row.name}>
                <td><strong>{row.name}</strong></td>
                <td>{row.type}</td>
                <td><span className={`badge ${row.status === 'Connected' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span></td>
                <td>{row.sync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card" style={{ padding: 22, height: "fit-content" }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Connector</h3>
        <div className="field">
          <label>Connector Type</label>
          <select className="select">
            <option>REST API</option>
            <option>Database (Read-only)</option>
            <option>SFTP CSV Upload</option>
          </select>
        </div>
        <div className="field">
          <label>Connection String / URL</label>
          <input className="input" />
        </div>
        <button className="btn btn-primary btn-block">Test & Save</button>
      </div>
    </div>
  );
}
