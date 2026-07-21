import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState, KPICard } from "../components";

export default function DuplicateBankAccountsPage() {
  const { data, loading, error } = useFetch(() => vendorApi.duplicateBank());

  const totalDuplicates = data?.length ?? 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Duplicate Bank Accounts
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Multiple vendors sharing the same bank account number
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading duplicate bank accounts..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🏦" title="No Duplicate Accounts" description="No bank accounts are shared between multiple vendors" />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KPICard title="Duplicate Accounts" value={totalDuplicates} icon="🏦" color="var(--danger)" subtitle="Shared bank accounts detected" />
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <DataTable
              data={data}
              columns={[
                {
                  key: "account_number",
                  label: "Account Number",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace", fontWeight: 600, color: "var(--navy)" }}>
                      {val || "—"}
                    </span>
                  ),
                },
                {
                  key: "ifsc",
                  label: "IFSC",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "bank_name",
                  label: "Bank Name",
                  render: (val: any) => (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                  ),
                },
                {
                  key: "vendors",
                  label: "Vendors",
                  render: (val: any) => {
                    const vendors = val as { id: number; name: string; code: string }[];
                    if (!vendors || vendors.length === 0) return "—";
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {vendors.map((v) => (
                          <span key={v.id} style={{ fontSize: "0.8rem" }}>
                            <span style={{ fontWeight: 600, color: "var(--navy)" }}>{v.code}</span>
                            <span style={{ color: "var(--slate)", marginLeft: 4 }}>{v.name}</span>
                          </span>
                        ))}
                      </div>
                    );
                  },
                },
              ]}
              searchKeys={["account_number", "ifsc", "bank_name"]}
              searchPlaceholder="Search by account number, IFSC or bank..."
            />
          </div>
        </>
      )}
    </div>
  );
}
