import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Finding } from "../types";

export default function ObservationLogPage() {
  const { data, loading, error } = useFetch(() => r2rApi.findings(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load observations" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Observation Log</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Audit observations, findings and recommendations</p>
        </div>
        <button className="btn btn-primary">+ Log Observation</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No observations logged" description="Log audit observations as you discover them during fieldwork" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Finding>
            data={data}
            searchKeys={["title", "category", "owner"]}
            searchPlaceholder="Search title, category, or owner..."
            columns={[
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              { key: "risk_rating", label: "Risk Rating", render: (v) => <Badge value={v || "—"} /> },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "owner", label: "Owner" },
              { key: "recommendation", label: "Recommendation" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
