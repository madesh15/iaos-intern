import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "master_data_change_governance";

type SubTab =
  | "scope" | "rcm" | "rules" | "data_sources" | "sampling"
  | "exceptions" | "working_papers" | "findings" | "remediation";

export default function AuditFrameworkTab({ subTab }: { subTab: SubTab }) {
  if (subTab === "scope") return <ScopePanel />;
  if (subTab === "rcm") return <RcmPanel />;
  if (subTab === "rules") return <RulesPanel />;
  if (subTab === "data_sources") return <DataSourcesPanel />;
  if (subTab === "sampling") return <SamplingPanel />;
  if (subTab === "exceptions") return <ExceptionsPanel />;
  if (subTab === "working_papers") return <WorkingPapersPanel />;
  if (subTab === "findings") return <FindingsPanel />;
  return <RemediationPanel />;
}

/* ---------- 17. Scope & Audit Universe ---------- */
function ScopePanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entity_type: "GL", entity_name: "", description: "", risk_rating: "Medium" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/scope`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/scope`, form);
    setForm({ ...form, entity_name: "", description: "" });
    refresh();
  }

  function riskBadge(r: string) {
    if (r === "High") return "badge-danger";
    if (r === "Medium") return "badge-gold";
    return "badge-success";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Scope & Audit Universe</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Entity Type</label>
            <select className="select" value={form.entity_type}
              onChange={(e) => setForm({ ...form, entity_type: e.target.value })}>
              {["GL", "Cost Centre", "Profit Centre", "Bank", "Vendor", "Customer", "Other"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 2, minWidth: 180 }}>
            <label>Entity Name</label>
            <input className="input" value={form.entity_name}
              onChange={(e) => setForm({ ...form, entity_name: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Risk Rating</label>
            <select className="select" value={form.risk_rating}
              onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}>
              {["High", "Medium", "Low"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Description</label>
          <input className="input" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Entity</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No scope items defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Type</th><th>Entity</th><th>Description</th><th>Risk</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-slate">{s.entity_type}</span></td>
                  <td><strong>{s.entity_name}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{s.description || "—"}</td>
                  <td><span className={`badge ${riskBadge(s.risk_rating)}`}>{s.risk_rating}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/scope/${s.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 18. Risk & Control Matrix ---------- */
function RcmPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ risk_id: "", risk_description: "", control_id: "", control_description: "", assertion: "", control_type: "Preventive", control_owner: "", frequency: "Quarterly" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/rcm`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.risk_id.trim() || !form.control_id.trim()) return;
    await post(`/api/modules/${SLUG}/rcm`, form);
    setForm({ ...form, risk_id: "", risk_description: "", control_id: "", control_description: "", assertion: "", control_owner: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Risk & Control Matrix (RCM)</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Risk ID</label><input className="input" value={form.risk_id}
            onChange={(e) => setForm({ ...form, risk_id: e.target.value })} required /></div>
          <div className="field"><label>Risk Description</label><input className="input" value={form.risk_description}
            onChange={(e) => setForm({ ...form, risk_description: e.target.value })} /></div>
          <div className="field"><label>Control ID</label><input className="input" value={form.control_id}
            onChange={(e) => setForm({ ...form, control_id: e.target.value })} required /></div>
          <div className="field"><label>Control Description</label><input className="input" value={form.control_description}
            onChange={(e) => setForm({ ...form, control_description: e.target.value })} /></div>
          <div className="field"><label>Assertion</label><input className="input" value={form.assertion}
            onChange={(e) => setForm({ ...form, assertion: e.target.value })} /></div>
          <div className="field"><label>Control Type</label>
            <select className="select" value={form.control_type}
              onChange={(e) => setForm({ ...form, control_type: e.target.value })}>
              {["Preventive", "Detective", "Corrective"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Control Owner</label><input className="input" value={form.control_owner}
            onChange={(e) => setForm({ ...form, control_owner: e.target.value })} /></div>
          <div className="field"><label>Frequency</label>
            <select className="select" value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {["Daily", "Weekly", "Monthly", "Quarterly", "Annually"].map((f) => <option key={f}>{f}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add RCM Entry</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No RCM entries.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Risk</th><th>Control</th><th>Type</th><th>Owner</th><th>Frequency</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.risk_id}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.risk_description}</div></td>
                  <td><strong>{r.control_id}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.control_description}</div></td>
                  <td><span className="badge badge-slate">{r.control_type}</span></td>
                  <td>{r.control_owner || "—"}</td>
                  <td>{r.frequency}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/rcm/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 19. Test & Analytics Rule Library ---------- */
function RulesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rule_name: "", rule_type: "Red-Flag", master_type: "chart_of_accounts", threshold: "", caat_script: "", is_active: true });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/rules`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rule_name.trim()) return;
    await post(`/api/modules/${SLUG}/rules`, form);
    setForm({ ...form, rule_name: "", threshold: "", caat_script: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Test & Analytics Rule Library</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Rule Name</label><input className="input" value={form.rule_name}
            onChange={(e) => setForm({ ...form, rule_name: e.target.value })} required /></div>
          <div className="field"><label>Rule Type</label>
            <select className="select" value={form.rule_type}
              onChange={(e) => setForm({ ...form, rule_type: e.target.value })}>
              {["Red-Flag", "Threshold", "Anomaly", "Compliance"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {["chart_of_accounts", "cost_centre", "bank_master", "gl_account", "profit_centre"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Threshold</label><input className="input" value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>CAAT Script / Description</label>
          <input className="input" value={form.caat_script}
            onChange={(e) => setForm({ ...form, caat_script: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Rule</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No rules defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Rule</th><th>Type</th><th>Master</th><th>Threshold</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.rule_name}</strong></td>
                  <td><span className="badge badge-slate">{r.rule_type}</span></td>
                  <td>{r.master_type}</td>
                  <td>{r.threshold || "—"}</td>
                  <td><span className={`badge ${r.is_active ? "badge-success" : "badge-danger"}`}>{r.is_active ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/rules/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 20. Data Source & Connector Setup ---------- */
function DataSourcesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source_name: "", source_type: "ERP", connection_detail: "", table_mapping: "", is_active: true });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/data-sources`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source_name.trim()) return;
    await post(`/api/modules/${SLUG}/data-sources`, form);
    setForm({ ...form, source_name: "", connection_detail: "", table_mapping: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Data Source & Connector Setup</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label>Source Name</label>
            <input className="input" value={form.source_name}
              onChange={(e) => setForm({ ...form, source_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Source Type</label>
            <select className="select" value={form.source_type}
              onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
              {["ERP", "API", "CSV Upload", "Database", "Manual"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Connection Detail</label>
            <input className="input" value={form.connection_detail}
              onChange={(e) => setForm({ ...form, connection_detail: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Table Mapping</label>
          <input className="input" value={form.table_mapping}
            onChange={(e) => setForm({ ...form, table_mapping: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Data Source</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No data sources configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Source</th><th>Type</th><th>Connection</th><th>Mapping</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.source_name}</strong></td>
                  <td><span className="badge badge-slate">{d.source_type}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{d.connection_detail || "—"}</td>
                  <td style={{ fontSize: 12 }}>{d.table_mapping || "—"}</td>
                  <td><span className={`badge ${d.is_active ? "badge-success" : "badge-danger"}`}>{d.is_active ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/data-sources/${d.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 21. Sampling & Population Builder ---------- */
function SamplingPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ population_name: "", population_size: 0, sample_size: 0, sample_method: "Random", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/sampling`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.population_name.trim()) return;
    await post(`/api/modules/${SLUG}/sampling`, form);
    setForm({ ...form, population_name: "", population_size: 0, sample_size: 0, notes: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Sampling & Population Builder</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label>Population Name</label>
            <input className="input" value={form.population_name}
              onChange={(e) => setForm({ ...form, population_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Population Size</label>
            <input className="input" type="number" value={form.population_size}
              onChange={(e) => setForm({ ...form, population_size: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Sample Size</label>
            <input className="input" type="number" value={form.sample_size}
              onChange={(e) => setForm({ ...form, sample_size: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Method</label>
            <select className="select" value={form.sample_method}
              onChange={(e) => setForm({ ...form, sample_method: e.target.value })}>
              {["Random", "Stratified", "Systematic", "Judgemental"].map((m) => <option key={m}>{m}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Create Sample</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No sampling records.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Population</th><th>Pop. Size</th><th>Sample</th><th>Method</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.population_name}</strong></td>
                  <td>{s.population_size.toLocaleString()}</td>
                  <td>{s.sample_size.toLocaleString()}</td>
                  <td><span className="badge badge-slate">{s.sample_method}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/sampling/${s.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 22. Exception & Red-Flag Queue ---------- */
function ExceptionsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ exception_type: "", description: "", severity: "Medium", status: "Open", assigned_to: "", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/exceptions`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.exception_type.trim()) return;
    await post(`/api/modules/${SLUG}/exceptions`, form);
    setForm({ ...form, exception_type: "", description: "", assigned_to: "", notes: "" });
    refresh();
  }

  function sevBadge(s: string) {
    if (s === "High") return "badge-danger";
    if (s === "Medium") return "badge-gold";
    return "badge-success";
  }
  function statusBadge(s: string) {
    if (s === "Open") return "badge-danger";
    if (s === "In Progress") return "badge-gold";
    return "badge-success";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Exception & Red-Flag Queue</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Exception Type</label><input className="input" value={form.exception_type}
            onChange={(e) => setForm({ ...form, exception_type: e.target.value })} required /></div>
          <div className="field"><label>Severity</label>
            <select className="select" value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Assigned To</label><input className="input" value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Exception</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No exceptions in queue.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Assigned</th><th></th></tr></thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.exception_type}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{e.description || "—"}</td>
                  <td><span className={`badge ${sevBadge(e.severity)}`}>{e.severity}</span></td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                  <td>{e.assigned_to || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/exceptions/${e.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 23. Working Papers & Evidence ---------- */
function WorkingPapersPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", paper_type: "Evidence", reference_url: "", status: "Draft" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/working-papers`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await post(`/api/modules/${SLUG}/working-papers`, form);
    setForm({ ...form, title: "", description: "", reference_url: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Working Papers & Evidence</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Title</label><input className="input" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="field"><label>Paper Type</label>
            <select className="select" value={form.paper_type}
              onChange={(e) => setForm({ ...form, paper_type: e.target.value })}>
              {["Evidence", "Memo", "Checklist", "Analysis", "Screenshot"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Reference URL</label><input className="input" value={form.reference_url}
            onChange={(e) => setForm({ ...form, reference_url: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Paper</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No working papers.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.title}</strong></td>
                  <td><span className="badge badge-slate">{w.paper_type}</span></td>
                  <td><span className={`badge ${w.status === "Final" ? "badge-success" : "badge-gold"}`}>{w.status}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/working-papers/${w.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 24. Observation & Finding Log ---------- */
function FindingsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ finding_title: "", description: "", severity: "Medium", status: "Open", assigned_to: "", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/findings`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.finding_title.trim()) return;
    await post(`/api/modules/${SLUG}/findings`, form);
    setForm({ ...form, finding_title: "", description: "", assigned_to: "", notes: "" });
    refresh();
  }

  function sevBadge(s: string) {
    if (s === "High") return "badge-danger";
    if (s === "Medium") return "badge-gold";
    return "badge-success";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Observation & Finding Log</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Finding Title</label><input className="input" value={form.finding_title}
            onChange={(e) => setForm({ ...form, finding_title: e.target.value })} required /></div>
          <div className="field"><label>Severity</label>
            <select className="select" value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Assigned To</label><input className="input" value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Finding</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No findings logged.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Finding</th><th>Severity</th><th>Status</th><th>Assigned</th><th></th></tr></thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.finding_title}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{f.description}</div></td>
                  <td><span className={`badge ${sevBadge(f.severity)}`}>{f.severity}</span></td>
                  <td><span className={`badge ${f.status === "Closed" ? "badge-success" : f.status === "In Progress" ? "badge-gold" : "badge-danger"}`}>{f.status}</span></td>
                  <td>{f.assigned_to || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/findings/${f.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 25. Remediation / Action Tracker ---------- */
function RemediationPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ action_title: "", description: "", owner: "", status: "Planned", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/remediation`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.action_title.trim()) return;
    await post(`/api/modules/${SLUG}/remediation`, form);
    setForm({ ...form, action_title: "", description: "", owner: "", notes: "" });
    refresh();
  }

  function statusBadge(s: string) {
    if (s === "Completed") return "badge-success";
    if (s === "In Progress") return "badge-gold";
    return "badge-slate";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Remediation / Action Tracker</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Action Title</label><input className="input" value={form.action_title}
            onChange={(e) => setForm({ ...form, action_title: e.target.value })} required /></div>
          <div className="field"><label>Owner</label><input className="input" value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
          <div className="field"><label>Description</label><input className="input" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Status</label>
            <select className="select" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["Planned", "In Progress", "Completed"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Action</button>
      </form>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No remediation items.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Action</th><th>Owner</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.action_title}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.description}</div></td>
                  <td>{r.owner || "—"}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/remediation/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
