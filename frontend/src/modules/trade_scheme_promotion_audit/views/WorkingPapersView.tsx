import { useState } from "react";

export default function WorkingPapersView() {
  const [papers] = useState([
    { ref: "WP-72-01", name: "Trade scheme governance walkthrough — approval workflow review", author: "Internal Audit Team", signedOff: true, reviewer: "L. Vance" },
    { ref: "WP-72-02", name: "Distributor claim settlement sample testing — 150 claims verified", author: "Trade Finance Auditor", signedOff: true, reviewer: "K. Mehta" },
    { ref: "WP-72-03", name: "Ghost outlet physical verification — field visit documentation", author: "Field Audit Lead", signedOff: false, reviewer: "Pending" },
    { ref: "WP-72-04", name: "Accrual vs actual variance analysis — Q2 FY26 reconciliation", author: "Trade Finance Controller", signedOff: false, reviewer: "Pending" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Working Papers & Evidence Registry</h3>
        <p style={{ color: "var(--slate)" }}>
          Attach claim-testing sheets, outlet verification photos, scheme approval workflows and reviewer sign-offs to document audit execution.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Paper Ref</th>
              <th>Document Name</th>
              <th>Prepared By</th>
              <th>Review Sign-off</th>
              <th>Signed By</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.ref}>
                <td><strong>{p.ref}</strong></td>
                <td>{p.name}</td>
                <td>{p.author}</td>
                <td>
                  <span className={`badge ${p.signedOff ? "badge-success" : "badge-gold"}`}>
                    {p.signedOff ? "Completed" : "Draft"}
                  </span>
                </td>
                <td>{p.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
