import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, Badge, LoadingSpinner, EmptyState } from "../components";

export default function VendorDeactivationPage() {
  const { data, loading, error } = useFetch(() => vendorApi.deactivation());

  const totalInactive = data ? data.length : 0;
  const withBlockers = data ? data.filter((r) => r.has_blockers).length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Vendor Deactivation
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Inactive vendors with open obligations
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading deactivation data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🚫" title="No Deactivation Data" description="No inactive vendor records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Inactive" value={totalInactive} icon="🚫" color="var(--gold)" subtitle="Vendors marked inactive" />
            <KPICard title="With Blockers" value={withBlockers} icon="🚧" color="var(--danger)" subtitle="Cannot be fully deactivated" />
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
                  key: "status",
                  label: "Status",
                  render: (val: any) => <Badge value={val || "inactive"} />,
                },
                {
                  key: "open_po_count",
                  label: "Open POs",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: val > 0 ? 700 : 400, color: val > 0 ? "#d97706" : "var(--slate)" }}>
                      {val}
                    </span>
                  ),
                },
                {
                  key: "open_invoice_count",
                  label: "Open Invoices",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: val > 0 ? 700 : 400, color: val > 0 ? "#d97706" : "var(--slate)" }}>
                      {val}
                    </span>
                  ),
                },
                {
                  key: "has_blockers",
                  label: "Has Blockers",
                  render: (val: any) => (
                    <span style={{ fontSize: "1rem" }}>{val ? "❌" : "✅"}</span>
                  ),
                },
                {
                  key: "issues",
                  label: "Issues",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                      {val && val.length > 0 ? val.join("; ") : "—"}
                    </span>
                  ),
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "status"]}
              searchPlaceholder="Search by vendor name or code..."
            />
          </div>
        </>
      )}
    </div>
  );
}
