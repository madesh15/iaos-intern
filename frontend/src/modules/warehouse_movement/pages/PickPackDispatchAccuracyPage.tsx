import { useState } from "react";

export default function PickPackDispatchAccuracyPage() {
  const [data] = useState([
    { order: "ORD-991", pick: "Done", pack: "Done", dispatch: "Pending", error: "None" },
    { order: "ORD-992", pick: "Error", pack: "Pending", dispatch: "Pending", error: "Short Pick" },
    { order: "ORD-993", pick: "Done", pack: "Error", dispatch: "Pending", error: "Wrong Packaging" },
  ]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Pick-Pack-Dispatch Accuracy</h2>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Pick Status</th>
            <th>Pack Status</th>
            <th>Dispatch Status</th>
            <th>Error Flag</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.order}>
              <td><strong>{row.order}</strong></td>
              <td>{row.pick}</td>
              <td>{row.pack}</td>
              <td>{row.dispatch}</td>
              <td>
                {row.error !== 'None' ? <span className="badge badge-danger">{row.error}</span> : <span className="badge badge-success">None</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
