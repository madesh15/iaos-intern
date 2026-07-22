import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { CloseTask } from "../types";

export default function CloseCalendarPage() {
  const { data, loading, error } = useFetch(() => r2rApi.closeTasks(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load close tasks" description={error} />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Close Calendar</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Period-end close tasks and their completion status</p>

      {!data || data.length === 0 ? (
        <EmptyState title="No close tasks" description="Define period-end close tasks to track completion" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<CloseTask>
            data={data}
            searchKeys={["period", "task_name", "owner"]}
            searchPlaceholder="Search period, task, or owner..."
            columns={[
              { key: "period", label: "Period" },
              { key: "task_name", label: "Task Name" },
              { key: "owner", label: "Owner" },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "due_date", label: "Due Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
              { key: "priority", label: "Priority", render: (v) => <Badge value={v || "—"} /> },
              { key: "is_delayed", label: "Delayed", render: (v) => v ? <span style={{ color: "#ef4444", fontWeight: 600 }}>✓</span> : <span style={{ color: "#22c55e" }}>—</span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
