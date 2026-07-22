import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState, KPICard } from "../components";

function VerifiedIcon({ verified }: { verified: boolean }) {
  return (
    <span style={{ fontSize: "1rem", color: verified ? "#16a34a" : "#dc2626" }}>
      {verified ? "✔" : "✘"}
    </span>
  );
}

export default function KYCValidationPage() {
  const { data, loading, error } = useFetch(() => vendorApi.kyc());

  const totalPending = data?.filter((r) => r.kyc_status.toLowerCase() === "pending").length ?? 0;
  const gstVerified = data?.filter((r) => r.gst_verified).length ?? 0;
  const panVerified = data?.filter((r) => r.pan_verified).length ?? 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          KYC & GST Validation
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Verification status of GST, PAN, and MSME for all vendors
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading KYC validation data..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="📋" title="No KYC Records" description="No vendor KYC data available" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Total Pending" value={totalPending} icon="⏳" color="var(--gold)" subtitle="Awaiting verification" />
            <KPICard title="GST Verified" value={gstVerified} icon="✔" color="var(--success)" subtitle={`Of ${data.length} vendors`} />
            <KPICard title="PAN Verified" value={panVerified} icon="✔" color="var(--success)" subtitle={`Of ${data.length} vendors`} />
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
                  key: "gst_number",
                  label: "GST Number",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "gst_verified",
                  label: "GST Verified",
                  render: (val: any) => <VerifiedIcon verified={val} />,
                },
                {
                  key: "pan_verified",
                  label: "PAN Verified",
                  render: (val: any) => <VerifiedIcon verified={val} />,
                },
                {
                  key: "msme_verified",
                  label: "MSME Verified",
                  render: (val: any) => <VerifiedIcon verified={val} />,
                },
                {
                  key: "kyc_status",
                  label: "KYC Status",
                  render: (val: any) => <Badge value={val || "pending"} />,
                },
                {
                  key: "missing_fields",
                  label: "Missing Fields",
                  render: (val: any) => {
                    const fields = val as string[] | null;
                    if (!fields || fields.length === 0) {
                      return <span style={{ fontSize: "0.82rem", color: "#16a34a" }}>—</span>;
                    }
                    return (
                      <span style={{ fontSize: "0.82rem", color: "var(--danger)" }}>
                        {fields.join(", ")}
                      </span>
                    );
                  },
                },
              ]}
              searchKeys={["vendor_name", "vendor_code", "gst_number"]}
              searchPlaceholder="Search by vendor or GST..."
            />
          </div>
        </>
      )}
    </div>
  );
}
