import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Diversion {
  id: number;
  source_project: string;
  destination_project: string;
  amount: number;
  diversion_date: string;
  risk_level: string;
  status: string;
  notes: string;
}

export default function FundDiversionView() {
  const [items, setItems] = useState<Diversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source_project: "", destination_project: "", amount: 0, diversion_date: "", risk_level: "Medium", status: "Under Review", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Diversion[]>("/api/modules/project_cost_rera/diversions")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source_project || !form.destination_project) return;
    await post("/api/modules/project_cost_rera/diversions", form);
    setForm({ source_project: "", destination_project: "", amount: 0, diversion_date: "", risk_level: "Medium", status: "Under Review", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/diversions/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Inter-Project Fund Diversions</h3>
          <span className="badge badge-gold">{items.length} Flagged</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Source → Destination</th><th>Amount</th><th>Date</th><th>Risk</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.source_project}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>→ {it.destination_project}</div></td>
                  <td>₹{it.amount.toLocaleString()}</td>
                  <td>{it.diversion_date || "—"}</td>
                  <td><span className={`badge ${it.risk_level === "High" ? "badge-danger" : it.risk_level === "Medium" ? "badge-gold" : "badge-success"}`}>{it.risk_level}</span></td>
                  <td><span className="badge badge-slate">{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No fund diversions flagged.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Flag Fund Diversion</h3>
        <div className="field"><label>Source Project</label><input className="input" value={form.source_project} onChange={(e) => setForm({ ...form, source_project: e.target.value })} required /></div>
        <div className="field"><label>Destination Project</label><input className="input" value={form.destination_project} onChange={(e) => setForm({ ...form, destination_project: e.target.value })} required /></div>
        <div className="field"><label>Amount (₹)</label><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Diversion Date</label><input className="input" type="date" value={form.diversion_date} onChange={(e) => setForm({ ...form, diversion_date: e.target.value })} /></div>
        <div className="field"><label>Risk Level</label>
          <select className="select" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Under Review</option><option>Confirmed</option><option>Cleared</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Flag Diversion</button>
      </form>
    </div>
  );
}
