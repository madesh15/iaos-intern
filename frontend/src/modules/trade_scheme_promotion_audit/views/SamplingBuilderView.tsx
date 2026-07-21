import { useState } from "react";

export default function SamplingBuilderView() {
  const [popSize, setPopSize] = useState(5000);
  const [confidence, setConfidence] = useState(95);
  const [sampleSize, setSampleSize] = useState(357);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const zScore = confidence === 99 ? 2.576 : confidence === 95 ? 1.96 : 1.645;
    const p = 0.5;
    const e2 = 0.05 * 0.05;
    const n0 = (zScore * zScore * p * (1 - p)) / e2;
    const n = Math.min(popSize, Math.round(n0 / (1 + (n0 - 1) / popSize)));
    setSampleSize(n);
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.2fr 1.8fr" }}>
      <form className="card" style={{ padding: 22 }} onSubmit={calculate}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Sample Calculator</h3>
        <div className="field">
          <label>Total Population Size (N)</label>
          <input className="input" type="number" value={popSize} onChange={(e) => setPopSize(Number(e.target.value))} min={1} required />
        </div>
        <div className="field">
          <label>Desired Confidence Level</label>
          <select className="select" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>
            <option value={99}>99% (Critical trade-spend checks)</option>
            <option value={95}>95% (Standard claim verification)</option>
            <option value={90}>90% (Low-risk scheme audits)</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Calculate Sample Size</button>
      </form>

      <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ color: "var(--navy)" }}>Sampling & Population Builder</h3>
        <p style={{ color: "var(--slate)" }}>
          Statistically select which trade claims, scheme records or outlet audits to verify during detail testing.
          Enforce randomized checks on high-risk distributors and channels.
        </p>
        <div style={{ background: "var(--navy-tint)", borderRadius: "var(--radius)", padding: 20, marginTop: "auto" }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Suggested Sample Audit Size (n)</div>
          <h1 style={{ fontSize: 48, color: "var(--navy)", margin: "4px 0" }}>{sampleSize} <span style={{ fontSize: 16, color: "var(--slate-soft)", fontWeight: 400 }}>records to audit</span></h1>
          <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Based on N={popSize}, {confidence}% confidence, 5% margin of error.</div>
        </div>
      </div>
    </div>
  );
}
