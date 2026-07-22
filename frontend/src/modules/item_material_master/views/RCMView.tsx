import { useState } from "react";

type RCMEntry = {
  id: string;
  risk: string;
  control: string;
  assertion: string;
  owner: string;
  frequency: string;
  testMethod: string;
  status: string;
};

export default function RCMView() {
  const [entries] = useState<RCMEntry[]>([
    { id: "R-MM-01", risk: "Duplicate item codes created due to lack of ERP validation", control: "System blocks creation if similar name/material group exists", assertion: "Completeness", owner: "Master Data Lead", frequency: "Every creation", testMethod: "System Config Review", status: "Effective" },
    { id: "R-MM-02", risk: "HSN codes missing or incorrectly mapped leading to GST misreporting", control: "Mandatory HSN field with validation against master table", assertion: "Accuracy", owner: "Tax Team", frequency: "Monthly audit", testMethod: "Data Analytics", status: "Effective" },
    { id: "R-MM-03", risk: "UOM inconsistencies cause procurement vs. inventory mismatch", control: "UOM conversion table enforced at material group level", assertion: "Accuracy", owner: "Supply Chain", frequency: "Quarterly review", testMethod: "Sample Check", status: "Needs Improvement" },
    { id: "R-MM-04", risk: "Obsolete items remain active and trigger erroneous MRP runs", control: "Material status review every 6 months with auto-flagging", assertion: "Validity", owner: "Planning Head", frequency: "Semi-annual", testMethod: "System Report", status: "Effective" },
    { id: "R-MM-05", risk: "Standard cost not updated resulting in valuation gaps", control: "Cost rollup triggered automatically on material master changes", assertion: "Accuracy", owner: "Costing Manager", frequency: "On change", testMethod: "Reconciliation", status: "Ineffective" },
    { id: "R-MM-06", risk: "Unauthorized changes to material master fields", control: "Change log with approval workflow for critical fields", assertion: "Authorization", owner: "ITGC Lead", frequency: "Continuous", testMethod: "Audit Log Review", status: "Effective" },
  ]);

  const [search, setSearch] = useState("");
  const [filterAssertion, setFilterAssertion] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = entries.filter((e) => {
    const s = !search || e.risk.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const a = !filterAssertion || e.assertion === filterAssertion;
    const st = !filterStatus || e.status === filterStatus;
    return s && a && st;
  });

  const cards = [
    { label: "Total Risks", value: entries.length, color: "var(--navy)" },
    { label: "Critical Risks", value: entries.filter((e) => e.status === "Ineffective").length, color: "var(--danger)" },
    { label: "Controls Tested", value: entries.length, color: "var(--gold)" },
    { label: "Effective Controls", value: entries.filter((e) => e.status === "Effective").length, color: "var(--success)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <input className="input" placeholder="Search risk or ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
          <select className="select" value={filterAssertion} onChange={(e) => setFilterAssertion(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">All Assertions</option>
            <option value="Completeness">Completeness</option>
            <option value="Accuracy">Accuracy</option>
            <option value="Validity">Validity</option>
            <option value="Authorization">Authorization</option>
          </select>
          <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">All Status</option>
            <option value="Effective">Effective</option>
            <option value="Needs Improvement">Needs Improvement</option>
            <option value="Ineffective">Ineffective</option>
          </select>
          <span style={{ color: "var(--slate)", fontSize: 13, alignSelf: "center" }}>{filtered.length} entries</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No RCM entries match your filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Risk ID</th>
                <th>Risk Description</th>
                <th>Control Description</th>
                <th>Assertion</th>
                <th>Owner</th>
                <th>Frequency</th>
                <th>Test Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td style={{ maxWidth: 200 }}>{r.risk}</td>
                  <td style={{ maxWidth: 200 }}>{r.control}</td>
                  <td><span className="badge badge-slate">{r.assertion}</span></td>
                  <td>{r.owner}</td>
                  <td>{r.frequency}</td>
                  <td>{r.testMethod}</td>
                  <td><span className={`badge ${r.status === "Effective" ? "badge-success" : r.status === "Needs Improvement" ? "badge-gold" : "badge-danger"}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
