import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function SODPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.sod(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load SOD data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No SOD violations" description="No segregation of duties violations detected" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Segregation of Duties</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Users with conflicting roles that violate segregation of duties</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["user"]}
          searchPlaceholder="Search user..."
          columns={[
            { key: "user", label: "User" },
            { key: "roles_found", label: "Roles Found" },
            { key: "je_count", label: "JE Count" },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
