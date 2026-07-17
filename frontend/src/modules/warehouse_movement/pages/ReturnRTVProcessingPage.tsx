import { useState } from "react";

export default function ReturnRTVProcessingPage() {
  const [returns] = useState([
    { id: "RTV-01", vendor: "Supplier A", item: "Defective Motors", status: "Approved" },
    { id: "RTV-02", vendor: "Supplier B", item: "Wrong Parts", status: "Raised" },
    { id: "RTV-03", vendor: "Supplier C", item: "Damaged Goods", status: "Closed" },
  ]);

  const stages = ["Raised", "Approved", "Dispatched", "Closed"];

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Return to Vendor (RTV) Processing</h2>
      <table>
        <thead>
          <tr>
            <th>RTV ID</th>
            <th>Vendor</th>
            <th>Item</th>
            <th>Status Tracker</th>
          </tr>
        </thead>
        <tbody>
          {returns.map(row => {
            const currentIdx = stages.indexOf(row.status);
            return (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.vendor}</td>
                <td>{row.item}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {stages.map((stage, idx) => (
                      <div key={stage} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ 
                          padding: "4px 8px", 
                          fontSize: 12, 
                          borderRadius: 12, 
                          background: idx <= currentIdx ? "var(--navy)" : "#eee",
                          color: idx <= currentIdx ? "#fff" : "var(--slate)"
                        }}>
                          {stage}
                        </div>
                        {idx < stages.length - 1 && <div style={{ width: 10, height: 2, background: idx < currentIdx ? "var(--navy)" : "#eee" }} />}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
