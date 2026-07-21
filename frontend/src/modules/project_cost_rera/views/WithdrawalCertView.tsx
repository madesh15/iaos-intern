import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Cert {
  id: number;
  project_name: string;
  cert_number: string;
  cert_type: string;
  certified_amount: number;
  certifier_name: string;
  cert_date: string;
  valid: boolean;
  notes: string;
}

export default function WithdrawalCertView() {
  const [items, setItems] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", cert_number: "", cert_type: "Architect", certified_amount: 0, certifier_name: "", cert_date: "", valid: true, notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Cert[]>("/api/modules/project_cost_rera/withdrawals")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name) return;
    await post("/api/modules/project_cost_rera/withdrawals", form);
    setForm({ project_name: "", cert_number: "", cert_type: "Architect", certified_amount: 0, certifier_name: "", cert_date: "", valid: true, notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/withdrawals/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Withdrawal Certificates</h3>
          <span className="badge badge-success">{items.length} Certificates</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Cert #</th><th>Type</th><th>Amount</th><th>Certifier</th><th>Date</th><th>Valid</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.cert_number}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                  <td>{it.cert_type}</td>
                  <td>₹{it.certified_amount.toLocaleString()}</td>
                  <td>{it.certifier_name}</td>
                  <td>{it.cert_date || "—"}</td>
                  <td><span className={`badge ${it.valid ? "badge-success" : "badge-danger"}`}>{it.valid ? "Valid" : "Invalid"}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No withdrawal certificates found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Certificate</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Certificate Number</label><input className="input" value={form.cert_number} onChange={(e) => setForm({ ...form, cert_number: e.target.value })} placeholder="e.g. WC-2026-041" /></div>
        <div className="field"><label>Certifier Type</label>
          <select className="select" value={form.cert_type} onChange={(e) => setForm({ ...form, cert_type: e.target.value })}>
            <option>Architect</option><option>Engineer</option><option>Chartered Accountant</option>
          </select>
        </div>
        <div className="field"><label>Certified Amount (₹)</label><input className="input" type="number" value={form.certified_amount} onChange={(e) => setForm({ ...form, certified_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Certifier Name</label><input className="input" value={form.certifier_name} onChange={(e) => setForm({ ...form, certifier_name: e.target.value })} /></div>
        <div className="field"><label>Cert Date</label><input className="input" type="date" value={form.cert_date} onChange={(e) => setForm({ ...form, cert_date: e.target.value })} /></div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Certificate</button>
      </form>
    </div>
  );
}
