import { useState } from "react";

export default function ScopeUniverseView() {
  const [entities] = useState([
    { code: "ENT-RE-01", name: "RERA Escrow Account Reconciliation", type: "Financial Control", riskRating: "High", controlOwner: "Finance Head" },
    { code: "ENT-RE-02", name: "Project Cost Budget Approval Workflow", type: "Cost Control", riskRating: "Medium", controlOwner: "Project Director" },
    { code: "ENT-RE-03", name: "Buyer Collection & Demand Notes", type: "Revenue Cycle", riskRating: "Medium", controlOwner: "Sales Lead" },
    { code: "ENT-RE-04", name: "Contractor Bill Certification", type: "Procurement", riskRating: "High", controlOwner: "Contracts Manager" },
    { code: "ENT-RE-05", name: "Statutory Approvals & RERA Registration", type: "Compliance", riskRating: "High", controlOwner: "Legal Head" },
    { code: "ENT-RE-06", name: "Land Title & Encumbrance Register", type: "Asset Governance", riskRating: "Critical", controlOwner: "Legal Head" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scope & Audit Universe</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines auditable units, processes, and entities in scope for Project Cost & RERA Compliance.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity Code</th><th>Auditable Unit / Process</th><th>Type</th><th>Risk Profile</th><th>Owner</th></tr></thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.code}>
                <td><strong>{e.code}</strong></td>
                <td>{e.name}</td>
                <td>{e.type}</td>
                <td><span className={`badge ${e.riskRating === "Critical" ? "badge-danger" : e.riskRating === "High" ? "badge-gold" : "badge-success"}`}>{e.riskRating}</span></td>
                <td>{e.controlOwner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
