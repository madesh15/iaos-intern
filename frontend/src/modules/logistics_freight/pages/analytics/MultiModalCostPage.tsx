import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface ModeCost {
  mode: string; shipment_count: number; total_cost: number;
  avg_cost_per_km: number; avg_cost_per_kg: number;
}

export default function MultiModalCostPage() {
  const [data, setData] = useState<ModeCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<ModeCost[]>(`/api/modules/${SLUG}/analytics/multimodal-cost`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const cheapest = data.length ? data.reduce((a, b) => a.avg_cost_per_km < b.avg_cost_per_km ? a : b) : null;
  const costliest = data.length ? data.reduce((a, b) => a.avg_cost_per_km > b.avg_cost_per_km ? a : b) : null;

  return (
    <div>
      <PageHeader title="Multi-Modal Cost Comparison"
        description="Compare freight costs across Road, Rail, Sea, and Air modes to identify the most cost-effective transport option." />

      {cheapest && costliest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatCard label="Cheapest Mode" value={cheapest.mode} color="#059669" icon="💰" />
          <StatCard label="Avg Cost/km" value={`₹${cheapest.avg_cost_per_km.toFixed(2)}`} color="#059669" />
          <StatCard label="Costliest Mode" value={costliest.mode} color="#dc2626" icon="⚠" />
          <StatCard label="Avg Cost/km" value={`₹${costliest.avg_cost_per_km.toFixed(2)}`} color="#dc2626" />
        </div>
      )}

      <DataTable
        columns={[
          { key: "mode", label: "Transport Mode", render: (r) => <strong>{r.mode}</strong> },
          { key: "shipment_count", label: "Shipments" },
          { key: "total_cost", label: "Total Cost", render: (r) => `₹${r.total_cost.toLocaleString()}` },
          { key: "avg_cost_per_km", label: "Avg Cost/km", render: (r) => `₹${r.avg_cost_per_km.toFixed(2)}` },
          { key: "avg_cost_per_kg", label: "Avg Cost/kg", render: (r) => `₹${r.avg_cost_per_kg.toFixed(2)}` },
        ]}
        data={data}
        loading={loading}
        emptyMessage="No multi-modal cost data available."
      />
    </div>
  );
}
