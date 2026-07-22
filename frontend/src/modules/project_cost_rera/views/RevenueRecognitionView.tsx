import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Rev {
  id: number;
  project_name: string;
  buyer_name: string;
  flat_unit: string;
  total_consideration: number;
  recognised_to_date: number;
  recognition_basis: string;
  handover_date: string;
  notes: string;
}

export default function RevenueRecognitionView() {
  const [items, setItems] = useState<Rev[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", buyer_name: "", flat_unit: "", total_consideration: 0, recognised_to_date: 0, recognition_basis: "Handover", handover_date: "", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Rev[]>("/api/modules/project_cost_rera/revenue")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.buyer_name) return;
    await post("/api/modules/project_cost_rera/revenue", form);
    setForm({ project_name: "", buyer_name: "", flat_unit: "", total_consideration: 0, recognised_to_date: 0, recognition_basis: "Handover", handover_date: "", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/revenue/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Revenue Recognition (Ind AS 115)</h3>
          <span className="badge badge-success">{items.length} Entries</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Buyer / Unit</th><th>Consideration</th><th>Recognised</th><th>Basis</th><th>Handover</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => {
                const pct = it.total_consideration > 0 ? ((it.recognised_to_date / it.total_consideration) * 100).toFixed(0) : "0";
                return (
                  <tr key={it.id}>
                    <td><strong>{it.buyer_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.flat_unit} — {it.project_name}</div></td>
                    <td>₹{it.total_consideration.toLocaleString()}</td>
                    <td>₹{it.recognised_to_date.toLocaleString()} <span style={{ fontSize: 11, color: "var(--slate)" }}>({pct}%)</span></td>
                    <td>{it.recognition_basis}</td>
                    <td>{it.handover_date || "—"}</td>
                    <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No revenue recognition entries found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Revenue Entry</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Buyer Name</label><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} /></div>
        <div className="field"><label>Total Consideration (₹)</label><input className="input" type="number" value={form.total_consideration} onChange={(e) => setForm({ ...form, total_consideration: Number(e.target.value) })} /></div>
        <div className="field"><label>Recognised to Date (₹)</label><input className="input" type="number" value={form.recognised_to_date} onChange={(e) => setForm({ ...form, recognised_to_date: Number(e.target.value) })} /></div>
        <div className="field"><label>Recognition Basis</label>
          <select className="select" value={form.recognition_basis} onChange={(e) => setForm({ ...form, recognition_basis: e.target.value })}>
            <option>Handover</option><option>Progress</option><option>Completion</option>
          </select>
        </div>
        <div className="field"><label>Handover Date</label><input className="input" type="date" value={form.handover_date} onChange={(e) => setForm({ ...form, handover_date: e.target.value })} /></div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Entry</button>
      </form>
    </div>
  );
}
