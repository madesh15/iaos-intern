import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { AuditScope } from "../types";

export default function ScopePage() {
  const { data, loading, error } = useFetch(() => r2rApi.scopes(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load scopes" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Scope Management</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Define and manage audit scope boundaries and periods</p>
        </div>
        <button className="btn btn-primary">+ Add Scope</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No scopes defined" description="Create audit scopes to define entities and periods under review" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<AuditScope>
            data={data}
            searchKeys={["scope_name", "entity", "business_unit"]}
            searchPlaceholder="Search scope, entity, or business unit..."
            columns={[
              { key: "scope_name", label: "Scope Name" },
              { key: "entity", label: "Entity" },
              { key: "business_unit", label: "Business Unit" },
              { key: "period_from", label: "Period From", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
              { key: "period_to", label: "Period To", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
