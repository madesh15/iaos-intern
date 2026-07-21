import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Adv {
  id: number;
  project_name: string;
  buyer_name: string;
  flat_unit: string;
  advance_amount: number;
  received_date: string;
  ageing_days: number;
  status: string;
  notes: string;
}

export default function CustomerAdvanceView() {
  const [items, setItems] = useState<Adv[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", buyer_name: "", flat_unit: "", advance_amount: 0, received_date: "", ageing_days: 0, status: "Active", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Adv[]>("/api/modules/project_cost_rera/advances")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.buyer_name) return;
    await post("/api/modules/project_cost_rera/advances", form);
    setForm({ project_name: "", buyer_name: "", flat_unit: "", advance_amount: 0, received_date: "", ageing_days: 0, status: "Active", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/advances/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Customer Advance Ageing</h3>
          <span className="badge badge-success">{items.length} Advances</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Buyer / Unit</th><th>Advance ₹</th><th>Received</th><th>Ageing (days)</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.buyer_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.flat_unit} — {it.project_name}</div></td>
                  <td>₹{it.advance_amount.toLocaleString()}</td>
                  <td>{it.received_date || "—"}</td>
                  <td><span style={{ color: it.ageing_days > 90 ? "var(--danger)" : it.ageing_days > 30 ? "var(--gold-strong)" : "var(--slate)" }}>{it.ageing_days}</span></td>
                  <td><span className={`badge ${it.status === "Adjusted" ? "badge-success" : it.status === "Refunded" ? "badge-slate" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No customer advance records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Customer Advance</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Buyer Name</label><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} /></div>
        <div className="field"><label>Advance Amount (₹)</label><input className="input" type="number" value={form.advance_amount} onChange={(e) => setForm({ ...form, advance_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Received Date</label><input className="input" type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} /></div>
        <div className="field"><label>Ageing (days)</label><input className="input" type="number" value={form.ageing_days} onChange={(e) => setForm({ ...form, ageing_days: Number(e.target.value) })} min={0} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option><option>Adjusted</option><option>Refunded</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Log Advance</button>
      </form>
    </div>
  );
}
