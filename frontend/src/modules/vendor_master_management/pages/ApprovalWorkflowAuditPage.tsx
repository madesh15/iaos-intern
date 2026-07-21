import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, KPICard, Badge, LoadingSpinner, EmptyState } from "../components";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ApprovalWorkflowAuditPage() {
  const { data, loading, error } = useFetch(() => vendorApi.approvalAudit());

  const pendingCount = data ? data.filter((r) => r.status.toLowerCase() === "pending").length : 0;
  const approvedCount = data ? data.filter((r) => r.status.toLowerCase() === "approved").length : 0;
  const rejectedCount = data ? data.filter((r) => r.status.toLowerCase() === "rejected").length : 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Approval Workflow Audit
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Maker-checker compliance and pending approvals
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading approval audit data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="✅" title="No Approval Records" description="No maker-checker workflow records found" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Pending" value={pendingCount} icon="⏳" color="var(--gold)" subtitle="Awaiting checker review" />
            <KPICard title="Approved" value={approvedCount} icon="✅" color="var(--success)" subtitle="Completed approvals" />
            <KPICard title="Rejected" value={rejectedCount} icon="❌" color="var(--danger)" subtitle="Rejected requests" />
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
                  key: "action_type",
                  label: "Action Type",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "maker",
                  label: "Maker",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "maker_date",
                  label: "Maker Date",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                  ),
                },
                {
                  key: "checker",
                  label: "Checker",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "checker_date",
                  label: "Checker Date",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{formatDate(val)}</span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (val: any) => <Badge value={val || "pending"} />,
                },
                {
                  key: "remarks",
                  label: "Remarks",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "action_type", "maker", "checker", "remarks"]}
              searchPlaceholder="Search by vendor, action, maker or checker..."
            />
          </div>
        </>
      )}
    </div>
  );
}
