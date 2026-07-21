import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface FuelRow {
  shipment_id: number; shipment_number: string;
  expected_surcharge: number; billed_surcharge: number; variance: number;
}

export default function FuelSurchargePage() {
  const [data, setData] = useState<FuelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<FuelRow[]>(`/api/modules/${SLUG}/analytics/fuel-surcharge`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const totalVariance = data.reduce((s, r) => s + Math.abs(r.variance), 0);
  const overcharged = data.filter((r) => r.variance < 0).length;

  return (
    <div>
      <PageHeader title="Fuel Surcharge Validation"
        description="Validate fuel surcharges using index-based formula to detect overcharging or undercharging by carriers." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Shipments Checked" value={data.length} color="var(--navy)" />
        <StatCard label="Total Variance" value={`₹${totalVariance.toFixed(2)}`} color="#ea580c" />
        <StatCard label="Overcharged" value={overcharged} color="#dc2626" />
        <StatCard label="Undercharged" value={data.length - overcharged} color="#059669" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "expected_surcharge", label: "Expected Surcharge", render: (r) => `₹${r.expected_surcharge.toFixed(2)}` },
          { key: "billed_surcharge", label: "Billed Surcharge", render: (r) => `₹${r.billed_surcharge.toFixed(2)}` },
          { key: "variance", label: "Variance", render: (r) => (
            <span style={{ color: r.variance < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
              {r.variance > 0 ? "+" : ""}₹{r.variance.toFixed(2)}
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No fuel surcharge data available."
      />
    </div>
  );
}
