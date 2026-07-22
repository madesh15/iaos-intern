import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function BlankNarrationPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.blankNarration(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load blank narration data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No blank narration entries" description="All journal entries have valid narrations" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Blank Narration Detection</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries with missing or insufficient narration text</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "user"]}
          searchPlaceholder="Search JE number or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "user", label: "User" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "narration", label: "Narration" },
            { key: "narration_risk", label: "Narration Risk", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
