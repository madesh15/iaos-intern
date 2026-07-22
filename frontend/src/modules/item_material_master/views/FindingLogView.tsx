import { useEffect, useState } from "react";
import { get, post, put } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type Finding = {
  id: number;
  itemCode: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  assignedTo: string;
};

export default function FindingLogView() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newFinding, setNewFinding] = useState({ itemCode: "", type: "", severity: "Medium", description: "", assignedTo: "" });

  useEffect(() => {
    get<Finding[]>(`/api/modules/${SLUG}/findings`)
      .then((data) => setFindings(data))
      .catch(() => {
        setFindings([
          { id: 1, itemCode: "MAT-1001", type: "Data Gap", severity: "Critical", description: "Missing GST/HSN classification", status: "Open", assignedTo: "R. Sharma" },
          { id: 2, itemCode: "MAT-1005", type: "Valuation", severity: "High", description: "Standard cost not updated for 6 months", status: "In Progress", assignedTo: "P. Mehta" },
          { id: 3, itemCode: "MAT-1012", type: "Duplicate", severity: "Medium", description: "Similar item exists under different code", status: "Open", assignedTo: "A. Kumar" },
          { id: 4, itemCode: "MAT-1020", type: "Compliance", severity: "High", description: "Item missing mandatory material group", status: "Closed", assignedTo: "S. Patel" },
          { id: 5, itemCode: "MAT-1035", type: "Data Quality", severity: "Low", description: "Item description in mixed languages", status: "Open", assignedTo: "R. Sharma" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const createFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Date.now();
    const finding: Finding = { id: tempId, ...newFinding, status: "Open" };
    try {
      const created = await post<Finding>(`/api/modules/${SLUG}/findings`, newFinding);
      setFindings((prev) => [...prev, created]);
    } catch {
      setFindings((prev) => [...prev, finding]);
    }
    setNewFinding({ itemCode: "", type: "", severity: "Medium", description: "", assignedTo: "" });
    setShowForm(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await put(`/api/modules/${SLUG}/findings/${id}`, { status });
    } catch {}
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  const filtered = findings.filter((f) => {
    const s = !search || f.description.toLowerCase().includes(search.toLowerCase()) || f.itemCode.toLowerCase().includes(search.toLowerCase());
    const sev = !filterSeverity || f.severity === filterSeverity;
    const st = !filterStatus || f.status === filterStatus;
    return s && sev && st;
  });

  const cardData = [
    { label: "Total Findings", value: findings.length, color: "var(--navy)" },
    { label: "Open", value: findings.filter((f) => f.status === "Open").length, color: "var(--danger)" },
    { label: "In Progress", value: findings.filter((f) => f.status === "In Progress").length, color: "var(--gold)" },
    { label: "Closed", value: findings.filter((f) => f.status === "Closed").length, color: "var(--success)" },
  ];

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading findings...</div>;

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

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input className="input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
          <select className="select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "New Finding"}</button>
          <span style={{ color: "var(--slate)", fontSize: 13 }}>{filtered.length} results</span>
        </div>

        {showForm && (
          <form onSubmit={createFinding} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr", padding: 16, background: "var(--line-soft)", borderRadius: "var(--radius)", marginBottom: 16 }}>
            <div className="field"><label>Item Code</label><input className="input" value={newFinding.itemCode} onChange={(e) => setNewFinding({ ...newFinding, itemCode: e.target.value })} required /></div>
            <div className="field"><label>Type</label><input className="input" value={newFinding.type} onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })} required /></div>
            <div className="field"><label>Severity</label><select className="select" value={newFinding.severity} onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
            <div className="field"><label>Description</label><input className="input" value={newFinding.description} onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })} required /></div>
            <div className="field"><label>Assigned To</label><input className="input" value={newFinding.assignedTo} onChange={(e) => setNewFinding({ ...newFinding, assignedTo: e.target.value })} required /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-gold" type="submit">Create</button></div>
          </form>
        )}

        {filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No findings match your criteria.</div>
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
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td><strong>{f.itemCode}</strong></td>
                  <td>{f.type}</td>
                  <td><span className={`badge ${f.severity === "Critical" ? "badge-danger" : f.severity === "High" ? "badge-danger" : f.severity === "Medium" ? "badge-gold" : "badge-slate"}`}>{f.severity}</span></td>
                  <td style={{ maxWidth: 200 }}>{f.description}</td>
                  <td><span className={`badge ${f.status === "Closed" ? "badge-success" : f.status === "In Progress" ? "badge-gold" : "badge-danger"}`}>{f.status}</span></td>
                  <td>{f.assignedTo}</td>
                  <td>
                    {f.status === "Open" && <button className="btn btn-primary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(f.id, "In Progress")}>Start</button>}
                    {f.status === "In Progress" && <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => updateStatus(f.id, "Closed")}>Close</button>}
                    {f.status === "Open" && <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px", marginLeft: 4 }} onClick={() => alert("Assign finding " + f.id)}>Assign</button>}
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
