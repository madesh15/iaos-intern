import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface CostChange {
  id: number;
  item_id: number;
  item_code: string;
  old_value: number;
  new_value: number;
  changed_by: string;
  date: string;
  change_type: string;
}

export default function CostChangesView() {
  const [items, setItems] = useState<CostChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await get<CostChange[]>(`/api/modules/${SLUG}/analytics/cost-history`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) =>
    i.item_code.toLowerCase().includes(search.toLowerCase()) ||
    i.changed_by.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    totalChanges: items.length,
    itemsTracked: new Set(items.map((i) => i.item_id)).size,
    pendingReview: items.filter((i) => i.change_type === "Manual").length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Cost Changes</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.totalChanges}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Items Tracked</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.itemsTracked}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Pending Review</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.pendingReview}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Cost Changes History</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => console.log("Export cost history")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or changed by..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading cost history…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Code</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Changed By</th>
                <th>Date</th>
                <th>Change Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td>{it.item_id}</td>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--danger)" }}>${it.old_value.toLocaleString()}</td>
                  <td style={{ color: "var(--success)" }}>${it.new_value.toLocaleString()}</td>
                  <td>{it.changed_by}</td>
                  <td style={{ fontSize: 13 }}>{new Date(it.date).toLocaleDateString()}</td>
                  <td><span className={`badge ${it.change_type === "Manual" ? "badge-gold" : "badge-success"}`}>{it.change_type}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No cost changes recorded.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
