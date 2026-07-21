import { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";
import AnalyticsPanel from "./AnalyticsPanel";
import RegistersPanel from "./RegistersPanel";
import AuditWorkspacePanel from "./AuditWorkspacePanel";

const SLUG = "insurance_coverage_claims";

// ── Types ──────────────────────────────────────────────────────────
interface Policy {
  id: number;
  policy_number: string;
  policy_type: string;
  insurer_name: string;
  broker_name: string;
  asset_or_entity_covered: string;
  asset_value: number;
  sum_insured: number;
  premium_amount: number;
  policy_start_date: string;
  policy_end_date: string;
  department: string;
  location: string;
  status: string;
  coverage_pct: number;
  days_to_expiry: number;
}

interface Claim {
  id: number;
  policy_id: number;
  claim_number: string;
  incident_date: string;
  claim_lodged_date: string;
  claim_amount: number;
  approved_amount: number;
  recovery_amount: number;
  surveyor_name: string;
  status: string;
  lodgement_delay_days: number;
  outstanding_amount: number;
}

interface Dashboard {
  total_policies: number;
  active_policies: number;
  expired_policies: number;
  expiring_in_30_days: number;
  total_sum_insured: number;
  total_asset_value: number;
  underinsured_count: number;
  total_premium: number;
  open_claims: number;
  total_claim_amount: number;
  total_recovery_amount: number;
  total_outstanding: number;
  average_lodgement_delay_days: number;
}

const POLICY_TYPES = [
  "Fire & Property",
  "Marine / Transit",
  "Business Interruption",
  "GPA / GMC",
  "D&O Liability",
  "Product Liability",
  "Motor",
  "Cyber",
  "Other",
];
const POLICY_STATUSES = ["active", "expired", "lapsed", "renewed"];
const CLAIM_STATUSES = ["lodged", "under_review", "approved", "settled", "rejected"];

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "badge-success",
    settled: "badge-success",
    approved: "badge-gold",
    under_review: "badge-gold",
    renewed: "badge-success",
    lodged: "badge-slate",
    expired: "badge-danger",
    lapsed: "badge-danger",
    rejected: "badge-danger",
  };
  return `badge ${map[status] || "badge-slate"}`;
}

function coverageBadge(pct: number) {
  if (pct === 0) return "badge-slate";
  if (pct < 90) return "badge-danger";
  if (pct <= 110) return "badge-success";
  return "badge-gold"; // overinsured
}

