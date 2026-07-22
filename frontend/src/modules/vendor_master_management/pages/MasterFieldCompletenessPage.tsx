import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, LoadingSpinner, EmptyState } from "../components";

function completenessColor(pct: number): string {
  if (pct < 50) return "#dc2626";
  if (pct < 75) return "#d97706";
  return "#16a34a";
}

export default function MasterFieldCompletenessPage() {
  const { data, loading, error } = useFetch(() => vendorApi.completeness());

  const avgCompleteness = data && data.length > 0
    ? Math.round(data.reduce((s, r) => s + r.completeness_pct, 0) / data.length)
    : 0;
  const belowFifty = data ? data.filter((r) => r.completeness_pct < 50).length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Master Field Completeness
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Missing fields across vendor master records
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading completeness data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="📋" title="No Data Available" description="No vendor completeness records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Avg Completeness" value={`${avgCompleteness}%`} icon="📊" color="var(--gold)" subtitle="Across all vendors" />
            <KPICard title="Below 50%" value={belowFifty} icon="⚠️" color="var(--danger)" subtitle="Vendors needing attention" />
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
                  key: "total_fields",
                  label: "Total Fields",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{val}</span>
                  ),
                },
                {
                  key: "filled_fields",
                  label: "Filled Fields",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{val}</span>
                  ),
                },
                {
                  key: "completeness_pct",
                  label: "Completeness %",
                  render: (val: any) => (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--line)", minWidth: 60 }}>
                        <div style={{ width: `${val}%`, height: "100%", borderRadius: 3, background: completenessColor(val) }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: completenessColor(val), minWidth: 36 }}>{val}%</span>
                    </div>
                  ),
                },
                {
                  key: "missing_fields",
                  label: "Missing Fields",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                      {val && val.length > 0 ? val.join(", ") : "—"}
                    </span>
                  ),
                },
              ]}
              searchKeys={["vendor_name", "vendor_code"]}
              searchPlaceholder="Search by vendor name or code..."
            />
          </div>
        </>
      )}
    </div>
  );
}
