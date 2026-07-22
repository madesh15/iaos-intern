import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function PostClosePage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.postClose(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load post close data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No post close entries" description="No journal entries posted after period close" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Post Close Entries</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries posted after the period closing date</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "account", "user"]}
          searchPlaceholder="Search JE, account, or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "period", label: "Period" },
            { key: "account", label: "Account" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "user", label: "User" },
            { key: "date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
          ]}
        />
      </div>
    </div>
  );
}
