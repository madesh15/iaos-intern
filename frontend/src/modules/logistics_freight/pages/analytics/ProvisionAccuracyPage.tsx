import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface ProvisionRow {
  shipment_id: number; shipment_number: string;
  accrued_freight: number; actual_freight: number; variance: number; variance_pct: number;
}

export default function ProvisionAccuracyPage() {
  const [data, setData] = useState<ProvisionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<ProvisionRow[]>(`/api/modules/${SLUG}/analytics/provision-accuracy`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const totalVariance = data.reduce((s, r) => s + Math.abs(r.variance), 0);

  return (
    <div>
      <PageHeader title="Freight Provision Accuracy"
        description="Compare accrued freight provisions against actual invoices to assess provisioning accuracy and identify gaps." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Shipments Reviewed" value={data.length} color="var(--navy)" />
        <StatCard label="Total Variance" value={`₹${totalVariance.toLocaleString()}`} color="#ea580c" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "accrued_freight", label: "Accrued (₹)", render: (r) => `₹${r.accrued_freight.toLocaleString()}` },
          { key: "actual_freight", label: "Actual (₹)", render: (r) => `₹${r.actual_freight.toLocaleString()}` },
          { key: "variance", label: "Variance (₹)", render: (r) => (
            <span style={{ color: Math.abs(r.variance) > 5000 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
              {r.variance > 0 ? "+" : ""}₹{r.variance.toLocaleString()}
            </span>
          )},
          { key: "variance_pct", label: "Variance %", render: (r) => (
            <span className={`badge ${Math.abs(r.variance_pct) > 15 ? "badge-danger" : Math.abs(r.variance_pct) > 5 ? "badge" : "badge-success"}`}>
              {r.variance_pct.toFixed(1)}%
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No provision data available."
      />
    </div>
  );
}
