import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "logistics_freight";

const TABS = [
  "Rate Compliance", "Weight Variance", "Route Distance", "Detention",
  "Carrier Performance", "Duplicate Billing", "Multi-Modal Cost", "Fuel Surcharge",
  "Empty Return", "LR/POD Match", "Provision Accuracy", "Transit SLA",
  "Damage Claims", "Vehicle Placement", "Cost Trends",
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    "rate-compliance", "weight-variance", "route-distance", "detention",
    "carrier-performance", "duplicate-billing", "multimodal-cost", "fuel-surcharge",
    "empty-return", "lr-pod-match", "provision-accuracy", "transit-sla",
    "damage-claims", "vehicle-placement", "cost-trends",
  ];

  useEffect(() => {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/analytics/${endpoints[tab]}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Audit Analytics</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button key={t} className={`btn ${i === tab ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 20, minHeight: 300 }}>
        <h3 style={{ marginBottom: 14, color: "var(--navy)" }}>{TABS[tab]}</h3>
        {loading ? <p>Loading analytics…</p> : (
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            {Array.isArray(data) ? (
              data.length === 0 ? <p>No exceptions found. All clear.</p> :
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((k) => <th key={k}>{k.replace(/_/g, " ")}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row: any, i: number) => (
                    <tr key={i}>
                      {Object.values(row).map((v: any, j: number) => (
                        <td key={j}>{typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : data && typeof data === "object" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {Object.entries(data).filter(([k]) => k !== "results").map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase" }}>{k.replace(/_/g, " ")}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : String(v)}
                      {k.includes("pct") || k.includes("rate") || k.includes("compliance") ? "%" : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>No data available.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
