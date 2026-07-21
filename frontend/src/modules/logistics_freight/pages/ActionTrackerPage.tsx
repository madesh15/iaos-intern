import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Action {
  id: number; action_number: string; finding_id: number | null; title: string;
  assigned_to: string; target_date: string; completion_date: string | null;
  status: string; priority: string; notes: string;
}

export default function ActionTrackerPage() {
  const [items, setItems] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ action_number: "", finding_id: 0, title: "", assigned_to: "", target_date: "", completion_date: "", status: "Open", priority: "Medium", notes: "" });
  const pageSize = 15;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/actions?page=${page}&page_size=${pageSize}&search=${search}&status=${statusFilter}&priority=${priorityFilter}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search, statusFilter, priorityFilter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, completion_date: form.completion_date || null, finding_id: form.finding_id || null };
    if (editId) await put(`/api/modules/${SLUG}/actions/${editId}`, body);
    else await post(`/api/modules/${SLUG}/actions`, body);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/actions/${id}`); load();
  }

  function edit(item: Action) {
    setForm({ action_number: item.action_number, finding_id: item.finding_id || 0, title: item.title, assigned_to: item.assigned_to, target_date: item.target_date, completion_date: item.completion_date || "", status: item.status, priority: item.priority, notes: item.notes });
    setEditId(item.id); setShowForm(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const overdue = items.filter((a) => a.status !== "Closed" && a.status !== "Completed" && new Date(a.target_date) < new Date());

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Remediation / Action Tracker</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ action_number: "", finding_id: 0, title: "", assigned_to: "", target_date: "", completion_date: "", status: "Open", priority: "Medium", notes: "" }); setShowForm(true); }}>+ New Action</button>
      </div>

      {overdue.length > 0 && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠ {overdue.length} action(s) are overdue. Immediate attention required.
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="input" placeholder="Search..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 240 }} />
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Status</option>
            <option>Open</option><option>In Progress</option><option>Completed</option><option>Closed</option>
          </select>
          <select className="input" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Priority</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Action#</th><th>Title</th><th>Finding</th><th>Assigned To</th>
                <th>Target</th><th>Completion</th><th>Status</th><th>Priority</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const isOverdue = a.status !== "Closed" && a.status !== "Completed" && new Date(a.target_date) < new Date();
                return (
                  <tr key={a.id} style={isOverdue ? { background: "#fef2f2" } : {}}>
                    <td><strong>{a.action_number}</strong></td>
                    <td>{a.title}</td>
                    <td style={{ fontSize: 12 }}>{a.finding_id || "—"}</td>
                    <td>{a.assigned_to}</td>
                    <td style={{ fontSize: 12 }}>{a.target_date}</td>
                    <td style={{ fontSize: 12 }}>{a.completion_date || "—"}</td>
                    <td><span className={`badge ${a.status === "Completed" || a.status === "Closed" ? "badge-success" : a.status === "In Progress" ? "badge" : isOverdue ? "badge-danger" : "badge"}`}>{a.status}</span></td>
                    <td><span className={`badge ${a.priority === "High" ? "badge-danger" : a.priority === "Medium" ? "badge" : "badge-success"}`}>{a.priority}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(a)}>Edit</button>
                      <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(a.id)}>Del</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={9} style={{ color: "var(--slate)" }}>No actions found.</td></tr>}
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
          <h3>{editId ? "Edit" : "New"} Action</h3>
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>Action#</label><input className="input" required value={form.action_number} onChange={(e) => setForm({ ...form, action_number: e.target.value })} /></div>
              <div className="field"><label>Finding ID</label><input className="input" type="number" value={form.finding_id} onChange={(e) => setForm({ ...form, finding_id: Number(e.target.value) })} /></div>
              <div className="field"><label>Priority</label><select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></div>
              <div className="field"><label>Assigned To</label><input className="input" required value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
              <div className="field"><label>Target Date</label><input className="input" type="date" required value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
              <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Open</option><option>In Progress</option><option>Completed</option></select></div>
            </div>
            <div className="field"><label>Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea></div>
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
