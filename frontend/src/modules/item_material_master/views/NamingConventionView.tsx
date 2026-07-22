import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface NamingItem {
  id: number;
  item_code: string;
  item_name: string;
  naming_prefix: string;
  expected_pattern: string;
  issue: string;
  severity: string;
}

export default function NamingConventionView() {
  const [items, setItems] = useState<NamingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function runCheck() {
    setLoading(true);
    try {
      const data = await post<NamingItem[]>(`/api/modules/${SLUG}/analytics/naming`);
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
    namingIssues: items.filter((i) => i.severity !== "OK").length,
    wrongPrefix: items.filter((i) => i.issue.toLowerCase().includes("prefix")).length,
    patternMismatch: items.filter((i) => i.issue.toLowerCase().includes("pattern")).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Naming Issues</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.namingIssues}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Wrong Prefix</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.wrongPrefix}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Pattern Mismatch</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.patternMismatch}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Naming Convention</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={runCheck}>Run Check</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export naming data")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Running naming convention check…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Naming Prefix</th>
                <th>Expected Pattern</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td><span className="badge badge-slate">{it.naming_prefix}</span></td>
                  <td style={{ fontSize: 13, fontFamily: "monospace" }}>{it.expected_pattern}</td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No naming convention issues found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
