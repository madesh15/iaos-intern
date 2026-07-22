import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface ObsoleteItem {
  id: number;
  item_code: string;
  item_name: string;
  blocked: boolean;
  deleted: boolean;
  active: boolean;
  discontinued: boolean;
  issue: string;
  severity: string;
}

export default function ObsoleteBlockedView() {
  const [items, setItems] = useState<ObsoleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await post<ObsoleteItem[]>(`/api/modules/${SLUG}/analytics/duplicate`);
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
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    total: items.length,
    blocked: items.filter((i) => i.blocked).length,
    inactive: items.filter((i) => !i.active).length,
    discontinued: items.filter((i) => i.discontinued).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Blocked</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.blocked}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Inactive</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.inactive}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Discontinued</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.discontinued}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Obsolete / Blocked Items</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={load}>Refresh</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export obsolete data")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading items…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Blocked</th>
                <th>Deleted</th>
                <th>Active</th>
                <th>Discontinued</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td><span className={`badge ${it.blocked ? "badge-danger" : "badge-success"}`}>{it.blocked ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${it.deleted ? "badge-danger" : "badge-success"}`}>{it.deleted ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${it.active ? "badge-success" : "badge-danger"}`}>{it.active ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${it.discontinued ? "badge-gold" : "badge-success"}`}>{it.discontinued ? "Yes" : "No"}</span></td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No obsolete or blocked items.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
