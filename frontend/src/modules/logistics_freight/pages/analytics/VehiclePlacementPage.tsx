import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface PlacementRow {
  shipment_id: number; shipment_number: string;
  indent_date: string; placement_date: string; delay_days: number;
}

interface PlacementResponse {
  results: PlacementRow[]; total_shipments: number;
  avg_delay_days: number; on_time_placement: number; on_time_pct: number;
}

export default function VehiclePlacementPage() {
  const [response, setResponse] = useState<PlacementResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<PlacementResponse>(`/api/modules/${SLUG}/analytics/vehicle-placement`)
      .then(setResponse).finally(() => setLoading(false));
  }, []);

  const data = response?.results ?? [];

  return (
    <div>
      <PageHeader title="Vehicle Placement Efficiency"
        description="Analyze the gap between indent date and vehicle placement date to measure carrier response times." />

      {response && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatCard label="Total Placements" value={response.total_shipments} color="var(--navy)" />
          <StatCard label="Avg Delay (Days)" value={response.avg_delay_days.toFixed(1)} color="#ea580c" />
          <StatCard label="On-Time Placement" value={`${response.on_time_pct}%`}
            color={response.on_time_pct >= 80 ? "#059669" : "#ca8a04"} />
          <StatCard label="On-Time Count" value={response.on_time_placement} color="#059669" />
        </div>
      )}

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "indent_date", label: "Indent Date" },
          { key: "placement_date", label: "Placement Date" },
          { key: "delay_days", label: "Delay (Days)", render: (r) => (
            <span style={{ color: r.delay_days > 3 ? "var(--danger)" : r.delay_days > 1 ? "#ca8a04" : "var(--success)", fontWeight: 600 }}>
              {r.delay_days}
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No vehicle placement data available."
      />
    </div>
  );
}
