import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface OverbillingRow {
  shipment_id: number; shipment_number: string; contract_rate: number;
  billed_rate: number; difference: number; overbilling_pct: number;
}

export default function RateCompliancePage() {
  const [data, setData] = useState<OverbillingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<OverbillingRow[]>(`/api/modules/${SLUG}/analytics/rate-compliance`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const totalOverbilling = data.reduce((s, r) => s + r.difference, 0);
  const avgOverbillingPct = data.length
    ? data.reduce((s, r) => s + r.overbilling_pct, 0) / data.length
    : 0;

  return (
    <div>
      <PageHeader title="Freight Rate-Contract Compliance"
        description="Compare contract rates vs billed rates to identify overbilling and rate violations across carriers.">
        <span className="badge" style={{ alignSelf: "center", fontSize: 12 }}>{data.length} violations</span>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => window.open(`/api/modules/${SLUG}/export/shipments/csv`, "_blank")}>
          Export CSV
        </button>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Overbilling Incidents" value={data.length} color="#dc2626" />
        <StatCard label="Total Overbilled Amount" value={`₹${totalOverbilling.toLocaleString()}`} color="#dc2626" />
        <StatCard label="Avg Overbilling %" value={`${avgOverbillingPct.toFixed(1)}%`} color="#ea580c" />
        <StatCard label="At-Risk Shipments" value={data.filter((r) => r.overbilling_pct > 20).length} color="#ca8a04" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "contract_rate", label: "Contract Rate", render: (r) => `₹${r.contract_rate.toFixed(2)}` },
          { key: "billed_rate", label: "Billed Rate", render: (r) => `₹${r.billed_rate.toFixed(2)}` },
          { key: "difference", label: "Difference", render: (r) => <span style={{ color: "var(--danger)", fontWeight: 600 }}>₹{r.difference.toFixed(2)}</span> },
          { key: "overbilling_pct", label: "Overbilling %", render: (r) => (
            <span className={`badge ${r.overbilling_pct > 20 ? "badge-danger" : r.overbilling_pct > 10 ? "badge" : "badge-success"}`}>
              {r.overbilling_pct.toFixed(1)}%
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No rate compliance violations found. All clear."
      />
    </div>
  );
}
