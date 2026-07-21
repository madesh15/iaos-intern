import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface DetentionData {
  total_detention_amount: number; avoidable_amount: number;
  avoidable_pct: number; total_hours: number; chargeable_hours: number;
  shipments_with_charges: number;
}

export default function DetentionDemurragePage() {
  const [data, setData] = useState<DetentionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<DetentionData>(`/api/modules/${SLUG}/analytics/detention`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Detention & Demurrage Analysis"
        description="Analyze holding charges, identify avoidable detention costs, and review free time utilization across shipments." />

      {loading ? <p>Loading...</p> : data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Detention Amount" value={`₹${data.total_detention_amount.toLocaleString()}`} color="#dc2626" />
            <StatCard label="Avoidable Amount" value={`₹${data.avoidable_amount.toLocaleString()}`} color="#ea580c" />
            <StatCard label="Avoidable %" value={`${data.avoidable_pct}%`} color="#ca8a04" />
            <StatCard label="Total Hours" value={data.total_hours} color="var(--navy)" />
            <StatCard label="Chargeable Hours" value={data.chargeable_hours} color="#059669" />
            <StatCard label="Shipments Affected" value={data.shipments_with_charges} color="#0891b2" />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Detention Summary</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Total Detention Incurred", value: `₹${data.total_detention_amount.toLocaleString()}`, color: "#dc2626" },
                { label: "Potentially Avoidable", value: `₹${data.avoidable_amount.toLocaleString()} (${data.avoidable_pct}%)`, color: "#ea580c" },
                { label: "Net Unavoidable", value: `₹${(data.total_detention_amount - data.avoidable_amount).toLocaleString()}`, color: "#059669" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "var(--bg)", borderRadius: 6,
                }}>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color, fontSize: 15 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : <p>No data available.</p>}
    </div>
  );
}
