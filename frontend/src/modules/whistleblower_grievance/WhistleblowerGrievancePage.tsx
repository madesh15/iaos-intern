import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

const SLUG = "whistleblower_grievance";

interface WBCase {
  id: number;
  case_number: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  priority: string;
  status: string;
  is_anonymous: boolean;
  complainant_name: string;
  complainant_email: string;
  complainant_phone: string;
  intake_mode: string;
  assigned_to_id: number | null;
  conflict_check_done: boolean;
  date_received: string;
  date_triaged: string | null;
  date_assigned: string | null;
  date_investigation_started: string | null;
  date_closed: string | null;
  substantiation: string;
  resolution_notes: string;
  routing: string;
  sla_target_days: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

interface CaseComment {
  id: number;
  case_id: number;
  user_id: number;
  comment: string;
  comment_type: string;
  is_confidential: boolean;
  created_at: string;
}

interface CaseProtection {
  id: number;
  case_id: number;
  protection_type: string;
  description: string;
  status: string;
  implemented_by_id: number;
  created_at: string;
}

interface CaseOutcome {
  id: number;
  case_id: number;
  outcome: string;
  reasoning: string;
  decided_by_id: number;
  created_at: string;
}

interface CaseDisciplinary {
  id: number;
  case_id: number;
  action_type: string;
  description: string;
  recipient: string;
  status: string;
  created_by_id: number;
  created_at: string;
}

interface CaseFeedback {
  id: number;
  case_id: number;
  message: string;
  channel: string;
  sent_by_id: number;
  created_at: string;
}

interface CaseLink {
  id: number;
  case_id_1: number;
  case_id_2: number;
  relationship_type: string;
  created_by_id: number;
  created_at: string;
}

interface Survey {
  id: number;
  survey_name: string;
  respondent_count: number;
  score: number;
  dimension: string;
  date_conducted: string;
  notes: string;
  created_at: string;
}

interface Dashboard {
  total: number;
  open: number;
  closed: number;
  anonymous: number;
  sla_breaches: number;
  substantiated: number;
  unfounded: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_routing: Record<string, number>;
}

const CATEGORIES = ["fraud", "harassment", "discrimination", "ethics", "POSH", "safety", "other"];
const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "triaging", "assigned", "investigating", "substantiated", "unsubstantiated", "closed"];
const SUBSTANTIATIONS = ["pending", "founded", "unfounded", "inconclusive"];
const ROUTINGS = ["ethics", "POSH", "HR"];
const INTAKE_MODES = ["web", "email", "phone", "walk-in", "hotline"];
const PROTECTION_TYPES = ["anonymity", "non_retaliation", "legal_counsel", "relocation", "other"];
const DISCIPLINARY_TYPES = ["warning", "suspension", "termination", "demotion", "counseling", "other"];
const LINK_TYPES = ["related", "duplicate", "sequential", "same_subject"];
const DIMENSIONS = ["trust", "awareness", "willingness", "satisfaction"];

const TABS = [
  { id: "intake", label: "Intake Channel", sub: 1 },
  { id: "triage", label: "Triage", sub: 2 },
  { id: "assignment", label: "Assignment", sub: 3 },
  { id: "investigation", label: "Investigation", sub: 4 },
  { id: "protection", label: "Protection", sub: 5 },
  { id: "sla", label: "SLA Monitor", sub: 6 },
  { id: "outcome", label: "Substantiation", sub: 7 },
  { id: "disciplinary", label: "Disciplinary", sub: 8 },
  { id: "trends", label: "Trends", sub: 9 },
  { id: "reporting", label: "Board Reporting", sub: 10 },
  { id: "confidentiality", label: "Confidentiality", sub: 11 },
  { id: "feedback_tab", label: "Feedback", sub: 12 },
  { id: "repeat", label: "Repeat Links", sub: 13 },
  { id: "routing", label: "POSH/HR Split", sub: 14 },
  { id: "survey", label: "Ethics Survey", sub: 15 },
  { id: "dashboard", label: "Dashboard", sub: 16 },
  { id: "scope", label: "Scope", sub: 17 },
  { id: "rcm", label: "RCM", sub: 18 },
  { id: "rules", label: "Rule Library", sub: 19 },
  { id: "datasource", label: "Data Sources", sub: 20 },
  { id: "sampling", label: "Sampling", sub: 21 },
  { id: "exceptions", label: "Exceptions", sub: 22 },
  { id: "papers", label: "Working Papers", sub: 23 },
  { id: "findings", label: "Finding Log", sub: 24 },
  { id: "remediation", label: "Remediation", sub: 25 },
];

function priorityBadge(p: string) {
  if (p === "critical") return "badge-danger";
  if (p === "high") return "badge-gold";
  if (p === "medium") return "badge-success";
  return "badge-success";
}

