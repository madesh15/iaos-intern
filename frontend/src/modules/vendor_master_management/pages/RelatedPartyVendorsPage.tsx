import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, LoadingSpinner, EmptyState } from "../components";

function riskScoreColor(score: number): string {
  if (score >= 80) return "#dc2626";
  if (score >= 50) return "#d97706";
  return "#16a34a";
}

export default function RelatedPartyVendorsPage() {
  const { data, loading, error } = useFetch(() => vendorApi.relatedParty());

  const totalRelationships = data ? data.length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Related Party Vendors
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Vendors with shared attributes indicating potential relationships
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading related party data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🔗" title="No Related Party Data" description="No vendor relationship records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Relationships" value={totalRelationships} icon="🔗" color="var(--gold)" subtitle="Potential related party links" />
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <DataTable
              data={data}
              columns={[
                {
                  key: "vendor_code",
                  label: "Vendor A",
                  render: (_: any, row: any) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_code}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_name}</div>
                    </div>
                  ),
                },
                {
                  key: "related_vendor_name",
                  label: "Vendor B",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "relationship_type",
                  label: "Relationship Type",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "shared_field",
                  label: "Shared Field(s)",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "risk_score",
                  label: "Risk Score",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: riskScoreColor(val) }}>
                      {val}
                    </span>
                  ),
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "related_vendor_name", "relationship_type", "shared_field"]}
              searchPlaceholder="Search by vendor name, code or relationship..."
            />
          </div>
        </>
      )}
    </div>
  );
}
