import { useEffect, useState } from "react";
import { get, post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface DuplicateItem {
  id: number;
  item_code_1: string;
  item_name_1: string;
  item_code_2: string;
  item_name_2: string;
  confidence: number;
  reason: string;
  status: string;
}

export default function DuplicateDetectionView() {
  const [items, setItems] = useState<DuplicateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function runAnalysis() {
    setLoading(true);
    try {
      const data = await post<DuplicateItem[]>(`/api/modules/${SLUG}/analytics/duplicate`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAnalysis();
  }, []);

  const filtered = items.filter(
    (i) =>
      i.item_code_1.toLowerCase().includes(search.toLowerCase()) ||
      i.item_name_1.toLowerCase().includes(search.toLowerCase()) ||
      i.item_code_2.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    total: items.length,
    potentialDuplicates: items.filter((i) => i.status === "Open").length,
    critical: items.filter((i) => i.confidence >= 90).length,
    high: items.filter((i) => i.confidence >= 70 && i.confidence < 90).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Potential Duplicates</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.potentialDuplicates}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Critical</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.critical}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>High</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.high}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Duplicate Detection</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={runAnalysis}>Run Analysis</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export duplicates")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Running duplicate analysis…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code 1</th>
                <th>Item Name 1</th>
                <th>Item Code 2</th>
                <th>Item Name 2</th>
                <th>Confidence %</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code_1}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name_1}</td>
                  <td><strong>{it.item_code_2}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name_2}</td>
                  <td><span className={`badge ${it.confidence >= 90 ? "badge-danger" : it.confidence >= 70 ? "badge-gold" : "badge-slate"}`}>{it.confidence}%</span></td>
                  <td style={{ fontSize: 13 }}>{it.reason}</td>
                  <td><span className={`badge ${it.status === "Open" ? "badge-danger" : "badge-success"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => { const r = prompt("Evidence / Notes:"); if (r) console.log("Evidence saved:", r); }}>Evidence</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No duplicate items found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
