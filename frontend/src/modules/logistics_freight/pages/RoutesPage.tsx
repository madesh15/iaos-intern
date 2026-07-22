import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Route {
  id: number; origin: string; destination: string; origin_code: string;
  destination_code: string; distance_km: number; standard_transit_hours: number;
  mode: string; is_active: boolean;
}

export default function RoutesPage() {
  const [items, setItems] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ origin: "", destination: "", origin_code: "", destination_code: "", distance_km: 0, standard_transit_hours: 0, mode: "Road", is_active: true });

  const pageSize = 20;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/routes?page=${page}&page_size=${pageSize}&search=${search}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await put(`/api/modules/${SLUG}/routes/${editId}`, form);
    else await post(`/api/modules/${SLUG}/routes`, form);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/routes/${id}`); load();
  }

  function edit(item: Route) { setForm(item); setEditId(item.id); setShowForm(true); }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Routes</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ origin: "", destination: "", origin_code: "", destination_code: "", distance_km: 0, standard_transit_hours: 0, mode: "Road", is_active: true }); setShowForm(true); }}>+ New Route</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="input" placeholder="Search routes..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 320 }} />
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Origin</th><th>Dest</th><th>Code</th><th>Dist (km)</th>
                <th>Transit (hrs)</th><th>Mode</th><th>Active</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.origin}</td><td>{r.destination}</td>
                  <td>{r.origin_code}→{r.destination_code}</td>
                  <td>{r.distance_km}</td><td>{r.standard_transit_hours}</td>
                  <td><span className="badge">{r.mode}</span></td>
                  <td>{r.is_active ? "✓" : "✗"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(r)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(r.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} style={{ color: "var(--slate)" }}>No routes found.</td></tr>}
            </tbody>
          </table>
        )}
        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>{total} total</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>{page} / {totalPages}</span>
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 22, marginTop: 16 }}>
          <h3 style={{ marginBottom: 14 }}>{editId ? "Edit" : "New"} Route</h3>
          <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>Origin</label><input className="input" required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
            <div className="field"><label>Destination</label><input className="input" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
            <div className="field"><label>Origin Code</label><input className="input" value={form.origin_code} onChange={(e) => setForm({ ...form, origin_code: e.target.value })} /></div>
            <div className="field"><label>Dest Code</label><input className="input" value={form.destination_code} onChange={(e) => setForm({ ...form, destination_code: e.target.value })} /></div>
            <div className="field"><label>Distance (km)</label><input className="input" type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })} /></div>
            <div className="field"><label>Transit Hours</label><input className="input" type="number" value={form.standard_transit_hours} onChange={(e) => setForm({ ...form, standard_transit_hours: Number(e.target.value) })} /></div>
            <div className="field"><label>Mode</label><select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}><option>Road</option><option>Rail</option><option>Sea</option><option>Air</option></select></div>
            <div className="field"><label>Active</label><select className="input" value={String(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button className="btn btn-primary">{editId ? "Update" : "Create"}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
