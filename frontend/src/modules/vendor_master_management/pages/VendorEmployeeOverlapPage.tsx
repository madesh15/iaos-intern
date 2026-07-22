import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

function riskColor(score: number): string {
  if (score >= 80) return "#dc2626";
  if (score >= 50) return "#d97706";
  if (score >= 30) return "#ca8a04";
  return "#16a34a";
}

export default function VendorEmployeeOverlapPage() {
  const { data, loading, error } = useFetch(() => vendorApi.employeeOverlap());

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Vendor-Employee Overlap Detection
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Potential fraud indicators where vendor data matches employee records
        </p>
      </div>

      <div style={{
        padding: "0.75rem 1rem",
        background: "var(--gold-tint)",
        borderRadius: "var(--radius-sm)",
        color: "var(--gold-strong)",
        fontSize: "0.82rem",
        marginBottom: "1.5rem",
        borderLeft: "3px solid var(--gold)",
      }}>
        ⚠ This analysis requires employee data to be loaded. Overlaps are detected by matching PAN, phone, email, and address between vendor and employee records.
      </div>

      {loading && <LoadingSpinner message="Loading employee overlap data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="✅" title="No Overlaps Detected" description="No vendor-employee data matches found" />
      )}

      {data && data.length > 0 && (
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
                key: "match_type",
                label: "Match Type",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)" }}>
                    {val || "—"}
                  </span>
                ),
              },
              {
                key: "match_value",
                label: "Match Value",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace", color: "var(--slate)" }}>
                    {val || "—"}
                  </span>
                ),
              },
              {
                key: "risk_score",
                label: "Risk Score",
                render: (val: any) => {
                  const score = val as number;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: riskColor(score),
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: riskColor(score) }}>
                        {score}
                      </span>
                    </div>
                  );
                },
              },
            ]}
            searchKeys={["vendor_name", "vendor_code", "match_type", "match_value"]}
            searchPlaceholder="Search by vendor, match type or value..."
          />
        </div>
      )}
    </div>
  );
}
