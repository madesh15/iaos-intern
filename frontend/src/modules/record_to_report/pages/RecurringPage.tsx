import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function RecurringPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.recurring(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load recurring data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No recurring entries" description="No recurring journal entry patterns detected" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Recurring Journal Detection</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries with similar narration and amounts posted repeatedly</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["narration"]}
          searchPlaceholder="Search narration..."
          columns={[
            { key: "narration", label: "Narration" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "count", label: "Count" },
            { key: "users", label: "Users" },
            { key: "je_numbers", label: "JE Numbers" },
          ]}
        />
      </div>
    </div>
  );
}
