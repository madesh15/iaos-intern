import { useState } from "react";

export default function SecurityCCTVCoveragePage() {
  const [zones] = useState([
    { zone: "Receiving Dock", coverage: "100%", status: "Active" },
    { zone: "High Value Bin", coverage: "100%", status: "Active" },
    { zone: "Dispatch Dock", coverage: "60%", status: "Blind Spots" },
  ]);

  const [incidents] = useState([
    { date: "2026-07-10", desc: "Camera 4 offline", zone: "Dispatch Dock" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Security & CCTV Coverage</h2>
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Coverage %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(row => (
              <tr key={row.zone}>
                <td><strong>{row.zone}</strong></td>
                <td>{row.coverage}</td>
                <td><span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Incident Log</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Zone</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.zone}</td>
                <td>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
