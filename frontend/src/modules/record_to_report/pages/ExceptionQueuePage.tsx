import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { R2RException } from "../types";

export default function ExceptionQueuePage() {
  const { data, loading, error } = useFetch(() => r2rApi.exceptions(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load exceptions" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Exception Queue</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Audit exceptions requiring investigation and resolution</p>
        </div>
        <button className="btn btn-primary">+ Add Exception</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No exceptions found" description="All controls are operating normally" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<R2RException>
            data={data}
            searchKeys={["category", "description", "owner"]}
            searchPlaceholder="Search category, description, or owner..."
            columns={[
              { key: "id", label: "ID" },
              { key: "category", label: "Category", render: (v) => <Badge value={v || "—"} /> },
              { key: "severity", label: "Severity", render: (v) => <Badge value={v || "—"} /> },
              { key: "description", label: "Description" },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "owner", label: "Owner" },
              { key: "detected_date", label: "Detected Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
