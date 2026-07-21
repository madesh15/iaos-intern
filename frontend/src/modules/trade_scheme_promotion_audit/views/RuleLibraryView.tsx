import { useState } from "react";

export default function RuleLibraryView() {
  const [rules] = useState([
    { id: "RULE-TS-01", name: "Duplicate Claim Detection", query: "SELECT claim_id, distributor, scheme_code, COUNT(*) as dup_count FROM claims GROUP BY distributor, scheme_code HAVING dup_count > 1", status: "Active" },
    { id: "RULE-TS-02", name: "Ghost Outlet Identification", query: "SELECT outlet_code FROM outlets WHERE is_ghost=1 OR performance_status='Ghost'", status: "Active" },
    { id: "RULE-TS-03", name: "Scheme Overlap Flag", query: "SELECT s1.scheme_code, s2.scheme_code FROM schemes s1 JOIN schemes s2 ON s1.channel=s2.channel AND s1.end_date >= s2.start_date AND s1.start_date <= s2.end_date", status: "Active" },
    { id: "RULE-TS-04", name: "Accrual Variance > 15%", query: "SELECT promo_name, accrual_amount, actual_spend, ABS(accrual_amount - actual_spend)/accrual_amount*100 as var_pct FROM spend WHERE ABS(accrual_amount - actual_spend)/accrual_amount > 0.15", status: "Active" },
    { id: "RULE-TS-05", name: "Unreconciled Free-Goods > 30 Days", query: "SELECT * FROM spend WHERE free_goods_qty > 0 AND free_goods_reconciled = 0 AND DATEDIFF(NOW(), promo_period_end) > 30", status: "Active" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Test & Analytics Rule Library</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the automated CAAT rules that monitor trade-spend data to flag duplicate claims, ghost outlets, overlaps and accrual variances.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Rule Name</th>
              <th>Technical CAAT Query (SQL)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.name}</td>
                <td><code style={{ background: "var(--line-soft)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>{r.query}</code></td>
                <td><span className="badge badge-success">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
