import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Inv {
  id: number;
  project_name: string;
  flat_unit: string;
  unit_type: string;
  carpet_area: number;
  booked_price: number;
  nrv: number;
  status: string;
  notes: string;
}

export default function UnsoldInventoryView() {
  const [items, setItems] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", flat_unit: "", unit_type: "", carpet_area: 0, booked_price: 0, nrv: 0, status: "Unsold", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Inv[]>("/api/modules/project_cost_rera/inventory")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.flat_unit) return;
    await post("/api/modules/project_cost_rera/inventory", form);
    setForm({ project_name: "", flat_unit: "", unit_type: "", carpet_area: 0, booked_price: 0, nrv: 0, status: "Unsold", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/inventory/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Unsold Inventory Valuation</h3>
          <span className="badge badge-gold">{items.length} Units</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Unit</th><th>Type</th><th>Area (sqft)</th><th>Booked ₹</th><th>NRV ₹</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.flat_unit}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                  <td>{it.unit_type}</td>
                  <td>{it.carpet_area}</td>
                  <td>₹{it.booked_price.toLocaleString()}</td>
                  <td>₹{it.nrv.toLocaleString()}</td>
                  <td><span className={`badge ${it.status === "Sold" ? "badge-success" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No inventory records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Inventory Unit</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Flat / Unit</label><input className="input" value={form.flat_unit} onChange={(e) => setForm({ ...form, flat_unit: e.target.value })} required /></div>
        <div className="field"><label>Unit Type</label><input className="input" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} placeholder="e.g. 2BHK, 3BHK, Shop" /></div>
        <div className="field"><label>Carpet Area (sqft)</label><input className="input" type="number" value={form.carpet_area} onChange={(e) => setForm({ ...form, carpet_area: Number(e.target.value) })} /></div>
        <div className="field"><label>Booked Price (₹)</label><input className="input" type="number" value={form.booked_price} onChange={(e) => setForm({ ...form, booked_price: Number(e.target.value) })} /></div>
        <div className="field"><label>NRV (₹)</label><input className="input" type="number" value={form.nrv} onChange={(e) => setForm({ ...form, nrv: Number(e.target.value) })} /></div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Unsold</option><option>Booked</option><option>Sold</option>
          </select>
        </div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Unit</button>
      </form>
    </div>
  );
}
