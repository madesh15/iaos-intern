import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CF {
  id: number;
  project_name: string;
  period: string;
  opening_balance: number;
  inflows: number;
  outflows: number;
  closing_balance: number;
  liquidity_status: string;
  notes: string;
}

export default function ProjectCashflowView() {
  const [items, setItems] = useState<CF[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", period: "", opening_balance: 0, inflows: 0, outflows: 0, closing_balance: 0, liquidity_status: "Adequate", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<CF[]>("/api/modules/project_cost_rera/cashflow")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.period) return;
    await post("/api/modules/project_cost_rera/cashflow", form);
    setForm({ project_name: "", period: "", opening_balance: 0, inflows: 0, outflows: 0, closing_balance: 0, liquidity_status: "Adequate", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/cashflow/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Project Cashflow Monitoring</h3>
          <span className="badge badge-success">{items.length} Periods</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Project</th><th>Period</th><th>Opening</th><th>Inflows</th><th>Outflows</th><th>Closing</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.project_name}</strong></td>
                  <td>{it.period}</td>
                  <td>₹{it.opening_balance.toLocaleString()}</td>
                  <td style={{ color: "var(--success)" }}>₹{it.inflows.toLocaleString()}</td>
                  <td style={{ color: "var(--danger)" }}>₹{it.outflows.toLocaleString()}</td>
                  <td>₹{it.closing_balance.toLocaleString()}</td>
                  <td><span className={`badge ${it.liquidity_status === "Adequate" ? "badge-success" : it.liquidity_status === "Deficit" ? "badge-danger" : "badge-gold"}`}>{it.liquidity_status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No cashflow records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Cashflow Entry</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Period</label><input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2026" required /></div>
        <div className="field"><label>Opening Balance (₹)</label><input className="input" type="number" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: Number(e.target.value) })} /></div>
        <div className="field"><label>Inflows (₹)</label><input className="input" type="number" value={form.inflows} onChange={(e) => setForm({ ...form, inflows: Number(e.target.value) })} /></div>
        <div className="field"><label>Outflows (₹)</label><input className="input" type="number" value={form.outflows} onChange={(e) => setForm({ ...form, outflows: Number(e.target.value) })} /></div>
        <div className="field"><label>Closing Balance (₹)</label><input className="input" type="number" value={form.closing_balance} onChange={(e) => setForm({ ...form, closing_balance: Number(e.target.value) })} /></div>
        <div className="field"><label>Liquidity Status</label>
          <select className="select" value={form.liquidity_status} onChange={(e) => setForm({ ...form, liquidity_status: e.target.value })}>
            <option>Adequate</option><option>Tight</option><option>Deficit</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Entry</button>
      </form>
    </div>
  );
}
