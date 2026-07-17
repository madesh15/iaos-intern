import { useState } from "react";

export default function SamplingPopulationBuilderPage() {
  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.5fr" }}>
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Population Builder</h2>
        <div className="field">
          <label>Data Set</label>
          <select className="select">
            <option>All Goods Receipts (Q3)</option>
            <option>Dispatches (Q3)</option>
          </select>
        </div>
        <div className="field">
          <label>Sample Size Method</label>
          <select className="select">
            <option>Random (n=25)</option>
            <option>Monetary Unit Sampling</option>
            <option>High Value Stratified</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Generate Sample</button>
      </div>
      
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Sample Results</h2>
        <p style={{ color: "var(--slate)" }}>Population: 1,450 records. Sample: 25 selected.</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>GE-091</td><td>2026-08-01</td><td>$1,500</td></tr>
            <tr><td>GE-211</td><td>2026-08-05</td><td>$850</td></tr>
            <tr><td>GE-304</td><td>2026-08-10</td><td>$3,200</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
