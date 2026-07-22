import { useEffect, useState } from "react";
import { post } from "../../../lib/api";

const SLUG = "item_material_master_governance";

interface BatchSerialItem {
  id: number;
  item_code: string;
  item_name: string;
  batch_managed: boolean;
  serial_tracked: boolean;
  issue: string;
  severity: string;
}

export default function BatchSerialControlView() {
  const [items, setItems] = useState<BatchSerialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await post<BatchSerialItem[]>(`/api/modules/${SLUG}/analytics/duplicate`);
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
    batchManaged: items.filter((i) => i.batch_managed).length,
    serialTracked: items.filter((i) => i.serial_tracked).length,
    issuesFound: items.filter((i) => i.severity !== "OK").length,
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Total Items</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totals.total}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Batch Managed</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.batchManaged}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Serial Tracked</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{totals.serialTracked}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Issues Found</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{totals.issuesFound}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Batch / Serial Control</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={load}>Refresh</button>
            <button className="btn btn-ghost" onClick={() => console.log("Export batch/serial data")}>Export</button>
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
                <th>Batch Managed</th>
                <th>Serial Tracked</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.item_code}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{it.item_name}</td>
                  <td><span className={`badge ${it.batch_managed ? "badge-success" : "badge-danger"}`}>{it.batch_managed ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${it.serial_tracked ? "badge-success" : "badge-danger"}`}>{it.serial_tracked ? "Yes" : "No"}</span></td>
                  <td style={{ fontSize: 13 }}>{it.issue}</td>
                  <td><span className={`badge ${it.severity === "Critical" ? "badge-danger" : it.severity === "High" ? "badge-gold" : "badge-slate"}`}>{it.severity}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No batch/serial control issues.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
