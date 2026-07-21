import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

const SLUG = "logistics_freight";

interface KPI {
  id: number; kpi_name: string; kpi_value: number;
  kpi_category: string; period: string;
  period_start: string; period_end: string;
}

interface DashboardData {
  total_shipments: number; total_freight_spend: number;
  duplicate_bills: number; open_claims: number;
  delayed_deliveries: number; avg_carrier_score: number;
  avg_freight_cost: number; risk_score: number;
  total_contracts: number; active_carriers: number;
  pending_invoices: number; total_findings: number;
}

export default function ModuleDashboardKPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      get<any>(`/api/modules/${SLUG}/kpis?category=${categoryFilter}`),
      get<DashboardData>(`/api/modules/${SLUG}/dashboard`),
    ]).then(([kpiRes, dash]) => {
      setKpis(kpiRes.items ?? []);
      setSummary(dash);
    }).finally(() => setLoading(false));
  }, [categoryFilter]);

  return (
    <div>
      <PageHeader title="Module Dashboard & KPIs"
        description="Key performance indicators and metrics dashboard for the Logistics & Freight audit module." />

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Risk Score" value={`${summary.risk_score}/100`}
            color={summary.risk_score > 60 ? "#dc2626" : "#059669"} />
          <StatCard label="Total Shipments" value={summary.total_shipments} color="var(--navy)" />
          <StatCard label="Freight Spend" value={`₹${(summary.total_freight_spend / 1e6).toFixed(2)}M`} color="#0891b2" />
          <StatCard label="Open Claims" value={summary.open_claims} color="#ea580c" />
          <StatCard label="Duplicate Bills" value={summary.duplicate_bills} color="#dc2626" />
          <StatCard label="Avg Carrier Score" value={`${summary.avg_carrier_score}%`} color="#7c3aed" />
          <StatCard label="Active Carriers" value={summary.active_carriers} color="#059669" />
          <StatCard label="Total Findings" value={summary.total_findings} color="#ca8a04" />
        </div>
      )}

      <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>KPI Category:</strong>
        {["", "Volume", "Cost", "Service", "Risk"].map((cat) => (
          <button key={cat} className={`btn ${categoryFilter === cat ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 12, padding: "4px 10px" }}
            onClick={() => setCategoryFilter(cat)}>
            {cat || "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "kpi_name", label: "KPI Name", render: (r) => <strong>{r.kpi_name}</strong> },
          { key: "kpi_value", label: "Value", render: (r) => {
            const isPct = r.kpi_name.includes("%") || r.kpi_name.includes("Rate");
            return <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{r.kpi_value}{isPct ? "%" : ""}</span>;
          }},
          { key: "kpi_category", label: "Category", render: (r) => <span className="badge">{r.kpi_category}</span> },
          { key: "period", label: "Period" },
          { key: "period_start", label: "Start" },
          { key: "period_end", label: "End" },
        ]}
        data={kpis}
        loading={loading}
        emptyMessage="No KPIs configured yet."
      />
    </div>
  );
}
