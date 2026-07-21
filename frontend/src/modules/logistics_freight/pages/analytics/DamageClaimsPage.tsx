import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface ClaimSummary {
  total_claims: number; total_value: number; total_recovered: number;
  total_pending: number; total_rejected: number; recovery_rate: number;
  by_type: Record<string, { count: number; value: number; recovered: number }>;
}

export default function DamageClaimsPage() {
  const [data, setData] = useState<ClaimSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<ClaimSummary>(`/api/modules/${SLUG}/analytics/damage-claims`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Damage & Shortage Claims Analysis"
        description="Track claim values, recovery amounts, pending settlements, and rejections across carriers." />

      {loading ? <p>Loading...</p> : data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Claims" value={data.total_claims} color="var(--navy)" />
            <StatCard label="Total Value" value={`₹${data.total_value.toLocaleString()}`} color="#dc2626" />
            <StatCard label="Recovered" value={`₹${data.total_recovered.toLocaleString()}`} color="#059669" />
            <StatCard label="Pending" value={`₹${data.total_pending.toLocaleString()}`} color="#ea580c" />
            <StatCard label="Rejected" value={`₹${data.total_rejected.toLocaleString()}`} color="#dc2626" />
            <StatCard label="Recovery Rate" value={`${data.recovery_rate}%`}
              color={data.recovery_rate > 70 ? "#059669" : data.recovery_rate > 40 ? "#ca8a04" : "#dc2626"} />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Claims by Type</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(data.by_type).map(([type, info]) => (
                <div key={type} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "var(--bg)", borderRadius: 6,
                }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{type}</strong>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "var(--slate)" }}>
                      {info.count} claims
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 12 }}>Value: <strong>₹{info.value.toLocaleString()}</strong></span>
                    <span style={{ fontSize: 12 }}>Recovered: <strong style={{ color: "#059669" }}>₹{info.recovered.toLocaleString()}</strong></span>
                  </div>
                </div>
              ))}
              {Object.keys(data.by_type).length === 0 && (
                <p style={{ color: "var(--slate)" }}>No claims data available.</p>
              )}
            </div>
          </div>
        </>
      ) : <p>No data available.</p>}
    </div>
  );
}
