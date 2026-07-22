import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Land {
  id: number;
  project_name: string;
  land_parcel: string;
  acquisition_cost: number;
  title_clear: boolean;
  title_insurance: boolean;
  encumbrances: string;
  notes: string;
}

export default function LandCostTitleView() {
  const [items, setItems] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ project_name: "", land_parcel: "", acquisition_cost: 0, title_clear: true, title_insurance: false, encumbrances: "None", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(await get<Land[]>("/api/modules/project_cost_rera/land")); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name || !form.land_parcel) return;
    await post("/api/modules/project_cost_rera/land", form);
    setForm({ project_name: "", land_parcel: "", acquisition_cost: 0, title_clear: true, title_insurance: false, encumbrances: "None", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/project_cost_rera/land/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Land Cost & Title Records</h3>
          <span className="badge badge-success">{items.length} Parcels</span>
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
          <table>
            <thead><tr><th>Parcel</th><th>Acquisition Cost</th><th>Title Clear</th><th>Insurance</th><th>Encumbrances</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.land_parcel}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{it.project_name}</div></td>
                  <td>₹{it.acquisition_cost.toLocaleString()}</td>
                  <td><span className={`badge ${it.title_clear ? "badge-success" : "badge-danger"}`}>{it.title_clear ? "Clear" : "Disputed"}</span></td>
                  <td><span className={`badge ${it.title_insurance ? "badge-success" : "badge-slate"}`}>{it.title_insurance ? "Insured" : "Not Insured"}</span></td>
                  <td>{it.encumbrances}</td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No land records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Land Record</h3>
        <div className="field"><label>Project Name</label><input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div className="field"><label>Land Parcel</label><input className="input" value={form.land_parcel} onChange={(e) => setForm({ ...form, land_parcel: e.target.value })} placeholder="e.g. Survey No. 123/2" required /></div>
        <div className="field"><label>Acquisition Cost (₹)</label><input className="input" type="number" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: Number(e.target.value) })} /></div>
        <div className="field"><label>Encumbrances</label><input className="input" value={form.encumbrances} onChange={(e) => setForm({ ...form, encumbrances: e.target.value })} placeholder="e.g. None, Mortgage, Lien" /></div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Record</button>
      </form>
    </div>
  );
}
