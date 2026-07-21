import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface EmptyReturnData {
  total_trips: number; return_trips: number; utilization_pct: number;
}

export default function EmptyReturnPage() {
  const [data, setData] = useState<EmptyReturnData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<EmptyReturnData>(`/api/modules/${SLUG}/analytics/empty-return`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Empty Return / Backhaul Analysis"
        description="Analyze return-trip utilization to identify empty backhaul inefficiencies and cost optimization opportunities." />

      {loading ? <p>Loading...</p> : data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Trips" value={data.total_trips} color="var(--navy)" />
            <StatCard label="Return Trips" value={data.return_trips} color="#ea580c" />
            <StatCard label="Utilization %" value={`${data.utilization_pct}%`}
              color={data.utilization_pct < 70 ? "#dc2626" : data.utilization_pct < 85 ? "#ca8a04" : "#059669"} />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Efficiency Assessment</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Effective Utilized Trips", value: data.total_trips - data.return_trips, color: "#059669" },
                { label: "Empty/Low-Utilization Returns", value: data.return_trips, color: "#dc2626" },
                { label: "Potential Savings Opportunity", value: data.return_trips > 0 ? "High - Consider backhaul matching" : "Low - Good utilization", color: data.return_trips > 0 ? "#ea580c" : "#059669" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 14px", background: "var(--bg)", borderRadius: 6, fontSize: 13,
                }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : <p>No data available.</p>}
    </div>
  );
}
