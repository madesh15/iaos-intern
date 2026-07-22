import { useState } from "react";

export default function SamplingBuilderView() {
  const [population, setPopulation] = useState(5000);
  const [confidence, setConfidence] = useState(95);
  const [margin, setMargin] = useState(5);
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  const zScores: Record<number, number> = { 99: 2.576, 95: 1.96, 90: 1.645 };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const z = zScores[confidence];
    const p = 0.5;
    const e2 = margin / 100;
    const num = Math.pow(z, 2) * p * (1 - p);
    const den = Math.pow(e2, 2);
    const ss = Math.ceil((num / den) / (1 + (num / den - 1) / population));
    setSampleSize(ss);
  };

  const sampleItems = sampleSize
    ? Array.from({ length: Math.min(sampleSize, 20) }, (_, i) => ({
        id: `SAMP-${String(i + 1).padStart(4, "0")}`,
        itemCode: `MAT-${Math.floor(Math.random() * 9000 + 1000)}`,
        category: ["Raw Material", "Packing", "Finished Good", "Spare"][Math.floor(Math.random() * 4)],
        selectedDate: new Date().toISOString().split("T")[0],
      }))
    : [];

  const handleExport = () => { console.log("Export CSV"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Population Size", value: population.toLocaleString(), color: "var(--navy)" },
          { label: "Sample Size", value: sampleSize ?? "-", color: "var(--gold)" },
          { label: "Confidence Level", value: `${confidence}%`, color: "var(--success)" },
          { label: "Margin of Error", value: `±${margin}%`, color: "var(--slate)" },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.2fr 1.8fr" }}>
        <form className="card" style={{ padding: 22 }} onSubmit={calculate}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 14px" }}>Sampling Parameters</h4>
          <div className="field">
            <label>Population Size (N)</label>
            <input className="input" type="number" value={population} onChange={(e) => setPopulation(Number(e.target.value))} min={10} required />
          </div>
          <div className="field">
            <label>Confidence Level</label>
            <select className="select" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>
              <option value={99}>99% (High assurance)</option>
              <option value={95}>95% (Standard)</option>
              <option value={90}>90% (Low risk)</option>
            </select>
          </div>
          <div className="field">
            <label>Margin of Error (%)</label>
            <input className="input" type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} min={1} max={20} step={0.5} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Calculate Sample Size</button>
        </form>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h4 style={{ color: "var(--navy)", margin: 0 }}>Sample Results</h4>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={handleExport}>Export CSV</button>
          </div>

          {sampleSize === null ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>Configure parameters and calculate to see sample items.</div>
          ) : (
            <>
              <div style={{ background: "var(--navy-tint)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Recommended Sample Size (n)</div>
                <h1 style={{ fontSize: 40, color: "var(--navy)", margin: "4px 0" }}>{sampleSize}</h1>
                <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>from N={population} at {confidence}% confidence, ±{margin}% margin</div>
              </div>

              {sampleItems.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Item Code</th>
                      <th>Category</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleItems.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.id}</strong></td>
                        <td>{s.itemCode}</td>
                        <td>{s.category}</td>
                        <td>{s.selectedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sampleSize > 20 && (
                <div style={{ padding: "8px 0", textAlign: "center", fontSize: 12, color: "var(--slate)" }}>
                  Showing 20 of {sampleSize} sample items. Use Export CSV for full list.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
