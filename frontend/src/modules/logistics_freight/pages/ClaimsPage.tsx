import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Claim {
  id: number; claim_number: string; shipment_id: number; carrier_id: number;
  claim_type: string; claim_date: string; claim_value: number;
  recovered_amount: number; pending_amount: number; rejected_amount: number;
  status: string; resolution_date: string | null; notes: string;
}

export default function ClaimsPage() {
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ claim_number: "", shipment_id: 0, carrier_id: 0, claim_type: "Damage", claim_date: "", claim_value: 0, recovered_amount: 0, pending_amount: 0, rejected_amount: 0, status: "Open", resolution_date: "", notes: "" });
  const pageSize = 15;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/claims?page=${page}&page_size=${pageSize}&search=${search}&status=${statusFilter}&claim_type=${typeFilter}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search, statusFilter, typeFilter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, resolution_date: form.resolution_date || null };
    if (editId) await put(`/api/modules/${SLUG}/claims/${editId}`, body);
    else await post(`/api/modules/${SLUG}/claims`, body);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/claims/${id}`); load();
  }

  function edit(item: Claim) {
    setForm({ claim_number: item.claim_number, shipment_id: item.shipment_id, carrier_id: item.carrier_id, claim_type: item.claim_type, claim_date: item.claim_date, claim_value: item.claim_value, recovered_amount: item.recovered_amount, pending_amount: item.pending_amount, rejected_amount: item.rejected_amount, status: item.status, resolution_date: item.resolution_date || "", notes: item.notes });
    setEditId(item.id); setShowForm(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Claims</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn btn-ghost" href={`/api/modules/${SLUG}/export/claims/csv`}>Export CSV</a>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ claim_number: "", shipment_id: 0, carrier_id: 0, claim_type: "Damage", claim_date: "", claim_value: 0, recovered_amount: 0, pending_amount: 0, rejected_amount: 0, status: "Open", resolution_date: "", notes: "" }); setShowForm(true); }}>+ New Claim</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="input" placeholder="Search claims..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 240 }} />
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Status</option>
            <option>Open</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Partial</option>
          </select>
          <select className="input" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Types</option>
            <option>Damage</option>
            <option>Shortage</option>
            <option>Delay</option>
            <option>Loss</option>
          </select>
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Claim#</th><th>Type</th><th>Date</th><th>Value</th>
                <th>Recovered</th><th>Pending</th><th>Rejected</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.claim_number}</strong></td>
                  <td><span className="badge">{c.claim_type}</span></td>
                  <td>{c.claim_date}</td>
                  <td>₹{c.claim_value.toLocaleString()}</td>
                  <td>₹{c.recovered_amount.toLocaleString()}</td>
                  <td>₹{c.pending_amount.toLocaleString()}</td>
                  <td>₹{c.rejected_amount.toLocaleString()}</td>
                  <td><span className={`badge ${c.status === "Approved" ? "badge-success" : c.status === "Rejected" ? "badge-danger" : "badge"}`}>{c.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(c.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={9} style={{ color: "var(--slate)" }}>No claims found.</td></tr>}
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
          <h3>{editId ? "Edit" : "New"} Claim</h3>
          <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>Claim#</label><input className="input" required value={form.claim_number} onChange={(e) => setForm({ ...form, claim_number: e.target.value })} /></div>
            <div className="field"><label>Type</label><select className="input" value={form.claim_type} onChange={(e) => setForm({ ...form, claim_type: e.target.value })}><option>Damage</option><option>Shortage</option><option>Delay</option><option>Loss</option></select></div>
            <div className="field"><label>Shipment ID</label><input className="input" type="number" required value={form.shipment_id} onChange={(e) => setForm({ ...form, shipment_id: Number(e.target.value) })} /></div>
            <div className="field"><label>Carrier ID</label><input className="input" type="number" required value={form.carrier_id} onChange={(e) => setForm({ ...form, carrier_id: Number(e.target.value) })} /></div>
            <div className="field"><label>Claim Date</label><input className="input" type="date" required value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
            <div className="field"><label>Value ₹</label><input className="input" type="number" value={form.claim_value} onChange={(e) => setForm({ ...form, claim_value: Number(e.target.value) })} /></div>
            <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Open</option><option>Approved</option><option>Rejected</option><option>Partial</option></select></div>
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
