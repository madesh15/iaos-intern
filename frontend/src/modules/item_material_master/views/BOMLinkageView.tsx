import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface BOMItem {
  id: number;
  item_code: string;
  item_name: string;
  parent_material: string;
  bom_active: boolean;
  issue: string;
  severity: string;
}

export default function BOMLinkageView() {
  const [items, setItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function runCheck() {
    setLoading(true);
    try {
      const data = await post<BOMItem[]>(`/api/modules/${SLUG}/analytics/bom`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runCheck(); }, []);

  const filtered = items.filter((i) =>
    i.item_code.toLowerCase().includes(search.toLowerCase()) ||
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    total: items.length,
    bomIssues: items.filter((i) => i.severity !== "OK").length,
    missingParent: items.filter((i) => i.issue.toLowerCase().includes("missing parent")).length,
    inactiveBOM: items.filter((i) => !i.bom_active).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>BOM Issues</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.bomIssues}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Missing Parent</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.missingParent}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Inactive BOM</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.inactiveBOM}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>BOM Linkage</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={runCheck}>Run Check</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export BOM data")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Running BOM linkage check…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Parent Material</th>
                <th>BOM Active</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td>{it.parent_material || "—"}</td>
                  <td><span className={`badge ${it.bom_active ? "badge-success" : "badge-danger"}`}>{it.bom_active ? "Yes" : "No"}</span></td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No BOM linkage issues found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
