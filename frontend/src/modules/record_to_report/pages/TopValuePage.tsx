import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function TopValuePage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.topValue(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load top value data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No top value entries" description="No high-value journal entries found" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Top Value Journal Entries</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Highest value journal entries ranked by debit or credit amount</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "account_name", "user"]}
          searchPlaceholder="Search JE, account, or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "account_name", label: "Account Name" },
            { key: "debit_amount", label: "Debit Amount (₹)", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "credit_amount", label: "Credit Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "user", label: "User" },
            { key: "date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
