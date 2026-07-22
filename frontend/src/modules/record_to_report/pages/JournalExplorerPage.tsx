import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, KPICard, LoadingSpinner, EmptyState } from "../components";
import type { JournalEntry } from "../types";

export default function JournalExplorerPage() {
  const { data, loading, error } = useFetch(() => r2rApi.journals(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load journals" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No journal entries found" description="Upload journal data to get started" />;

  const totalDebit = data.reduce((s, j) => s + (j.debit_amount || 0), 0);
  const totalCredit = data.reduce((s, j) => s + (j.credit_amount || 0), 0);

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Journal Explorer</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Browse and search all posted journal entries</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <KPICard title="Total JEs" value={data.length.toLocaleString("en-IN")} icon="📒" />
        <KPICard title="Total Debit" value={"₹" + totalDebit.toLocaleString("en-IN")} icon="📈" color="#ef4444" />
        <KPICard title="Total Credit" value={"₹" + totalCredit.toLocaleString("en-IN")} icon="📉" color="#22c55e" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable<JournalEntry>
          data={data}
          searchKeys={["je_number", "account_code", "account_name", "narration", "user_name"]}
          searchPlaceholder="Search JE number, account, narration..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "je_date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            { key: "period", label: "Period" },
            { key: "account_code", label: "Account Code" },
            { key: "account_name", label: "Account Name" },
            { key: "debit_amount", label: "Debit (₹)", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "credit_amount", label: "Credit (₹)", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "narration", label: "Narration" },
            { key: "user_name", label: "User" },
            { key: "posting_type", label: "Posting Type", render: (v) => <Badge value={v || "—"} /> },
            { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
            { key: "risk_score", label: "Risk Score", render: (v) => <span style={{ fontWeight: 600 }}>{v ?? "—"}</span> },
          ]}
        />
      </div>
    </div>
  );
}
