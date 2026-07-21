import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const SCOPE_COLUMNS = [
  { key: "scope_id" as const, label: "Scope ID" },
  { key: "scope_name" as const, label: "Scope Name" },
  { key: "description" as const, label: "Description" },
  { key: "status" as const, label: "Status", render: (v: string) => <Badge value={v || "draft"} /> },
  { key: "created_date" as const, label: "Created Date" },
];

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function ScopeAuditUniversePage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());
  const scopeData = (data ?? []) as any[];

  const totalScopes = scopeData.length;

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Scope & Audit Universe</h2>
        <p style={subtitleStyle}>Define audit scope, objectives, and universe of vendors to be audited</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Scopes" value={totalScopes} icon="📋" color="var(--navy)" subtitle="Defined audit scopes" />
        <KPICard title="Active Scopes" value={0} icon="✅" color="var(--success)" subtitle="Currently in progress" />
        <KPICard title="Vendors in Scope" value={0} icon="🏢" color="var(--gold)" subtitle="Covered by audit universe" />
        <KPICard title="Completion Rate" value="0%" icon="📊" color="var(--slate-soft)" subtitle="Overall progress" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Audit Scopes</span>
          <button className="btn btn-primary" onClick={() => console.log("Add Scope feature coming soon")}>
            + Add Scope
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading audit scopes..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && scopeData && scopeData.length === 0 && (
          <EmptyState icon="📋" title="No audit scopes defined yet. Click 'Add Scope' to begin." description="Audit scopes define the boundaries, objectives, and criteria for vendor audits." />
        )}

        {!loading && !error && scopeData && scopeData.length > 0 && (
          <DataTable
            data={scopeData}
            columns={SCOPE_COLUMNS}
            searchKeys={["scope_name", "description"]}
            searchPlaceholder="Search by scope name or description..."
          />
        )}
      </div>
    </div>
  );
}
