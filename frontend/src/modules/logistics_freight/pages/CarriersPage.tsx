import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Carrier {
  id: number; name: string; code: string; carrier_type: string; status: string;
  contact_person: string; email: string; phone: string;
  performance_score: number; on_time_percentage: number; damage_percentage: number;
  claim_percentage: number; delay_percentage: number;
}

export default function CarriersPage() {
  const [items, setItems] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", code: "", carrier_type: "Truck", status: "Active", contact_person: "", email: "", phone: "" });
  const pageSize = 20;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/carriers?page=${page}&page_size=${pageSize}&search=${search}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await put(`/api/modules/${SLUG}/carriers/${editId}`, form);
    else await post(`/api/modules/${SLUG}/carriers`, form);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/carriers/${id}`); load();
  }

  function edit(item: Carrier) { setForm(item); setEditId(item.id); setShowForm(true); }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Carriers</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn btn-ghost" href={`/api/modules/${SLUG}/export/carriers/csv`}>Export CSV</a>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ name: "", code: "", carrier_type: "Truck", status: "Active", contact_person: "", email: "", phone: "" }); setShowForm(true); }}>+ New Carrier</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="input" placeholder="Search carriers..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 320 }} />
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Name</th><th>Type</th><th>Status</th>
                <th>Score</th><th>On-Time%</th><th>Damage%</th><th>Claim%</th><th>Delay%</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}</td>
                  <td>{c.carrier_type}</td>
                  <td><span className={`badge ${c.status === "Active" ? "badge-success" : "badge-danger"}`}>{c.status}</span></td>
                  <td><strong>{c.performance_score}</strong></td>
                  <td>{c.on_time_percentage}%</td>
                  <td>{c.damage_percentage}%</td>
                  <td>{c.claim_percentage}%</td>
                  <td>{c.delay_percentage}%</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(c.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={10} style={{ color: "var(--slate)" }}>No carriers found.</td></tr>}
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
          <h3>{editId ? "Edit" : "New"} Carrier</h3>
          <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>Code</label><input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div className="field"><label>Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Type</label><select className="input" value={form.carrier_type} onChange={(e) => setForm({ ...form, carrier_type: e.target.value })}><option>Truck</option><option>Rail</option><option>Sea</option><option>Air</option></select></div>
            <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Blacklisted</option></select></div>
            <div className="field"><label>Contact Person</label><input className="input" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
