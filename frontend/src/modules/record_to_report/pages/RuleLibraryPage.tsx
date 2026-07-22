import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Rule } from "../types";

export default function RuleLibraryPage() {
  const { data, loading, error } = useFetch(() => r2rApi.rules(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load rules" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Rule Library</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Audit rules and detection thresholds for automated analysis</p>
        </div>
        <button className="btn btn-primary">+ Add Rule</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No rules defined" description="Create rules to automate audit exception detection" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Rule>
            data={data}
            searchKeys={["rule_code", "rule_name", "category"]}
            searchPlaceholder="Search code, name, or category..."
            columns={[
              { key: "rule_code", label: "Rule Code" },
              { key: "rule_name", label: "Rule Name" },
              { key: "category", label: "Category", render: (v) => <Badge value={v || "—"} /> },
              { key: "severity", label: "Severity", render: (v) => <Badge value={v || "—"} /> },
              { key: "threshold_value", label: "Threshold" },
              { key: "is_active", label: "Active", render: (v) => v ? <span style={{ color: "#22c55e", fontWeight: 600 }}>✓</span> : <span style={{ color: "#ef4444" }}>✗</span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
