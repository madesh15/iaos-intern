import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

const SLUG = "payroll_hr";

// ── Types ────────────────────────────────────────────────────────────
interface ScopeUnit {
  id: number;
  name: string;
  unit_type: string;
  headcount: number;
  risk_rating: string;
  in_scope: boolean;
  notes: string;
}
interface RcmEntry {
  id: number;
  risk: string;
  control: string;
  assertion: string;
  control_owner: string;
  risk_rating: string;
}
interface Rule {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  threshold: string;
  enabled: boolean;
}
interface DataSource {
  id: number;
  name: string;
  source_type: string;
  status: string;
  notes: string;
}
interface Sample {
  id: number;
  name: string;
  population_size: number;
  sample_size: number;
  method: string;
  criteria: string;
}
interface ExceptionRow {
  id: number;
  rule_id: number | null;
  rule_name: string;
  reference: string;
  detail: string;
  severity: string;
  status: string;
  disposition: string;
}
interface Evidence {
  id: number;
  title: string;
  reference: string;
  exception_id: number | null;
  reviewer: string;
  signed_off: boolean;
  notes: string;
}
interface Finding {
  id: number;
  title: string;
  rule_id: number | null;
  severity: string;
  status: string;
  owner: string;
  description: string;
}
interface ActionItem {
  id: number;
  finding_id: number | null;
  finding_title: string;
  owner: string;
  due_date: string | null;
  status: string;
  notes: string;
}
interface Dashboard {
  scope_units: number;
  scope_in_scope: number;
  coverage_pct: number;
  rules_enabled: number;
  rules_total: number;
  open_exceptions: number;
  exceptions_by_severity: Record<string, number>;
  open_findings: number;
  findings_by_status: Record<string, number>;
  actions_open: number;
  actions_overdue: number;
  risk_score: number;
}

const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const RISK_RATINGS = ["Low", "Medium", "High"];
const EXCEPTION_STATUSES = ["Open", "Under Review", "Cleared", "Escalated"];
const FINDING_STATUSES = ["Open", "In Progress", "Closed"];
const ACTION_STATUSES = ["Pending", "In Progress", "Completed"];

function sevBadge(sev: string) {
  if (sev === "Critical" || sev === "High") return "badge-danger";
  if (sev === "Medium") return "badge-gold";
  return "badge-success";
}
function statusBadge(st: string) {
  if (st === "Cleared" || st === "Closed" || st === "Completed") return "badge-success";
  if (st === "Escalated") return "badge-danger";
  return "badge-slate";
}

// The 15 signature tests, each its own tab (code must match SIGNATURE_RULES
// seeded on the backend in router.py).
const SIGNATURE_TABS: { code: string; name: string }[] = [
  { code: "PHR-01", name: "Ghost-Employee Detection" },
  { code: "PHR-02", name: "Attendance-to-Pay Reconciliation" },
  { code: "PHR-03", name: "Overtime Abnormality" },
  { code: "PHR-04", name: "Full-and-Final Settlement" },
  { code: "PHR-05", name: "Reimbursement vs Entitlement" },
  { code: "PHR-06", name: "Duplicate Bank Accounts" },
  { code: "PHR-07", name: "Salary Revision & Arrears" },
  { code: "PHR-08", name: "Statutory Deduction Accuracy" },
  { code: "PHR-09", name: "Loan & Advance Recovery" },
  { code: "PHR-10", name: "Payroll Register Analytics" },
  { code: "PHR-11", name: "New-Joiner / Exit Controls" },
  { code: "PHR-12", name: "Leave & Encashment" },
  { code: "PHR-13", name: "Contractor vs Payroll Split" },
  { code: "PHR-14", name: "Incentive & Bonus Payout" },
  { code: "PHR-15", name: "Headcount vs Cost Reconciliation" },
];

