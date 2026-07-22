import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Budget {
  id: number;
  project_name: string;
  cost_head: string;
  approved_budget: number;
  actual_cost: number;
  variance_pct: number;
  status: string;
  notes: string;
}

export default function BudgetControlView() {
  const [items, setItems] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", cost_head: "", approved_budget: 0, actual_cost: 0, variance_pct: 0, status: "On Track", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Budget[]>("/api/modules/project_cost_rera/budgets")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.cost_head) return;
    const v = form.approved_budget > 0 ? ((form.actual_cost - form.approved_budget) / form.approved_budget) * 100 : 0;
    await post("/api/modules/project_cost_rera/budgets", { ...form, variance_pct: parseFloat(v.toFixed(1)) });
    setForm({ project_name: "", cost_head: "", approved_budget: 0, actual_cost: 0, variance_pct: 0, status: "On Track", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/budgets/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Project Cost Budget vs Actual</h3>
          <span className="badge badge-success">{items.length} Cost Heads</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Project / Cost Head</th><th>Approved</th><th>Actual</th><th>Variance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.project_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.cost_head}</div></td>
                  <td>₹{it.approved_budget.toLocaleString()}</td>
                  <td>₹{it.actual_cost.toLocaleString()}</td>
                  <td><span style={{ color: it.variance_pct > 10 ? "var(--danger)" : it.variance_pct < 0 ? "var(--success)" : "var(--slate)" }}>{it.variance_pct > 0 ? "+" : ""}{it.variance_pct}%</span></td>
                  <td><span className={`badge ${it.status === "On Track" ? "badge-success" : it.status === "Over Budget" ? "badge-danger" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No budget records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Budget Entry</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Cost Head</label><input className="input" value={form.cost_head} onChange={(e) => setForm({ ...form, cost_head: e.target.value })} placeholder="e.g. Civil Works, MEP" required /></div>
        <div className="field"><label>Approved Budget (₹)</label><input className="input" type="number" value={form.approved_budget} onChange={(e) => setForm({ ...form, approved_budget: Number(e.target.value) })} /></div>
        <div className="field"><label>Actual Cost (₹)</label><input className="input" type="number" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: Number(e.target.value) })} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>On Track</option><option>Near Threshold</option><option>Over Budget</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Budget Entry</button>
      </form>
    </div>
  );
}
