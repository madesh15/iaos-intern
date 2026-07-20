import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function WorkingPapersPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Working Papers</h2>
        <p style={subtitleStyle}>Document audit evidence, procedures, and conclusions</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Papers" value={0} icon="📝" color="var(--navy)" subtitle="Working papers created" />
        <KPICard title="Draft" value={0} icon="✏️" color="var(--gold)" subtitle="Awaiting completion" />
        <KPICard title="Under Review" value={0} icon="👁️" color="var(--slate)" subtitle="Pending review" />
        <KPICard title="Finalized" value={0} icon="✅" color="var(--success)" subtitle="Approved papers" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Working Papers</span>
          <button className="btn btn-primary" onClick={() => console.log("New Working Paper feature coming soon")}>
            + New Working Paper
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading working papers..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="📝" title="No working papers created. Start documenting your audit procedures." description="Working papers capture the audit evidence, procedures performed, and conclusions reached during vendor audit engagements, forming the basis for the final audit report." />
        )}
      </div>
    </div>
  );
}
