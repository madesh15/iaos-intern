import { useState } from "react";

export default function DataSourceView() {
  const [sources] = useState([
    { name: "Tally ERP — Project Ledger", type: "API", tables: "td_project_costs, td_escrow_transactions", status: "Connected", sync: "Hourly" },
    { name: "RERA Portal Scraper", type: "Scrape", tables: "rera_registrations, project_status", status: "Connected", sync: "Daily" },
    { name: "Bank Statement Feed", type: "SFTP", tables: "bank_transactions, escrow_movements", status: "Connected", sync: "Daily" },
    { name: "Project Cost Workbook", type: "Upload", tables: "budget_vs_actual, cost_heads", status: "Manual", sync: "On Upload" },
    { name: "Ind AS 115 Workpaper", type: "Upload", tables: "revenue_recognition, handover_log", status: "Manual", sync: "On Upload" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Data Source & Connector Setup</h3>
        <p style={{ color: "var(--slate)" }}>
          Maps ERP tables, APIs, and upload feeds that power this module's analytics engine.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Source</th><th>Type</th><th>Tables / Entities</th><th>Status</th><th>Sync Freq</th></tr></thead>
          <tbody>
            {sources.map((s, i) => (
              <tr key={i}>
                <td><strong>{s.name}</strong></td>
                <td><span className="badge badge-slate">{s.type}</span></td>
                <td style={{ fontSize: 12, fontFamily: "monospace" }}>{s.tables}</td>
                <td><span className={`badge ${s.status === "Connected" ? "badge-success" : "badge-gold"}`}>{s.status}</span></td>
                <td>{s.sync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