function statusBadge(s: string) {
  if (s === "closed") return "badge-success";
  if (s === "investigating") return "badge-gold";
  if (s === "substantiated") return "badge-danger";
  return "badge-success";
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function WhistleblowerGrievancePage() {
  const [tab, setTab] = useState("intake");
  const [cases, setCases] = useState<WBCase[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [selectedCase, setSelectedCase] = useState<WBCase | null>(null);
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [protections, setProtections] = useState<CaseProtection[]>([]);
  const [outcomes, setOutcomes] = useState<CaseOutcome[]>([]);
  const [disciplinaries, setDisciplinaries] = useState<CaseDisciplinary[]>([]);
  const [feedbacks, setFeedbacks] = useState<CaseFeedback[]>([]);
  const [links, setLinks] = useState<CaseLink[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const [intakeForm, setIntakeForm] = useState({
    title: "", description: "", category: "ethics", sub_category: "",
    priority: "medium", is_anonymous: true, complainant_name: "",
    complainant_email: "", complainant_phone: "", intake_mode: "web",
    routing: "ethics", sla_target_days: 30,
  });
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("general");
  const [confidential, setConfidential] = useState(false);
  const [protForm, setProtForm] = useState({ protection_type: "anonymity", description: "", status: "active" });
  const [outcomeForm, setOutcomeForm] = useState({ outcome: "founded", reasoning: "" });
  const [discForm, setDiscForm] = useState({ action_type: "warning", description: "", recipient: "", status: "pending" });
  const [fbForm, setFbForm] = useState({ message: "", channel: "email" });
  const [linkForm, setLinkForm] = useState({ case_id_2: 0, relationship_type: "related" });
  const [surveyForm, setSurveyForm] = useState({ survey_name: "", respondent_count: 0, score: 50, dimension: "trust", notes: "" });

  const loadCases = () => get<WBCase[]>(`/api/modules/${SLUG}/cases`).then(setCases);
  const loadDashboard = () => get<Dashboard>(`/api/modules/${SLUG}/dashboard`).then(setDashboard);
  const loadSurveys = () => get<Survey[]>(`/api/modules/${SLUG}/surveys`).then(setSurveys);

  useEffect(() => { loadCases(); loadDashboard(); loadSurveys(); }, []);

  const loadCaseDetail = async (c: WBCase) => {
    setSelectedCase(c);
    const [co, pr, ot, di, fb, lk] = await Promise.all([
      get<CaseComment[]>(`/api/modules/${SLUG}/cases/${c.id}/comments`),
      get<CaseProtection[]>(`/api/modules/${SLUG}/cases/${c.id}/protections`),
      get<CaseOutcome[]>(`/api/modules/${SLUG}/cases/${c.id}/outcomes`),
      get<CaseDisciplinary[]>(`/api/modules/${SLUG}/cases/${c.id}/disciplinary`),
      get<CaseFeedback[]>(`/api/modules/${SLUG}/cases/${c.id}/feedback`),
      get<CaseLink[]>(`/api/modules/${SLUG}/cases/${c.id}/links`),
    ]);
    setComments(co); setProtections(pr); setOutcomes(ot);
    setDisciplinaries(di); setFeedbacks(fb); setLinks(lk);
  };

  async function submitIntake(e: React.FormEvent) {
    e.preventDefault();
    if (!intakeForm.title.trim()) return;
    await post(`/api/modules/${SLUG}/cases`, intakeForm);
    setIntakeForm({ title: "", description: "", category: "ethics", sub_category: "", priority: "medium", is_anonymous: true, complainant_name: "", complainant_email: "", complainant_phone: "", intake_mode: "web", routing: "ethics", sla_target_days: 30 });
    loadCases(); loadDashboard();
  }

  async function addComment() {
    if (!selectedCase || !commentText.trim()) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/comments`, { comment: commentText, comment_type: commentType, is_confidential: confidential });
    setCommentText(""); loadCaseDetail(selectedCase);
  }

  async function addProtection() {
    if (!selectedCase) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/protections`, protForm);
    setProtForm({ protection_type: "anonymity", description: "", status: "active" }); loadCaseDetail(selectedCase);
  }

  async function addOutcome() {
    if (!selectedCase) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/outcomes`, outcomeForm);
    await patch(`/api/modules/${SLUG}/cases/${selectedCase.id}`, { substantiation: outcomeForm.outcome, status: outcomeForm.outcome === "founded" ? "substantiated" : "unsubstantiated" });
    setOutcomeForm({ outcome: "founded", reasoning: "" }); loadCases(); loadCaseDetail(selectedCase);
  }

  async function addDisciplinary() {
    if (!selectedCase) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/disciplinary`, discForm);
    setDiscForm({ action_type: "warning", description: "", recipient: "", status: "pending" }); loadCaseDetail(selectedCase);
  }

  async function addFeedback() {
    if (!selectedCase || !fbForm.message.trim()) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/feedback`, fbForm);
    setFbForm({ message: "", channel: "email" }); loadCaseDetail(selectedCase);
  }

  async function addLink() {
    if (!selectedCase || !linkForm.case_id_2) return;
    await post(`/api/modules/${SLUG}/cases/${selectedCase.id}/links`, linkForm);
    setLinkForm({ case_id_2: 0, relationship_type: "related" }); loadCaseDetail(selectedCase);
  }

  async function addSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!surveyForm.survey_name.trim()) return;
    await post(`/api/modules/${SLUG}/surveys`, surveyForm);
    setSurveyForm({ survey_name: "", respondent_count: 0, score: 50, dimension: "trust", notes: "" }); loadSurveys();
  }

  async function updateCaseStatus(c: WBCase, status: string) {
    const patches: Record<string, unknown> = { status };
    if (status === "triaging") patches.date_triaged = new Date().toISOString();
    if (status === "assigned") patches.date_assigned = new Date().toISOString();
    if (status === "investigating") patches.date_investigation_started = new Date().toISOString();
    if (status === "closed") patches.date_closed = new Date().toISOString();
    await patch(`/api/modules/${SLUG}/cases/${c.id}`, patches);
    loadCases(); loadDashboard();
    if (selectedCase?.id === c.id) loadCaseDetail({ ...c, status });
  }

  async function deleteCase(id: number) {
    await del(`/api/modules/${SLUG}/cases/${id}`);
    if (selectedCase?.id === id) setSelectedCase(null);
    loadCases(); loadDashboard();
  }

  function renderBar(data: Record<string, number>) {
    const entries = Object.entries(data);
    if (!entries.length) return <span style={{ color: "var(--slate)" }}>No data</span>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 110, fontSize: 13, textTransform: "capitalize" }}>{k}</span>
            <div style={{ flex: 1, background: "var(--border)", borderRadius: 4, height: 18 }}>
              <div style={{ width: `${Math.max((v / Math.max(...Object.values(data))) * 100, 4)}%`, background: "var(--accent)", borderRadius: 4, height: "100%" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, width: 30, textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    );
  }

  const sel = selectedCase;

  return (
    <div>
      <div className="card" style={{ padding: "16px 22px", marginBottom: 12 }}>
        <h2 style={{ color: "var(--navy)", margin: 0 }}>Whistleblower & Grievance</h2>
        <p style={{ color: "var(--slate)", margin: "4px 0 0", fontSize: 14 }}>Confidential ethics-and-grievance channel — intake, triage, investigation, protection & closure.</p>
      </div>

      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button key={t.id} className={`btn ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
            style={{ whiteSpace: "nowrap", fontSize: 12, padding: "5px 12px" }}
            onClick={() => setTab(t.id)}>
            <span style={{ opacity: 0.5, marginRight: 4 }}>#{t.sub}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Sub#1 Anonymous Intake Channel ──────────────────────────── */}
      {tab === "intake" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
          <form className="card" style={{ padding: 22 }} onSubmit={submitIntake}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Submit a Report</h3>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14 }}>
              <input type="checkbox" checked={intakeForm.is_anonymous}
                onChange={(e) => setIntakeForm({ ...intakeForm, is_anonymous: e.target.checked })} />
              Anonymous submission
            </label>
            <div className="field"><label>Title *</label>
              <input className="input" value={intakeForm.title} onChange={(e) => setIntakeForm({ ...intakeForm, title: e.target.value })} required /></div>
            <div className="field"><label>Description *</label>
              <textarea className="input" rows={4} value={intakeForm.description} onChange={(e) => setIntakeForm({ ...intakeForm, description: e.target.value })} required /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}><label>Category</label>
                <select className="select" value={intakeForm.category} onChange={(e) => setIntakeForm({ ...intakeForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select></div>
              <div className="field" style={{ flex: 1 }}><label>Priority</label>
                <select className="select" value={intakeForm.priority} onChange={(e) => setIntakeForm({ ...intakeForm, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}><label>Routing</label>
                <select className="select" value={intakeForm.routing} onChange={(e) => setIntakeForm({ ...intakeForm, routing: e.target.value })}>
                  {ROUTINGS.map((r) => <option key={r}>{r}</option>)}
                </select></div>
              <div className="field" style={{ flex: 1 }}><label>Intake Mode</label>
                <select className="select" value={intakeForm.intake_mode} onChange={(e) => setIntakeForm({ ...intakeForm, intake_mode: e.target.value })}>
                  {INTAKE_MODES.map((m) => <option key={m}>{m}</option>)}
                </select></div>
            </div>
            {!intakeForm.is_anonymous && (
              <>
                <div className="field"><label>Contact Name</label>
                  <input className="input" value={intakeForm.complainant_name} onChange={(e) => setIntakeForm({ ...intakeForm, complainant_name: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="field" style={{ flex: 1 }}><label>Email</label>
                    <input className="input" type="email" value={intakeForm.complainant_email} onChange={(e) => setIntakeForm({ ...intakeForm, complainant_email: e.target.value })} /></div>
                  <div className="field" style={{ flex: 1 }}><label>Phone</label>
                    <input className="input" value={intakeForm.complainant_phone} onChange={(e) => setIntakeForm({ ...intakeForm, complainant_phone: e.target.value })} /></div>
                </div>
              </>
            )}
            <div className="field"><label>SLA Target (days)</label>
              <input className="input" type="number" min={1} value={intakeForm.sla_target_days} onChange={(e) => setIntakeForm({ ...intakeForm, sla_target_days: Number(e.target.value) })} /></div>
            <button className="btn btn-primary btn-block">Submit Report</button>
          </form>
          <div className="card" style={{ padding: 22, maxHeight: 600, overflow: "auto" }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Recent Reports</h3>
            {cases.slice(0, 10).map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 14 }}>{c.case_number}</strong>
                  <span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>
                  {c.category} | {c.routing} | {c.is_anonymous ? "Anonymous" : "Named"} | {daysSince(c.date_received)}d ago
                </div>
              </div>
            ))}
            {cases.length === 0 && <p style={{ color: "var(--slate)" }}>No reports yet.</p>}
          </div>
        </div>
      )}

      {/* ── Sub#2 Case Triage & Categorisation ──────────────────────── */}
      {tab === "triage" && (
        <div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Triage & Categorise Cases</h3>
            <table>
              <thead><tr><th>Case #</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Routing</th><th></th></tr></thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.case_number}</strong></td>
                    <td>{c.title}</td>
                    <td style={{ textTransform: "capitalize" }}>{c.category}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ textTransform: "capitalize" }}>{c.routing}</td>
                    <td style={{ display: "flex", gap: 4 }}>
                      {c.status === "open" && <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateCaseStatus(c, "triaging")}>Triage</button>}
                      {c.status === "triaging" && <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateCaseStatus(c, "assigned")}>Assign</button>}
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)" }}>No cases to triage.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sub#3 Conflict-Free Assignment ──────────────────────────── */}
      {tab === "assignment" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Conflict-Free Assignment</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Handlers are assigned ensuring no conflict of interest with the complainant or subject.</p>
          <table>
            <thead><tr><th>Case #</th><th>Title</th><th>Assigned To</th><th>Conflict Check</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {cases.filter((c) => c.status === "assigned" || c.status === "triaging").map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.case_number}</strong></td>
                  <td>{c.title}</td>
                  <td>{c.assigned_to_id ? `User #${c.assigned_to_id}` : <em style={{ color: "var(--slate)" }}>Unassigned</em>}</td>
                  <td>{c.conflict_check_done ? <span className="badge badge-success">Cleared</span> : <span className="badge badge-gold">Pending</span>}</td>
                  <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  <td>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => patch(`/api/modules/${SLUG}/cases/${c.id}`, { conflict_check_done: true }).then(() => loadCases())}>
                      Mark Cleared
                    </button>
                  </td>
                </tr>
              ))}
              {cases.filter((c) => c.status === "assigned" || c.status === "triaging").length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No cases awaiting assignment.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sub#4 Investigation Tracking ────────────────────────────── */}
      {tab === "investigation" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Investigation Tracker</h3>
            <table>
              <thead><tr><th>Case</th><th>Title</th><th>Status</th><th>Days Open</th><th></th></tr></thead>
              <tbody>
                {cases.filter((c) => c.status !== "closed").map((c) => (
                  <tr key={c.id} style={{ background: sel?.id === c.id ? "var(--accent-light)" : undefined }}>
                    <td><strong>{c.case_number}</strong></td>
                    <td>{c.title}</td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td>{daysSince(c.date_received)}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>View</button>
                      {c.status !== "investigating" && <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => updateCaseStatus(c, "investigating")}>Start Investigation</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 10 }}>{sel.case_number} — Investigation Notes</h3>
              <div style={{ marginBottom: 16 }}>
                <select className="select" value={commentType} onChange={(e) => setCommentType(e.target.value)} style={{ marginRight: 8 }}>
                  <option value="general">General</option><option value="triage">Triage</option><option value="investigation">Investigation</option><option value="note">Note</option>
                </select>
                <label style={{ fontSize: 13 }}><input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} style={{ marginRight: 4 }} />Confidential</label>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input className="input" placeholder="Add a note..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={addComment}>Add</button>
              </div>
              {comments.map((cm) => (
                <div key={cm.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>
                    <span className="badge badge-success" style={{ marginRight: 6 }}>{cm.comment_type}</span>
                    {cm.is_confidential && <span className="badge badge-danger" style={{ marginRight: 6 }}>Confidential</span>}
                    User #{cm.user_id} — {daysSince(cm.created_at)}d ago
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{cm.comment}</div>
                </div>
              ))}
              {comments.length === 0 && <p style={{ color: "var(--slate)", fontSize: 13 }}>No notes yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#5 Whistleblower Protection ──────────────────────────── */}
      {tab === "protection" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Select Case for Protection Measures</h3>
            {cases.map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer", background: sel?.id === c.id ? "var(--accent-light)" : undefined }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <strong>{c.case_number}</strong> — {c.title}
              </div>
            ))}
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Protection Measures — {sel.case_number}</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <select className="select" value={protForm.protection_type} onChange={(e) => setProtForm({ ...protForm, protection_type: e.target.value })}>
                  {PROTECTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input className="input" placeholder="Description" value={protForm.description} onChange={(e) => setProtForm({ ...protForm, description: e.target.value })} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={addProtection}>Add Protection</button>
              </div>
              {protections.map((p) => (
                <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="badge badge-success" style={{ marginRight: 6 }}>{p.protection_type}</span>
                  <span className={`badge ${p.status === "active" ? "badge-gold" : "badge-success"}`}>{p.status}</span>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{p.description}</div>
                </div>
              ))}
              {protections.length === 0 && <p style={{ color: "var(--slate)" }}>No protection measures recorded.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#6 SLA & Ageing Monitor ─────────────────────────────── */}
      {tab === "sla" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>SLA & Ageing Monitor</h3>
          <table>
            <thead><tr><th>Case</th><th>Title</th><th>Received</th><th>Age (days)</th><th>SLA Target</th><th>Status</th></tr></thead>
            <tbody>
              {cases.filter((c) => c.status !== "closed").map((c) => {
                const age = daysSince(c.date_received);
                const breached = age > c.sla_target_days;
                return (
                  <tr key={c.id}>
                    <td><strong>{c.case_number}</strong></td>
                    <td>{c.title}</td>
                    <td>{new Date(c.date_received).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: breached ? "var(--danger)" : undefined }}>{age}</td>
                    <td>{c.sla_target_days} days</td>
                    <td>{breached ? <span className="badge badge-danger">BREACHED</span> : <span className="badge badge-success">On Track</span>}</td>
                  </tr>
                );
              })}
              {cases.filter((c) => c.status !== "closed").length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No open cases.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sub#7 Substantiation Outcome ────────────────────────────── */}
      {tab === "outcome" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Substantiation</h3>
            {cases.filter((c) => c.substantiation === "pending").map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <strong>{c.case_number}</strong> — {c.title}
              </div>
            ))}
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Outcome — {sel.case_number}</h3>
              <div className="field"><label>Disposition</label>
                <select className="select" value={outcomeForm.outcome} onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}>
                  {SUBSTANTIATIONS.filter((s) => s !== "pending").map((s) => <option key={s}>{s}</option>)}
                </select></div>
              <div className="field"><label>Reasoning</label>
                <textarea className="input" rows={4} value={outcomeForm.reasoning} onChange={(e) => setOutcomeForm({ ...outcomeForm, reasoning: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={addOutcome}>Record Outcome</button>
              {outcomes.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 14, color: "var(--navy)" }}>Previous Outcomes</h4>
                  {outcomes.map((o) => (
                    <div key={o.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span className={`badge ${o.outcome === "founded" ? "badge-danger" : "badge-success"}`}>{o.outcome}</span>
                      <div style={{ fontSize: 13, marginTop: 4 }}>{o.reasoning}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#8 Disciplinary Action Linkage ───────────────────────── */}
      {tab === "disciplinary" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Link Disciplinary Action</h3>
            {cases.filter((c) => c.substantiation === "founded").map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <strong>{c.case_number}</strong> — {c.title}
              </div>
            ))}
            {cases.filter((c) => c.substantiation === "founded").length === 0 && <p style={{ color: "var(--slate)" }}>No substantiated cases.</p>}
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Disciplinary — {sel.case_number}</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <select className="select" value={discForm.action_type} onChange={(e) => setDiscForm({ ...discForm, action_type: e.target.value })}>
                  {DISCIPLINARY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input className="input" placeholder="Recipient" value={discForm.recipient} onChange={(e) => setDiscForm({ ...discForm, recipient: e.target.value })} />
                <button className="btn btn-primary" onClick={addDisciplinary}>Add Action</button>
              </div>
              <div className="field"><label>Description</label>
                <textarea className="input" rows={2} value={discForm.description} onChange={(e) => setDiscForm({ ...discForm, description: e.target.value })} /></div>
              {disciplinaries.map((d) => (
                <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="badge badge-danger" style={{ marginRight: 6 }}>{d.action_type}</span>
                  <span className={`badge ${d.status === "executed" ? "badge-success" : "badge-gold"}`}>{d.status}</span>
                  <div style={{ fontSize: 13, marginTop: 4 }}><strong>{d.recipient}</strong> — {d.description}</div>
                </div>
              ))}
              {disciplinaries.length === 0 && <p style={{ color: "var(--slate)" }}>No disciplinary actions.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#9 Trend & Hotspot Analytics ─────────────────────────── */}
      {tab === "trends" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Category</h3>
            {renderBar(dashboard?.by_category ?? {})}
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Routing</h3>
            {renderBar(dashboard?.by_routing ?? {})}
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Priority</h3>
            {renderBar(dashboard?.by_priority ?? {})}
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Status</h3>
            {renderBar(dashboard?.by_status ?? {})}
          </div>
        </div>
      )}

      {/* ── Sub#10 Committee / Board Reporting ──────────────────────── */}
      {tab === "reporting" && dashboard && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Governance Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{dashboard.total}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>Total Cases</div></div>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{dashboard.open}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>Open Cases</div></div>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{dashboard.sla_breaches}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>SLA Breaches</div></div>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{dashboard.anonymous}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>Anonymous Reports</div></div>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Outcome Distribution</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{dashboard.substantiated}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>Substantiated</div></div>
              <div><div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{dashboard.unfounded}</div><div style={{ fontSize: 12, color: "var(--slate)" }}>Unfounded</div></div>
            </div>
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 8 }}>Resolution Rate</h4>
              <div style={{ background: "var(--border)", borderRadius: 4, height: 24, overflow: "hidden" }}>
                <div style={{ width: `${dashboard.total ? (dashboard.closed / dashboard.total) * 100 : 0}%`, background: "var(--accent)", borderRadius: 4, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>
                  {dashboard.total ? Math.round((dashboard.closed / dashboard.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub#11 Confidentiality Controls ─────────────────────────── */}
      {tab === "confidentiality" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Confidentiality Controls</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Access to case data is restricted by role and need-to-know basis.</p>
          <table>
            <thead><tr><th>Case</th><th>Title</th><th>Anonymous</th><th>Confidential Comments</th><th>Access Level</th></tr></thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.case_number}</strong></td>
                  <td>{c.title}</td>
                  <td>{c.is_anonymous ? <span className="badge badge-success">Yes</span> : <span className="badge badge-gold">No</span>}</td>
                  <td>{comments.filter((cm) => cm.case_id === c.id && cm.is_confidential).length}</td>
                  <td>Restricted</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sub#12 Feedback to Complainant ──────────────────────────── */}
      {tab === "feedback_tab" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Select Case</h3>
            {cases.map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <strong>{c.case_number}</strong> — {c.title}
              </div>
            ))}
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Feedback — {sel.case_number}</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <select className="select" value={fbForm.channel} onChange={(e) => setFbForm({ ...fbForm, channel: e.target.value })}>
                  <option value="email">Email</option><option value="phone">Phone</option><option value="portal">Portal</option>
                </select>
                <input className="input" placeholder="Feedback message" value={fbForm.message} onChange={(e) => setFbForm({ ...fbForm, message: e.target.value })} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={addFeedback}>Send</button>
              </div>
              {feedbacks.map((f) => (
                <div key={f.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="badge badge-success" style={{ marginRight: 6 }}>{f.channel}</span>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>User #{f.sent_by_id} — {daysSince(f.created_at)}d ago</span>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{f.message}</div>
                </div>
              ))}
              {feedbacks.length === 0 && <p style={{ color: "var(--slate)" }}>No feedback sent yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#13 Repeat-Complaint Linkage ─────────────────────────── */}
      {tab === "repeat" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: sel ? "1fr 1fr" : "1fr" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Link Related Cases</h3>
            {cases.map((c) => (
              <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onClick={() => { setSelectedCase(c); loadCaseDetail(c); }}>
                <strong>{c.case_number}</strong> — {c.title}
              </div>
            ))}
          </div>
          {sel && (
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Links — {sel.case_number}</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <input className="input" type="number" placeholder="Linked case ID" value={linkForm.case_id_2 || ""} onChange={(e) => setLinkForm({ ...linkForm, case_id_2: Number(e.target.value) })} />
                <select className="select" value={linkForm.relationship_type} onChange={(e) => setLinkForm({ ...linkForm, relationship_type: e.target.value })}>
                  {LINK_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <button className="btn btn-primary" onClick={addLink}>Link</button>
              </div>
              {links.map((l) => (
                <div key={l.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="badge badge-gold" style={{ marginRight: 6 }}>{l.relationship_type}</span>
                  Case #{l.case_id_1} ↔ Case #{l.case_id_2}
                </div>
              ))}
              {links.length === 0 && <p style={{ color: "var(--slate)" }}>No links yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Sub#14 POSH/HR Grievance Split ──────────────────────────── */}
      {tab === "routing" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>POSH / HR Grievance Routing</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Cases are routed to the appropriate forum — Ethics Committee, POSH Committee, or HR.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {ROUTINGS.map((r) => (
              <div key={r} className="card" style={{ padding: 16 }}>
                <h4 style={{ color: "var(--navy)", textTransform: "capitalize", marginBottom: 10 }}>{r} Forum</h4>
                {cases.filter((c) => c.routing === r).map((c) => (
                  <div key={c.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <strong>{c.case_number}</strong> — <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                  </div>
                ))}
                {cases.filter((c) => c.routing === r).length === 0 && <p style={{ color: "var(--slate)", fontSize: 12 }}>No cases</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub#15 Ethics-Culture Survey ────────────────────────────── */}
      {tab === "survey" && (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
          <form className="card" style={{ padding: 22 }} onSubmit={addSurvey}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Survey Results</h3>
            <div className="field"><label>Survey Name</label>
              <input className="input" value={surveyForm.survey_name} onChange={(e) => setSurveyForm({ ...surveyForm, survey_name: e.target.value })} required /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}><label>Dimension</label>
                <select className="select" value={surveyForm.dimension} onChange={(e) => setSurveyForm({ ...surveyForm, dimension: e.target.value })}>
                  {DIMENSIONS.map((d) => <option key={d}>{d}</option>)}
                </select></div>
              <div className="field" style={{ flex: 1 }}><label>Score (0–100)</label>
                <input className="input" type="number" min={0} max={100} value={surveyForm.score} onChange={(e) => setSurveyForm({ ...surveyForm, score: Number(e.target.value) })} /></div>
            </div>
            <div className="field"><label>Respondents</label>
              <input className="input" type="number" min={0} value={surveyForm.respondent_count} onChange={(e) => setSurveyForm({ ...surveyForm, respondent_count: Number(e.target.value) })} /></div>
            <div className="field"><label>Notes</label>
              <textarea className="input" rows={2} value={surveyForm.notes} onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })} /></div>
            <button className="btn btn-primary btn-block">Add Survey</button>
          </form>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Survey History</h3>
            {surveys.map((s) => (
              <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 14 }}>{s.survey_name}</strong>
                  <span className={`badge ${s.score >= 70 ? "badge-success" : s.score >= 40 ? "badge-gold" : "badge-danger"}`}>{s.score}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>Dimension: {s.dimension} | {s.respondent_count} respondents</div>
              </div>
            ))}
            {surveys.length === 0 && <p style={{ color: "var(--slate)" }}>No surveys logged.</p>}
          </div>
        </div>
      )}

      {/* ── Sub#16 Module Dashboard & KPIs ──────────────────────────── */}
      {tab === "dashboard" && dashboard && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Total Cases", value: dashboard.total, color: "var(--navy)" },
              { label: "Open", value: dashboard.open, color: "var(--accent)" },
              { label: "Closed", value: dashboard.closed, color: "var(--success)" },
              { label: "SLA Breaches", value: dashboard.sla_breaches, color: "var(--danger)" },
              { label: "Anonymous", value: dashboard.anonymous, color: "var(--slate)" },
            ].map((k) => (
              <div key={k.label} className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{k.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Category</h3>
              {renderBar(dashboard.by_category)}
            </div>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>By Status</h3>
              {renderBar(dashboard.by_status)}
            </div>
          </div>
        </div>
      )}

      {/* ── Sub#17–25 Shell Pages ───────────────────────────────────── */}
      {tab === "scope" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Scope & Audit Universe</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Define auditable units, entities and processes in scope for the Whistleblower & Grievance module.</p>
          <table>
            <thead><tr><th>Unit</th><th>Entity</th><th>Process</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>All Business Units</td><td>Enterprise-wide</td><td>Intake & Triage</td><td><span className="badge badge-success">In Scope</span></td></tr>
              <tr><td>Senior Management</td><td>C-Suite / Directors</td><td>Investigation Oversight</td><td><span className="badge badge-success">In Scope</span></td></tr>
              <tr><td>HR & POSH Committee</td><td>HR Department</td><td>POSH Case Handling</td><td><span className="badge badge-success">In Scope</span></td></tr>
              <tr><td>External Vendors</td><td>Third-party partners</td><td>Anonymous Reporting</td><td><span className="badge badge-gold">Partial</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "rcm" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Risk & Control Matrix</h3>
          <table>
            <thead><tr><th>Risk</th><th>Control</th><th>Assertion</th><th>Owner</th><th>Rating</th></tr></thead>
            <tbody>
              <tr><td>Retaliation against reporter</td><td>Anti-retaliation policy & monitoring</td><td>Completeness</td><td>Compliance Officer</td><td><span className="badge badge-danger">High</span></td></tr>
              <tr><td>Leak of complainant identity</td><td>Role-based access controls</td><td>Confidentiality</td><td>IT Security</td><td><span className="badge badge-danger">High</span></td></tr>
              <tr><td>Delayed investigation</td><td>SLA tracking & escalation</td><td>Timeliness</td><td>Grievance Committee</td><td><span className="badge badge-gold">Medium</span></td></tr>
              <tr><td>Biased investigation</td><td>Conflict-free assignment</td><td>Accuracy</td><td>Ethics Committee</td><td><span className="badge badge-gold">Medium</span></td></tr>
              <tr><td>Unresolved complaints</td><td>Periodic status reviews</td><td>Completeness</td><td>Board Audit Committee</td><td><span className="badge badge-success">Low</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "rules" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Test & Analytics Rule Library</h3>
          <table>
            <thead><tr><th>Rule</th><th>Threshold</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>SLA Breach Detection</td><td>&gt; 30 days open</td><td>Automated</td><td><span className="badge badge-success">Active</span></td></tr>
              <tr><td>Repeat Complainant Flag</td><td>&gt; 2 complaints / entity</td><td>Automated</td><td><span className="badge badge-success">Active</span></td></tr>
              <tr><td>Anonymous Spike Alert</td><td>&gt; 50% increase QoQ</td><td>Threshold</td><td><span className="badge badge-gold">Draft</span></td></tr>
              <tr><td>High-Risk Category Monitor</td><td>Fraud / POSH cases</td><td>Filter</td><td><span className="badge badge-success">Active</span></td></tr>
              <tr><td>Unsubstantiated Rate Alert</td><td>&gt; 70% unfounded</td><td>Threshold</td><td><span className="badge badge-gold">Draft</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "datasource" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Data Source & Connector Setup</h3>
          <table>
            <thead><tr><th>Source</th><th>Type</th><th>Table / Endpoint</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Internal Case DB</td><td>Direct Table</td><td>mod_whistleblower_grievance_cases</td><td><span className="badge badge-success">Connected</span></td></tr>
              <tr><td>HR System</td><td>API</td><td>/api/hr/employees</td><td><span className="badge badge-gold">Pending</span></td></tr>
              <tr><td>Hotline Vendor</td><td>SFTP Upload</td><td>/inbound/hotline/*.csv</td><td><span className="badge badge-gold">Pending</span></td></tr>
              <tr><td>Email Reports</td><td>IMAP Polling</td><td>whistleblower@company.com</td><td><span className="badge badge-success">Connected</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "sampling" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Sampling & Population Builder</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Draw statistical or judgemental samples from the full case population for review.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{cases.length}</div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>Population Size</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{Math.ceil(cases.length * 0.1)}</div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>Sample Size (10%)</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>Random</div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>Method</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--slate)" }}>Sample selection can be configured by category, priority, date range, or routing type.</p>
        </div>
      )}

      {tab === "exceptions" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Exception & Red-Flag Queue</h3>
          <table>
            <thead><tr><th>Exception</th><th>Severity</th><th>Case</th><th>Disposition</th></tr></thead>
            <tbody>
              {cases.filter((c) => daysSince(c.date_received) > c.sla_target_days).map((c) => (
                <tr key={c.id}>
                  <td>SLA breach — {daysSince(c.date_received)} days open</td>
                  <td><span className="badge badge-danger">High</span></td>
                  <td><strong>{c.case_number}</strong></td>
                  <td>Under Review</td>
                </tr>
              ))}
              {cases.filter((c) => daysSince(c.date_received) > c.sla_target_days).length === 0 && <tr><td colSpan={4} style={{ color: "var(--slate)" }}>No exceptions at this time.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "papers" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Working Papers & Evidence</h3>
          <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 16 }}>Attach evidence, tick-marks, screenshots and reviewer sign-off for each investigation.</p>
          <table>
            <thead><tr><th>Case</th><th>Evidence Type</th><th>Description</th><th>Reviewer</th><th>Sign-off</th></tr></thead>
            <tbody>
              {cases.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.case_number}</strong></td>
                  <td>Document</td>
                  <td>{c.title} — supporting evidence</td>
                  <td>Reviewer #{c.created_by_id}</td>
                  <td><span className="badge badge-gold">Pending</span></td>
                </tr>
              ))}
              {cases.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No working papers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "findings" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Observation & Finding Log</h3>
          <table>
            <thead><tr><th>Finding</th><th>Case</th><th>Grade</th><th>Routed To</th><th>Status</th></tr></thead>
            <tbody>
              {cases.filter((c) => c.substantiation === "founded").map((c) => (
                <tr key={c.id}>
                  <td>{c.title} — substantiated finding</td>
                  <td><strong>{c.case_number}</strong></td>
                  <td><span className="badge badge-danger">Critical</span></td>
                  <td style={{ textTransform: "capitalize" }}>{c.routing} Committee</td>
                  <td><span className={`badge ${c.status === "closed" ? "badge-success" : "badge-gold"}`}>{c.status === "closed" ? "Remediated" : "Open"}</span></td>
                </tr>
              ))}
              {cases.filter((c) => c.substantiation === "founded").length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)" }}>No substantiated findings.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "remediation" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Remediation / Action Tracker</h3>
          <table>
            <thead><tr><th>CAPA Item</th><th>Owner</th><th>Due Date</th><th>Case</th><th>Re-test</th><th>Status</th></tr></thead>
            <tbody>
              {disciplinaries.map((d) => (
                <tr key={d.id}>
                  <td>{d.action_type} — {d.description}</td>
                  <td>{d.recipient}</td>
                  <td>TBD</td>
                  <td><strong>Case #{d.case_id}</strong></td>
                  <td><span className="badge badge-gold">Scheduled</span></td>
                  <td><span className={`badge ${d.status === "executed" ? "badge-success" : "badge-gold"}`}>{d.status}</span></td>
                </tr>
              ))}
              {disciplinaries.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)" }}>No remediation items.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
