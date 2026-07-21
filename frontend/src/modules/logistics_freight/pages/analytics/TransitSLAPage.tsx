import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface SLARow {
  shipment_id: number; shipment_number: string;
  expected_delivery: string; actual_delivery: string | null;
  delay_days: number; sla_breached: boolean;
}

interface SLAResponse {
  results: SLARow[]; total_shipments: number;
  breached_count: number; sla_compliance_pct: number;
}

export default function TransitSLAPage() {
  const [response, setResponse] = useState<SLAResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<SLAResponse>(`/api/modules/${SLUG}/analytics/transit-sla`)
      .then(setResponse).finally(() => setLoading(false));
  }, []);

  const data = response?.results ?? [];

  return (
    <div>
      <PageHeader title="Transit-Time SLA Compliance"
        description="Monitor expected vs actual delivery dates to identify SLA breaches and carrier performance issues." />

      {response && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatCard label="Total Shipments" value={response.total_shipments} color="var(--navy)" />
          <StatCard label="SLA Compliance" value={`${response.sla_compliance_pct}%`}
            color={response.sla_compliance_pct >= 90 ? "#059669" : response.sla_compliance_pct >= 75 ? "#ca8a04" : "#dc2626"} />
          <StatCard label="SLA Breaches" value={response.breached_count} color="#dc2626" />
        </div>
      )}

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "expected_delivery", label: "Expected Delivery" },
          { key: "actual_delivery", label: "Actual Delivery", render: (r) => r.actual_delivery || "—" },
          { key: "delay_days", label: "Delay (Days)", render: (r) => (
            <span style={{ color: r.delay_days > 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
              {r.delay_days > 0 ? `+${r.delay_days}` : r.delay_days}
            </span>
          )},
          { key: "sla_breached", label: "SLA Status", render: (r) => (
            <span className={`badge ${r.sla_breached ? "badge-danger" : "badge-success"}`}>
              {r.sla_breached ? "Breached" : "Compliant"}
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No transit SLA data available."
      />
    </div>
  );
}
