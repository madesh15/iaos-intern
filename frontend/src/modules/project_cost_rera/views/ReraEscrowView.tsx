import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Escrow {
  id: number;
  project_name: string;
  escrow_account: string;
  total_deposit: number;
  eligible_withdrawal: number;
  withdrawn_amount: number;
  compliance_status: string;
  notes: string;
}

export default function ReraEscrowView() {
  const [items, setItems] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", escrow_account: "", total_deposit: 0, eligible_withdrawal: 0, withdrawn_amount: 0, compliance_status: "Compliant", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Escrow[]>("/api/modules/project_cost_rera/escrow")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name) return;
    await post("/api/modules/project_cost_rera/escrow", form);
    setForm({ project_name: "", escrow_account: "", total_deposit: 0, eligible_withdrawal: 0, withdrawn_amount: 0, compliance_status: "Compliant", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/escrow/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>RERA Escrow Account Records</h3>
          <span className="badge badge-success">{items.length} Accounts</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Project</th><th>Escrow A/c</th><th>Deposit</th><th>Eligible</th><th>Withdrawn</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.project_name}</strong></td>
                  <td>{it.escrow_account}</td>
                  <td>₹{it.total_deposit.toLocaleString()}</td>
                  <td>₹{it.eligible_withdrawal.toLocaleString()}</td>
                  <td>₹{it.withdrawn_amount.toLocaleString()}</td>
                  <td><span className={`badge ${it.compliance_status === "Compliant" ? "badge-success" : it.compliance_status === "Breach" ? "badge-danger" : "badge-gold"}`}>{it.compliance_status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No escrow records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Escrow Record</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="e.g. Skyline Residences Phase 2" required /></div>
        <div className="field"><label>Escrow Account</label><input className="input" value={form.escrow_account} onChange={(e) => setForm({ ...form, escrow_account: e.target.value })} placeholder="e.g. HDFC-ESC-9921" /></div>
        <div className="field"><label>Total Deposit (₹)</label><input className="input" type="number" value={form.total_deposit} onChange={(e) => setForm({ ...form, total_deposit: Number(e.target.value) })} /></div>
        <div className="field"><label>Eligible Withdrawal (₹)</label><input className="input" type="number" value={form.eligible_withdrawal} onChange={(e) => setForm({ ...form, eligible_withdrawal: Number(e.target.value) })} /></div>
        <div className="field"><label>Withdrawn Amount (₹)</label><input className="input" type="number" value={form.withdrawn_amount} onChange={(e) => setForm({ ...form, withdrawn_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Compliance Status</label>
          <select className="select" value={form.compliance_status} onChange={(e) => setForm({ ...form, compliance_status: e.target.value })}>
            <option>Compliant</option><option>Warning</option><option>Breach</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Record</button>
      </form>
    </div>
  );
}
