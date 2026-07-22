import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, KPICard, LoadingSpinner, EmptyState } from "../components";

export default function ManualRiskPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.manualRisk(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load manual risk data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No manual risk data" description="Run risk analysis to score manual journal entries" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Manual JE Risk Scoring</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Risk scoring for manually posted journal entries</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "user"]}
          searchPlaceholder="Search JE number or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "user", label: "User" },
            { key: "posting_type", label: "Posting Type" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "narration", label: "Narration" },
            { key: "is_odd_hour", label: "Is Odd Hour", render: (v) => v ? <Badge value="Yes" variant="danger" /> : <Badge value="No" variant="success" /> },
            { key: "is_weekend", label: "Is Weekend", render: (v) => v ? <Badge value="Yes" variant="danger" /> : <Badge value="No" variant="success" /> },
            { key: "is_round", label: "Is Round", render: (v) => v ? <Badge value="Yes" variant="warning" /> : <Badge value="No" variant="success" /> },
            { key: "risk_score", label: "Risk Score", render: (v) => <span style={{ fontWeight: 600 }}>{v ?? "—"}</span> },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
