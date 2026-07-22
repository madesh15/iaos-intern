import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function OddHourPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.oddHour(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load odd hour data" description={error} />;
  if (!data || data.length === 0) return <EmptyState title="No odd hour postings found" description="All journal entries are within normal posting hours" />;

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Odd Hour Posting Detection</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Journal entries posted outside standard business hours</p>

      <div className="card" style={{ padding: "1.25rem" }}>
        <DataTable
          data={data}
          searchKeys={["je_number", "user"]}
          searchPlaceholder="Search JE number or user..."
          columns={[
            { key: "je_number", label: "JE Number" },
            { key: "user", label: "User" },
            { key: "date", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            { key: "amount", label: "Amount", render: (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
            { key: "posting_hour", label: "Posting Hour" },
            { key: "day_of_week", label: "Day of Week" },
            { key: "risk_level", label: "Risk Level", render: (v) => <Badge value={v || "—"} /> },
          ]}
        />
      </div>
    </div>
  );
}
