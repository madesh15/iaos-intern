import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Contract {
  id: number; contract_number: string; carrier_id: number; route_id: number | null;
  effective_date: string; expiry_date: string; rate_per_kg: number; rate_per_km: number;
  rate_per_shipment: number; fuel_surcharge_pct: number; minimum_charge: number;
  volume_discount_pct: number; detention_rate_per_hour: number; free_detention_hours: number;
  terms: string; status: string; tenant_id: number; created_at: string; updated_at: string;
}

export default function ContractsPage() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ contract_number: "", carrier_id: 0, route_id: 0, effective_date: "", expiry_date: "", rate_per_kg: 0, rate_per_km: 0, rate_per_shipment: 0, fuel_surcharge_pct: 0, minimum_charge: 0, volume_discount_pct: 0, detention_rate_per_hour: 0, free_detention_hours: 0, terms: "", status: "Active" });

  const pageSize = 15;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/contracts?page=${page}&page_size=${pageSize}&search=${search}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, route_id: form.route_id || null };
    if (editId) await put(`/api/modules/${SLUG}/contracts/${editId}`, body);
    else await post(`/api/modules/${SLUG}/contracts`, body);
    setShowForm(false); setEditId(null); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this contract?")) return;
    await del(`/api/modules/${SLUG}/contracts/${id}`);
    load();
  }

  function edit(item: Contract) {
    setForm({ contract_number: item.contract_number, carrier_id: item.carrier_id, route_id: item.route_id || 0, effective_date: item.effective_date, expiry_date: item.expiry_date, rate_per_kg: item.rate_per_kg, rate_per_km: item.rate_per_km, rate_per_shipment: item.rate_per_shipment, fuel_surcharge_pct: item.fuel_surcharge_pct, minimum_charge: item.minimum_charge, volume_discount_pct: item.volume_discount_pct, detention_rate_per_hour: item.detention_rate_per_hour, free_detention_hours: item.free_detention_hours, terms: item.terms, status: item.status });
    setEditId(item.id); setShowForm(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Freight Rate Contracts</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ contract_number: "", carrier_id: 0, route_id: 0, effective_date: "", expiry_date: "", rate_per_kg: 0, rate_per_km: 0, rate_per_shipment: 0, fuel_surcharge_pct: 0, minimum_charge: 0, volume_discount_pct: 0, detention_rate_per_hour: 0, free_detention_hours: 0, terms: "", status: "Active" }); setShowForm(true); }}>
          + New Contract
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="input" placeholder="Search contracts..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 320 }} />
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Contract#</th>
                <th>Carrier ID</th>
                <th>Rate/Kg</th>
                <th>Rate/Km</th>
                <th>Rate/Shipment</th>
                <th>Fuel%</th>
                <th>Effective</th>
                <th>Expiry</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.contract_number}</strong></td>
                  <td>{c.carrier_id}</td>
                  <td>₹{c.rate_per_kg}</td>
                  <td>₹{c.rate_per_km}</td>
                  <td>₹{c.rate_per_shipment.toLocaleString()}</td>
                  <td>{c.fuel_surcharge_pct}%</td>
                  <td>{c.effective_date}</td>
                  <td>{c.expiry_date}</td>
                  <td><span className={`badge ${c.status === "Active" ? "badge-success" : "badge-danger"}`}>{c.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(c.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={10} style={{ color: "var(--slate)" }}>No contracts found.</td></tr>}
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
          <h3 style={{ marginBottom: 14 }}>{editId ? "Edit" : "New"} Contract</h3>
          <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Contract Number</label>
              <input className="input" required value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} />
            </div>
            <div className="field">
              <label>Carrier ID</label>
              <input className="input" type="number" required value={form.carrier_id} onChange={(e) => setForm({ ...form, carrier_id: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Route ID</label>
              <input className="input" type="number" value={form.route_id} onChange={(e) => setForm({ ...form, route_id: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Effective Date</label>
              <input className="input" type="date" required value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
            </div>
            <div className="field">
              <label>Expiry Date</label>
              <input className="input" type="date" required value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            </div>
            <div className="field">
              <label>Rate/Kg</label>
              <input className="input" type="number" step="0.01" value={form.rate_per_kg} onChange={(e) => setForm({ ...form, rate_per_kg: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Rate/Km</label>
              <input className="input" type="number" step="0.01" value={form.rate_per_km} onChange={(e) => setForm({ ...form, rate_per_km: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Rate/Shipment</label>
              <input className="input" type="number" step="0.01" value={form.rate_per_shipment} onChange={(e) => setForm({ ...form, rate_per_shipment: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Fuel Surcharge %</label>
              <input className="input" type="number" step="0.1" value={form.fuel_surcharge_pct} onChange={(e) => setForm({ ...form, fuel_surcharge_pct: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Expired</option>
                <option>Terminated</option>
              </select>
            </div>
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
