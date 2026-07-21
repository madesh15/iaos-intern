import { useEffect, useState } from "react";
import { get } from "../../lib/api";

const BASE = "/api/modules/insurance_coverage_claims/analytics";
type Kind = "coverage-adequacy" | "uninsured-assets" | "lodgement-timeliness" | "premium-benchmark" | "duplicate-cover";

const TABS: { key: Kind; label: string }[] = [
  { key: "coverage-adequacy", label: "Coverage Adequacy" },
  { key: "uninsured-assets", label: "Uninsured / Underinsured" },
  { key: "lodgement-timeliness", label: "Claim Lodgement Timeliness" },
  { key: "premium-benchmark", label: "Premium vs Coverage Benchmark" },
  { key: "duplicate-cover", label: "Duplicate / Overlapping Cover" },
];

function badgeClass(v: string) {
  const map: Record<string, string> = {
    underinsured: "badge-danger",
    breach: "badge-danger",
    high: "badge-danger",
    overinsured: "badge-gold",
    medium: "badge-gold",
    adequate: "badge-success",
    on_time: "badge-success",
    low: "badge-success",
  };
  return `badge ${map[v] || "badge-slate"}`;
}

export default function AnalyticsPanel() {
  const [kind, setKind] = useState<Kind>("coverage-adequacy");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get<Record<string, unknown>[]>(`${BASE}/${kind}`)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [kind]);

  const columns = COLUMNS[kind];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === kind ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "6px 14px", fontSize: 13 }}
            onClick={() => setKind(t.key)}
          >
            {t.label}
          </button>
        ))}
        {kind === "coverage-adequacy" && (
          <a
            className="btn btn-ghost"
            style={{ padding: "6px 14px", fontSize: 13, marginLeft: "auto" }}
            href={`${BASE}/coverage-adequacy/export.csv`}
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
        )}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? "—")}</td>
                ))}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ color: "var(--slate)" }}>
                  No data yet — add policies and claims first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Col {
  key: string;
  label: string;
  render?: (r: Record<string, unknown>) => React.ReactNode;
}

const COLUMNS: Record<Kind, Col[]> = {
  "coverage-adequacy": [
    { key: "policy_number", label: "Policy" },
    { key: "asset_or_entity_covered", label: "Asset" },
    { key: "asset_value", label: "Asset Value" },
    { key: "sum_insured", label: "Sum Insured" },
    { key: "coverage_pct", label: "Coverage %" },
    { key: "status", label: "Status", render: (r) => <span className={badgeClass(String(r.status))}>{String(r.status)}</span> },
    { key: "risk_rating", label: "Risk", render: (r) => <span className={badgeClass(String(r.risk_rating))}>{String(r.risk_rating)}</span> },
  ],
  "uninsured-assets": [
    { key: "asset_or_entity_covered", label: "Asset" },
    { key: "location", label: "Location" },
    { key: "asset_value", label: "Asset Value" },
    { key: "insured_value", label: "Insured Value" },
    { key: "coverage_gap", label: "Coverage Gap" },
    { key: "risk_level", label: "Risk", render: (r) => <span className={badgeClass(String(r.risk_level))}>{String(r.risk_level)}</span> },
  ],
  "lodgement-timeliness": [
    { key: "claim_number", label: "Claim No" },
    { key: "incident_date", label: "Incident Date" },
    { key: "claim_date", label: "Claim Date" },
    { key: "delay_days", label: "Delay (days)" },
    { key: "sla_status", label: "SLA", render: (r) => <span className={badgeClass(String(r.sla_status))}>{String(r.sla_status)}</span> },
    { key: "late_claim", label: "Late?", render: (r) => (r.late_claim ? "Yes" : "No") },
  ],
  "premium-benchmark": [
    { key: "policy_number", label: "Policy" },
    { key: "premium", label: "Premium" },
    { key: "coverage", label: "Coverage" },
    { key: "premium_pct", label: "Premium %" },
    { key: "benchmark_pct", label: "Benchmark %" },
    {
      key: "variance_pct",
      label: "Variance",
      render: (r) => (
        <span className={badgeClass(Number(r.variance_pct) > 0 ? "high" : "low")}>
          {String(r.variance_pct)}%
        </span>
      ),
    },
  ],
  "duplicate-cover": [
    { key: "asset_or_entity_covered", label: "Asset" },
    { key: "policy_type", label: "Policy Type" },
    { key: "policy_count", label: "# Policies" },
    { key: "policy_numbers", label: "Policy Numbers", render: (r) => (r.policy_numbers as string[]).join(", ") },
    { key: "total_premium", label: "Total Premium" },
  ],
};
