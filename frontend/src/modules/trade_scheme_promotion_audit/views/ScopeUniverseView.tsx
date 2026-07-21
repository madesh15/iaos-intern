import { useState } from "react";

export default function ScopeUniverseView() {
  const [entities] = useState([
    { code: "ENT-TS-01", name: "Modern Trade Chain Accounts (Top 50)", type: "Channel", riskRating: "High", controlOwner: "Trade Marketing Lead" },
    { code: "ENT-TS-02", name: "General Trade Distributor Network", type: "Channel", riskRating: "Medium", controlOwner: "Regional Sales Mgr" },
    { code: "ENT-TS-03", name: "E-Commerce Marketplace Promotions", type: "Channel", riskRating: "High", controlOwner: "Digital Commerce Head" },
    { code: "ENT-TS-04", name: "HoReCa & Institutional Segment", type: "Channel", riskRating: "Medium", controlOwner: "Institutional Sales Lead" },
    { code: "ENT-TS-05", name: "Free-Goods & Sampling Programs", type: "Process", riskRating: "High", controlOwner: "Trade Finance Controller" },
    { code: "ENT-TS-06", name: "Display & Visibility Merchandising", type: "Process", riskRating: "Medium", controlOwner: "Merchandising Manager" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scope & Audit Universe</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the auditable channels, processes, and trade entities in scope for Trade Scheme & Promotion Audit.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Entity Code</th>
              <th>Auditable Unit / Process</th>
              <th>Scope Type</th>
              <th>Risk Profile</th>
              <th>Control Owner</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.code}>
                <td><strong>{e.code}</strong></td>
                <td>{e.name}</td>
                <td><span className="badge badge-slate">{e.type}</span></td>
                <td>
                  <span className={`badge ${e.riskRating === "High" ? "badge-danger" : "badge-gold"}`}>
                    {e.riskRating}
                  </span>
                </td>
                <td>{e.controlOwner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
