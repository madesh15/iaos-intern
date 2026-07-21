import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function ExceptionQueuePage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Exception Queue</h2>
        <p style={subtitleStyle}>Review and manage audit exceptions and findings</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Exceptions" value={0} icon="🚨" color="var(--danger)" subtitle="Open exceptions" />
        <KPICard title="Critical" value={0} icon="🔴" color="var(--danger)" subtitle="High-severity issues" />
        <KPICard title="In Review" value={0} icon="🔍" color="var(--gold)" subtitle="Under investigation" />
        <KPICard title="Resolved" value={0} icon="✅" color="var(--success)" subtitle="Cleared exceptions" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Exception Queue</span>
          <button className="btn btn-primary" onClick={() => console.log("Add Exception feature coming soon")}>
            + Add Exception
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading exceptions..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="🚨" title="No exceptions in queue. Exceptions will appear as analytics flag issues." description="The Exception Queue consolidates all flagged vendor data anomalies, compliance breaches, and policy violations requiring auditor review and disposition." />
        )}
      </div>
    </div>
  );
}
