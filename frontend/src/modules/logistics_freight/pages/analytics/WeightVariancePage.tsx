import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface WeightRow {
  shipment_id: number; shipment_number: string; actual_weight: number;
  charged_weight: number; variance_pct: number;
}

export default function WeightVariancePage() {
  const [data, setData] = useState<WeightRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<WeightRow[]>(`/api/modules/${SLUG}/analytics/weight-variance`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const avgVariance = data.length ? data.reduce((s, r) => s + Math.abs(r.variance_pct), 0) / data.length : 0;
  const totalOvercharged = data.reduce((s, r) => {
    const diff = r.charged_weight - r.actual_weight;
    return diff > 0 ? s + diff : s;
  }, 0);

  return (
    <div>
      <PageHeader title="Weight / Volume Variance"
        description="Analyze discrepancies between actual weight and charged weight to identify overcharging or billing errors." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Variance Incidents" value={data.length} color="#dc2626" />
        <StatCard label="Avg Variance %" value={`${avgVariance.toFixed(1)}%`} color="#ea580c" />
        <StatCard label="Total Overcharged (kg)" value={totalOvercharged.toFixed(0)} color="#ca8a04" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "actual_weight", label: "Actual Weight (kg)", render: (r) => r.actual_weight.toFixed(1) },
          { key: "charged_weight", label: "Charged Weight (kg)", render: (r) => r.charged_weight.toFixed(1) },
          { key: "variance_pct", label: "Variance %", render: (r) => (
            <span className={`badge ${Math.abs(r.variance_pct) > 20 ? "badge-danger" : "badge"}`}>
              {r.variance_pct > 0 ? "+" : ""}{r.variance_pct.toFixed(1)}%
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No significant weight variances detected."
      />
    </div>
  );
}
