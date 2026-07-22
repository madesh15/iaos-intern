import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function IntercompanyPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.intercompany(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load intercompany data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No intercompany entries" description="No intercompany elimination entries found" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Intercompany Elimination</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Intercompany journal entries and elimination differences</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "account", "user"]}
          searchPlaceholder="Search JE, account, or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "account", label: "Account" },
            { key: "debit", label: "Debit", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "credit", label: "Credit", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "difference", label: "Difference", render: (v) => (
              <span style={{ color: v && v !== 0 ? "#ef4444" : "inherit", fontWeight: v && v !== 0 ? 600 : 400 }}>
                {v ? "₹" + Number(v).toLocaleString("en-IN") : "—"}
              </span>
            )},
            { key: "user", label: "User" },
          ]}
        />
      </div>
    </div>
  );
}
