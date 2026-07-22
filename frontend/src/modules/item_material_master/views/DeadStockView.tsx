import { useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface DeadStockItem {
  id: number;
  item_code: string;
  item_name: string;
  last_movement: string;
  days_since: number;
  threshold: number;
  issue: string;
}

export default function DeadStockView() {
  const [items, setItems] = useState<DeadStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(90);

  async function runAnalysis(days: number) {
    setLoading(true);
    setThreshold(days);
    try {
      const data = await post<DeadStockItem[]>(`/api/modules/${SLUG}/analytics/dead-stock`, { threshold_days: days });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter((i) =>
    i.item_code.toLowerCase().includes(search.toLowerCase()) ||
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    total: items.length,
    deadStock: items.length,
    days90: items.filter((i) => i.days_since >= 90 && i.days_since < 180).length,
    days180: items.filter((i) => i.days_since >= 180 && i.days_since < 365).length,
    days365: items.filter((i) => i.days_since >= 365).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Dead Stock Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.deadStock}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>90-Day</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.days90}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>180-Day</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.days180}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>365-Day</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.days365}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Dead Stock Analysis</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn ${threshold === 90 ? "btn-primary" : "btn-ghost"}`} onClick={() => runAnalysis(90)}>90 Days</button>
            <button className={`btn ${threshold === 180 ? "btn-primary" : "btn-ghost"}`} onClick={() => runAnalysis(180)}>180 Days</button>
            <button className={`btn ${threshold === 365 ? "btn-primary" : "btn-ghost"}`} onClick={() => runAnalysis(365)}>365 Days</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export dead stock data")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Running dead stock analysis…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Last Movement</th>
                <th>Days Since</th>
                <th>Threshold</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td>{it.last_movement ? new Date(it.last_movement).toLocaleDateString() : "—"}</td>
                  <td><span className={`badge ${it.days_since >= 365 ? "badge-danger" : it.days_since >= 180 ? "badge-gold" : "badge-slate"}`}>{it.days_since}d</span></td>
                  <td>{it.threshold}d</td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No dead stock items for the selected threshold.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
