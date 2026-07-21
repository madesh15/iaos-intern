import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Collection {
  id: number;
  project_name: string;
  buyer_name: string;
  flat_unit: string;
  demand_amount: number;
  collected_amount: number;
  collection_date: string;
  payment_mode: string;
  notes: string;
}

export default function BuyerCollectionView() {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", buyer_name: "", flat_unit: "", demand_amount: 0, collected_amount: 0, collection_date: "", payment_mode: "Bank Transfer", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Collection[]>("/api/modules/project_cost_rera/collections")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.buyer_name) return;
    await post("/api/modules/project_cost_rera/collections", form);
    setForm({ project_name: "", buyer_name: "", flat_unit: "", demand_amount: 0, collected_amount: 0, collection_date: "", payment_mode: "Bank Transfer", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/collections/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Buyer Collection Tracking</h3>
          <span className="badge badge-success">{items.length} Entries</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Buyer / Unit</th><th>Demand</th><th>Collected</th><th>Variance</th><th>Mode</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => {
                const v = it.demand_amount - it.collected_amount;
                return (
                  <tr key={it.id}>
                    <td><strong>{it.buyer_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.flat_unit} — {it.project_name}</div></td>
                    <td>₹{it.demand_amount.toLocaleString()}</td>
                    <td>₹{it.collected_amount.toLocaleString()}</td>
                    <td><span style={{ color: v > 0 ? "var(--danger)" : "var(--success)" }}>{v > 0 ? "₹" + v.toLocaleString() + " pending" : "Fully collected"}</span></td>
                    <td>{it.payment_mode}</td>
                    <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No buyer collection records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Collection</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Buyer Name</label><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} placeholder="e.g. Tower A, Unit 1204" /></div>
        <div className="field"><label>Demand Amount (₹)</label><input className="input" type="number" value={form.demand_amount} onChange={(e) => setForm({ ...form, demand_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Collected Amount (₹)</label><input className="input" type="number" value={form.collected_amount} onChange={(e) => setForm({ ...form, collected_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Collection Date</label><input className="input" type="date" value={form.collection_date} onChange={(e) => setForm({ ...form, collection_date: e.target.value })} /></div>
        <div className="field"><label>Payment Mode</label>
          <select className="select" value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}>
            <option>Bank Transfer</option><option>NEFT/RTGS</option><option>Cheque</option><option>Cash</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Log Collection</button>
      </form>
    </div>
  );
}
