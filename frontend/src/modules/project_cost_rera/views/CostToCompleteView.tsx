import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CTC {
  id: number;
  project_name: string;
  cost_head: string;
  original_estimate: number;
  revised_estimate: number;
  incurred_to_date: number;
  reliability: string;
  notes: string;
}

export default function CostToCompleteView() {
  const [items, setItems] = useState<CTC[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", cost_head: "", original_estimate: 0, revised_estimate: 0, incurred_to_date: 0, reliability: "Medium", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<CTC[]>("/api/modules/project_cost_rera/ctc")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.cost_head) return;
    await post("/api/modules/project_cost_rera/ctc", form);
    setForm({ project_name: "", cost_head: "", original_estimate: 0, revised_estimate: 0, incurred_to_date: 0, reliability: "Medium", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/ctc/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Cost-to-Complete Estimates</h3>
          <span className="badge badge-success">{items.length} Entries</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Cost Head</th><th>Original</th><th>Revised</th><th>Incurred</th><th>Remaining</th><th>Reliability</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => {
                const remaining = it.revised_estimate - it.incurred_to_date;
                return (
                  <tr key={it.id}>
                    <td><strong>{it.cost_head}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                    <td>₹{it.original_estimate.toLocaleString()}</td>
                    <td>₹{it.revised_estimate.toLocaleString()}</td>
                    <td>₹{it.incurred_to_date.toLocaleString()}</td>
                    <td style={{ color: remaining < 0 ? "var(--danger)" : "var(--slate)" }}>₹{remaining.toLocaleString()}</td>
                    <td><span className={`badge ${it.reliability === "High" ? "badge-success" : it.reliability === "Low" ? "badge-danger" : "badge-gold"}`}>{it.reliability}</span></td>
                    <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No CTC entries found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add CTC Entry</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Cost Head</label><input className="input" value={form.cost_head} onChange={(e) => setForm({ ...form, cost_head: e.target.value })} required /></div>
        <div className="field"><label>Original Estimate (₹)</label><input className="input" type="number" value={form.original_estimate} onChange={(e) => setForm({ ...form, original_estimate: Number(e.target.value) })} /></div>
        <div className="field"><label>Revised Estimate (₹)</label><input className="input" type="number" value={form.revised_estimate} onChange={(e) => setForm({ ...form, revised_estimate: Number(e.target.value) })} /></div>
        <div className="field"><label>Incurred to Date (₹)</label><input className="input" type="number" value={form.incurred_to_date} onChange={(e) => setForm({ ...form, incurred_to_date: Number(e.target.value) })} /></div>
        <div className="field"><label>Reliability</label>
          <select className="select" value={form.reliability} onChange={(e) => setForm({ ...form, reliability: e.target.value })}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Entry</button>
      </form>
    </div>
  );
}
