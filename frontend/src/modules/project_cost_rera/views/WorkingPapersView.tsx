import { useState } from "react";

export default function WorkingPapersView() {
  const [papers] = useState([
    { id: "WP-77-01", title: "Escrow Account Reconciliation — June 2026", scope: "RERA Escrow Compliance", status: "Reviewed", reviewer: "Senior Auditor" },
    { id: "WP-77-02", title: "Budget Variance Analysis — All Projects", scope: "Cost Budget Control", status: "Draft", reviewer: "—" },
    { id: "WP-77-03", title: "Contractor Bill Certification Testing", scope: "RA-Bill Certification", status: "Reviewed", reviewer: "Audit Manager" },
    { id: "WP-77-04", title: "Fund Diversion Vouching — Q1 FY27", scope: "Fund-Diversion Detection", status: "In Progress", reviewer: "—" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Working Papers & Evidence</h3>
        <p style={{ color: "var(--slate)" }}>
          Attach evidence, tick-marks, screenshots, and track reviewer sign-off for each working paper.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Paper ID</th><th>Title</th><th>Scope Area</th><th>Status</th><th>Reviewer</th></tr></thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td>{p.title}</td>
                <td>{p.scope}</td>
                <td><span className={`badge ${p.status === "Reviewed" ? "badge-success" : p.status === "Draft" ? "badge-slate" : "badge-gold"}`}>{p.status}</span></td>
                <td>{p.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
