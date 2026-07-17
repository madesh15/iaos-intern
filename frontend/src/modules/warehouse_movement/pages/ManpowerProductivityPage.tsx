import { useState } from "react";

export default function ManpowerProductivityPage() {
  const [data] = useState([
    { shift: "Morning", worker: "W-01", lines: 120, hrs: 8, costPerWorker: 160 },
    { shift: "Morning", worker: "W-02", lines: 80, hrs: 8, costPerWorker: 160 },
    { shift: "Evening", worker: "W-03", lines: 150, hrs: 8, costPerWorker: 180 },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Manpower Productivity</h2>
      <table>
        <thead>
          <tr>
            <th>Worker ID</th>
            <th>Shift</th>
            <th>Lines Picked</th>
            <th>Lines per Hour</th>
            <th>Cost per Worker ($)</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const lph = (row.lines / row.hrs).toFixed(1);
            return (
              <tr key={row.worker}>
                <td><strong>{row.worker}</strong></td>
                <td>{row.shift}</td>
                <td>{row.lines}</td>
                <td>{lph}</td>
                <td>${row.costPerWorker}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
