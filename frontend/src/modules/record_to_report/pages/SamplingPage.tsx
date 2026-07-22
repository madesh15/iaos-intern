import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { DataTable, LoadingSpinner, EmptyState } from "../components";

export default function SamplingPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.sampling(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load sampling data" description={error} />;
  if (!data) return <EmptyState title="No sampling data" description="Generate sampling results from journal entries" />;

  const randomSample = data.random_sample || [];
  const monetaryUnitSample = data.monetary_unit_sample || [];
  const stratified = data.stratified || [];

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Sampling Engine</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Audit sampling methods: random, monetary unit, and stratified breakdown</p>

      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>Random Sample</h3>
        {randomSample.length === 0 ? (
          <div style={{ color: "var(--slate)", fontSize: "0.85rem", padding: "1rem" }}>No random sample data available</div>
        ) : (
          <DataTable
            data={randomSample}
            searchKeys={["je_number"]}
            searchPlaceholder="Search..."
            columns={[
              { key: "je_number", label: "JE Number" },
              { key: "amount", label: "Amount", render: (v: any) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
              { key: "user", label: "User" },
              { key: "date", label: "Date", render: (v: any) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            ]}
          />
        )}
      </div>

      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>Monetary Unit Sample</h3>
        {monetaryUnitSample.length === 0 ? (
          <div style={{ color: "var(--slate)", fontSize: "0.85rem", padding: "1rem" }}>No monetary unit sample data available</div>
        ) : (
          <DataTable
            data={monetaryUnitSample}
            searchKeys={["je_number"]}
            searchPlaceholder="Search..."
            columns={[
              { key: "je_number", label: "JE Number" },
              { key: "amount", label: "Amount", render: (v: any) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
              { key: "user", label: "User" },
              { key: "date", label: "Date", render: (v: any) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
            ]}
          />
        )}
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>Stratified Breakdown</h3>
        {stratified.length === 0 ? (
          <div style={{ color: "var(--slate)", fontSize: "0.85rem", padding: "1rem" }}>No stratified data available</div>
        ) : (
          <DataTable
            data={stratified}
            searchKeys={["category"]}
            searchPlaceholder="Search..."
            columns={[
              { key: "category", label: "Category" },
              { key: "count", label: "Count" },
              { key: "total_amount", label: "Total Amount", render: (v: any) => v ? "₹" + Number(v).toLocaleString("en-IN") : "—" },
              { key: "sample_size", label: "Sample Size" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
