import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface RouteRow {
  shipment_id: number; shipment_number: string; expected_distance: number;
  actual_distance: number; variance_pct: number;
}

export default function RouteDistancePage() {
  const [data, setData] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<RouteRow[]>(`/api/modules/${SLUG}/analytics/route-distance`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const totalInflatedKm = data.reduce((s, r) => s + (r.actual_distance - r.expected_distance), 0);

  return (
    <div>
      <PageHeader title="Route & Distance Analytics"
        description="Compare expected vs actual distances to detect inflated routes, detours, and billing discrepancies." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Route Violations" value={data.length} color="#ea580c" />
        <StatCard label="Total Inflated Distance" value={`${totalInflatedKm.toFixed(0)} km`} color="#dc2626" />
        <StatCard label="Avg Route Variance" value={data.length ? `${(data.reduce((s, r) => s + r.variance_pct, 0) / data.length).toFixed(1)}%` : "0%"} color="#ca8a04" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "expected_distance", label: "Expected (km)", render: (r) => r.expected_distance.toFixed(0) },
          { key: "actual_distance", label: "Actual (km)", render: (r) => r.actual_distance.toFixed(0) },
          { key: "variance_pct", label: "Variance %", render: (r) => (
            <span className={`badge ${r.variance_pct > 20 ? "badge-danger" : "badge"}`}>
              +{r.variance_pct.toFixed(1)}%
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No route distance anomalies detected."
      />
    </div>
  );
}
