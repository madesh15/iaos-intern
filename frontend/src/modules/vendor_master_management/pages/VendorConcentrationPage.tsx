import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

function formatCurrency(v: number) {
  return "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function VendorConcentrationPage() {
  const { data, loading, error } = useFetch(() => vendorApi.concentration());

  const totalSpend = data?.reduce((sum, r) => sum + r.spend_amount, 0) ?? 0;
  const topVendorPct = data && data.length > 0 ? data[0].percentage : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Vendor Concentration Analysis
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Spend concentration risk by vendor
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading concentration data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="📊" title="No Concentration Data" description="No vendor spend data available" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Spend" value={formatCurrency(totalSpend)} icon="💰" color="var(--gold)" subtitle="Across all vendors" />
            <KPICard title="Top Vendor" value={`${topVendorPct.toFixed(1)}%`} icon="🏆" color="var(--danger)" subtitle="Highest concentration" />
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <DataTable
              data={data}
              columns={[
                {
                  key: "vendor_name",
                  label: "Vendor",
                  render: (_: any, row: any) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_code}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_name}</div>
                    </div>
                  ),
                },
                {
                  key: "spend_amount",
                  label: "Spend Amount",
                  render: (val: any) => (
                    <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.85rem" }}>{formatCurrency(val)}</span>
                  ),
                },
                {
                  key: "percentage",
                  label: "Percentage",
                  render: (val: any) => (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{
                        width: 80,
                        height: 6,
                        borderRadius: 3,
                        background: "var(--line-soft)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}>
                        <div style={{
                          width: `${Math.min(val, 100)}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: val >= 30 ? "var(--danger)" : val >= 15 ? "var(--gold)" : "var(--success)",
                        }} />
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)" }}>{val.toFixed(1)}%</span>
                    </div>
                  ),
                },
                {
                  key: "risk_level",
                  label: "Risk Level",
                  render: (val: any) => <Badge value={val || "low"} />,
                },
              ]}
              searchKeys={["vendor_name", "vendor_code"]}
              searchPlaceholder="Search by vendor..."
            />
          </div>
        </>
      )}
    </div>
  );
}
