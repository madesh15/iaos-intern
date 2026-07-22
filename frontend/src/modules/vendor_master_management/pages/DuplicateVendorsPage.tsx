import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v: number) {
  return "₹" + v.toLocaleString("en-IN");
}

function scoreVariant(score: number): "danger" | "warning" | "gold" | "slate" {
  if (score >= 90) return "danger";
  if (score >= 70) return "warning";
  if (score >= 50) return "gold";
  return "slate";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export default function DuplicateVendorsPage() {
  const { data, loading, error } = useFetch(() => vendorApi.duplicates());

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Duplicate Vendor Detection
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Vendors matched by GST, PAN, name, phone, email, or address
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading duplicate vendors..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="✅" title="No Duplicates Found" description="All vendor records appear unique" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Duplicates" value={data.length} icon="🔀" color="var(--danger)" subtitle="Potential matches detected" />
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <DataTable
              data={data}
              columns={[
                {
                  key: "vendor_a_name",
                  label: "Vendor A",
                  render: (_: any, row: any) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_a_code}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_a_name}</div>
                    </div>
                  ),
                },
                {
                  key: "vendor_b_name",
                  label: "Vendor B",
                  render: (_: any, row: any) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_b_code}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_b_name}</div>
                    </div>
                  ),
                },
                {
                  key: "duplicate_score",
                  label: "Duplicate Score",
                  render: (val: any) => (
                    <Badge value={scoreLabel(val)} variant={scoreVariant(val)} />
                  ),
                },
                {
                  key: "reason",
                  label: "Reason",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
              ]}
              searchKeys={["vendor_a_name", "vendor_a_code", "vendor_b_name", "vendor_b_code", "reason"]}
              searchPlaceholder="Search by vendor name, code or reason..."
            />
          </div>
        </>
      )}
    </div>
  );
}
