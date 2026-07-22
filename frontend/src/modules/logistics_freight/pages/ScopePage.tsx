import { useState } from "react";

export default function ScopePage() {
  const [activeYear, setActiveYear] = useState("2025-26");

  const entities = [
    { name: "Speed Logistics Ltd", risk: "Medium", shipments: 450, spend: "₹28.5M", lastAudit: "Jan 2025" },
    { name: "Cargo Express Pvt", risk: "High", shipments: 320, spend: "₹22.1M", lastAudit: "Mar 2024" },
    { name: "Rail Freight Corp", risk: "Low", shipments: 180, spend: "₹15.2M", lastAudit: "Jun 2025" },
    { name: "SeaLine Shipping", risk: "Medium", shipments: 95, spend: "₹12.8M", lastAudit: "Nov 2024" },
    { name: "AirSpeed Couriers", risk: "Low", shipments: 210, spend: "₹18.6M", lastAudit: "Feb 2025" },
    { name: "TransGoods Movers", risk: "High", shipments: 65, spend: "₹4.2M", lastAudit: "Aug 2023" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Scope & Audit Universe</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select className="input" value={activeYear} onChange={(e) => setActiveYear(e.target.value)} style={{ maxWidth: 200 }}>
          <option>2025-26</option><option>2024-25</option><option>2023-24</option>
        </select>
        <button className="btn btn-primary">Define Scope</button>
        <button className="btn btn-ghost">Risk Assessment</button>
      </div>

      <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          Audit Universe — {activeYear}
        </div>
        <table>
          <thead>
            <tr>
              <th>Entity / Carrier</th><th>Risk Level</th><th>Shipments</th>
              <th>Freight Spend</th><th>Last Audited</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.name}>
                <td><strong>{e.name}</strong></td>
                <td><span className={`badge ${e.risk === "High" ? "badge-danger" : e.risk === "Medium" ? "badge" : "badge-success"}`}>{e.risk}</span></td>
                <td>{e.shipments}</td><td>{e.spend}</td><td>{e.lastAudit}</td>
                <td><button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Include</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 8 }}>Scope Definition</h4>
          <div className="field"><label>Audit Period</label><input className="input" type="text" defaultValue="Q1-Q2 FY 2025-26" /></div>
          <div className="field"><label>Scope Coverage</label><select className="input"><option>Full Audit</option><option>Limited Review</option><option>Targeted Testing</option></select></div>
          <div className="field"><label>Materiality Threshold</label><input className="input" type="text" defaultValue="₹500,000" /></div>
          <div className="field"><label><input type="checkbox" defaultChecked style={{ marginRight: 8 }} />Include inter-company transactions</label></div>
          <div className="field"><label><input type="checkbox" defaultChecked style={{ marginRight: 8 }} />Include fuel surcharge review</label></div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 8 }}>Risk Assessment Summary</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {[{ level: "High Risk Entities", count: 2, color: "#dc2626" },
              { level: "Medium Risk Entities", count: 2, color: "#ca8a04" },
              { level: "Low Risk Entities", count: 2, color: "#059669" },
              { level: "Total Audit Hours Est.", count: "320 hrs", color: "var(--navy)" },
            ].map((r) => (
              <div key={r.level} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg)", borderRadius: 6 }}>
                <span style={{ fontSize: 13 }}>{r.level}</span>
                <span style={{ fontWeight: 700, color: r.color }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
