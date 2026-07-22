import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Bill {
  id: number;
  project_name: string;
  contractor_name: string;
  bill_number: string;
  bill_amount: number;
  certified_amount: number;
  progress_pct: number;
  status: string;
  notes: string;
}

export default function ContractorBillView() {
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", contractor_name: "", bill_number: "", bill_amount: 0, certified_amount: 0, progress_pct: 0, status: "Pending", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Bill[]>("/api/modules/project_cost_rera/bills")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.contractor_name) return;
    await post("/api/modules/project_cost_rera/bills", form);
    setForm({ project_name: "", contractor_name: "", bill_number: "", bill_amount: 0, certified_amount: 0, progress_pct: 0, status: "Pending", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/bills/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Contractor / RA-Bill Certification</h3>
          <span className="badge badge-success">{items.length} Bills</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Contractor</th><th>Bill #</th><th>Amount</th><th>Certified</th><th>Progress</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.contractor_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                  <td>{it.bill_number}</td>
                  <td>₹{it.bill_amount.toLocaleString()}</td>
                  <td>₹{it.certified_amount.toLocaleString()}</td>
                  <td>{it.progress_pct}%</td>
                  <td><span className={`badge ${it.status === "Approved" ? "badge-success" : it.status === "Rejected" ? "badge-danger" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No contractor bills found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Contractor Bill</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Contractor Name</label><input className="input" value={form.contractor_name} onChange={(e) => setForm({ ...form, contractor_name: e.target.value })} required /></div>
        <div className="field"><label>Bill Number</label><input className="input" value={form.bill_number} onChange={(e) => setForm({ ...form, bill_number: e.target.value })} /></div>
        <div className="field"><label>Bill Amount (₹)</label><input className="input" type="number" value={form.bill_amount} onChange={(e) => setForm({ ...form, bill_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Certified Amount (₹)</label><input className="input" type="number" value={form.certified_amount} onChange={(e) => setForm({ ...form, certified_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Progress (%)</label><input className="input" type="number" value={form.progress_pct} onChange={(e) => setForm({ ...form, progress_pct: Number(e.target.value) })} min={0} max={100} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option><option>Approved</option><option>Rejected</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Bill</button>
      </form>
    </div>
  );
}
