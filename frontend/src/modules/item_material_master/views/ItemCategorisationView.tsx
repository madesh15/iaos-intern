import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface CategoryItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  subcategory: string;
  material_group: string;
  issue: string;
  severity: string;
}

export default function ItemCategorisationView() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await post<CategoryItem[]>(`/api/modules/${SLUG}/analytics/duplicate`);
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
    missingCategory: items.filter((i) => i.issue.toLowerCase().includes("category")).length,
    missingSubcategory: items.filter((i) => i.issue.toLowerCase().includes("subcategory")).length,
    missingGroup: items.filter((i) => i.issue.toLowerCase().includes("group")).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Missing Category</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.missingCategory}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Missing Subcategory</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.missingSubcategory}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Missing Group</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.missingGroup}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Item Categorisation</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={load}>Refresh</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export categorisation data")}>Export</button>
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
                <th>Category</th>
                <th>Subcategory</th>
                <th>Material Group</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td>{it.category || "—"}</td>
                  <td>{it.subcategory || "—"}</td>
                  <td>{it.material_group || "—"}</td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No categorisation issues found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
