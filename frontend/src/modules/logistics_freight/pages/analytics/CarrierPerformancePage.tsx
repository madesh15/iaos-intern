import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface CarrierScore {
  carrier_id: number; carrier_name: string; on_time_pct: number;
  damage_pct: number; claim_pct: number; delay_pct: number; overall_score: number;
}

export default function CarrierPerformancePage() {
  const [data, setData] = useState<CarrierScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<CarrierScore[]>(`/api/modules/${SLUG}/analytics/carrier-performance`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const avgScore = data.length ? data.reduce((s, r) => s + r.overall_score, 0) / data.length : 0;
  const topCarrier = data.length ? data.reduce((best, r) => r.overall_score > best.overall_score ? r : best, data[0]) : null;
  const lowCarrier = data.length ? data.reduce((worst, r) => r.overall_score < worst.overall_score ? r : worst, data[0]) : null;

  return (
    <div>
      <PageHeader title="Carrier Performance Scoring"
        description="Evaluate carrier performance based on on-time delivery, damage rates, claim ratios, and delays." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Avg Performance Score" value={`${avgScore.toFixed(1)}%`} color="#0891b2" />
        {topCarrier && <StatCard label="Top Performer" value={topCarrier.carrier_name} color="#059669" icon="🏆" />}
        {lowCarrier && <StatCard label="Needs Improvement" value={lowCarrier.carrier_name} color="#dc2626" icon="⚠" />}
        <StatCard label="Carriers Evaluated" value={data.length} color="var(--navy)" />
      </div>

      <DataTable
        columns={[
          { key: "carrier_name", label: "Carrier Name" },
          { key: "on_time_pct", label: "On-Time %", render: (r) => <span style={{ color: r.on_time_pct > 85 ? "#059669" : "#dc2626" }}>{r.on_time_pct}%</span> },
          { key: "damage_pct", label: "Damage %", render: (r) => <span style={{ color: r.damage_pct > 5 ? "#dc2626" : "#059669" }}>{r.damage_pct}%</span> },
          { key: "claim_pct", label: "Claim %", render: (r) => <span style={{ color: r.claim_pct > 3 ? "#dc2626" : "#059669" }}>{r.claim_pct}%</span> },
          { key: "delay_pct", label: "Delay %", render: (r) => <span style={{ color: r.delay_pct > 15 ? "#dc2626" : "#059669" }}>{r.delay_pct}%</span> },
          { key: "overall_score", label: "Overall Score", render: (r) => {
            const color = r.overall_score >= 80 ? "#059669" : r.overall_score >= 60 ? "#ca8a04" : "#dc2626";
            return <strong style={{ color, fontSize: 15 }}>{r.overall_score.toFixed(1)}</strong>;
          }},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No carrier performance data available."
      />
    </div>
  );
}
