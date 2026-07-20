import { useState } from "react";

const ruleCategories = [
  { name: "Rate Compliance", count: 3, rules: ["Contract vs Billed Rate > 5%", "Minimum Charge Verification", "Volume Discount Application"] },
  { name: "Weight/Volume", count: 2, rules: ["Actual vs Charged Weight Variance > 10%", "Density Check (kg/CBM)"] },
  { name: "Route Distance", count: 2, rules: ["Expected vs Actual Distance > 10%", "Geo-fence Breach Detection"] },
  { name: "Duplicate Detection", count: 3, rules: ["Duplicate Invoice Number", "Duplicate LR Number", "Duplicate Shipment- Amount Match"] },
  { name: "Fuel Surcharge", count: 2, rules: ["Index-based Surcharge Validation", "Surcharge % vs Contract Rate Comparison"] },
  { name: "Transit SLA", count: 2, rules: ["Expected vs Actual Delivery Date", "Mode-wise SLA Compliance"] },
  { name: "Carrier Performance", count: 3, rules: ["On-Time Delivery % < 80%", "Damage % > 5%", "Claim Ratio > 3%"] },
  { name: "Detention", count: 2, rules: ["Avoidable Detention Identification", "Free Time Exceeded Alert"] },
];

export default function TestRulePage() {
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Test & Analytics Rule Library</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {ruleCategories.map((cat, i) => (
          <button key={cat.name} className={`btn ${i === activeCat ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={() => setActiveCat(i)}>
            {cat.name} ({cat.count})
          </button>
        ))}
        <button className="btn btn-primary" style={{ marginLeft: "auto" }}>+ New Rule</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>{ruleCategories[activeCat].name} — Test Rules</h4>
        {ruleCategories[activeCat].rules.map((rule, i) => (
          <div key={i} style={{
            padding: "12px 16px", marginBottom: 8, background: "var(--bg)", borderRadius: 6,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{rule}</div>
              <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 2 }}>
                Last run: {["Today", "Yesterday", "3 days ago"][i % 3]}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 12 }}>Run Test</button>
              <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Edit</button>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input type="checkbox" defaultChecked /> Auto
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Test Execution Summary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[{ label: "Tests Passed", value: 12, color: "#059669" },
            { label: "Tests Failed", value: 3, color: "#dc2626" },
            { label: "Tests Pending", value: 4, color: "#ca8a04" },
            { label: "Exception Rate", value: "20%", color: "var(--navy)" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: 12, background: "var(--bg)", borderRadius: 6 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
