import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function RuleLibraryPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Rule Library</h2>
        <p style={subtitleStyle}>Reusable audit rules for automated vendor analysis</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Rules" value={0} icon="📏" color="var(--navy)" subtitle="Configured rules" />
        <KPICard title="Active Rules" value={0} icon="⚡" color="var(--success)" subtitle="Currently running" />
        <KPICard title="Critical Rules" value={0} icon="🔴" color="var(--danger)" subtitle="High-severity rules" />
        <KPICard title="Violations Found" value={0} icon="🚨" color="var(--gold)" subtitle="Rule violations detected" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Audit Rules</span>
          <button className="btn btn-primary" onClick={() => console.log("Add Rule feature coming soon")}>
            + Add Rule
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading audit rules..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="📏" title="No rules configured. Define rules to automate vendor risk detection." description="Audit rules define conditions and thresholds that automatically flag vendor data anomalies, compliance breaches, and policy violations." />
        )}
      </div>
    </div>
  );
}
