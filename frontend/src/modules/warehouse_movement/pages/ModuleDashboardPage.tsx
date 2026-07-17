import { useState } from "react";

export default function ModuleDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        <div className="card" style={{ padding: 22, textAlign: "center", background: "var(--navy-tint)" }}>
          <h3 style={{ margin: 0, color: "var(--slate)" }}>Risk Score</h3>
          <h1 style={{ margin: "8px 0", color: "var(--navy)" }}>Medium</h1>
        </div>
        <div className="card" style={{ padding: 22, textAlign: "center", background: "#fff3e0" }}>
          <h3 style={{ margin: 0, color: "var(--slate)" }}>Open Exceptions</h3>
          <h1 style={{ margin: "8px 0", color: "var(--gold)" }}>12</h1>
        </div>
        <div className="card" style={{ padding: 22, textAlign: "center", background: "#e8f5e9" }}>
          <h3 style={{ margin: 0, color: "var(--slate)" }}>Audit Coverage</h3>
          <h1 style={{ margin: "8px 0", color: "var(--green)" }}>85%</h1>
        </div>
        <div className="card" style={{ padding: 22, textAlign: "center", background: "var(--navy-tint)" }}>
          <h3 style={{ margin: 0, color: "var(--slate)" }}>Trend</h3>
          <h1 style={{ margin: "8px 0", color: "var(--navy)" }}>Improving</h1>
        </div>
      </div>
      
      <div className="card" style={{ padding: 22, height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate)", border: "1px dashed var(--slate)" }}>
        [ Chart Placeholder: Exceptions over time ]
      </div>
    </div>
  );
}
