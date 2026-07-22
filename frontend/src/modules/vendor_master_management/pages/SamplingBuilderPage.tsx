import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const titleStyle: React.CSSProperties = { color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" };
const toolbarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" };
const kpiGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };

export default function SamplingBuilderPage() {
  const { data, loading, error } = useFetch(() => vendorApi.list());

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Sampling Builder</h2>
        <p style={subtitleStyle}>Build statistical and judgmental samples for audit testing</p>
      </div>

      <div style={kpiGrid}>
        <KPICard title="Total Samples" value={0} icon="🎯" color="var(--navy)" subtitle="Built sample sets" />
        <KPICard title="Population Size" value={0} icon="📈" color="var(--gold)" subtitle="Vendor records in scope" />
        <KPICard title="Sample Size" value={0} icon="🔢" color="var(--success)" subtitle="Items selected for testing" />
        <KPICard title="Coverage" value="0%" icon="📊" color="var(--slate-soft)" subtitle="Audit coverage achieved" />
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={toolbarStyle}>
          <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>Audit Samples</span>
          <button className="btn btn-primary" onClick={() => console.log("Create Sample feature coming soon")}>
            + Create Sample
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading samples..." />}
        {error && (
          <div style={{ padding: "1rem", background: "var(--danger-tint)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmptyState icon="🎯" title="No samples created. Build a sample set for your audit procedures." description="Sampling Builder supports statistical sampling (random, stratified, systematic) and judgmental sampling to select vendor records for detailed audit testing." />
        )}
      </div>
    </div>
  );
}
