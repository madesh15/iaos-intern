import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Reg {
  id: number;
  project_name: string;
  buyer_name: string;
  flat_unit: string;
  agreement_date: string;
  registration_date: string;
  possession_date: string;
  status: string;
  notes: string;
}

export default function RegistrationPossessionView() {
  const [items, setItems] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", buyer_name: "", flat_unit: "", agreement_date: "", registration_date: "", possession_date: "", status: "Pending", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Reg[]>("/api/modules/project_cost_rera/registrations")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.buyer_name) return;
    await post("/api/modules/project_cost_rera/registrations", form);
    setForm({ project_name: "", buyer_name: "", flat_unit: "", agreement_date: "", registration_date: "", possession_date: "", status: "Pending", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/registrations/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Registration & Possession Tracker</h3>
          <span className="badge badge-success">{items.length} Units</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Buyer / Unit</th><th>Agreement</th><th>Registration</th><th>Possession</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.buyer_name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.flat_unit} — {it.project_name}</div></td>
                  <td>{it.agreement_date || "—"}</td>
                  <td>{it.registration_date || "—"}</td>
                  <td>{it.possession_date || "—"}</td>
                  <td><span className={`badge ${it.status === "Completed" ? "badge-success" : it.status === "Delayed" ? "badge-danger" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No registration records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Registration Record</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Buyer Name</label><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} /></div>
        <div className="field"><label>Agreement Date</label><input className="input" type="date" value={form.agreement_date} onChange={(e) => setForm({ ...form, agreement_date: e.target.value })} /></div>
        <div className="field"><label>Registration Date</label><input className="input" type="date" value={form.registration_date} onChange={(e) => setForm({ ...form, registration_date: e.target.value })} /></div>
        <div className="field"><label>Possession Date</label><input className="input" type="date" value={form.possession_date} onChange={(e) => setForm({ ...form, possession_date: e.target.value })} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option><option>In Progress</option><option>Completed</option><option>Delayed</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Record</button>
      </form>
    </div>
  );
}
