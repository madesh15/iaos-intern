import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, Badge, LoadingSpinner, EmptyState } from "../components";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MSMEValidationPage() {
  const { data, loading, error } = useFetch(() => vendorApi.msme());

  const totalMsme = data ? data.length : 0;
  const validCount = data ? data.filter((r) => r.is_valid).length : 0;
  const expiredCount = data ? data.filter((r) => {
    if (!r.msme_expiry) return false;
    return new Date(r.msme_expiry) < new Date();
  }).length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          MSME Validation
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          MSME registration and certificate status
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading MSME validation data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="📜" title="No MSME Data" description="No MSME validation records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total MSME" value={totalMsme} icon="📜" color="var(--gold)" subtitle="Vendors with MSME records" />
            <KPICard title="Valid" value={validCount} icon="✅" color="var(--success)" subtitle="Active and valid" />
            <KPICard title="Expired" value={expiredCount} icon="⚠️" color="var(--danger)" subtitle="Expired certificates" />
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
                  key: "msme_status",
                  label: "MSME Status",
                  render: (val: any) => <Badge value={val || "unknown"} />,
                },
                {
                  key: "msme_reg_number",
                  label: "Registration Number",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "msme_expiry",
                  label: "Expiry Date",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                  ),
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
              searchKeys={["vendor_name", "vendor_code", "msme_status", "msme_reg_number", "issue"]}
              searchPlaceholder="Search by vendor name, code or registration..."
            />
          </div>
        </>
      )}
    </div>
  );
}
