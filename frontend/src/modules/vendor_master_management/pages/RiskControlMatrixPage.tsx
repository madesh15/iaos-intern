import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const btnGroupStyle: React.CSSProperties = { display: "flex", gap: "0.5rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function RiskControlMatrixPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Risk & Control Matrix</h2>
        <p style={subtitleStyle}>Map risks to controls and assess their effectiveness</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Risks" value={0} icon="⚠️" color="var(--danger)" subtitle="Identified risks" />
        <KPICard title="Total Controls" value={0} icon="🛡️" color="var(--success)" subtitle="Mapped controls" />
        <KPICard title="Effective Controls" value={0} icon="✅" color="var(--navy)" subtitle="Operating effectively" />
        <KPICard title="Control Gaps" value={0} icon="❗" color="var(--gold)" subtitle="Unmitigated risks" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Risk-Control Mappings</span>
          <div style={btnGroupStyle}>
            <button className="btn btn-primary" onClick={() => console.log("Add Risk feature coming soon")}>
              + Add Risk
            </button>
            <button className="btn btn-ghost" onClick={() => console.log("Add Control feature coming soon")}>
              + Add Control
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner message="Loading risk-control matrix..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="🛡️" title="No risk-control mappings defined. Start by adding risks and controls." description="The Risk & Control Matrix maps vendor-related risks to preventive and detective controls, enabling structured risk assessment and mitigation tracking." />
        )}
      </div>
    </div>
  );
}
