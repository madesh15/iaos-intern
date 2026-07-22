import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, Badge, LoadingSpinner, EmptyState } from "../components";

function changeCountColor(count: number): string {
  if (count >= 10) return "#dc2626";
  if (count >= 5) return "#d97706";
  return "var(--navy)";
}

export default function ChangeFrequencyPage() {
  const { data, loading, error } = useFetch(() => vendorApi.changeFrequency());

  const totalVendors = data ? data.length : 0;
  const highRiskCount = data ? data.filter((r) => r.risk_level.toLowerCase() === "high").length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Change Frequency Analytics
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Vendors with excessive master data changes
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading change frequency data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🔄" title="No Change Frequency Data" description="No vendor change frequency records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Vendors with Changes" value={totalVendors} icon="🔄" color="var(--gold)" subtitle="Vendors with recorded changes" />
            <KPICard title="High Risk" value={highRiskCount} icon="🚨" color="var(--danger)" subtitle="Excessive change activity" />
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <DataTable
              data={data}
              columns={[
                {
                  key: "vendor_code",
                  label: "Vendor",
                  render: (_: any, row: any) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_code}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_name}</div>
                    </div>
                  ),
                },
                {
                  key: "change_count",
                  label: "Change Count",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: changeCountColor(val) }}>
                      {val}
                    </span>
                  ),
                },
                {
                  key: "risk_level",
                  label: "Risk Level",
                  render: (val: any) => <Badge value={val || "low"} />,
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "risk_level"]}
              searchPlaceholder="Search by vendor name or code..."
            />
          </div>
        </>
      )}
    </div>
  );
}
