import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Outlet {
  id: number;
  outlet_name: string;
  outlet_code: string;
  outlet_type: string;
  channel: string;
  distributor: string;
  is_ghost: boolean;
  performance_status: string;
  competitor_spend_ratio: number;
  trade_spend_ratio: number;
  unclaimed_amount: number;
  unclaimed_scheme_codes: string;
  last_audit_date: string | null;
  notes: string;
}

const OUTLET_TYPES = ["Kirana", "Supermarket", "Hypermarket", "E-Commerce", "HoReCa"];
const PERF_STATUSES = ["Active", "Low-Performing", "Non-Performing", "Ghost"];

export default function GhostNonPerformingOutletsView() {
  const [items, setItems] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    outlet_name: "",
    outlet_code: "",
    outlet_type: "Kirana",
    channel: "General Trade",
    distributor: "",
    is_ghost: false,
    performance_status: "Active",
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Outlet[]>(`/api/modules/${SLUG}/outlets`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.outlet_name || !form.outlet_code) return;
    await post(`/api/modules/${SLUG}/outlets`, form);
    setForm({ outlet_name: "", outlet_code: "", outlet_type: "Kirana", channel: "General Trade", distributor: "", is_ghost: false, performance_status: "Active", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/outlets/${id}`);
    load();
  }

  const ghostCount = items.filter((i) => i.is_ghost || i.performance_status === "Ghost").length;
  const nonPerforming = items.filter((i) => i.performance_status === "Non-Performing").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Outlets</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{items.length}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Ghost Outlets</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{ghostCount}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Non-Performing</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold-strong)" }}>{nonPerforming}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
          <div style={{ padding: "16px 20px", background: "var(--danger-tint)" }}>
            <h3 style={{ color: "var(--danger)", margin: 0 }}>Ghost / Non-Performing Outlets</h3>
          </div>
          {loading ? (
            <p style={{ padding: 20 }}>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Type</th>
                  <th>Distributor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.outlet_code}</strong>
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>{o.outlet_name}</div>
                    </td>
                    <td>{o.outlet_type}</td>
                    <td>{o.distributor}</td>
                    <td>
                      <span className={`badge ${o.performance_status === "Ghost" || o.is_ghost ? "badge-danger" : o.performance_status === "Non-Performing" ? "badge-gold" : "badge-success"}`}>
                        {o.performance_status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(o.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No outlets registered.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Register Outlet</h3>
          <div className="field">
            <label>Outlet Code</label>
            <input className="input" value={form.outlet_code} onChange={(e) => setForm({ ...form, outlet_code: e.target.value })} required />
          </div>
          <div className="field">
            <label>Outlet Name</label>
            <input className="input" value={form.outlet_name} onChange={(e) => setForm({ ...form, outlet_name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Outlet Type</label>
            <select className="select" value={form.outlet_type} onChange={(e) => setForm({ ...form, outlet_type: e.target.value })}>
              {OUTLET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Performance Status</label>
            <select className="select" value={form.performance_status} onChange={(e) => setForm({ ...form, performance_status: e.target.value })}>
              {PERF_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Distributor</label>
            <input className="input" value={form.distributor} onChange={(e) => setForm({ ...form, distributor: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block">Register Outlet</button>
        </form>
      </div>
    </div>
  );
}
