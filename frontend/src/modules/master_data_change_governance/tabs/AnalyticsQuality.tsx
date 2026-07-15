import { useEffect, useState } from "react";
import { get, patch, post } from "../../../lib/api";

const SLUG = "master_data_change_governance";

const MASTER_TYPES = ["chart_of_accounts", "cost_centre", "bank_master", "gl_account", "profit_centre"];

type SubTab = "quality" | "duplicates" | "reference" | "ageing" | "reconciliation" | "alerting";

export default function AnalyticsQualityTab({ subTab }: { subTab: SubTab }) {
  if (subTab === "quality") return <QualityPanel />;
  if (subTab === "duplicates") return <DuplicatesPanel />;
  if (subTab === "reference") return <ReferencePanel />;
  if (subTab === "ageing") return <AgeingPanel />;
  if (subTab === "reconciliation") return <ReconciliationPanel />;
  return <AlertingPanel />;
}

/* ---------- 10. Data-Quality Scorecard ---------- */
function QualityPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", dimension: "completeness", score: 0, total_records: 0, passing_records: 0, notes: "" });

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/quality-scores`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/quality-scores`, form);
    setForm({ ...form, score: 0, total_records: 0, passing_records: 0, notes: "" });
    refresh();
  }

  function scoreColor(s: number) {
    if (s >= 90) return "badge-success";
    if (s >= 70) return "badge-gold";
    return "badge-danger";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Data-Quality Scorecard</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Dimension</label>
            <select className="select" value={form.dimension}
              onChange={(e) => setForm({ ...form, dimension: e.target.value })}>
              {["completeness", "accuracy", "consistency", "timeliness"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Score (0-100)</label>
            <input className="input" type="number" min={0} max={100} value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Total</label>
            <input className="input" type="number" value={form.total_records}
              onChange={(e) => setForm({ ...form, total_records: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Passing</label>
            <input className="input" type="number" value={form.passing_records}
              onChange={(e) => setForm({ ...form, passing_records: Number(e.target.value) })} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Record Score</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No quality scores recorded.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Dimension</th><th>Score</th><th>Pass / Total</th><th>Evaluated</th></tr></thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id}>
                  <td><span className="badge badge-slate">{q.master_type}</span></td>
                  <td>{q.dimension}</td>
                  <td><span className={`badge ${scoreColor(q.score)}`}>{q.score}%</span></td>
                  <td>{q.passing_records} / {q.total_records}</td>
                  <td style={{ fontSize: 12 }}>{new Date(q.evaluated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 11. Duplicate Detection Engine ---------- */
function DuplicatesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", record_a_id: "", record_a_name: "", record_b_id: "", record_b_name: "", match_score: 80, status: "open" });

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/duplicates`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_a_id.trim() || !form.record_b_id.trim()) return;
    await post(`/api/modules/${SLUG}/duplicates`, form);
    setForm({ ...form, record_a_id: "", record_a_name: "", record_b_id: "", record_b_name: "", match_score: 80 });
    refresh();
  }

  async function updateStatus(id: number, status: string) {
    await patch(`/api/modules/${SLUG}/duplicates/${id}`, { status });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Duplicate Detection Engine</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Record A ID</label>
            <input className="input" value={form.record_a_id}
              onChange={(e) => setForm({ ...form, record_a_id: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Record A Name</label>
            <input className="input" value={form.record_a_name}
              onChange={(e) => setForm({ ...form, record_a_name: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Record B ID</label>
            <input className="input" value={form.record_b_id}
              onChange={(e) => setForm({ ...form, record_b_id: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Record B Name</label>
            <input className="input" value={form.record_b_name}
              onChange={(e) => setForm({ ...form, record_b_name: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Match %</label>
            <input className="input" type="number" min={0} max={100} value={form.match_score}
              onChange={(e) => setForm({ ...form, match_score: Number(e.target.value) })} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Duplicate</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No duplicate pairs detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record A</th><th>Record B</th><th>Match</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td><span className="badge badge-slate">{d.master_type}</span></td>
                  <td><strong>{d.record_a_name || d.record_a_id}</strong></td>
                  <td><strong>{d.record_b_name || d.record_b_id}</strong></td>
                  <td><span className={`badge ${d.match_score >= 90 ? "badge-danger" : d.match_score >= 70 ? "badge-gold" : "badge-success"}`}>{d.match_score}%</span></td>
                  <td>
                    <select className="select" value={d.status}
                      onChange={(e) => updateStatus(d.id, e.target.value)}
                      style={{ padding: "4px 8px", fontSize: 12 }}>
                      <option value="open">Open</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="false_positive">False Positive</option>
                    </select>
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 12. Reference-Data Consistency ---------- */
function ReferencePanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code_system: "", code_value: "", code_description: "", module_a: "", module_b: "", is_consistent: true, notes: "" });

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/reference-data`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code_system.trim() || !form.code_value.trim()) return;
    await post(`/api/modules/${SLUG}/reference-data`, form);
    setForm({ ...form, code_value: "", code_description: "", notes: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Reference-Data Consistency</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Code System</label>
            <input className="input" value={form.code_system}
              onChange={(e) => setForm({ ...form, code_system: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}>
            <label>Code Value</label>
            <input className="input" value={form.code_value}
              onChange={(e) => setForm({ ...form, code_value: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Module A</label>
            <input className="input" value={form.module_a}
              onChange={(e) => setForm({ ...form, module_a: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Module B</label>
            <input className="input" value={form.module_b}
              onChange={(e) => setForm({ ...form, module_b: e.target.value })} />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={form.is_consistent}
                onChange={(e) => setForm({ ...form, is_consistent: e.target.checked })} />
              Consistent
            </label>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Entry</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No reference data entries.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>System</th><th>Code</th><th>Module A</th><th>Module B</th><th>Consistent</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.code_system}</td>
                  <td><strong>{r.code_value}</strong></td>
                  <td>{r.module_a || "—"}</td>
                  <td>{r.module_b || "—"}</td>
                  <td><span className={`badge ${r.is_consistent ? "badge-success" : "badge-danger"}`}>{r.is_consistent ? "Yes" : "No"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 13. Change-Approval Ageing ---------- */
function AgeingPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/approval-ageing`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function daysOld(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    return Math.floor(diff / 86400000);
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Change-Approval Ageing</h3>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>Pending approvals sorted by age (oldest first).</p>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No pending approvals.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record</th><th>Field</th><th>Requested</th><th>Days Open</th><th>User</th></tr></thead>
            <tbody>
              {items.map((a) => {
                const days = daysOld(a.change_timestamp);
                return (
                  <tr key={a.id}>
                    <td><span className="badge badge-slate">{a.master_type}</span></td>
                    <td><strong>{a.record_name || a.record_id}</strong></td>
                    <td>{a.field_name}</td>
                    <td style={{ fontSize: 12 }}>{new Date(a.change_timestamp).toLocaleDateString()}</td>
                    <td><span className={`badge ${days > 7 ? "badge-danger" : days > 3 ? "badge-gold" : "badge-success"}`}>{days}d</span></td>
                    <td>{a.change_user || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 14. Master Reconciliation ---------- */
function ReconciliationPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", record_id: "", source_system: "", target_system: "", source_hash: "", target_hash: "", status: "pending", notes: "" });

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/reconciliation`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_id.trim()) return;
    await post(`/api/modules/${SLUG}/reconciliation`, form);
    setForm({ ...form, record_id: "", source_hash: "", target_hash: "", notes: "" });
    refresh();
  }

  function statusBadge(s: string) {
    if (s === "match") return "badge-success";
    if (s === "mismatch") return "badge-danger";
    return "badge-gold";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Master Reconciliation</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Record ID</label>
            <input className="input" value={form.record_id}
              onChange={(e) => setForm({ ...form, record_id: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Source System</label>
            <input className="input" value={form.source_system}
              onChange={(e) => setForm({ ...form, source_system: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Target System</label>
            <input className="input" value={form.target_system}
              onChange={(e) => setForm({ ...form, target_system: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}>
            <label>Status</label>
            <select className="select" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="match">Match</option>
              <option value="mismatch">Mismatch</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Reconciliation</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No reconciliation records.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record</th><th>Source</th><th>Target</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><span className="badge badge-slate">{r.master_type}</span></td>
                  <td><strong>{r.record_id}</strong></td>
                  <td>{r.source_system || "—"}</td>
                  <td>{r.target_system || "—"}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(r.reconciled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 15. Sensitive-Change Alerting ---------- */
function AlertingPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ alert_type: "rule", master_type: "chart_of_accounts", field_name: "*", threshold: 1, recipients: "", message: "" });

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/alerts`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/alerts`, form);
    setForm({ ...form, field_name: "*", recipients: "", message: "" });
    refresh();
  }

  async function triggerAlert(id: number) {
    await post(`/api/modules/${SLUG}/alerts/${id}/trigger`);
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Sensitive-Change Alerting</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Field (* = all)</label>
            <input className="input" value={form.field_name}
              onChange={(e) => setForm({ ...form, field_name: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Threshold</label>
            <input className="input" type="number" min={1} value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Recipients</label>
            <input className="input" value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              placeholder="email1,email2" />
          </div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Message</label>
            <input className="input" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Create Alert Rule</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No alert rules configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Field</th><th>Threshold</th><th>Recipients</th><th>Active</th><th>Triggered</th><th></th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><span className="badge badge-slate">{a.master_type}</span></td>
                  <td>{a.field_name}</td>
                  <td>{a.threshold}</td>
                  <td style={{ fontSize: 12 }}>{a.recipients || "—"}</td>
                  <td><span className={`badge ${a.is_active ? "badge-success" : "badge-slate"}`}>{a.is_active ? "Active" : "Inactive"}</span></td>
                  <td style={{ fontSize: 12 }}>{a.triggered_at ? new Date(a.triggered_at).toLocaleString() : "—"}</td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                      onClick={() => triggerAlert(a.id)}>Trigger</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
