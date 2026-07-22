import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function ActionTrackerPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Action Tracker</h2>
        <p style={subtitleStyle}>Track CAPA (Corrective and Preventive Actions) to closure</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Actions" value={0} icon="📌" color="var(--navy)" subtitle="Open actions" />
        <KPICard title="Overdue" value={0} icon="🔴" color="var(--danger)" subtitle="Past due date" />
        <KPICard title="In Progress" value={0} icon="⏳" color="var(--gold)" subtitle="Actively working" />
        <KPICard title="Completed" value={0} icon="✅" color="var(--success)" subtitle="Actions closed" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Action Items</span>
          <button className="btn btn-primary" onClick={() => console.log("Add Action feature coming soon")}>
            + Add Action
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading actions..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="📌" title="No actions tracked. Assign corrective actions for audit findings." description="The Action Tracker manages the lifecycle of Corrective and Preventive Actions (CAPA) from assignment through implementation to verified closure, ensuring audit findings are remediated." />
        )}
      </div>
    </div>
  );
}
