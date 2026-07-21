import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Penalty {
  id: number;
  project_name: string;
  buyer_name: string;
  flat_unit: string;
  delay_days: number;
  penalty_amount: number;
  interest_rate: number;
  status: string;
  notes: string;
}

export default function InterestPenaltyView() {
  const [items, setItems] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", buyer_name: "", flat_unit: "", delay_days: 0, penalty_amount: 0, interest_rate: 0, status: "Accrued", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Penalty[]>("/api/modules/project_cost_rera/penalties")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.buyer_name) return;
    await post("/api/modules/project_cost_rera/penalties", form);
    setForm({ project_name: "", buyer_name: "", flat_unit: "", delay_days: 0, penalty_amount: 0, interest_rate: 0, status: "Accrued", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/penalties/${id}`);
    load();
  }

  const totalLiability = items.reduce((s, i) => s + i.penalty_amount, 0);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Interest / Penalty to Buyers</h3>
          <span className="badge badge-danger">₹{totalLiability.toLocaleString()} Total Liability</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Buyer / Unit</th><th>Delay (days)</th><th>Rate %</th><th>Penalty ₹</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.buyer_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.flat_unit} — {it.project_name}</div></td>
                  <td><span style={{ color: it.delay_days > 180 ? "var(--danger)" : it.delay_days > 90 ? "var(--gold-strong)" : "var(--slate)" }}>{it.delay_days}</span></td>
                  <td>{it.interest_rate}%</td>
                  <td>₹{it.penalty_amount.toLocaleString()}</td>
                  <td><span className={`badge ${it.status === "Paid" ? "badge-success" : it.status === "Disputed" ? "badge-danger" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No penalty records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Penalty</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Buyer Name</label><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} /></div>
        <div className="field"><label>Delay (days)</label><input className="input" type="number" value={form.delay_days} onChange={(e) => setForm({ ...form, delay_days: Number(e.target.value) })} min={0} /></div>
        <div className="field"><label>Penalty Amount (₹)</label><input className="input" type="number" value={form.penalty_amount} onChange={(e) => setForm({ ...form, penalty_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Interest Rate (%)</label><input className="input" type="number" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: Number(e.target.value) })} step="0.1" /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Accrued</option><option>Paid</option><option>Disputed</option><option>Waived</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Log Penalty</button>
      </form>
    </div>
  );
}
