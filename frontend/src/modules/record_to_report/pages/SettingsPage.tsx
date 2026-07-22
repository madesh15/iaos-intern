import React, { useState } from "react";

export default function SettingsPage() {
  const [erpName, setErpName] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [uploadSchedule, setUploadSchedule] = useState("daily");

  const fieldStyle: React.CSSProperties = {
    marginBottom: "1rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--navy)",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Settings</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Configure data source connections and module preferences</p>

      <div className="card" style={{ padding: "1.5rem", maxWidth: 640 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1rem" }}>Data Source Configuration</h3>

        <div style={fieldStyle}>
          <label style={labelStyle}>ERP Name</label>
          <input className="input" placeholder="e.g. SAP, Oracle, Tally" value={erpName} onChange={(e) => setErpName(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Connection String</label>
          <input className="input" placeholder="Server=...;Database=...;..." value={connectionString} onChange={(e) => setConnectionString(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>API Endpoint</label>
          <input className="input" placeholder="https://erp-api.example.com/v1" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Upload Schedule</label>
          <select className="select" value={uploadSchedule} onChange={(e) => setUploadSchedule(e.target.value)} style={{ width: "100%" }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <button className="btn btn-primary">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
