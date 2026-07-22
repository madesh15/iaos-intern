import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type Rule = {
  id: number;
  name: string;
  ruleType: string;
  severity: string;
  enabled: boolean;
  parameters: string;
  description: string;
};

export default function RuleLibraryView() {
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, name: "Duplicate Item Code Detection", ruleType: "Data Quality", severity: "High", enabled: true, parameters: "Similarity > 85%", description: "Detect items with matching name/material group combinations" },
    { id: 2, name: "Missing HSN Code Check", ruleType: "Completeness", severity: "High", enabled: true, parameters: "HSN field required", description: "Flag items where HSN code is not populated" },
    { id: 3, name: "UOM Consistency Rule", ruleType: "Validation", severity: "Medium", enabled: true, parameters: "Base UOM = Purchase UOM", description: "Verify base unit of measure matches purchase order UOM" },
    { id: 4, name: "Valuation Class Check", ruleType: "Accuracy", severity: "High", enabled: false, parameters: "Valuation class mapped to GL", description: "Ensure valuation class is correctly assigned" },
    { id: 5, name: "Obsolete Item Flagging", ruleType: "Lifecycle", severity: "Medium", enabled: true, parameters: "No movement > 365 days", description: "Mark items with zero movement for over a year" },
    { id: 6, name: "Material Group Validation", ruleType: "Data Quality", severity: "Low", enabled: false, parameters: "Group exists in master", description: "Validate material group references" },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<Rule[]>(`/api/modules/${SLUG}/rules`)
      .then((apiRules) => { if (apiRules && apiRules.length > 0) setRules(apiRules); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleRule = (id: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const total = rules.length;
  const enabled = rules.filter((r) => r.enabled).length;
  const disabled = total - enabled;

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading rules...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Total Rules", value: total, color: "var(--navy)" },
          { label: "Enabled", value: enabled, color: "var(--success)" },
          { label: "Disabled", value: disabled, color: "var(--slate)" },
          { label: "Active Checks", value: enabled, color: "var(--gold)" },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Rule Name</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Enabled</th>
              <th>Parameters</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td><span className="badge badge-slate">{r.ruleType}</span></td>
                <td><span className={`badge ${r.severity === "High" ? "badge-danger" : r.severity === "Medium" ? "badge-gold" : "badge-slate"}`}>{r.severity}</span></td>
                <td>
                  <button
                    className={`btn ${r.enabled ? "btn-primary" : "btn-ghost"}`}
                    style={{ fontSize: 12, padding: "4px 12px" }}
                    onClick={() => toggleRule(r.id)}
                  >
                    {r.enabled ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td style={{ fontSize: 13, color: "var(--slate)" }}>{r.parameters}</td>
                <td style={{ fontSize: 13, color: "var(--slate)", maxWidth: 250 }}>{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
