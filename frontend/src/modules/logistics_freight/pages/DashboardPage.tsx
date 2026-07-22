import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "logistics_freight";

interface DashboardData {
  total_shipments: number;
  total_freight_spend: number;
  duplicate_bills: number;
  open_claims: number;
  delayed_deliveries: number;
  avg_carrier_score: number;
  avg_freight_cost: number;
  risk_score: number;
  total_contracts: number;
  active_carriers: number;
  pending_invoices: number;
  total_findings: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    get<DashboardData>(`/api/modules/${SLUG}/dashboard`).then(setData);
  }, []);

  const cards = [
    { label: "Total Shipments", value: data?.total_shipments ?? "—", color: "#2563eb" },
    { label: "Freight Spend", value: data ? `₹${(data.total_freight_spend / 1000).toFixed(0)}K` : "—", color: "#059669" },
    { label: "Duplicate Bills", value: data?.duplicate_bills ?? "—", color: "#dc2626" },
    { label: "Open Claims", value: data?.open_claims ?? "—", color: "#ea580c" },
    { label: "Delayed Deliveries", value: data?.delayed_deliveries ?? "—", color: "#ca8a04" },
    { label: "Carrier Score", value: data ? `${data.avg_carrier_score}%` : "—", color: "#7c3aed" },
    { label: "Avg Freight Cost", value: data ? `₹${(data.avg_freight_cost / 1000).toFixed(1)}K` : "—", color: "#0891b2" },
    { label: "Risk Score", value: data ? `${data.risk_score}/100` : "—", color: data?.risk_score && data.risk_score > 60 ? "#dc2626" : "#059669" },
  ];

  const secondaryCards = [
    { label: "Active Contracts", value: data?.total_contracts ?? "—" },
    { label: "Active Carriers", value: data?.active_carriers ?? "—" },
    { label: "Pending Invoices", value: data?.pending_invoices ?? "—" },
    { label: "Total Findings", value: data?.total_findings ?? "—" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Logistics & Freight Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ padding: "16px 18px", borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {secondaryCards.map((card) => (
          <div key={card.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "var(--slate)" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12 }}>Quick Actions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Review Duplicate Bills", path: "/analytics" },
              { label: "Check Open Claims", path: "/claims" },
              { label: "Run Rate Compliance Check", path: "/analytics" },
              { label: "Export Audit Report", path: "/reports" },
              { label: "Review SLA Breaches", path: "/analytics" },
            ].map((a) => (
              <div key={a.label} style={{
                padding: "10px 14px", background: "var(--bg)", borderRadius: 6,
                cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>→</span> {a.label}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12 }}>Recent Findings</h4>
          {[
            { sev: "High", text: "Freight Overbilling Detected - ₹45K impact", color: "#dc2626" },
            { sev: "Med", text: "Excessive Detention Charges - ₹8.8K avoidable", color: "#ca8a04" },
            { sev: "Med", text: "Route Inflation on Mumbai-Chennai Route", color: "#ca8a04" },
            { sev: "High", text: "Duplicate Invoice Detection - ₹95K under review", color: "#dc2626" },
          ].map((f, i) => (
            <div key={i} style={{
              padding: "8px 12px", marginBottom: 6, background: "var(--bg)", borderRadius: 6,
              fontSize: 13, borderLeft: `3px solid ${f.color}`,
            }}>
              <span style={{
                display: "inline-block", padding: "1px 6px", borderRadius: 3,
                background: f.color, color: "#fff", fontSize: 10, marginRight: 8,
              }}>{f.sev}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
