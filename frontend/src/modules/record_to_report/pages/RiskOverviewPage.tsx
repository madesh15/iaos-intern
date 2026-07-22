import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, KPICard, LoadingSpinner, EmptyState } from "../components";

export default function RiskOverviewPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.manualRisk(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load risk data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No risk data found" description="Run risk analysis to generate scores" />;

  const highRisk = data.filter((d) => d.risk_level?.toLowerCase() === "high").length;
  const mediumRisk = data.filter((d) => d.risk_level?.toLowerCase() === "medium").length;
  const lowRisk = data.filter((d) => d.risk_level?.toLowerCase() === "low").length;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Risk Analysis Overview</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Consolidated view of all risk-scored journal entries</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <KPICard title="Total Scored" value={data.length.toLocaleString("en-IN")} icon="📊" />
        <KPICard title="High Risk" value={highRisk.toLocaleString("en-IN")} icon="🔴" color="#ef4444" />
        <KPICard title="Medium Risk" value={mediumRisk.toLocaleString("en-IN")} icon="⚠️" color="#f59e0b" />
        <KPICard title="Low Risk" value={lowRisk.toLocaleString("en-IN")} icon="✅" color="#22c55e" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "user"]}
          searchPlaceholder="Search JE number or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "user", label: "User" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "narration_status", label: "Narration Status", render: (v) => <Badge value={v || "—"} /> },
            { key: "risk_score", label: "Risk Score", render: (v) => <span style={{ fontWeight: 600 }}>{v ?? "—"}</span> },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
