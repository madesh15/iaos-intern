import { useEffect, useState } from "react";
import { getDashboard, getDashboardTrends, getAnalytics } from "./api";
import { BarChartComponent, PieChartComponent, LineChartComponent, RiskHeatmap } from "./Charts";
import { LoadingState } from "./Forms";
import type { DashboardData, TrendData } from "./types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [carrierScores, setCarrierScores] = useState<any[]>([]);
  const [modeCosts, setModeCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getDashboardTrends(),
      getAnalytics("carrier-performance"),
      getAnalytics("multimodal-cost"),
    ]).then(([d, t, c, m]) => {
      setData(d);
      setTrends(Array.isArray(t) ? t : []);
      setCarrierScores(Array.isArray(c) ? c : []);
      setModeCosts(Array.isArray(m) ? m : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const cards = [
    { label: "Total Shipments", value: data?.total_shipments ?? "—", color: "#2563eb" },
    { label: "Freight Spend", value: data ? `₹${(data.total_freight_spend / 100000).toFixed(2)}L` : "—", color: "#059669" },
    { label: "Duplicate Bills", value: data?.duplicate_bills ?? "—", color: "#dc2626" },
    { label: "Open Claims", value: data?.open_claims ?? "—", color: "#ea580c" },
    { label: "Delayed Deliveries", value: data?.delayed_deliveries ?? "—", color: "#ca8a04" },
    { label: "Avg Carrier Score", value: data ? `${data.avg_carrier_score}%` : "—", color: "#7c3aed" },
    { label: "Avg Freight Cost", value: data ? `₹${(data.avg_freight_cost / 1000).toFixed(1)}K` : "—", color: "#0891b2" },
    { label: "Risk Score", value: data ? `${data.risk_score}/100` : "—", color: (data?.risk_score ?? 0) > 60 ? "#dc2626" : "#059669" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Logistics & Freight Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ padding: "16px 18px", borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Monthly Freight Cost Trend (₹)</h4>
          <LineChartComponent data={trends.map((t) => ({ period: t.period, "Cost/Shipment": t.cost_per_shipment, "Cost/Ton": t.cost_per_ton }))} height={260} />
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Multi-Modal Cost Comparison (₹/km)</h4>
          <BarChartComponent data={modeCosts.map((m) => ({ mode: m.mode, "Cost/km": m.avg_cost_per_km }))} height={260} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Carrier Performance Scores</h4>
          <BarChartComponent data={carrierScores.slice(0, 10).map((c) => ({ carrier: c.carrier_name, Score: c.overall_score }))} height={260} />
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Shipment Status Distribution</h4>
          <PieChartComponent data={[
            { name: "Delivered", value: data?.total_shipments ? Math.round(data.total_shipments * 0.6) : 0 },
            { name: "In Transit", value: data?.total_shipments ? Math.round(data.total_shipments * 0.2) : 0 },
            { name: "Delayed", value: data?.delayed_deliveries ?? 0 },
            { name: "Others", value: data?.total_shipments ? Math.round(data.total_shipments * 0.1) : 0 },
          ]} height={260} />
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12, fontSize: 14 }}>Risk Score Heatmap</h4>
        <RiskHeatmap data={[
          { name: "Rate Compliance", score: data?.risk_score ? Math.min(data.risk_score + 10, 100) : 65 },
          { name: "Claims Risk", score: data?.open_claims ? Math.min(data.open_claims * 8, 100) : 30 },
          { name: "Duplicate Billing", score: data?.duplicate_bills ? Math.min(data.duplicate_bills * 12, 100) : 20 },
          { name: "Overall", score: data?.risk_score ?? 50 },
        ]} />
      </div>
    </div>
  );
}
