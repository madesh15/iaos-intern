import { useState } from "react";

const risks = [
  { id: "R1", risk: "Freight Overbilling", category: "Rate Compliance", likelihood: 4, impact: 4, score: 16, rating: "High", controls: "Auto rate validation, 3-way match" },
  { id: "R2", risk: "Duplicate Payments", category: "Duplicate Billing", likelihood: 3, impact: 5, score: 15, rating: "High", controls: "Invoice number unique check, PO matching" },
  { id: "R3", risk: "SLA Non-Compliance", category: "Service Level", likelihood: 4, impact: 3, score: 12, rating: "Medium", controls: "SLA tracking dashboard, penalty clauses" },
  { id: "R4", risk: "Fuel Surcharge Errors", category: "Billing", likelihood: 3, impact: 3, score: 9, rating: "Medium", controls: "Index-based calculation, periodic audit" },
  { id: "R5", risk: "Weight Manipulation", category: "Fraud", likelihood: 2, impact: 4, score: 8, rating: "Medium", controls: "Weighbor bridge verification, random checks" },
  { id: "R6", risk: "Route Inflation", category: "Operational", likelihood: 3, impact: 2, score: 6, rating: "Low", controls: "GPS tracking, geo-fence alerts" },
  { id: "R7", risk: "Unapproved Carrier Usage", category: "Compliance", likelihood: 2, impact: 3, score: 6, rating: "Low", controls: "Approved carrier master, PO validation" },
];

export default function RiskControlPage() {
  const [view, setView] = useState<"matrix" | "register">("matrix");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Risk & Control Matrix</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${view === "matrix" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("matrix")}>Heat Map</button>
          <button className={`btn ${view === "register" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("register")}>Risk Register</button>
        </div>
      </div>

      {view === "matrix" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, maxWidth: 500 }}>
            <div></div>
            {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ textAlign: "center", fontWeight: 600, fontSize: 12 }}>I={i}</div>)}
            {[5, 4, 3, 2, 1].map((l) => (
              <>
                <div style={{ fontWeight: 600, fontSize: 12 }}>L={l}</div>
                {[1, 2, 3, 4, 5].map((i) => {
                  const score = l * i;
                  const color = score >= 15 ? "#dc2626" : score >= 8 ? "#ca8a04" : "#059669";
                  const matchingRisks = risks.filter((r) => r.likelihood === l && r.impact === i);
                  return (
                    <div key={`${l}-${i}`} style={{
                      background: color, padding: 8, borderRadius: 4, minHeight: 40,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, textAlign: "center",
                    }}>
                      {matchingRisks.length > 0 ? matchingRisks.map((r) => <div key={r.id}>{r.id}</div>) : ""}
                    </div>
                  );
                })}
              </>
            ))}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h4>Risk Rating Legend</h4>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#dc2626", borderRadius: 2, marginRight: 4 }}></span> High (15-25)</span>
              <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#ca8a04", borderRadius: 2, marginRight: 4 }}></span> Medium (8-14)</span>
              <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#059669", borderRadius: 2, marginRight: 4 }}></span> Low (1-7)</span>
            </div>
          </div>
        </div>
      )}

      {view === "register" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Risk</th><th>Category</th><th>L</th><th>I</th>
                <th>Score</th><th>Rating</th><th>Key Controls</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td>{r.risk}</td>
                  <td>{r.category}</td>
                  <td>{r.likelihood}</td><td>{r.impact}</td>
                  <td><strong>{r.score}</strong></td>
                  <td><span className={`badge ${r.rating === "High" ? "badge-danger" : r.rating === "Medium" ? "badge" : "badge-success"}`}>{r.rating}</span></td>
                  <td style={{ fontSize: 12 }}>{r.controls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
