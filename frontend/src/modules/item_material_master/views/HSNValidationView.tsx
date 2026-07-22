import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface HSNItem {
  id: number;
  item_code: string;
  item_name: string;
  hsn_code: string;
  gst_rate: number;
  tax_code: string;
  issue: string;
  severity: string;
  status: string;
}

export default function HSNValidationView() {
  const [items, setItems] = useState<HSNItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");

  async function runCheck() {
    setLoading(true);
    try {
      const data = await post<HSNItem[]>(`/api/modules/${SLUG}/analytics/hsn`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runCheck(); }, []);

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.item_code.toLowerCase().includes(search.toLowerCase()) || i.item_name.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severity || i.severity === severity;
    return matchSearch && matchSeverity;
  });

  const totals = {
    total: items.length,
    missingHSN: items.filter((i) => i.issue.toLowerCase().includes("missing hsn")).length,
    invalidGST: items.filter((i) => i.issue.toLowerCase().includes("gst")).length,
    wrongTaxCode: items.filter((i) => i.issue.toLowerCase().includes("tax code")).length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Missing HSN</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.missingHSN}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Invalid GST</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.invalidGST}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Wrong Tax Code</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.wrongTaxCode}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>HSN / GST Validation</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={runCheck}>Run Check</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export HSN data")}>Export</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Search by item code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="select" style={{ width: 160 }} value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Running HSN validation…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>HSN Code</th>
                <th>GST Rate</th>
                <th>Tax Code</th>
                <th>Issue</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td>{it.hsn_code}</td>
                  <td>{it.gst_rate}%</td>
                  <td>{it.tax_code}</td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                  <td><span className={`badge ${it.status === "Resolved" ? "badge-success" : "badge-danger"}`}>{it.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No HSN validation results.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
