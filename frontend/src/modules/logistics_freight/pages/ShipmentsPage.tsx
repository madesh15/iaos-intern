import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Shipment {
  id: number; shipment_number: string; lr_number: string; carrier_id: number;
  route_id: number | null; vehicle_id: number | null; contract_id: number | null;
  shipment_date: string; expected_delivery_date: string; actual_delivery_date: string | null;
  origin: string; destination: string; mode: string; commodity: string;
  actual_weight_kg: number; charged_weight_kg: number; total_amount: number;
  contract_rate: number; billed_rate: number; status: string;
}

export default function ShipmentsPage() {
  const [items, setItems] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ shipment_number: "", lr_number: "", carrier_id: 0, origin: "", destination: "", mode: "Road", commodity: "", shipment_date: "", expected_delivery_date: "", actual_weight_kg: 0, charged_weight_kg: 0, contract_rate: 0, billed_rate: 0, total_amount: 0, status: "In Transit" });

  const pageSize = 15;

  function load() {
    setLoading(true);
    const params = `page=${page}&page_size=${pageSize}&search=${search}&status=${statusFilter}&mode=${modeFilter}`;
    get<any>(`/api/modules/${SLUG}/shipments?${params}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search, statusFilter, modeFilter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await put(`/api/modules/${SLUG}/shipments/${editId}`, form);
    else await post(`/api/modules/${SLUG}/shipments`, form);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this shipment?")) return;
    await del(`/api/modules/${SLUG}/shipments/${id}`);
    load();
  }

  function edit(item: Shipment) {
    setForm(item); setEditId(item.id); setShowForm(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Freight Shipments</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ shipment_number: "", lr_number: "", carrier_id: 0, origin: "", destination: "", mode: "Road", commodity: "", shipment_date: "", expected_delivery_date: "", actual_weight_kg: 0, charged_weight_kg: 0, contract_rate: 0, billed_rate: 0, total_amount: 0, status: "In Transit" }); setShowForm(true); }}>
          + New Shipment
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="input" placeholder="Search shipments..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 240 }} />
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
            <option value="">All Status</option>
            <option>Delivered</option>
            <option>In Transit</option>
            <option>Delayed</option>
            <option>Cancelled</option>
          </select>
          <select className="input" value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
            <option value="">All Modes</option>
            <option>Road</option>
            <option>Rail</option>
            <option>Sea</option>
            <option>Air</option>
          </select>
          <a className="btn btn-ghost" href={`/api/modules/${SLUG}/export/shipments/csv`} style={{ fontSize: 13, textDecoration: "none" }}>Export CSV</a>
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Shipment#</th>
                <th>LR#</th>
                <th>Date</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Actual Wt</th>
                <th>Charged Wt</th>
                <th>Contract Rate</th>
                <th>Billed Rate</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.shipment_number}</strong></td>
                  <td>{s.lr_number || "—"}</td>
                  <td>{s.shipment_date}</td>
                  <td>{s.origin}</td>
                  <td>{s.destination}</td>
                  <td><span className="badge">{s.mode}</span></td>
                  <td>{s.actual_weight_kg}kg</td>
                  <td>{s.charged_weight_kg}kg</td>
                  <td>₹{s.contract_rate}</td>
                  <td>₹{s.billed_rate}</td>
                  <td>₹{s.total_amount.toLocaleString()}</td>
                  <td><span className={`badge ${s.status === "Delivered" ? "badge-success" : s.status === "Delayed" ? "badge-danger" : "badge"}`}>{s.status}</span></td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(s)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(s.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={13} style={{ color: "var(--slate)" }}>No shipments found.</td></tr>}
            </tbody>
          </table>
        )}
        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>{total} total</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span style={{ padding: "4px 0" }}>{page} / {totalPages}</span>
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 22, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14 }}>{editId ? "Edit" : "New"} Shipment</h3>
          <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>Shipment#</label><input className="input" required value={form.shipment_number} onChange={(e) => setForm({ ...form, shipment_number: e.target.value })} /></div>
            <div className="field"><label>LR#</label><input className="input" value={form.lr_number} onChange={(e) => setForm({ ...form, lr_number: e.target.value })} /></div>
            <div className="field"><label>Carrier ID</label><input className="input" type="number" required value={form.carrier_id} onChange={(e) => setForm({ ...form, carrier_id: Number(e.target.value) })} /></div>
            <div className="field"><label>Origin</label><input className="input" required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
            <div className="field"><label>Destination</label><input className="input" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
            <div className="field"><label>Mode</label><select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}><option>Road</option><option>Rail</option><option>Sea</option><option>Air</option></select></div>
            <div className="field"><label>Shipment Date</label><input className="input" type="date" required value={form.shipment_date} onChange={(e) => setForm({ ...form, shipment_date: e.target.value })} /></div>
            <div className="field"><label>Expected Delivery</label><input className="input" type="date" required value={form.expected_delivery_date} onChange={(e) => setForm({ ...form, expected_delivery_date: e.target.value })} /></div>
            <div className="field"><label>Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>In Transit</option><option>Delivered</option><option>Delayed</option><option>Cancelled</option></select></div>
            <div className="field"><label>Actual Weight (kg)</label><input className="input" type="number" value={form.actual_weight_kg} onChange={(e) => setForm({ ...form, actual_weight_kg: Number(e.target.value) })} /></div>
            <div className="field"><label>Charged Weight (kg)</label><input className="input" type="number" value={form.charged_weight_kg} onChange={(e) => setForm({ ...form, charged_weight_kg: Number(e.target.value) })} /></div>
            <div className="field"><label>Total Amount</label><input className="input" type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })} /></div>
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