// The 10 platform shell screens.
const SHELL_TABS = [
  "Dashboard",
  "Scope",
  "RCM",
  "Rule Library",
  "Data Sources",
  "Sampling",
  "Exceptions",
  "Evidence",
  "Findings",
  "Actions",
] as const;
type ShellTab = (typeof SHELL_TABS)[number];
type Tab = ShellTab | string; // string covers the 15 signature-test codes

export default function PayrollHrPage() {
  const [tab, setTab] = useState<Tab>("Dashboard");

  function tabBtn(key: string, label: string) {
    return (
      <button
        key={key}
        onClick={() => setTab(key)}
        className={tab === key ? "btn btn-primary" : "btn btn-ghost"}
        style={{ padding: "7px 12px", fontSize: 13 }}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--slate-soft)", fontWeight: 600, marginBottom: 8 }}>
          Signature tests (15)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {SIGNATURE_TABS.map((r) => tabBtn(r.code, `${r.code} · ${r.name}`))}
        </div>
      </div>
      <div
        style={{
          marginBottom: 22,
          borderBottom: "1px solid var(--line)",
          paddingBottom: 12,
        }}
      >
        <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--slate-soft)", fontWeight: 600, marginBottom: 8 }}>
          Platform (10)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SHELL_TABS.map((t) => tabBtn(t, t))}
        </div>
      </div>

      {tab === "Dashboard" && <DashboardTab />}
      {tab === "Scope" && <ScopeTab />}
      {tab === "RCM" && <RcmTab />}
      {tab === "Rule Library" && <RulesTab />}
      {tab === "Data Sources" && <SourcesTab />}
      {tab === "Sampling" && <SamplingTab />}
      {tab === "Exceptions" && <ExceptionsTab />}
      {tab === "Evidence" && <EvidenceTab />}
      {tab === "Findings" && <FindingsTab />}
      {tab === "Actions" && <ActionsTab />}
      {SIGNATURE_TABS.some((r) => r.code === tab) && <SignatureTestTab code={tab} />}
    </div>
  );
}

