import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Finding {
  id: number; finding_number: string; title: string; category: string;
  severity: string; status: string; financial_impact: number;
  description: string; impact: string; recommendation: string;
  source_reference: string;
}

export default function FindingsPage() {
  const [items, setItems] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ finding_number: "", title: "", category: "Rate Compliance", severity: "Medium", description: "", impact: "", recommendation: "", status: "Open", source_reference: "", financial_impact: 0 });
  const pageSize = 15;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/findings?page=${page}&page_size=${pageSize}&search=${search}&severity=${severityFilter}&status=${statusFilter}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search, severityFilter, statusFilter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await put(`/api/modules/${SLUG}/findings/${editId}`, form);
    else await post(`/api/modules/${SLUG}/findings`, form);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/findings/${id}`); load();
  }

  function edit(item: Finding) { setForm(item); setEditId(item.id); setShowForm(true); }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Observation & Finding Log</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn btn-ghost" href={`/api/modules/${SLUG}/export/findings/csv`}>Export CSV</a>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ finding_number: "", title: "", category: "Rate Compliance", severity: "Medium", description: "", impact: "", recommendation: "", status: "Open", source_reference: "", financial_impact: 0 }); setShowForm(true); }}>+ New Finding</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="input" placeholder="Search findings..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 240 }} />
          <select className="input" value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Severity</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Status</option>
            <option>Open</option><option>Closed</option><option>In Progress</option>
          </select>
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Finding#</th><th>Title</th><th>Category</th><th>Severity</th>
                <th>Status</th><th>Financial Impact</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.finding_number}</strong></td>
                  <td>{f.title}</td>
                  <td><span className="badge">{f.category}</span></td>
                  <td><span className={`badge ${f.severity === "High" ? "badge-danger" : f.severity === "Medium" ? "badge" : "badge-success"}`}>{f.severity}</span></td>
                  <td><span className={`badge ${f.status === "Closed" ? "badge-success" : "badge"}`}>{f.status}</span></td>
                  <td>₹{f.financial_impact.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(f)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(f.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)" }}>No findings found.</td></tr>}
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
          <h3>{editId ? "Edit" : "New"} Finding</h3>
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>Finding#</label><input className="input" required value={form.finding_number} onChange={(e) => setForm({ ...form, finding_number: e.target.value })} /></div>
              <div className="field"><label>Severity</label><select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></div>
              <div className="field"><label>Category</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Rate Compliance</option><option>Duplicate Billing</option><option>Service Level</option><option>Operational Efficiency</option><option>Route Compliance</option><option>Fraud</option></select></div>
              <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Open</option><option>In Progress</option><option>Closed</option></select></div>
              <div className="field"><label>Financial Impact ₹</label><input className="input" type="number" value={form.financial_impact} onChange={(e) => setForm({ ...form, financial_impact: Number(e.target.value) })} /></div>
              <div className="field"><label>Source Reference</label><input className="input" value={form.source_reference} onChange={(e) => setForm({ ...form, source_reference: e.target.value })} /></div>
            </div>
            <div className="field"><label>Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea></div>
            <div className="field"><label>Impact</label><textarea className="input" rows={2} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}></textarea></div>
            <div className="field"><label>Recommendation</label><textarea className="input" rows={2} value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}></textarea></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary">{editId ? "Update" : "Create"}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
