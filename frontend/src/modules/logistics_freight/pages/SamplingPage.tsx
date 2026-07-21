import { useState } from "react";

export default function SamplingPage() {
  const [method, setMethod] = useState("random");

  const populations = [
    { name: "Freight Invoices (Jun 2025)", total: 145, sample: 25, method: "Random", coverage: "17.2%" },
    { name: "Freight Shipments (Q2 2025)", total: 320, sample: 40, method: "Stratified", coverage: "12.5%" },
    { name: "Carrier Contracts (Active)", total: 45, sample: 10, method: "Judgmental", coverage: "22.2%" },
    { name: "Claims (Open)", total: 12, sample: 12, method: "100% Check", coverage: "100%" },
    { name: "Fuel Surcharge Transactions", total: 280, sample: 30, method: "Random", coverage: "10.7%" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Sampling & Population Builder</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12 }}>Sampling Methodology</h4>
          <div className="field">
            <label>Method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="random">Random Sampling</option>
              <option value="stratified">Stratified Sampling</option>
              <option value="systematic">Systematic Sampling</option>
              <option value="judgmental">Judgmental Sampling</option>
              <option value="100">100% Check (High Risk)</option>
            </select>
          </div>
          <div className="field">
            <label>Confidence Level</label>
            <select className="input"><option>95%</option><option>99%</option><option>90%</option></select>
          </div>
          <div className="field">
            <label>Margin of Error</label>
            <input className="input" type="text" defaultValue="5%" />
          </div>
          <button className="btn btn-primary">Generate Sample</button>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ marginBottom: 12 }}>Population Filters</h4>
          <div className="field"><label>Date Range</label><input className="input" type="text" defaultValue="Apr 2025 - Jun 2025" /></div>
          <div className="field"><label>Carrier</label><select className="input"><option>All Carriers</option><option>Speed Logistics</option><option>Cargo Express</option></select></div>
          <div className="field"><label>Transaction Type</label><select className="input"><option>All Types</option><option>Road</option><option>Rail</option><option>Sea</option><option>Air</option></select></div>
          <div className="field"><label>Risk Filter</label><select className="input"><option>All</option><option>High Risk Only</option><option>Medium & Above</option></select></div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          Sample Populations
        </div>
        <table>
          <thead>
            <tr>
              <th>Population</th><th>Total</th><th>Sample Size</th><th>Method</th><th>Coverage</th><th></th>
            </tr>
          </thead>
          <tbody>
            {populations.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td><td>{p.total}</td><td><strong>{p.sample}</strong></td>
                <td><span className="badge">{p.method}</span></td><td>{p.coverage}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>View</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Export</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
