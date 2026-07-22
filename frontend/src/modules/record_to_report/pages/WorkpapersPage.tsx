import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";
import type { Workpaper } from "../types";

export default function WorkpapersPage() {
  const { data, loading, error } = useFetch(() => r2rApi.workpapers(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load workpapers" description={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Working Papers</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Audit working papers documentation and review</p>
        </div>
        <button className="btn btn-primary">+ New Working Paper</button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No working papers" description="Create your first working paper to begin documenting audit procedures" />
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable<Workpaper>
            data={data}
            searchKeys={["title", "prepared_by", "reviewed_by"]}
            searchPlaceholder="Search title, prepared by, or reviewed by..."
            columns={[
              { key: "title", label: "Title" },
              { key: "status", label: "Status", render: (v) => <Badge value={v || "—"} /> },
              { key: "prepared_by", label: "Prepared By" },
              { key: "reviewed_by", label: "Reviewed By" },
              { key: "audit_period", label: "Audit Period" },
              { key: "created_date", label: "Created Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
