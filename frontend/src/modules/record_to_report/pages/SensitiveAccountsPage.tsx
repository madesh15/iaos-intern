import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function SensitiveAccountsPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.sensitiveAccount(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load sensitive account data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No sensitive account postings" description="No postings detected to sensitive accounts" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Sensitive Account Posting</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries posted to flagged sensitive accounts</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "account_code", "account_name", "user"]}
          searchPlaceholder="Search JE, account, or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "account_code", label: "Account Code" },
            { key: "account_name", label: "Account Name" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "user", label: "User" },
            { key: "date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
          ]}
        />
      </div>
    </div>
  );
}
