import { useState } from "react";

export default function RuleLibraryView() {
  const [rules] = useState([
    { id: "RULE-01", name: "Escrow 70% Threshold Breach", target: "Escrow Account", threshold: "Withdrawal > 70% eligible", frequency: "Daily", status: "Active" },
    { id: "RULE-02", name: "Fund Diversion Detection", target: "Bank Transfers", threshold: "Inter-project GL movement", frequency: "Real-time", status: "Active" },
    { id: "RULE-03", name: "Budget Variance Alert", target: "Cost Budgets", threshold: "Actual > 110% of approved", frequency: "Weekly", status: "Active" },
    { id: "RULE-04", name: "Possession Delay Penalty Calc", target: "Registration Tracker", threshold: "Delay > RERA deadline", frequency: "Monthly", status: "Active" },
    { id: "RULE-05", name: "Revenue Recognition vs Handover", target: "Revenue Ledger", threshold: "Recognised without handover cert", frequency: "Monthly", status: "Draft" },
    { id: "RULE-06", name: "Unsold Inventory NRV Write-down", target: "Inventory Register", threshold: "NRV < 80% of booked price", frequency: "Quarterly", status: "Active" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Test & Analytics Rule Library</h3>
        <p style={{ color: "var(--slate)" }}>
          Automated CAAT rules, thresholds, and analytics scripts configured for this module's domain.
        </p>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Rule ID</th><th>Rule Name</th><th>Target Data</th><th>Threshold / Logic</th><th>Frequency</th><th>Status</th></tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.name}</td>
                <td>{r.target}</td>
                <td style={{ fontSize: 13 }}>{r.threshold}</td>
                <td>{r.frequency}</td>
                <td><span className={`badge ${r.status === "Active" ? "badge-success" : "badge-gold"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