// ── Component ─────────────────────────────────────────────────────
export default function InsuranceCoverageClaimsPage() {
  const [tab, setTab] = useState<
    "dashboard" | "policies" | "claims" | "analytics" | "registers" | "audit"
  >("dashboard");
  const [dash, setDash] = useState<Dashboard | null>(null);

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyTotal, setPolicyTotal] = useState(0);
  const [policySearch, setPolicySearch] = useState("");
  const [policyStatus, setPolicyStatus] = useState("");

  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimTotal, setClaimTotal] = useState(0);
  const [claimSearch, setClaimSearch] = useState("");
  const [claimStatus, setClaimStatus] = useState("");

  const [policyForm, setPolicyForm] = useState({
    policy_number: "",
    policy_type: POLICY_TYPES[0],
    insurer_name: "",
    broker_name: "",
    asset_or_entity_covered: "",
    asset_value: 0,
    sum_insured: 0,
    premium_amount: 0,
    policy_start_date: "",
    policy_end_date: "",
    department: "",
    location: "",
    status: "active",
  });

  const [claimForm, setClaimForm] = useState({
    policy_id: 0,
    claim_number: "",
    incident_date: "",
    claim_lodged_date: "",
    claim_amount: 0,
    approved_amount: 0,
    recovery_amount: 0,
    surveyor_name: "",
    status: "lodged",
  });

  async function loadDashboard() {
    setDash(await get<Dashboard>(`/api/modules/${SLUG}/dashboard`));
  }

  async function loadPolicies() {
    const qs = new URLSearchParams();
    if (policySearch) qs.set("search", policySearch);
    if (policyStatus) qs.set("status", policyStatus);
    const res = await get<{ total: number; items: Policy[] }>(
      `/api/modules/${SLUG}/policies?${qs.toString()}`
    );
    setPolicies(res.items);
    setPolicyTotal(res.total);
  }

  async function loadClaims() {
    const qs = new URLSearchParams();
    if (claimSearch) qs.set("search", claimSearch);
    if (claimStatus) qs.set("status", claimStatus);
    const res = await get<{ total: number; items: Claim[] }>(
      `/api/modules/${SLUG}/claims?${qs.toString()}`
    );
    setClaims(res.items);
    setClaimTotal(res.total);
  }

  useEffect(() => {
    loadDashboard();
    loadPolicies();
    loadClaims();
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [policySearch, policyStatus]);

  useEffect(() => {
    loadClaims();
  }, [claimSearch, claimStatus]);

  async function addPolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!policyForm.policy_number.trim() || !policyForm.policy_start_date || !policyForm.policy_end_date)
      return;
    await post(`/api/modules/${SLUG}/policies`, policyForm);
    setPolicyForm({ ...policyForm, policy_number: "", insurer_name: "", asset_or_entity_covered: "" });
    loadPolicies();
    loadDashboard();
  }

  async function addClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!claimForm.claim_number.trim() || !claimForm.policy_id) return;
    await post(`/api/modules/${SLUG}/claims`, claimForm);
    setClaimForm({ ...claimForm, claim_number: "" });
    loadClaims();
    loadDashboard();
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["dashboard", "policies", "claims", "analytics", "registers", "audit"] as const).map((t) => (
          <button
            key={t}
            className={t === tab ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "8px 18px", textTransform: "capitalize" }}
            onClick={() => setTab(t)}
          >
            {t === "dashboard"
              ? "Dashboard & KPIs"
              : t === "policies"
                ? "Policy Register"
                : t === "claims"
                  ? "Claims Tracking"
                  : t === "analytics"
                    ? "Coverage Analytics"
                    : t === "registers"
                      ? "Specialty Covers & Recovery"
                      : "Audit Workspace"}
          </button>
        ))}
      </div>

      {tab === "analytics" && <AnalyticsPanel />}
      {tab === "registers" && <RegistersPanel />}
      {tab === "audit" && <AuditWorkspacePanel />}

      {tab === "dashboard" && (
        <div>
          {!dash ? (
            <p style={{ color: "var(--slate)" }}>Loading…</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <Kpi label="Active Policies" value={dash.active_policies} />
                <Kpi
                  label="Expiring in 30 Days"
                  value={dash.expiring_in_30_days}
                  badge={dash.expiring_in_30_days > 0 ? "badge-gold" : "badge-success"}
                />
                <Kpi
                  label="Expired Policies"
                  value={dash.expired_policies}
                  badge={dash.expired_policies > 0 ? "badge-danger" : "badge-success"}
                />
                <Kpi
                  label="Underinsured Assets"
                  value={dash.underinsured_count}
                  badge={dash.underinsured_count > 0 ? "badge-danger" : "badge-success"}
                />
                <Kpi label="Open Claims" value={dash.open_claims} />
                <Kpi label="Avg. Lodgement Delay" value={`${dash.average_lodgement_delay_days}d`} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Coverage</h3>
                  <Row label="Total Asset Value" value={money(dash.total_asset_value)} />
                  <Row label="Total Sum Insured" value={money(dash.total_sum_insured)} />
                  <Row label="Total Premium" value={money(dash.total_premium)} />
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Claims &amp; Recovery</h3>
                  <Row label="Total Claimed" value={money(dash.total_claim_amount)} />
                  <Row label="Total Recovered" value={money(dash.total_recovery_amount)} />
                  <Row label="Outstanding" value={money(dash.total_outstanding)} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "policies" && (
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
          <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
            <div style={{ display: "flex", gap: 10, padding: 16, flexWrap: "wrap" }}>
              <input
                className="input"
                placeholder="Search policy #, insurer, asset…"
                style={{ flex: 1, minWidth: 200 }}
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
              />
              <select className="select" value={policyStatus} onChange={(e) => setPolicyStatus(e.target.value)}>
                <option value="">All statuses</option>
                {POLICY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Insurer</th>
                  <th>Coverage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.policy_number}</strong>
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>
                        {p.policy_type} — {p.asset_or_entity_covered || "—"}
                      </div>
                    </td>
                    <td>{p.insurer_name}</td>
                    <td>
                      <span className={`badge ${coverageBadge(p.coverage_pct)}`}>
                        {p.coverage_pct ? `${p.coverage_pct}%` : "—"}
                      </span>
                    </td>
                    <td>
                      {p.policy_end_date}
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>
                        {p.days_to_expiry >= 0 ? `${p.days_to_expiry}d left` : `${-p.days_to_expiry}d overdue`}
                      </div>
                    </td>
                    <td>
                      <span className={statusBadge(p.status)}>{p.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 12px" }}
                        onClick={async () => {
                          await del(`/api/modules/${SLUG}/policies/${p.id}`);
                          loadPolicies();
                          loadDashboard();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {policies.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ color: "var(--slate)" }}>
                      No policies recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ padding: 12, fontSize: 12, color: "var(--slate)" }}>
              {policyTotal} polic{policyTotal === 1 ? "y" : "ies"} total
            </div>
          </div>

          <form className="card" style={{ padding: 22 }} onSubmit={addPolicy}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add policy</h3>
            <div className="field">
              <label>Policy number</label>
              <input
                className="input"
                value={policyForm.policy_number}
                onChange={(e) => setPolicyForm({ ...policyForm, policy_number: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Type</label>
              <select
                className="select"
                value={policyForm.policy_type}
                onChange={(e) => setPolicyForm({ ...policyForm, policy_type: e.target.value })}
              >
                {POLICY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Insurer</label>
              <input
                className="input"
                value={policyForm.insurer_name}
                onChange={(e) => setPolicyForm({ ...policyForm, insurer_name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Broker</label>
              <input
                className="input"
                value={policyForm.broker_name}
                onChange={(e) => setPolicyForm({ ...policyForm, broker_name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Asset / entity covered</label>
              <input
                className="input"
                value={policyForm.asset_or_entity_covered}
                onChange={(e) => setPolicyForm({ ...policyForm, asset_or_entity_covered: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Asset value</label>
                <input
                  className="input"
                  type="number"
                  value={policyForm.asset_value}
                  onChange={(e) => setPolicyForm({ ...policyForm, asset_value: Number(e.target.value) })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Sum insured</label>
                <input
                  className="input"
                  type="number"
                  value={policyForm.sum_insured}
                  onChange={(e) => setPolicyForm({ ...policyForm, sum_insured: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="field">
              <label>Premium</label>
              <input
                className="input"
                type="number"
                value={policyForm.premium_amount}
                onChange={(e) => setPolicyForm({ ...policyForm, premium_amount: Number(e.target.value) })}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Start date</label>
                <input
                  className="input"
                  type="date"
                  value={policyForm.policy_start_date}
                  onChange={(e) => setPolicyForm({ ...policyForm, policy_start_date: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>End date</label>
                <input
                  className="input"
                  type="date"
                  value={policyForm.policy_end_date}
                  onChange={(e) => setPolicyForm({ ...policyForm, policy_end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Status</label>
              <select
                className="select"
                value={policyForm.status}
                onChange={(e) => setPolicyForm({ ...policyForm, status: e.target.value })}
              >
                {POLICY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-block">Add policy</button>
          </form>
        </div>
      )}

      {tab === "claims" && (
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
          <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
            <div style={{ display: "flex", gap: 10, padding: 16, flexWrap: "wrap" }}>
              <input
                className="input"
                placeholder="Search claim #, surveyor…"
                style={{ flex: 1, minWidth: 200 }}
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
              />
              <select className="select" value={claimStatus} onChange={(e) => setClaimStatus(e.target.value)}>
                <option value="">All statuses</option>
                {CLAIM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Delay</th>
                  <th>Amount</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.claim_number}</strong>
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>
                        Policy #{c.policy_id} — {c.surveyor_name || "no surveyor"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${c.lodgement_delay_days > 30 ? "badge-danger" : "badge-success"}`}>
                        {c.lodgement_delay_days}d
                      </span>
                    </td>
                    <td>{money(c.claim_amount)}</td>
                    <td>{money(c.outstanding_amount)}</td>
                    <td>
                      <span className={statusBadge(c.status)}>{c.status.replace("_", " ")}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 12px" }}
                        onClick={async () => {
                          await del(`/api/modules/${SLUG}/claims/${c.id}`);
                          loadClaims();
                          loadDashboard();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ color: "var(--slate)" }}>
                      No claims logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ padding: 12, fontSize: 12, color: "var(--slate)" }}>
              {claimTotal} claim{claimTotal === 1 ? "" : "s"} total
            </div>
          </div>

          <form className="card" style={{ padding: 22 }} onSubmit={addClaim}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log a claim</h3>
            <div className="field">
              <label>Policy</label>
              <select
                className="select"
                value={claimForm.policy_id}
                onChange={(e) => setClaimForm({ ...claimForm, policy_id: Number(e.target.value) })}
                required
              >
                <option value={0}>Select policy…</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policy_number} — {p.insurer_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Claim number</label>
              <input
                className="input"
                value={claimForm.claim_number}
                onChange={(e) => setClaimForm({ ...claimForm, claim_number: e.target.value })}
                required
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Incident date</label>
                <input
                  className="input"
                  type="date"
                  value={claimForm.incident_date}
                  onChange={(e) => setClaimForm({ ...claimForm, incident_date: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Lodged date</label>
                <input
                  className="input"
                  type="date"
                  value={claimForm.claim_lodged_date}
                  onChange={(e) => setClaimForm({ ...claimForm, claim_lodged_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Claim amount</label>
              <input
                className="input"
                type="number"
                value={claimForm.claim_amount}
                onChange={(e) => setClaimForm({ ...claimForm, claim_amount: Number(e.target.value) })}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Approved</label>
                <input
                  className="input"
                  type="number"
                  value={claimForm.approved_amount}
                  onChange={(e) => setClaimForm({ ...claimForm, approved_amount: Number(e.target.value) })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Recovered</label>
                <input
                  className="input"
                  type="number"
                  value={claimForm.recovery_amount}
                  onChange={(e) => setClaimForm({ ...claimForm, recovery_amount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="field">
              <label>Surveyor</label>
              <input
                className="input"
                value={claimForm.surveyor_name}
                onChange={(e) => setClaimForm({ ...claimForm, surveyor_name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select
                className="select"
                value={claimForm.status}
                onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value })}
              >
                {CLAIM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-block">Log claim</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, badge }: { label: string; value: string | number; badge?: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)" }}>
        {badge ? <span className={`badge ${badge}`}>{value}</span> : value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: "var(--slate)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
