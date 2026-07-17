import { useState } from "react";

export default function ExceptionRedFlagQueuePage() {
  const [exceptions, setExceptions] = useState([
    { id: "EX-01", type: "Unauthorised Movement", details: "Bin-A to Bin-B no doc", status: "Open", notes: "" },
    { id: "EX-02", type: "SLA Breach", details: "Dock to Stock > 24h", status: "Investigating", notes: "Awaiting ops response" },
  ]);

  const updateStatus = (id: string, st: string) => setExceptions(exceptions.map(e => e.id === id ? { ...e, status: st } : e));
  const updateNotes = (id: string, notes: string) => setExceptions(exceptions.map(e => e.id === id ? { ...e, notes } : e));

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Exception & Red-Flag Queue</h2>
      <table>
        <thead>
          <tr>
            <th>Exception ID</th>
            <th>Type</th>
            <th>Details</th>
            <th>Disposition</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {exceptions.map(row => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.type}</td>
              <td>{row.details}</td>
              <td>
                <select className="select" style={{ padding: 4 }} value={row.status} onChange={e => updateStatus(row.id, e.target.value)}>
                  <option>Open</option>
                  <option>Investigating</option>
                  <option>Closed - False Positive</option>
                  <option>Closed - Confirmed</option>
                </select>
              </td>
              <td>
                <input className="input" style={{ padding: 4 }} value={row.notes} onChange={e => updateNotes(row.id, e.target.value)} placeholder="Add notes..." />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
