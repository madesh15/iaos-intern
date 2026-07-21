import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BankChangeLogPage() {
  const { data, loading, error } = useFetch(() => vendorApi.bankChanges());

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Bank Detail Change Log
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Track all bank account modifications with approval status
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading bank change log..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🏦" title="No Bank Changes" description="No bank detail modifications have been recorded" />
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
                key: "old_account",
                label: "Old Account",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                ),
              },
              {
                key: "new_account",
                label: "New Account",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                ),
              },
              {
                key: "old_ifsc",
                label: "Old IFSC",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                ),
              },
              {
                key: "new_ifsc",
                label: "New IFSC",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                ),
              },
              {
                key: "changed_by",
                label: "Changed By",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                ),
              },
              {
                key: "changed_date",
                label: "Changed Date",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                ),
              },
              {
                key: "approval_status",
                label: "Approval Status",
                render: (val: any) => <Badge value={val || "pending"} />,
              },
            ]}
            searchKeys={["vendor_name", "vendor_code", "changed_by"]}
            searchPlaceholder="Search by vendor or changed by..."
          />
        </div>
      )}
    </div>
  );
}
