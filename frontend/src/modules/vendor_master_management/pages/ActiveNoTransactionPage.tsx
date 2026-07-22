import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ActiveNoTransactionPage() {
  const { data, loading, error } = useFetch(() => vendorApi.noTransactions());

  const dormantCount = data?.length ?? 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Active but No Transaction
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Active vendors with no recent purchase or payment activity
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading dormant vendors..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="✅" title="No Dormant Vendors" description="All active vendors have recent transaction activity" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Dormant Vendors" value={dormantCount} icon="😴" color="var(--danger)" subtitle="Active but no transactions" />
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
                  key: "status",
                  label: "Status",
                  render: (val: any) => <Badge value={val || "active"} />,
                },
                {
                  key: "last_purchase_date",
                  label: "Last Purchase Date",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                  ),
                },
                {
                  key: "last_payment_date",
                  label: "Last Payment Date",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                  ),
                },
                {
                  key: "idle_days",
                  label: "Idle Days",
                  render: (val: any) => {
                    const days = val as number;
                    const isWarning = days > 365;
                    return (
                      <span style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: isWarning ? "var(--danger)" : "var(--slate)",
                      }}>
                        {days} days{isWarning ? " ⚠" : ""}
                      </span>
                    );
                  },
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
