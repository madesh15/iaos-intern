import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function SuspenseAgeingPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.suspenseAgeing(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load suspense ageing data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No suspense account entries" description="No outstanding suspense balances found" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Suspense Account Ageing</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Outstanding suspense balances aged by days outstanding</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "account"]}
          searchPlaceholder="Search JE or account..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "account", label: "Account" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            { key: "age_days", label: "Age (Days)" },
            { key: "ageing_bucket", label: "Ageing Bucket", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
