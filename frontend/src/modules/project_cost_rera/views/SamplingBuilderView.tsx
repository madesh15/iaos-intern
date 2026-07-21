import { useState } from "react";

export default function SamplingBuilderView() {
  const [method, setMethod] = useState("monetary");
  const [population] = useState({ size: 247, totalValue: 185_000_000 });
  const [sampleSize] = useState(35);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Sampling & Population Builder</h3>
        <p style={{ color: "var(--slate)" }}>
          Draw statistical or judgemental samples from the full population for substantive testing.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Population Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span>Population Size</span><strong>{population.size} transactions</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span>Total Value</span><strong>₹{population.totalValue.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
              <span>Recommended Sample</span><strong>{sampleSize} items</strong>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Sampling Method</h3>
          <div className="field">
            <label>Method</label>
            <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="monetary">Monetary Unit Sampling (MUS)</option>
              <option value="random">Simple Random Sampling</option>
              <option value="stratified">Stratified Sampling</option>
              <option value="judgemental">Judgemental / Risk-Based</option>
            </select>
          </div>
          <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 12 }}>
            {method === "monetary" && "MUS selects items proportional to their monetary value. Ideal for high-value escrow and cost transactions."}
            {method === "random" && "Every transaction has an equal chance of selection. Suitable for homogeneous populations."}
            {method === "stratified" && "Population is split by risk strata (e.g., project, cost head) with independent sampling per stratum."}
            {method === "judgemental" && "Sample is hand-picked based on auditor risk assessment and domain expertise."}
          </p>
        </div>
      </div>
    </div>
  );
}
