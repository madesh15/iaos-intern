import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Reconciliation } from "../types";

export default function ReconciliationPage() {
  const { data, loading, error } = useFetch(() => r2rApi.reconciliations(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load reconciliations" description={error} />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Account Reconciliation</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>GL to subledger reconciliation status and differences</p>

      {!data || data.length === 0 ? (
        <EmptyState title="No reconciliations" description="Begin reconciliation by importing GL and subledger balances" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Reconciliation>
            data={data}
            searchKeys={["account_code", "account_name", "owner"]}
            searchPlaceholder="Search account or owner..."
            columns={[
              { key: "account_code", label: "Account Code" },
              { key: "account_name", label: "Account Name" },
              { key: "gl_balance", label: "GL Balance (₹)", render: (v) => "₹" + Number(v || 0).toLocaleString("en-IN") },
              { key: "subledger_balance", label: "Subledger Balance (₹)", render: (v) => "₹" + Number(v || 0).toLocaleString("en-IN") },
              { key: "difference", label: "Difference (₹)", render: (v) => (
                <span style={{ color: v && v !== 0 ? "#ef4444" : "inherit", fontWeight: v && v !== 0 ? 600 : 400 }}>
                  {v ? "₹" + Number(v).toLocaleString("en-IN") : "₹0"}
                </span>
              )},
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "owner", label: "Owner" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
