import { useState } from "react";

export default function ScopeAuditUniversePage() {
  const [data, setData] = useState([
    { id: 1, entity: "Central Warehouse A", process: "Inbound Receiving", status: "In Scope" },
    { id: 2, entity: "Regional Hub B", process: "Dispatch", status: "In Scope" },
    { id: 3, entity: "Store C", process: "Returns", status: "Out of Scope" },
  ]);

  const [newEntity, setNewEntity] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newEntity) return;
    setData([...data, { id: Date.now(), entity: newEntity, process: "General", status: "In Scope" }]);
    setNewEntity("");
  };

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ padding: 22 }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Scope & Audit Universe</h2>
        <table>
          <thead>
            <tr>
              <th>Entity / Location</th>
              <th>Process</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td><strong>{row.entity}</strong></td>
                <td>{row.process}</td>
                <td><span className={`badge ${row.status === 'In Scope' ? 'badge-success' : 'badge-slate'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Entity</h3>
        <div className="field">
          <label>Entity Name</label>
          <input className="input" value={newEntity} onChange={e => setNewEntity(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Add to Scope</button>
      </form>
    </div>
  );
}
