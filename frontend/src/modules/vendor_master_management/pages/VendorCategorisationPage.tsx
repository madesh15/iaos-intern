import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, Badge, LoadingSpinner, EmptyState } from "../components";

export default function VendorCategorisationPage() {
  const { data, loading, error } = useFetch(() => vendorApi.category());

  const totalCategorised = data ? data.length : 0;
  const invalidCount = data ? data.filter((r) => !r.is_valid).length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Vendor Categorisation
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Validation of vendor type classifications
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading vendor categorisation..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🏷️" title="No Categorisation Data" description="No vendor categorisation records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Categorised" value={totalCategorised} icon="🏷️" color="var(--gold)" subtitle="Vendors with type assigned" />
            <KPICard title="Invalid" value={invalidCount} icon="⚠️" color="var(--danger)" subtitle="Classification issues" />
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
                  key: "vendor_type",
                  label: "Vendor Type",
                  render: (val: any) => <Badge value={val || "unknown"} />,
                },
                {
                  key: "is_valid",
                  label: "Valid",
                  render: (val: any) => (
                    <span style={{ fontSize: "1rem" }}>{val ? "✅" : "❌"}</span>
                  ),
                },
                {
                  key: "issue",
                  label: "Issue",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: val ? "#dc2626" : "var(--slate)", fontWeight: val ? 600 : 400 }}>
                      {val || "—"}
                    </span>
                  ),
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "vendor_type", "issue"]}
              searchPlaceholder="Search by vendor name, code or type..."
            />
          </div>
        </>
      )}
    </div>
  );
}