// ── Signature test detail screen (one per test, 15 total) ─────────────
function SignatureTestTab({ code }: { code: string }) {
  const [rule, setRule] = useState<Rule | null>(null);
  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [runMsg, setRunMsg] = useState("");

  async function load() {
    const rules = await get<Rule[]>(`/api/modules/${SLUG}/rules`);
    const found = rules.find((r) => r.code === code) ?? null;
    setRule(found);
    const exceptions = await get<ExceptionRow[]>(`/api/modules/${SLUG}/exceptions`);
    setRows(found ? exceptions.filter((e) => e.rule_id === found.id) : []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function toggle() {
    if (!rule) return;
    await patch(`/api/modules/${SLUG}/rules/${rule.id}`, { enabled: !rule.enabled });
    load();
  }
  async function run() {
    if (!rule) return;
    await post(`/api/modules/${SLUG}/rules/${rule.id}/run`, {});
    setRunMsg("Exception raised — added to the list below.");
    setTimeout(() => setRunMsg(""), 4000);
    load();
  }
  async function setStatus(r: ExceptionRow, status: string) {
    await patch(`/api/modules/${SLUG}/exceptions/${r.id}`, { status });
    load();
  }

  if (!rule) return <p style={{ color: "var(--slate)" }}>Loading…</p>;

  return (
    <div>
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <span className="badge badge-gold">{rule.code}</span>
            <h3 style={{ color: "var(--navy)", margin: "10px 0 6px" }}>{rule.name}</h3>
            <p style={{ color: "var(--slate)", fontSize: 14, marginBottom: 8 }}>{rule.description}</p>
            <p style={{ fontSize: 13, color: "var(--slate-soft)" }}>
              Threshold / logic: <strong>{rule.threshold}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={toggle}>
              {rule.enabled ? <span className="badge badge-success">Enabled</span> : <span className="badge badge-slate">Disabled</span>}
            </button>
            <button className="btn btn-gold" onClick={run}>Run test</button>
          </div>
        </div>
        {runMsg && (
          <div className="alert" style={{ background: "var(--success-tint)", color: "var(--success)", marginTop: 14 }}>
            {runMsg}
          </div>
        )}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Reference</th><th>Detail</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.reference || "—"}</td>
                <td style={{ color: "var(--slate)" }}>{r.detail}</td>
                <td><span className={`badge ${sevBadge(r.severity)}`}>{r.severity}</span></td>
                <td>
                  <select className="select" style={{ padding: "4px 8px", fontSize: 13 }} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    {EXCEPTION_STATUSES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} style={{ color: "var(--slate)" }}>No exceptions raised by this test yet. Click "Run test" or log one manually from the Exceptions tab.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 1. Module Dashboard & KPIs ──────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--slate-soft)", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontFamily: "var(--font-head)", color: "var(--navy)", marginTop: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function DashboardTab() {
  const [d, setD] = useState<Dashboard | null>(null);

  useEffect(() => {
    get<Dashboard>(`/api/modules/${SLUG}/dashboard`).then(setD);
  }, []);

  if (!d) return <p style={{ color: "var(--slate)" }}>Loading…</p>;

  return (
    <div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        <KpiCard label="Module risk score" value={`${d.risk_score} / 100`} />
        <KpiCard label="Scope coverage" value={`${d.coverage_pct}%`} sub={`${d.scope_in_scope} of ${d.scope_units} units in scope`} />
        <KpiCard label="Rules enabled" value={`${d.rules_enabled} / ${d.rules_total}`} sub="Signature + custom tests" />
        <KpiCard label="Open exceptions" value={d.open_exceptions} />
      </div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Open exceptions by severity</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SEVERITIES.map((sev) => (
              <span key={sev} className={`badge ${sevBadge(sev)}`}>
                {sev}: {d.exceptions_by_severity[sev] ?? 0}
              </span>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Findings & remediation</h3>
          <p style={{ fontSize: 14, marginBottom: 6 }}>
            Open findings: <strong>{d.open_findings}</strong>
          </p>
          <p style={{ fontSize: 14, marginBottom: 6 }}>
            Open actions: <strong>{d.actions_open}</strong>{" "}
            {d.actions_overdue > 0 && <span className="badge badge-danger">{d.actions_overdue} overdue</span>}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            {Object.entries(d.findings_by_status).map(([st, n]) => (
              <span key={st} className={`badge ${statusBadge(st)}`}>
                {st}: {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Scope & Audit Universe ────────────────────────────────────────
function ScopeTab() {
  const [rows, setRows] = useState<ScopeUnit[]>([]);
  const [form, setForm] = useState({ name: "", unit_type: "Location", headcount: 0, risk_rating: "Medium", in_scope: true, notes: "" });

  const load = () => get<ScopeUnit[]>(`/api/modules/${SLUG}/scope`).then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await post(`/api/modules/${SLUG}/scope`, form);
    setForm({ ...form, name: "", headcount: 0, notes: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead>
            <tr><th>Unit</th><th>Type</th><th>Headcount</th><th>Risk</th><th>In scope</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong>{r.notes && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.notes}</div>}</td>
                <td>{r.unit_type}</td>
                <td>{r.headcount}</td>
                <td><span className={`badge ${sevBadge(r.risk_rating)}`}>{r.risk_rating}</span></td>
                <td>{r.in_scope ? <span className="badge badge-success">Yes</span> : <span className="badge badge-slate">No</span>}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/scope/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No entities in the audit universe yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add auditable unit</h3>
        <div className="field"><label>Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field"><label>Type</label>
          <input className="input" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} placeholder="Location / Legal entity / BU" />
        </div>
        <div className="field"><label>Headcount</label>
          <input className="input" type="number" min={0} value={form.headcount} onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })} />
        </div>
        <div className="field"><label>Risk rating</label>
          <select className="select" value={form.risk_rating} onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}>
            {RISK_RATINGS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.in_scope} onChange={(e) => setForm({ ...form, in_scope: e.target.checked })} />
            In scope for this cycle
          </label>
        </div>
        <button className="btn btn-primary btn-block">Add unit</button>
      </form>
    </div>
  );
}

// ── 3. Risk & Control Matrix ────────────────────────────────────────
function RcmTab() {
  const [rows, setRows] = useState<RcmEntry[]>([]);
  const [form, setForm] = useState({ risk: "", control: "", assertion: "Accuracy", control_owner: "", risk_rating: "Medium" });

  const load = () => get<RcmEntry[]>(`/api/modules/${SLUG}/rcm`).then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.risk.trim()) return;
    await post(`/api/modules/${SLUG}/rcm`, form);
    setForm({ ...form, risk: "", control: "", control_owner: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Risk</th><th>Control</th><th>Assertion</th><th>Owner</th><th>Rating</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.risk}</strong></td>
                <td style={{ color: "var(--slate)" }}>{r.control || "—"}</td>
                <td>{r.assertion}</td>
                <td>{r.control_owner || "—"}</td>
                <td><span className={`badge ${sevBadge(r.risk_rating)}`}>{r.risk_rating}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/rcm/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No risks or controls catalogued yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add RCM entry</h3>
        <div className="field"><label>Risk</label>
          <input className="input" value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} required />
        </div>
        <div className="field"><label>Control</label>
          <input className="input" value={form.control} onChange={(e) => setForm({ ...form, control: e.target.value })} />
        </div>
        <div className="field"><label>Assertion</label>
          <input className="input" value={form.assertion} onChange={(e) => setForm({ ...form, assertion: e.target.value })} placeholder="Accuracy / Completeness / Existence…" />
        </div>
        <div className="field"><label>Control owner</label>
          <input className="input" value={form.control_owner} onChange={(e) => setForm({ ...form, control_owner: e.target.value })} />
        </div>
        <div className="field"><label>Risk rating</label>
          <select className="select" value={form.risk_rating} onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}>
            {RISK_RATINGS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-block">Add entry</button>
      </form>
    </div>
  );
}

// ── 4. Test & Analytics Rule Library (the 15 signature tests) ────────
function RulesTab() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [form, setForm] = useState({ code: "", name: "", description: "", threshold: "" });
  const [runMsg, setRunMsg] = useState("");

  const load = () => get<Rule[]>(`/api/modules/${SLUG}/rules`).then(setRows);
  useEffect(() => { load(); }, []);

  async function toggle(r: Rule) {
    await patch(`/api/modules/${SLUG}/rules/${r.id}`, { enabled: !r.enabled });
    load();
  }
  async function run(r: Rule) {
    await post(`/api/modules/${SLUG}/rules/${r.id}/run`, {});
    setRunMsg(`Exception raised from "${r.name}" — see the Exceptions tab.`);
    setTimeout(() => setRunMsg(""), 4000);
  }
  async function addCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await post(`/api/modules/${SLUG}/rules`, { ...form, category: "Custom" });
    setForm({ code: "", name: "", description: "", threshold: "" });
    load();
  }

  const signature = rows.filter((r) => r.category === "Signature");
  const custom = rows.filter((r) => r.category !== "Signature");

  return (
    <div>
      {runMsg && <div className="alert alert-danger" style={{ background: "var(--success-tint)", color: "var(--success)" }}>{runMsg}</div>}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
        <div>
          <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
            <table>
              <thead><tr><th>Code</th><th>Signature test</th><th>Threshold</th><th>Enabled</th><th></th></tr></thead>
              <tbody>
                {signature.map((r) => (
                  <tr key={r.id}>
                    <td><span className="badge badge-gold">{r.code}</span></td>
                    <td><strong>{r.name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{r.description}</div></td>
                    <td style={{ fontSize: 13, color: "var(--slate)" }}>{r.threshold}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: "5px 10px" }} onClick={() => toggle(r)}>
                        {r.enabled ? <span className="badge badge-success">On</span> : <span className="badge badge-slate">Off</span>}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-gold" style={{ padding: "6px 12px" }} onClick={() => run(r)}>Run</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {custom.length > 0 && (
            <div className="card" style={{ overflow: "hidden" }}>
              <table>
                <thead><tr><th>Custom rule</th><th>Threshold</th><th></th><th></th></tr></thead>
                <tbody>
                  {custom.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong><div style={{ fontSize: 12, color: "var(--slate)" }}>{r.description}</div></td>
                      <td style={{ fontSize: 13, color: "var(--slate)" }}>{r.threshold}</td>
                      <td><button className="btn btn-gold" style={{ padding: "6px 12px" }} onClick={() => run(r)}>Run</button></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/rules/${r.id}`); load(); }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={addCustom}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add a custom rule</h3>
          <div className="field"><label>Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. PHR-C1" />
          </div>
          <div className="field"><label>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field"><label>Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field"><label>Threshold / logic</label>
            <input className="input" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block">Add rule</button>
        </form>
      </div>
    </div>
  );
}

// ── 5. Data Source & Connector Setup ──────────────────────────────────
function SourcesTab() {
  const [rows, setRows] = useState<DataSource[]>([]);
  const [form, setForm] = useState({ name: "", source_type: "File upload", status: "Not connected", notes: "" });

  const load = () => get<DataSource[]>(`/api/modules/${SLUG}/sources`).then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await post(`/api/modules/${SLUG}/sources`, form);
    setForm({ ...form, name: "", notes: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Source</th><th>Type</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong>{r.notes && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.notes}</div>}</td>
                <td>{r.source_type}</td>
                <td><span className={`badge ${r.status === "Connected" ? "badge-success" : "badge-slate"}`}>{r.status}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/sources/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} style={{ color: "var(--slate)" }}>No ERP tables, APIs, or uploads mapped yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Map a data source</h3>
        <div className="field"><label>Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SAP HCM — PA0008" required />
        </div>
        <div className="field"><label>Type</label>
          <input className="input" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })} placeholder="ERP table / API / File upload" />
        </div>
        <div className="field"><label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Not connected</option>
            <option>Pending</option>
            <option>Connected</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Add source</button>
      </form>
    </div>
  );
}

// ── 6. Sampling & Population Builder ──────────────────────────────────
function SamplingTab() {
  const [rows, setRows] = useState<Sample[]>([]);
  const [form, setForm] = useState({ name: "", population_size: 0, sample_size: 0, method: "Random", criteria: "" });

  const load = () => get<Sample[]>(`/api/modules/${SLUG}/samples`).then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await post(`/api/modules/${SLUG}/samples`, form);
    setForm({ ...form, name: "", population_size: 0, sample_size: 0, criteria: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Sample</th><th>Population</th><th>Sample size</th><th>Method</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong>{r.criteria && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.criteria}</div>}</td>
                <td>{r.population_size}</td>
                <td>{r.sample_size}</td>
                <td>{r.method}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/samples/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No samples drawn yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Draw a sample</h3>
        <div className="field"><label>Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q1 F&F settlements" required />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>Population size</label>
            <input className="input" type="number" min={0} value={form.population_size} onChange={(e) => setForm({ ...form, population_size: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1 }}><label>Sample size</label>
            <input className="input" type="number" min={0} value={form.sample_size} onChange={(e) => setForm({ ...form, sample_size: Number(e.target.value) })} />
          </div>
        </div>
        <div className="field"><label>Method</label>
          <select className="select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option>Random</option>
            <option>Systematic</option>
            <option>Judgemental</option>
            <option>Stratified</option>
            <option>Monetary unit</option>
          </select>
        </div>
        <div className="field"><label>Selection criteria</label>
          <input className="input" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block">Add sample</button>
      </form>
    </div>
  );
}

// ── 7. Exception & Red-Flag Queue ─────────────────────────────────────
function ExceptionsTab() {
  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({ rule_id: "", reference: "", detail: "", severity: "Medium" });

  const load = () => get<ExceptionRow[]>(`/api/modules/${SLUG}/exceptions`).then(setRows);
  useEffect(() => {
    load();
    get<Rule[]>(`/api/modules/${SLUG}/rules`).then(setRules);
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.detail.trim()) return;
    await post(`/api/modules/${SLUG}/exceptions`, { ...form, rule_id: form.rule_id ? Number(form.rule_id) : null });
    setForm({ ...form, reference: "", detail: "" });
    load();
  }
  async function setStatus(r: ExceptionRow, status: string) {
    await patch(`/api/modules/${SLUG}/exceptions/${r.id}`, { status });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Rule</th><th>Reference</th><th>Detail</th><th>Severity</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.rule_name || <span style={{ color: "var(--slate)" }}>Manual</span>}</td>
                <td>{r.reference || "—"}</td>
                <td style={{ maxWidth: 260, color: "var(--slate)" }}>{r.detail}</td>
                <td><span className={`badge ${sevBadge(r.severity)}`}>{r.severity}</span></td>
                <td>
                  <select className="select" style={{ padding: "4px 8px", fontSize: 13 }} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    {EXCEPTION_STATUSES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/exceptions/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No exceptions raised yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log an exception</h3>
        <div className="field"><label>Rule (optional)</label>
          <select className="select" value={form.rule_id} onChange={(e) => setForm({ ...form, rule_id: e.target.value })}>
            <option value="">Manual — no rule</option>
            {rules.map((r) => <option key={r.id} value={r.id}>{r.code ? `${r.code} — ${r.name}` : r.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Reference</label>
          <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Employee ID / dept" />
        </div>
        <div className="field"><label>Detail</label>
          <input className="input" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} required />
        </div>
        <div className="field"><label>Severity</label>
          <select className="select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-block">Add exception</button>
      </form>
    </div>
  );
}

// ── 8. Working Papers & Evidence ──────────────────────────────────────
function EvidenceTab() {
  const [rows, setRows] = useState<Evidence[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [form, setForm] = useState({ title: "", reference: "", exception_id: "", reviewer: "", signed_off: false });

  const load = () => get<Evidence[]>(`/api/modules/${SLUG}/evidence`).then(setRows);
  useEffect(() => {
    load();
    get<ExceptionRow[]>(`/api/modules/${SLUG}/exceptions`).then(setExceptions);
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await post(`/api/modules/${SLUG}/evidence`, { ...form, exception_id: form.exception_id ? Number(form.exception_id) : null });
    setForm({ ...form, title: "", reference: "", reviewer: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Working paper</th><th>Ref</th><th>Reviewer</th><th>Signed off</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong>{r.notes && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.notes}</div>}</td>
                <td>{r.reference || "—"}</td>
                <td>{r.reviewer || "—"}</td>
                <td>{r.signed_off ? <span className="badge badge-success">Yes</span> : <span className="badge badge-slate">Pending</span>}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/evidence/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No working papers attached yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Attach evidence</h3>
        <div className="field"><label>Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="field"><label>Reference</label>
          <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="WP-01" />
        </div>
        <div className="field"><label>Linked exception (optional)</label>
          <select className="select" value={form.exception_id} onChange={(e) => setForm({ ...form, exception_id: e.target.value })}>
            <option value="">None</option>
            {exceptions.map((x) => <option key={x.id} value={x.id}>#{x.id} — {x.detail.slice(0, 40)}</option>)}
          </select>
        </div>
        <div className="field"><label>Reviewer</label>
          <input className="input" value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} />
        </div>
        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.signed_off} onChange={(e) => setForm({ ...form, signed_off: e.target.checked })} />
            Reviewer signed off
          </label>
        </div>
        <button className="btn btn-primary btn-block">Add evidence</button>
      </form>
    </div>
  );
}

// ── 9. Observation & Finding Log ──────────────────────────────────────
function FindingsTab() {
  const [rows, setRows] = useState<Finding[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({ title: "", rule_id: "", severity: "Medium", owner: "", description: "" });

  const load = () => get<Finding[]>(`/api/modules/${SLUG}/findings`).then(setRows);
  useEffect(() => {
    load();
    get<Rule[]>(`/api/modules/${SLUG}/rules`).then(setRules);
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await post(`/api/modules/${SLUG}/findings`, { ...form, rule_id: form.rule_id ? Number(form.rule_id) : null });
    setForm({ ...form, title: "", owner: "", description: "" });
    load();
  }
  async function setStatus(r: Finding, status: string) {
    await patch(`/api/modules/${SLUG}/findings/${r.id}`, { status });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Finding</th><th>Severity</th><th>Owner</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong>{r.description && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.description}</div>}</td>
                <td><span className={`badge ${sevBadge(r.severity)}`}>{r.severity}</span></td>
                <td>{r.owner || "—"}</td>
                <td>
                  <select className="select" style={{ padding: "4px 8px", fontSize: 13 }} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    {FINDING_STATUSES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/findings/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No findings raised yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Raise a finding</h3>
        <div className="field"><label>Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="field"><label>Related rule (optional)</label>
          <select className="select" value={form.rule_id} onChange={(e) => setForm({ ...form, rule_id: e.target.value })}>
            <option value="">None</option>
            {rules.map((r) => <option key={r.id} value={r.id}>{r.code ? `${r.code} — ${r.name}` : r.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Severity</label>
          <select className="select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Owner</label>
          <input className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
        <div className="field"><label>Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block">Add finding</button>
      </form>
    </div>
  );
}

// ── 10. Remediation / Action Tracker ───────────────────────────────────
function ActionsTab() {
  const [rows, setRows] = useState<ActionItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [form, setForm] = useState({ finding_id: "", owner: "", due_date: "", notes: "" });

  const load = () => get<ActionItem[]>(`/api/modules/${SLUG}/actions`).then(setRows);
  useEffect(() => {
    load();
    get<Finding[]>(`/api/modules/${SLUG}/findings`).then(setFindings);
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.owner.trim()) return;
    await post(`/api/modules/${SLUG}/actions`, {
      ...form,
      finding_id: form.finding_id ? Number(form.finding_id) : null,
      due_date: form.due_date || null,
    });
    setForm({ ...form, owner: "", due_date: "", notes: "" });
    load();
  }
  async function setStatus(r: ActionItem, status: string) {
    await patch(`/api/modules/${SLUG}/actions/${r.id}`, { status });
    load();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead><tr><th>Finding</th><th>Owner</th><th>Due</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.finding_title || "—"}</strong>{r.notes && <div style={{ fontSize: 12, color: "var(--slate)" }}>{r.notes}</div>}</td>
                <td>{r.owner || "—"}</td>
                <td>
                  {r.due_date || "—"}
                  {r.due_date && r.due_date < today && r.status !== "Completed" && (
                    <span className="badge badge-danger" style={{ marginLeft: 6 }}>Overdue</span>
                  )}
                </td>
                <td>
                  <select className="select" style={{ padding: "4px 8px", fontSize: 13 }} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    {ACTION_STATUSES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={async () => { await del(`/api/modules/${SLUG}/actions/${r.id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No remediation actions tracked yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add action item</h3>
        <div className="field"><label>Finding</label>
          <select className="select" value={form.finding_id} onChange={(e) => setForm({ ...form, finding_id: e.target.value })}>
            <option value="">None</option>
            {findings.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </div>
        <div className="field"><label>Owner</label>
          <input className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} required />
        </div>
        <div className="field"><label>Due date</label>
          <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </div>
        <div className="field"><label>Notes</label>
          <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block">Add action</button>
      </form>
    </div>
  );
}
