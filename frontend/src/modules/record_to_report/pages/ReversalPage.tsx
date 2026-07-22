import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function ReversalPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.reversal(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load reversal data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No reversal patterns" description="No journal entry reversals detected" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Reversal Pattern Analysis</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries that were reversed and the gap between original and reversal</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["original_je", "reversal_je", "user"]}
          searchPlaceholder="Search JE or user..."
          columns={[
            { key: "original_je", label: "Original JE" },
            { key: "reversal_je", label: "Reversal JE" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "user", label: "User" },
            { key: "date_gap", label: "Date Gap" },
          ]}
        />
      </div>
    </div>
  );
}
