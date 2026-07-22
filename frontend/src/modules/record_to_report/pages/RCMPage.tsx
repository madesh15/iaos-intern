import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { LoadingSpinner, EmptyState } from "../components";

export default function RCMPage() {
  const { data, loading, error } = useFetch(() => r2rApi.analytics.rcm(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load risk control matrix" description={error} />;

  if (!data || data.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Risk Control Matrix</h2>
        <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Mapping of risks to controls, owners, and assertions</p>
        <EmptyState icon="🛡️" title="No risk-control mappings" description="Define risk-control mappings for your audit" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Risk Control Matrix</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Mapping of risks to controls, owners, and assertions</p>

      <div className="card" style={{ padding: "1.25rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Risk", "Control", "Owner", "Assertion"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem", borderBottom: "2px solid var(--line)", color: "var(--slate)", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={row.id || i}>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--line-soft)", fontSize: "0.85rem" }}>{row.risk || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--line-soft)", fontSize: "0.85rem" }}>{row.control || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--line-soft)", fontSize: "0.85rem" }}>{row.owner || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--line-soft)", fontSize: "0.85rem" }}>{row.assertion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
