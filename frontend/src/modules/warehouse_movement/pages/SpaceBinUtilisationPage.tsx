import { useState } from "react";

export default function SpaceBinUtilisationPage() {
  const [bins] = useState([
    { bin: "A-01", zone: "Bulk", util: 95 },
    { bin: "A-02", zone: "Bulk", util: 80 },
    { bin: "B-01", zone: "Pick", util: 40 },
    { bin: "B-02", zone: "Pick", util: 10 },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", margin: "0 0 16px 0" }}>Zone Utilisation</h2>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1, padding: 16, background: "var(--navy-tint)", borderRadius: 8, textAlign: "center" }}>
            <h3>Bulk Zone</h3>
            <h1 style={{ color: "var(--navy)", margin: "8px 0" }}>87.5%</h1>
          </div>
          <div style={{ flex: 1, padding: 16, background: "var(--navy-tint)", borderRadius: 8, textAlign: "center" }}>
            <h3>Pick Zone</h3>
            <h1 style={{ color: "var(--navy)", margin: "8px 0" }}>25.0%</h1>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Bin-Level Detail</h2>
        <table>
          <thead>
            <tr>
              <th>Bin</th>
              <th>Zone</th>
              <th>Utilisation %</th>
              <th>Indicator</th>
            </tr>
          </thead>
          <tbody>
            {bins.sort((a, b) => b.util - a.util).map(row => (
              <tr key={row.bin}>
                <td><strong>{row.bin}</strong></td>
                <td>{row.zone}</td>
                <td>{row.util}%</td>
                <td>
                  <div style={{ width: "100%", background: "#eee", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${row.util}%`, background: row.util > 90 ? "var(--red)" : "var(--navy)", height: "100%" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
