import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Approval {
  id: number;
  project_name: string;
  approval_type: string;
  authority: string;
  approval_number: string;
  status: string;
  valid_until: string;
  notes: string;
}

export default function ApprovalSanctionView() {
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", approval_type: "", authority: "", approval_number: "", status: "Pending", valid_until: "", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Approval[]>("/api/modules/project_cost_rera/approvals")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.approval_type) return;
    await post("/api/modules/project_cost_rera/approvals", form);
    setForm({ project_name: "", approval_type: "", authority: "", approval_number: "", status: "Pending", valid_until: "", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/approvals/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Approval & Sanction Tracker</h3>
          <span className="badge badge-success">{items.length} Approvals</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Type</th><th>Authority</th><th>Number</th><th>Valid Until</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.approval_type}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                  <td>{it.authority}</td>
                  <td>{it.approval_number || "—"}</td>
                  <td>{it.valid_until || "—"}</td>
                  <td><span className={`badge ${it.status === "Approved" ? "badge-success" : it.status === "Expired" ? "badge-danger" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No approvals found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Approval Record</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Approval Type</label><input className="input" value={form.approval_type} onChange={(e) => setForm({ ...form, approval_type: e.target.value })} placeholder="e.g. RERA Registration, Environment Clearance" required /></div>
        <div className="field"><label>Authority</label><input className="input" value={form.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} placeholder="e.g. MahaRERA, MOEF" /></div>
        <div className="field"><label>Approval Number</label><input className="input" value={form.approval_number} onChange={(e) => setForm({ ...form, approval_number: e.target.value })} /></div>
        <div className="field"><label>Valid Until</label><input className="input" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option><option>Approved</option><option>Expired</option><option>Rejected</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Record</button>
      </form>
    </div>
  );
}
