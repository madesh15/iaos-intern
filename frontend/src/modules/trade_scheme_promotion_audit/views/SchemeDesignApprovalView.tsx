import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Scheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  scheme_type: string;
  channel: string;
  product_category: string;
  start_date: string | null;
  end_date: string | null;
  budget_allocated: number;
  approval_status: string;
  approved_by: string;
  overlap_flag: boolean;
  overlap_schemes: string;
  notes: string;
}

const SCHEME_TYPES = ["Volume", "Cash", "Combo", "Loyalty", "Seasonal", "Tiered"];
const CHANNELS = ["Modern Trade", "General Trade", "E-Commerce", "HoReCa", "Institutional"];
const STATUSES = ["Draft", "Pending", "Approved", "Rejected"];

export default function SchemeDesignApprovalView() {
  const [items, setItems] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    scheme_code: "",
    scheme_name: "",
    scheme_type: "Volume",
    channel: "Modern Trade",
    product_category: "",
    start_date: "",
    end_date: "",
    budget_allocated: 0,
    approval_status: "Draft",
    approved_by: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Scheme[]>(`/api/modules/${SLUG}/schemes`);
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
    if (!form.scheme_code || !form.scheme_name) return;
    await post(`/api/modules/${SLUG}/schemes`, {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
    setForm({ scheme_code: "", scheme_name: "", scheme_type: "Volume", channel: "Modern Trade", product_category: "", start_date: "", end_date: "", budget_allocated: 0, approval_status: "Draft", approved_by: "", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/schemes/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Scheme Design & Approval Register</h3>
          <span className="badge badge-gold">{items.length} Schemes</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading schemes...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Scheme</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Budget</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.scheme_code}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>{s.scheme_name}</div>
                  </td>
                  <td>{s.scheme_type}</td>
                  <td>{s.channel}</td>
                  <td>{s.budget_allocated.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.approval_status === "Approved" ? "badge-success" : s.approval_status === "Rejected" ? "badge-danger" : "badge-gold"}`}>
                      {s.approval_status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No schemes registered yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Register Scheme Design</h3>
        <div className="field">
          <label>Scheme Code</label>
          <input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} placeholder="e.g. SCH-2026-001" required />
        </div>
        <div className="field">
          <label>Scheme Name</label>
          <input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Scheme Type</label>
          <select className="select" value={form.scheme_type} onChange={(e) => setForm({ ...form, scheme_type: e.target.value })}>
            {SCHEME_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Channel</label>
          <select className="select" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Product Category</label>
          <input className="input" value={form.product_category} onChange={(e) => setForm({ ...form, product_category: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Start Date</label>
            <input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>End Date</label>
            <input className="input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Budget Allocated</label>
          <input className="input" type="number" value={form.budget_allocated} onChange={(e) => setForm({ ...form, budget_allocated: Number(e.target.value) })} min={0} />
        </div>
        <div className="field">
          <label>Approval Status</label>
          <select className="select" value={form.approval_status} onChange={(e) => setForm({ ...form, approval_status: e.target.value })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block">Register Scheme</button>
      </form>
    </div>
  );
}
