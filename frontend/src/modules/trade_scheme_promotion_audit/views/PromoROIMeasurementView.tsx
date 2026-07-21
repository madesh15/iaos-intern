import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  promo_type: string;
  channel: string;
  region: string;
  spend_amount: number;
  uplift_revenue: number;
  roi_percentage: number;
  mechanism: string;
  slab_tier: string;
  target_quantity: number;
  achieved_quantity: number;
  slab_qualified: boolean;
  free_goods_qty: number;
  free_goods_reconciled: boolean;
  display_spend: number;
  display_verified: boolean;
  price_protection_amount: number;
  price_protection_validated: boolean;
  accrual_amount: number;
  actual_spend: number;
  variance: number;
  promo_period_start: string | null;
  promo_period_end: string | null;
  notes: string;
}

const PROMO_TYPES = ["Off-Invoice", "Bill-Back", "Free Goods", "Display", "Price Protection", "Slab"];
const CHANNELS = ["Modern Trade", "General Trade", "E-Commerce", "HoReCa", "Institutional"];

export default function PromoROIMeasurementView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    promo_name: "",
    promo_type: "Off-Invoice",
    channel: "Modern Trade",
    region: "",
    spend_amount: 0,
    uplift_revenue: 0,
    roi_percentage: 0,
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
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
    if (!form.promo_name) return;
    await post(`/api/modules/${SLUG}/spend`, form);
    setForm({ promo_name: "", promo_type: "Off-Invoice", channel: "Modern Trade", region: "", spend_amount: 0, uplift_revenue: 0, roi_percentage: 0, notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/spend/${id}`);
    load();
  }

  const totalSpend = items.reduce((s, i) => s + i.spend_amount, 0);
  const totalUplift = items.reduce((s, i) => s + i.uplift_revenue, 0);
  const avgROI = items.length > 0 ? items.reduce((s, i) => s + i.roi_percentage, 0) / items.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--navy)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{totalSpend.toLocaleString()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Promo Spend</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Across all promotions</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--success-tint)", color: "var(--success)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{totalUplift.toLocaleString()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Uplift Revenue</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Incremental sales generated</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{avgROI.toFixed(1)}%</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Average ROI</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Return on promotion investment</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
          <div style={{ padding: "16px 20px", background: "var(--navy-tint)" }}>
            <h3 style={{ color: "var(--navy)", margin: 0 }}>Promo ROI Records</h3>
          </div>
          {loading ? (
            <p style={{ padding: 20 }}>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Promo</th>
                  <th>Channel</th>
                  <th>Spend</th>
                  <th>Uplift</th>
                  <th>ROI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.promo_name}</strong>
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>{s.promo_type}</div>
                    </td>
                    <td>{s.channel}</td>
                    <td>{s.spend_amount.toLocaleString()}</td>
                    <td>{s.uplift_revenue.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${s.roi_percentage >= 100 ? "badge-success" : s.roi_percentage >= 50 ? "badge-gold" : "badge-danger"}`}>
                        {s.roi_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No promo records yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Promo Spend</h3>
          <div className="field">
            <label>Promotion Name</label>
            <input className="input" value={form.promo_name} onChange={(e) => setForm({ ...form, promo_name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Promo Type</label>
            <select className="select" value={form.promo_type} onChange={(e) => setForm({ ...form, promo_type: e.target.value })}>
              {PROMO_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Channel</label>
            <select className="select" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Region</label>
            <input className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div className="field">
            <label>Spend Amount</label>
            <input className="input" type="number" value={form.spend_amount} onChange={(e) => setForm({ ...form, spend_amount: Number(e.target.value) })} min={0} />
          </div>
          <div className="field">
            <label>Uplift Revenue</label>
            <input className="input" type="number" value={form.uplift_revenue} onChange={(e) => setForm({ ...form, uplift_revenue: Number(e.target.value) })} min={0} />
          </div>
          <div className="field">
            <label>ROI %</label>
            <input className="input" type="number" value={form.roi_percentage} onChange={(e) => setForm({ ...form, roi_percentage: Number(e.target.value) })} min={0} step={0.1} />
          </div>
          <button className="btn btn-primary btn-block">Add Promo Record</button>
        </form>
      </div>
    </div>
  );
}
