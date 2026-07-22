import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Reconciliation } from "../types";

export default function GLSubledgerPage() {
  const { data, loading, error } = useFetch(() => r2rApi.reconciliations(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load GL vs subledger data" description={error} />;

  const differences = data?.filter((r) => r.difference !== 0) || [];

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>GL vs Subledger Differences</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Reconciliation entries where GL and subledger balances do not match</p>

      {differences.length === 0 ? (
        <EmptyState title="No differences found" description="All GL and subledger balances are reconciled" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Reconciliation>
            data={differences}
            searchKeys={["account_code", "account_name", "owner"]}
            searchPlaceholder="Search account or owner..."
            columns={[
              { key: "account_code", label: "Account Code" },
              { key: "account_name", label: "Account Name" },
              { key: "gl_balance", label: "GL Balance", render: (v) => "₹" + Number(v || 0).toLocaleString("en-IN") },
              { key: "subledger_balance", label: "Subledger Balance", render: (v) => "₹" + Number(v || 0).toLocaleString("en-IN") },
              { key: "difference", label: "Difference", render: (v) => (
                <span style={{ color: "#ef4444", fontWeight: 600, background: "#fee2e2", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                  {"₹" + Number(v).toLocaleString("en-IN")}
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
