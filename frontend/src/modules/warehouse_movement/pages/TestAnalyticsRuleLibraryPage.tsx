import { useState } from "react";

export default function TestAnalyticsRuleLibraryPage() {
  const [rules, setRules] = useState([
    { id: "AR-101", name: "Dock-to-Stock SLA Breach", threshold: "24", unit: "Hours", active: true },
    { id: "AR-102", name: "High Value Mismatch", threshold: "1000", unit: "USD", active: false },
  ]);

  const toggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Test & Analytics Rule Library</h2>
      <table>
        <thead>
          <tr>
            <th>Rule ID</th>
            <th>Rule Name</th>
            <th>Threshold</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.name}</td>
              <td>
                <input className="input" style={{ width: 80, padding: 4, marginRight: 8 }} defaultValue={row.threshold} />
                {row.unit}
              </td>
              <td>
                <span className={`badge ${row.active ? 'badge-success' : 'badge-slate'}`}>
                  {row.active ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => toggle(row.id)}>
                  {row.active ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
