import { useState } from "react";

export default function WorkingPapersPage() {
  const [papers] = useState([
    { wp: "WP-001", title: "Rate Compliance Testing", category: "Analytics", status: "Completed", sheets: 3, lastUpdated: "2025-06-15", reviewer: "Pending" },
    { wp: "WP-002", title: "Duplicate Billing Analysis", category: "Analytics", status: "Draft", sheets: 2, lastUpdated: "2025-06-14", reviewer: "Not Assigned" },
    { wp: "WP-003", title: "Carrier Contract Review", category: "Substantive", status: "In Progress", sheets: 5, lastUpdated: "2025-06-13", reviewer: "John Smith" },
    { wp: "WP-004", title: "Fuel Surcharge Validation", category: "Analytics", status: "Completed", sheets: 2, lastUpdated: "2025-06-12", reviewer: "Approved" },
    { wp: "WP-005", title: "SLA Compliance Testing", category: "Compliance", status: "Draft", sheets: 4, lastUpdated: "2025-06-11", reviewer: "Not Assigned" },
    { wp: "WP-006", title: "Claim Processing Review", category: "Substantive", status: "In Progress", sheets: 3, lastUpdated: "2025-06-10", reviewer: "Jane Doe" },
    { wp: "WP-007", title: "Detention Charge Analysis", category: "Analytics", status: "Draft", sheets: 1, lastUpdated: "2025-06-09", reviewer: "Not Assigned" },
  ]);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Working Papers & Evidence</h2>
      <button className="btn btn-primary" style={{ marginBottom: 16 }}>+ New Working Paper</button>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>WP#</th><th>Title</th><th>Category</th><th>Status</th>
              <th>Sheets</th><th>Last Updated</th><th>Review</th><th></th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.wp}>
                <td><strong>{p.wp}</strong></td>
                <td>{p.title}</td>
                <td><span className="badge">{p.category}</span></td>
                <td><span className={`badge ${p.status === "Completed" ? "badge-success" : p.status === "In Progress" ? "badge" : "badge-danger"}`}>{p.status}</span></td>
                <td>{p.sheets}</td>
                <td style={{ fontSize: 12 }}>{p.lastUpdated}</td>
                <td><span className={`badge ${p.reviewer === "Approved" ? "badge-success" : p.reviewer === "Pending" ? "badge" : "badge-danger"}`}>{p.reviewer}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Open</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Upload</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 8 }}>Evidence Repository</h4>
          <div style={{ display: "grid", gap: 6 }}>
            {[{ name: "Invoice_Sample_Jun2025.xlsx", size: "2.3 MB", type: "Excel" },
              { name: "Contract_Agreements.pdf", size: "5.1 MB", type: "PDF" },
              { name: "GPS_Tracking_Data.zip", size: "12.8 MB", type: "Archive" },
              { name: "Rate_Card_Comparison.xlsx", size: "1.5 MB", type: "Excel" },
            ].map((f) => (
              <div key={f.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg)", borderRadius: 6, fontSize: 13 }}>
                <span>📄 {f.name}</span>
                <span style={{ color: "var(--slate)" }}>{f.size} <span className="badge">{f.type}</span></span>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }}>+ Upload Evidence</button>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 8 }}>Review Notes</h4>
          <textarea className="input" rows={4} placeholder="Add review notes for current working paper..."
            style={{ width: "100%", marginBottom: 8 }} />
          <button className="btn btn-primary">Save Notes</button>
        </div>
      </div>
    </div>
  );
}
