import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface TrendRow {
  period: string; shipment_count: number; total_cost: number;
  cost_per_shipment: number; cost_per_ton: number; cost_per_km: number;
}

export default function CostTrendPage() {
  const [data, setData] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<TrendRow[]>(`/api/modules/${SLUG}/analytics/cost-trends`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const latest = data[data.length - 1];
  const earliest = data[0];
  const costTrend = latest && earliest
    ? ((latest.cost_per_shipment - earliest.cost_per_shipment) / earliest.cost_per_shipment * 100)
    : 0;

  return (
    <div>
      <PageHeader title="Freight Cost per Unit Trend"
        description="Monthly trend analysis of freight costs per ton, per shipment, and per kilometer to monitor cost efficiency over time." />

      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatCard label="Latest Period" value={latest.period} color="var(--navy)" />
          <StatCard label="Cost/Shipment" value={`₹${latest.cost_per_shipment.toLocaleString()}`} color="#0891b2" />
          <StatCard label="Cost/Ton" value={`₹${latest.cost_per_ton.toLocaleString()}`} color="#059669" />
          <StatCard label="Cost/km" value={`₹${latest.cost_per_km.toFixed(2)}`} color="#7c3aed" />
          <StatCard label="Cost Trend" value={`${costTrend >= 0 ? "+" : ""}${costTrend.toFixed(1)}%`}
            color={costTrend > 5 ? "#dc2626" : costTrend < -5 ? "#059669" : "#ca8a04"} />
        </div>
      )}

      <DataTable
        columns={[
          { key: "period", label: "Period", render: (r) => <strong>{r.period}</strong> },
          { key: "shipment_count", label: "Shipments" },
          { key: "total_cost", label: "Total Cost", render: (r) => `₹${r.total_cost.toLocaleString()}` },
          { key: "cost_per_shipment", label: "Cost/Shipment", render: (r) => `₹${r.cost_per_shipment.toLocaleString()}` },
          { key: "cost_per_ton", label: "Cost/Ton", render: (r) => `₹${r.cost_per_ton.toLocaleString()}` },
          { key: "cost_per_km", label: "Cost/km", render: (r) => `₹${r.cost_per_km.toFixed(2)}` },
        ]}
        data={data}
        loading={loading}
        emptyMessage="No cost trend data available."
      />
    </div>
  );
}
