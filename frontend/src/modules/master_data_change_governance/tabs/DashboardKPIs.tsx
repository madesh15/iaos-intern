import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "master_data_change_governance";

interface Kpis {
  total_change_logs: number;
  active_workflows: number;
  open_exceptions: number;
  open_duplicates: number;
  reconciliation_match_rate: number;
  open_findings: number;
  open_remediations: number;
}

export default function DashboardKPIsTab() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<Kpis>(`/api/modules/${SLUG}/dashboard/kpis`).then((k) => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!kpis) return <p style={{ color: "var(--slate)" }}>Unable to load KPIs.</p>;

  const cards = [
    { label: "Total Change Logs", value: kpis.total_change_logs, color: "var(--navy)" },
    { label: "Active Workflows", value: kpis.active_workflows, color: "#2563eb" },
    { label: "Open Exceptions", value: kpis.open_exceptions, color: kpis.open_exceptions > 0 ? "#dc2626" : "#16a34a" },
    { label: "Open Duplicates", value: kpis.open_duplicates, color: kpis.open_duplicates > 0 ? "#d97706" : "#16a34a" },
    { label: "Reconciliation Match", value: `${kpis.reconciliation_match_rate}%`, color: kpis.reconciliation_match_rate >= 95 ? "#16a34a" : "#d97706" },
    { label: "Open Findings", value: kpis.open_findings, color: kpis.open_findings > 0 ? "#dc2626" : "#16a34a" },
    { label: "Open Remediations", value: kpis.open_remediations, color: kpis.open_remediations > 0 ? "#d97706" : "#16a34a" },
  ];

  function riskScore(): string {
    const s = kpis!.open_exceptions * 3 + kpis!.open_duplicates * 2 + kpis!.open_findings * 4 + kpis!.open_remediations;
    if (s >= 20) return "High";
    if (s >= 8) return "Medium";
    return "Low";
  }

  function riskColor(): string {
    const r = riskScore();
    if (r === "High") return "#dc2626";
    if (r === "Medium") return "#d97706";
    return "#16a34a";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 20 }}>Module Dashboard & KPIs</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h4 style={{ color: "var(--navy)", marginBottom: 12 }}>Overall Risk Score</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: riskColor(), color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700,
          }}>
            {riskScore()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14 }}>
              Based on open exceptions, duplicates, findings, and remediation items.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--slate)" }}>
              Formula: (exceptions × 3) + (duplicates × 2) + (findings × 4) + remediations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
