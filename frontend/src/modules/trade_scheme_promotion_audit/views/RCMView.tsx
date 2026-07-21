import { useState } from "react";

export default function RCMView() {
  const [rcm] = useState([
    { id: "R-72-1", risk: "Duplicate or inflated trade-claims result in overpayment", control: "Automated claim-deduplication engine cross-references distributor + scheme + period", type: "Preventive", owner: "Trade Finance Controller" },
    { id: "R-72-2", risk: "Ghost outlets receive fictitious scheme payouts", control: "Geo-tagged outlet verification and physical audit sampling", type: "Detective", owner: "Field Audit Lead" },
    { id: "R-72-3", risk: "Scheme overlaps cause double-benefit to distributors", control: "Scheme- overlap detection rules flag concurrent validity periods", type: "Preventive", owner: "Trade Marketing Lead" },
    { id: "R-72-4", risk: "Accrual provisions materially differ from actual payouts", control: "Monthly accrual-to-actual reconciliation with variance threshold alerts", type: "Detective", owner: "Trade Finance Controller" },
    { id: "R-72-5", risk: "Display/visibility claims submitted without physical verification", control: "Photographic proof-of-display and field merchandiser sign-off", type: "Preventive", owner: "Merchandising Manager" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Risk & Control Matrix (RCM)</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists the critical control matrix for Trade Scheme & Promotion Audit, linking trade-spend risks to active mitigations and owners.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Risk Description</th>
              <th>Mitigating Control Activity</th>
              <th>Control Type</th>
              <th>Control Owner</th>
            </tr>
          </thead>
          <tbody>
            {rcm.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.risk}</td>
                <td>{r.control}</td>
                <td><span className="badge badge-slate">{r.type}</span></td>
                <td>{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
