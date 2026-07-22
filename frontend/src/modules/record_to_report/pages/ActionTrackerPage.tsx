import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Action } from "../types";

export default function ActionTrackerPage() {
  const { data, loading, error } = useFetch(() => r2rApi.actions(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load actions" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Action Tracker (CAPA)</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Corrective and preventive actions for audit findings</p>
        </div>
        <button className="btn btn-primary">+ Add Action</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No actions tracked" description="Create corrective actions to address audit findings" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Action>
            data={data}
            searchKeys={["title", "owner"]}
            searchPlaceholder="Search title or owner..."
            columns={[
              { key: "title", label: "Title" },
              { key: "action_type", label: "Type" },
              { key: "priority", label: "Priority", render: (v) => <Badge value={v || "—"} /> },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "owner", label: "Owner" },
              { key: "due_date", label: "Due Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
              { key: "is_overdue", label: "Overdue", render: (v) => v ? <span style={{ color: "#ef4444", fontWeight: 600 }}>✓</span> : <span style={{ color: "#22c55e" }}>—</span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
