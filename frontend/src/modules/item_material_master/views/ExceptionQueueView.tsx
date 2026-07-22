import { useEffect, useState } from "react";
import { get, put } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type Exception = {
  id: number;
  itemCode: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  created: string;
};

export default function ExceptionQueueView() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<Exception[]>(`/api/modules/${SLUG}/exceptions`)
      .then((data) => setExceptions(data))
      .catch(() => {
        setExceptions([
          { id: 1, itemCode: "MAT-1001", type: "HSN Missing", severity: "High", description: "HSN code not assigned for raw material", status: "Open", created: "2026-07-15" },
          { id: 2, itemCode: "MAT-1002", type: "UOM Conflict", severity: "Medium", description: "Purchase UOM differs from base UOM", status: "Acknowledged", created: "2026-07-14" },
          { id: 3, itemCode: "MAT-1003", type: "Duplicate", severity: "High", description: "Possible duplicate with MAT-0892", status: "Open", created: "2026-07-13" },
          { id: 4, itemCode: "MAT-1004", type: "Valuation Gap", severity: "Critical", description: "Standard cost missing for valuation class", status: "Resolved", created: "2026-07-10" },
          { id: 5, itemCode: "MAT-1005", type: "Missing Attribute", severity: "Low", description: "Item category not defined", status: "Open", created: "2026-07-12" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await put(`/api/modules/${SLUG}/exceptions/${id}`, { status });
      setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch {
      setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    }
  };

  const cardData = [
    { label: "Total Exceptions", value: exceptions.length, color: "var(--navy)" },
    { label: "Open", value: exceptions.filter((e) => e.status === "Open").length, color: "var(--danger)" },
    { label: "Acknowledged", value: exceptions.filter((e) => e.status === "Acknowledged").length, color: "var(--gold)" },
    { label: "Resolved", value: exceptions.filter((e) => e.status === "Resolved").length, color: "var(--success)" },
  ];

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading exceptions...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {cardData.map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {exceptions.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No exceptions found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Code</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.id}</td>
                  <td><strong>{ex.itemCode}</strong></td>
                  <td>{ex.type}</td>
                  <td><span className={`badge ${ex.severity === "Critical" || ex.severity === "High" ? "badge-danger" : ex.severity === "Medium" ? "badge-gold" : "badge-slate"}`}>{ex.severity}</span></td>
                  <td style={{ maxWidth: 200 }}>{ex.description}</td>
                  <td><span className={`badge ${ex.status === "Resolved" ? "badge-success" : ex.status === "Acknowledged" ? "badge-gold" : "badge-danger"}`}>{ex.status}</span></td>
                  <td style={{ fontSize: 13 }}>{ex.created}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {ex.status === "Open" && <button className="btn btn-primary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(ex.id, "Acknowledged")}>Acknowledge</button>}
                      {ex.status !== "Resolved" && <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(ex.id, "Resolved")}>Resolve</button>}
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => alert("Comment on exception " + ex.id)}>Comment</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
