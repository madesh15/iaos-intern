import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function DataSourceSetupPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Data Source Setup</h2>
        <p style={subtitleStyle}>Configure data sources for vendor audit analysis</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Sources" value={0} icon="🗄️" color="var(--navy)" subtitle="Configured connections" />
        <KPICard title="Connected" value={0} icon="🔗" color="var(--success)" subtitle="Active connections" />
        <KPICard title="Last Sync" value="—" icon="🔄" color="var(--gold)" subtitle="Most recent update" />
        <KPICard title="Total Records" value={0} icon="📊" color="var(--slate-soft)" subtitle="Across all sources" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Data Sources</span>
          <button className="btn btn-primary" onClick={() => console.log("Add Data Source feature coming soon")}>
            + Add Data Source
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading data sources..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="🗄️" title="No data sources configured. Connect external data sources for comprehensive analysis." description="Data sources enable the audit module to ingest vendor data from ERP systems, banking feeds, GST portals, and other external repositories." />
        )}
      </div>
    </div>
  );
}
