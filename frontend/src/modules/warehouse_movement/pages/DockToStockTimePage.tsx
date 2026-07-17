import { useState } from "react";

export default function DockToStockTimePage() {
  const [data] = useState([
    { grn: "GRN-801", gateIn: "08:00 AM", putaway: "10:30 AM", timeHrs: 2.5, breach: false },
    { grn: "GRN-802", gateIn: "09:00 AM", putaway: "09:00 AM (+1 day)", timeHrs: 24, breach: true },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "var(--navy)", margin: 0 }}>Dock-to-Stock Time</h2>
        <span className="badge badge-gold">SLA Target: &lt; 12 Hours</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>GRN</th>
            <th>Gate-In Time</th>
            <th>Putaway Complete</th>
            <th>Time Taken (Hrs)</th>
            <th>SLA Breach</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.grn}>
              <td><strong>{row.grn}</strong></td>
              <td>{row.gateIn}</td>
              <td>{row.putaway}</td>
              <td>{row.timeHrs}</td>
              <td>{row.breach ? <span className="badge badge-danger">Breach</span> : <span className="badge badge-success">On Time</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
