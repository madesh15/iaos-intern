import { useEffect, useState } from "react";
import { get, post, put } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type Action = {
  id: number;
  findingId: string;
  action: string;
  status: string;
  completedBy: string;
  date: string;
};

export default function ActionTrackerView() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAction, setNewAction] = useState({ findingId: "", action: "", completedBy: "" });

  useEffect(() => {
    get<Action[]>(`/api/modules/${SLUG}/remediation`)
      .then((data) => setActions(data))
      .catch(() => {
        setActions([
          { id: 1, findingId: "F-MM-001", action: "Assign HSN codes to all raw materials", status: "Pending", completedBy: "R. Sharma", date: "2026-08-15" },
          { id: 2, findingId: "F-MM-002", action: "Reconcile UOM mapping for packing items", status: "In Progress", completedBy: "P. Mehta", date: "2026-08-10" },
          { id: 3, findingId: "F-MM-003", action: "Update standard cost for valuation class 3000", status: "Completed", completedBy: "S. Patel", date: "2026-07-20" },
          { id: 4, findingId: "F-MM-001", action: "Remove duplicate item MAT-0892 from master", status: "Pending", completedBy: "A. Kumar", date: "2026-08-20" },
          { id: 5, findingId: "F-MM-004", action: "Verify material group for all active items", status: "Overdue", completedBy: "L. Vance", date: "2026-07-01" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const createAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Date.now();
    const entry: Action = { id: tempId, ...newAction, status: "Pending", date: new Date().toISOString().split("T")[0] };
    try {
      const created = await post<Action>(`/api/modules/${SLUG}/remediation`, newAction);
      setActions((prev) => [...prev, created]);
    } catch {
      setActions((prev) => [...prev, entry]);
    }
    setNewAction({ findingId: "", action: "", completedBy: "" });
    setShowForm(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await put(`/api/modules/${SLUG}/remediation/${id}`, { status });
    } catch {}
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const cardData = [
    { label: "Total Actions", value: actions.length, color: "var(--navy)" },
    { label: "Pending", value: actions.filter((a) => a.status === "Pending").length, color: "var(--slate)" },
    { label: "In Progress", value: actions.filter((a) => a.status === "In Progress").length, color: "var(--gold)" },
    { label: "Completed", value: actions.filter((a) => a.status === "Completed").length, color: "var(--success)" },
    { label: "Overdue", value: actions.filter((a) => a.status === "Overdue").length, color: "var(--danger)" },
  ];

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading actions...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {cardData.map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ color: "var(--navy)", margin: 0 }}>Remediation / CAPA Actions</h4>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "New Action"}</button>
        </div>

        {showForm && (
          <form onSubmit={createAction} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr auto", padding: 16, background: "var(--line-soft)", borderRadius: "var(--radius)", marginBottom: 16, alignItems: "flex-end" }}>
            <div className="field"><label>Finding ID</label><input className="input" value={newAction.findingId} onChange={(e) => setNewAction({ ...newAction, findingId: e.target.value })} required /></div>
            <div className="field"><label>Action Description</label><input className="input" value={newAction.action} onChange={(e) => setNewAction({ ...newAction, action: e.target.value })} required /></div>
            <div className="field"><label>Completed By</label><input className="input" value={newAction.completedBy} onChange={(e) => setNewAction({ ...newAction, completedBy: e.target.value })} required /></div>
            <button className="btn btn-gold" type="submit">Create</button>
          </form>
        )}

        {actions.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No remediation actions recorded.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Finding ID</th>
                <th>Action</th>
                <th>Status</th>
                <th>Completed By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td><strong>{a.findingId}</strong></td>
                  <td style={{ maxWidth: 250 }}>{a.action}</td>
                  <td><span className={`badge ${a.status === "Completed" ? "badge-success" : a.status === "In Progress" ? "badge-gold" : a.status === "Overdue" ? "badge-danger" : "badge-slate"}`}>{a.status}</span></td>
                  <td>{a.completedBy}</td>
                  <td style={{ fontSize: 13 }}>{a.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {a.status === "Pending" && <button className="btn btn-primary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(a.id, "In Progress")}>Start</button>}
                      {a.status === "In Progress" && <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(a.id, "Completed")}>Complete</button>}
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => alert("Action details for " + a.id)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
