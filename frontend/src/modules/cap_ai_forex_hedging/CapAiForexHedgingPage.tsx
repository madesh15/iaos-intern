import { useEffect, useState } from "react";
import { get, post, patch, del } from "../../lib/api";
import { Icon } from "../../components/Icon";

const SLUG = "cap_ai_forex_hedging";

// Types matching backend schemas
interface Exposure {
  id: number;
  currency_pair: string;
  amount: number;
  direction: string;
  maturity_date: string;
  status: string;
  completeness_status: string;
  is_anomaly: boolean;
  notes: string;
}

interface Hedge {
  id: number;
  contract_type: string;
  underlying_exposure_id?: number;
  amount: number;
  strike_rate: number;
  fair_value: number;
  gain_loss: number;
  effectiveness_pct: number;
  maturity_date: string;
  bank_confirmation: string;
  is_speculative: boolean;
  status: string;
  counterparty: string;
  premium_cost: number;
}

interface AuditException {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  assigned_to: string;
  created_at: string;
}

interface AuditFinding {
  id: number;
  title: string;
  description: string;
  severity: string;
  root_cause: string;
  recommendation: string;
  created_at: string;
}

interface Remediation {
  id: number;
  finding_id: number;
  capa_action: string;
  owner: string;
  due_date: string;
  status: string;
  retesting_status: string;
}

interface HedgeDoc {
  id: number;
  filename: string;
  doc_type: string;
  uploaded_at: string;
}

interface DashboardKpis {
  overall_risk_score: number;
  total_exposure_amount: number;
  hedged_amount: number;
  unhedged_amount: number;
  hedge_coverage_pct: number;
  open_unhedged_positions: number;
  pending_exceptions: number;
  counterparty_risk_level: string;
  hedge_effectiveness_pct: number;
  natural_hedged_opportunities: number;
}

interface AISummary {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export default function CapAiForexHedgingPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  // State arrays for data
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [exposures, setExposures] = useState<Exposure[]>([]);
  const [hedges, setHedges] = useState<Hedge[]>([]);
  const [exceptions, setExceptions] = useState<AuditException[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [documents, setDocuments] = useState<HedgeDoc[]>([]);
  const [naturalHedges, setNaturalHedges] = useState<any[]>([]);
  const [speculativeDeals, setSpeculativeDeals] = useState<any[]>([]);
  const [samples, setSamples] = useState<Exposure[]>([]);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Forms state
  const [expForm, setExpForm] = useState({
    currency_pair: "USD/INR",
    amount: "",
    direction: "Export",
    maturity_date: "",
    notes: "",
  });

  const [hedgeForm, setHedgeForm] = useState({
    contract_type: "Forward",
    underlying_exposure_id: "",
    amount: "",
    strike_rate: "",
    maturity_date: "",
    counterparty: "HSBC Bank",
    premium_cost: "0",
  });

  const [findingForm, setFindingForm] = useState({
    title: "",
    description: "",
    severity: "Medium",
    root_cause: "",
    recommendation: "",
  });

  const [remediationForm, setRemediationForm] = useState({
    finding_id: "",
    capa_action: "",
    owner: "",
    due_date: "",
  });

  const [docForm, setDocForm] = useState({
    filename: "",
    doc_type: "Designation Memo",
  });

  const [samplingForm, setSamplingForm] = useState({
    sampling_type: "statistical",
    sample_size: "3",
  });

  // Global loading
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  // Refresh helper
  async function refreshAll() {
    setLoading(true);
    try {
      const dashboardKpis = await get<DashboardKpis>(`/api/modules/${SLUG}/dashboard`);
      const exposureList = await get<Exposure[]>(`/api/modules/${SLUG}/exposures`);
      const hedgeList = await get<Hedge[]>(`/api/modules/${SLUG}/hedges`);
      const exceptionList = await get<AuditException[]>(`/api/modules/${SLUG}/exceptions`);
      const findingList = await get<AuditFinding[]>(`/api/modules/${SLUG}/findings`);
      const remediationList = await get<Remediation[]>(`/api/modules/${SLUG}/remediations`);
      const docList = await get<HedgeDoc[]>(`/api/modules/${SLUG}/documents`);
      const naturalList = await get<any[]>(`/api/modules/${SLUG}/natural-hedges`);
      const speculativeList = await get<any[]>(`/api/modules/${SLUG}/speculative-deals`);

      setKpis(dashboardKpis);
      setExposures(exposureList);
      setHedges(hedgeList);
      setExceptions(exceptionList);
      setFindings(findingList);
      setRemediations(remediationList);
      setDocuments(docList);
      setNaturalHedges(naturalList);
      setSpeculativeDeals(speculativeList);
    } catch (err) {
      console.error("Error refreshing forex data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  // Form Submit Handlers
  async function addExposure(e: React.FormEvent) {
    e.preventDefault();
    if (!expForm.amount || !expForm.maturity_date) return;
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/exposures`, {
        currency_pair: expForm.currency_pair,
        amount: parseFloat(expForm.amount),
        direction: expForm.direction,
        maturity_date: expForm.maturity_date,
        notes: expForm.notes,
      });
      setExpForm({
        currency_pair: "USD/INR",
        amount: "",
        direction: "Export",
        maturity_date: "",
        notes: "",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to add exposure record");
    } finally {
      setActionBusy(false);
    }
  }

  async function addHedge(e: React.FormEvent) {
    e.preventDefault();
    if (!hedgeForm.amount || !hedgeForm.strike_rate || !hedgeForm.maturity_date) return;
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/hedges`, {
        contract_type: hedgeForm.contract_type,
        underlying_exposure_id: hedgeForm.underlying_exposure_id ? parseInt(hedgeForm.underlying_exposure_id) : null,
        amount: parseFloat(hedgeForm.amount),
        strike_rate: parseFloat(hedgeForm.strike_rate),
        maturity_date: hedgeForm.maturity_date,
        counterparty: hedgeForm.counterparty,
        premium_cost: parseFloat(hedgeForm.premium_cost),
      });
      setHedgeForm({
        contract_type: "Forward",
        underlying_exposure_id: "",
        amount: "",
        strike_rate: "",
        maturity_date: "",
        counterparty: "HSBC Bank",
        premium_cost: "0",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to add hedge contract");
    } finally {
      setActionBusy(false);
    }
  }

  async function addFinding(e: React.FormEvent) {
    e.preventDefault();
    if (!findingForm.title || !findingForm.description) return;
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/findings`, findingForm);
      setFindingForm({
        title: "",
        description: "",
        severity: "Medium",
        root_cause: "",
        recommendation: "",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to create audit finding");
    } finally {
      setActionBusy(false);
    }
  }

  async function addRemediation(e: React.FormEvent) {
    e.preventDefault();
    if (!remediationForm.finding_id || !remediationForm.capa_action || !remediationForm.owner) return;
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/remediations`, {
        finding_id: parseInt(remediationForm.finding_id),
        capa_action: remediationForm.capa_action,
        owner: remediationForm.owner,
        due_date: remediationForm.due_date,
      });
      setRemediationForm({
        finding_id: "",
        capa_action: "",
        owner: "",
        due_date: "",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to create remediation plan");
    } finally {
      setActionBusy(false);
    }
  }

  async function uploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.filename) return;
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/documents`, docForm);
      setDocForm({
        filename: "",
        doc_type: "Designation Memo",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to upload document reference");
    } finally {
      setActionBusy(false);
    }
  }

  async function runSampling(e: React.FormEvent) {
    e.preventDefault();
    try {
      const sampled = await get<Exposure[]>(
        `/api/modules/${SLUG}/sampling?sampling_type=${samplingForm.sampling_type}&sample_size=${samplingForm.sample_size}`
      );
      setSamples(sampled);
    } catch (err) {
      alert("Failed to generate samples");
    }
  }

  // Trigger MTM Valuation re-calc
  async function triggerMtmValuation() {
    setActionBusy(true);
    try {
      const res = await get<any>(`/api/modules/${SLUG}/mtm-valuation`);
      alert(`MTM evaluation complete! Re-calculated ${res.contracts_evaluated} active deals. Total portfolio MTM impact: $${res.total_mtm_gain_loss.toLocaleString()}`);
      await refreshAll();
    } catch (err) {
      alert("Failed to trigger MTM valuation");
    } finally {
      setActionBusy(false);
    }
  }

  // Generate AI Risk Audit report
  async function triggerAiReport() {
    setLoadingAi(true);
    try {
      const res = await post<AISummary>(`/api/modules/${SLUG}/ai-analysis`, {});
      setAiSummary(res);
    } catch (err) {
      alert("AI service failed to respond");
    } finally {
      setLoadingAi(false);
    }
  }

  // Rollover / Cancel Hedges
  async function handleHedgeAction(hedgeId: number, action: string) {
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/hedges/${hedgeId}/action?action=${action}`, {});
      await refreshAll();
    } catch (err) {
      alert(`Failed to execute ${action} on deal`);
    } finally {
      setActionBusy(false);
    }
  }

  // Resolve exceptions
  async function resolveException(excId: number, resolveNotes: string) {
    setActionBusy(true);
    try {
      await patch(`/api/modules/${SLUG}/exceptions/${excId}`, {
        status: "Resolved",
        assigned_to: "Audit Manager Clear",
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to update exception status");
    } finally {
      setActionBusy(false);
    }
  }

  // Update remediation action
  async function updateRemediationStatus(remId: number, newStatus: string, testStatus: string) {
    setActionBusy(true);
    try {
      await patch(`/api/modules/${SLUG}/remediations/${remId}`, {
        status: newStatus,
        retesting_status: testStatus,
      });
      await refreshAll();
    } catch (err) {
      alert("Failed to update remediation tracker");
    } finally {
      setActionBusy(false);
    }
  }

  // Import simulated ERP ledger
  async function importErpLedger() {
    setActionBusy(true);
    try {
      await post(`/api/modules/${SLUG}/exposures`, {
        currency_pair: "EUR/INR",
        amount: 850000.0,
        direction: "Import",
        maturity_date: "2026-08-30",
        notes: "Automated ERP ledger ingestion - Raw Material Purchase invoice",
      });
      await post(`/api/modules/${SLUG}/exposures`, {
        currency_pair: "USD/INR",
        amount: 140000.0,
        direction: "Export",
        maturity_date: "2026-09-10",
        notes: "Automated ERP ledger Ingestion - Machinery parts billing",
      });
      alert("ERP Connector: Successfully Ingested 2 new exposures from SAP/Oracle ledger feed.");
      await refreshAll();
    } catch (err) {
      alert("ERP Connector failed");
    } finally {
      setActionBusy(false);
    }
  }

  // Format Helper
  const fmt = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const menuItems = [
    { name: "Dashboard", icon: "dashboard" as const },
    { name: "Exposure Management", icon: "wallet" as const },
    { name: "Hedge Analytics", icon: "trending-up" as const },
    { name: "Valuation Testing", icon: "activity" as const },
    { name: "Contract Review", icon: "briefcase" as const },
    { name: "Compliance", icon: "shield" as const },
    { name: "Documentation Vault", icon: "clipboard" as const },
    { name: "Audit Framework", icon: "layers" as const },
    { name: "Exceptions", icon: "alert-triangle" as const },
    { name: "Findings", icon: "users" as const },
    { name: "Remediation Tracker", icon: "file-check" as const },
    { name: "Settings", icon: "settings" as const },
    { name: "Profile", icon: "user-check" as const },
  ];

  if (loading && !kpis) {
    return <div style={{ padding: 30, fontSize: "16px", color: "var(--navy)" }}>Loading Exposure Management Module...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 44px)", background: "var(--canvas)", margin: "-20px" }}>
      {/* Module Sidebar */}
      <aside style={{ background: "var(--navy)", color: "#fff", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 6, borderRight: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
          <Icon name="trending-up" size={20} style={{ color: "var(--gold)" }} />
          <strong style={{ fontSize: "14px", letterSpacing: "0.02em", color: "#fff", textTransform: "uppercase" }}>Forex & Hedging</strong>
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "13.5px",
              fontWeight: 600,
              textAlign: "left",
              color: activeTab === item.name ? "#fff" : "rgba(255,255,255,0.7)",
              background: activeTab === item.name ? "rgba(255,255,255,0.12)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >
            <Icon name={item.icon} size={17} style={{ color: activeTab === item.name ? "var(--gold)" : "inherit" }} />
            {item.name}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Auditor Mode</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)" }}>CAP-AI Risk Engine</span>
        </div>
      </aside>

      {/* Module Working Screen */}
      <main style={{ padding: 24, overflowY: "auto", height: "100vh" }}>
        
        {/* Module Header Bar */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
          <div>
            <h1 style={{ fontSize: "24px", color: "var(--navy)", fontWeight: 700 }}>{activeTab}</h1>
            <p style={{ fontSize: "13px", color: "var(--slate-soft)" }}>Forex & Hedging Exposure Management System</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={refreshAll} disabled={actionBusy} style={{ border: "1px solid var(--line)" }}>
              Refresh Data
            </button>
            <button className="btn btn-primary" onClick={triggerMtmValuation} disabled={actionBusy}>
              <Icon name="activity" size={15} /> Run MTM Valuation
            </button>
          </div>
        </header>

        {/* Action In-progress Mask */}
        {actionBusy && (
          <div style={{ background: "rgba(255,255,255,0.7)", position: "absolute", top: 0, left: 240, right: 0, bottom: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <strong style={{ color: "var(--navy)" }}>Executing Treasury Math Calculation Engine...</strong>
          </div>
        )}

        {/* ─── TAB 1: DASHBOARD ─── */}
        {activeTab === "Dashboard" && kpis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* KPI Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              
              <div className="card" style={{ padding: 18, borderLeft: "4px solid var(--gold)", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Forex Risk Score</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <strong style={{ fontSize: "32px", color: "var(--navy)", fontWeight: 800 }}>{kpis.overall_risk_score}</strong>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: kpis.overall_risk_score > 60 ? "var(--danger)" : kpis.overall_risk_score > 40 ? "var(--gold-strong)" : "var(--success)",
                    background: kpis.overall_risk_score > 60 ? "var(--danger-tint)" : kpis.overall_risk_score > 40 ? "var(--gold-tint)" : "var(--success-tint)"
                  }}>
                    {kpis.overall_risk_score > 60 ? "High Risk" : kpis.overall_risk_score > 40 ? "Medium Risk" : "Controlled"}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Predicted model index of asset loss</span>
              </div>

              <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Total Exposure (USD)</span>
                <strong style={{ fontSize: "28px", color: "var(--navy)", fontWeight: 800 }}>{fmt(kpis.total_exposure_amount)}</strong>
                <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Import & Export gross ledgers</span>
              </div>

              <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Hedge Coverage</span>
                <strong style={{ fontSize: "28px", color: "var(--navy)", fontWeight: 800 }}>{kpis.hedge_coverage_pct}%</strong>
                <div style={{ width: "100%", height: 6, background: "var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${kpis.hedge_coverage_pct}%`, height: "100%", background: "var(--success)" }} />
                </div>
              </div>

              <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Open Unhedged Deals</span>
                <strong style={{ fontSize: "28px", color: "var(--danger)", fontWeight: 800 }}>{kpis.open_unhedged_positions}</strong>
                <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Exposures lacking derivative covers</span>
              </div>

              <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Active Exceptions</span>
                <strong style={{ fontSize: "28px", color: "var(--navy)", fontWeight: 800 }}>{kpis.pending_exceptions}</strong>
                <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 600 }}>Action Required</span>
              </div>

              <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "12px", color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>Hedge Effectiveness</span>
                <strong style={{ fontSize: "28px", color: "var(--success)", fontWeight: 800 }}>{kpis.hedge_effectiveness_pct}%</strong>
                <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Ind AS 109 correlation index</span>
              </div>

            </div>

            {/* Custom SVG Exposure Trend Chart & AI Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              
              {/* Chart Card */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 18, fontWeight: 700 }}>FX Exposure vs Hedging Matrix Trend (30 Days Outlook)</h3>
                
                {/* SVG Visual Graphic Chart */}
                <div style={{ position: "relative", width: "100%", height: "200px", borderBottom: "2px solid var(--line)", borderLeft: "2px solid var(--line)", paddingLeft: 10 }}>
                  <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="var(--line-soft)" strokeDasharray="4" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="var(--line-soft)" strokeDasharray="4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="var(--line-soft)" strokeDasharray="4" />

                    {/* Chart Path: Gross Exposure (Blue line) */}
                    <path
                      d="M 0,160 Q 100,80 200,100 T 400,30 T 500,10"
                      fill="none"
                      stroke="var(--navy)"
                      strokeWidth="3.5"
                    />

                    {/* Chart Path: Hedged Amount (Gold line + fill) */}
                    <path
                      d="M 0,180 Q 100,120 200,130 T 400,90 T 500,80 L 500,200 L 0,200 Z"
                      fill="url(#chartGrad)"
                      opacity="0.8"
                    />
                    <path
                      d="M 0,180 Q 100,120 200,130 T 400,90 T 500,80"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="2.5"
                    />
                  </svg>
                  {/* Legend */}
                  <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--navy)", fontWeight: 700 }}>■ Total Gross Exposure (USD)</span>
                    <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}>■ Hedged Coverage derivatives (USD)</span>
                  </div>
                </div>
              </div>

              {/* AI Summary and Control Panel */}
              <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="activity" size={18} style={{ color: "var(--gold)" }} />
                  <h3 style={{ fontSize: "15px", color: "var(--navy)", fontWeight: 700 }}>CAP-AI Risk Auditor Insights</h3>
                </div>
                
                {!aiSummary ? (
                  <div style={{ textAlign: "center", padding: "30px 10px" }}>
                    <p style={{ fontSize: "13px", color: "var(--slate-soft)", marginBottom: 12 }}>Run standard compliance scans to generate AI feedback</p>
                    <button className="btn btn-primary" onClick={triggerAiReport} disabled={loadingAi}>
                      {loadingAi ? "Analyzing Portfolio..." : "Execute CAP-AI Deep Audit"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: "var(--canvas)", padding: 12, borderRadius: 6, fontSize: "12.5px", borderLeft: "3px solid var(--gold)" }}>
                      <p>{aiSummary.summary}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "var(--slate)" }}>Key Anomalies Detected:</strong>
                      <ul style={{ paddingLeft: 18, fontSize: "12px", color: "var(--navy)", marginTop: 4 }}>
                        {aiSummary.insights.map((ins, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "var(--success)" }}>Remediation Guidelines:</strong>
                      <ul style={{ paddingLeft: 18, fontSize: "12px", color: "var(--success)", marginTop: 4 }}>
                        {aiSummary.recommendations.map((rec, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={triggerAiReport} disabled={loadingAi}>
                      Refresh Audit Inferences
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Recent Audit Inferences timeline */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Audit Universe Timeline (Recent Activities)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12, borderLeft: "2px solid var(--gold)", paddingLeft: 14 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)" }}>TODAY</span>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)", margin: "2px 0" }}>MTM Valuation model calculations run</p>
                    <span style={{ fontSize: "12px", color: "var(--slate-soft)" }}>Hedge derivatives marked-to-market using current banking volatility curves. Gain/loss recomputed.</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>2 DAYS AGO</span>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)", margin: "2px 0" }}>Auto-exception created: Policy Limit Breach</p>
                    <span style={{ fontSize: "12px", color: "var(--slate-soft)" }}>Exposure amount USD 1.2M exceeded standard corporate board approval thresholds for unhedged status.</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>5 DAYS AGO</span>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)", margin: "2px 0" }}>Hedge documentation uploaded: Designation Memo</p>
                    <span style={{ fontSize: "12px", color: "var(--slate-soft)" }}>Compliance designation memo uploaded in Documentation vault for USD/INR forward trade.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 2: EXPOSURE MANAGEMENT ─── */}
        {activeTab === "Exposure Management" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Capture & Completeness */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              {/* Form to Add manual exposure */}
              <form className="card" style={{ padding: 20 }} onSubmit={addExposure}>
                <h3 style={{ color: "var(--navy)", fontSize: "15px", marginBottom: 14, fontWeight: 700 }}>Record Manual Forex Exposure</h3>
                
                <div className="field">
                  <label>Currency Pair</label>
                  <select
                    className="input"
                    value={expForm.currency_pair}
                    onChange={(e) => setExpForm({ ...expForm, currency_pair: e.target.value })}
                  >
                    <option value="USD/INR">USD/INR</option>
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="EUR/INR">EUR/INR</option>
                    <option value="USD/JPY">USD/JPY</option>
                  </select>
                </div>

                <div className="field">
                  <label>Exposure Gross Amount</label>
                  <input
                    className="input"
                    type="number"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    placeholder="e.g. 500000"
                    required
                  />
                </div>

                <div className="field">
                  <label>Exposure Flow Direction</label>
                  <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13.5px", fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="direction"
                        value="Export"
                        checked={expForm.direction === "Export"}
                        onChange={() => setExpForm({ ...expForm, direction: "Export" })}
                      /> Export (Receivable)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13.5px", fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="direction"
                        value="Import"
                        checked={expForm.direction === "Import"}
                        onChange={() => setExpForm({ ...expForm, direction: "Import" })}
                      /> Import (Payable)
                    </label>
                  </div>
                </div>

                <div className="field">
                  <label>Maturity Settlement Date</label>
                  <input
                    className="input"
                    type="date"
                    value={expForm.maturity_date}
                    onChange={(e) => setExpForm({ ...expForm, maturity_date: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label>Auditor Notes / Invoice Ref</label>
                  <input
                    className="input"
                    value={expForm.notes}
                    onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                    placeholder="e.g. PO-9912 components purchase"
                  />
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={actionBusy}>
                  Add Exposure Record
                </button>
              </form>

              {/* Ingestion & Ledger completeness overview */}
              <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", color: "var(--navy)", fontWeight: 700 }}>Exposure Capture Ledger</h3>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--line)" }} onClick={importErpLedger}>
                    Import SAP ERP Invoices
                  </button>
                </div>

                {/* Completeness Score */}
                <div style={{ background: "var(--canvas)", padding: 12, borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "var(--slate)" }}>Ledger Completeness Ingestion Score:</span>
                    <strong style={{ color: "var(--navy)" }}>
                      {Math.round((exposures.filter(e => e.completeness_status === "Verified").length / exposures.length) * 100)}%
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--line-soft)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(exposures.filter(e => e.completeness_status === "Verified").length / exposures.length) * 100}%`, height: "100%", background: "var(--gold)" }} />
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "12.5px" }}>
                    <thead>
                      <tr>
                        <th>Pair</th>
                        <th>Amount</th>
                        <th>Flow</th>
                        <th>Maturity</th>
                        <th>Audit Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exposures.map((exp) => (
                        <tr key={exp.id}>
                          <td style={{ fontWeight: 700 }}>
                            {exp.currency_pair} {exp.is_anomaly && <span style={{ color: "var(--danger)", fontSize: "10px", fontWeight: 800 }}>[ANOMALY]</span>}
                          </td>
                          <td>{fmt(exp.amount)}</td>
                          <td style={{ color: exp.direction === "Export" ? "var(--success)" : "var(--gold-strong)" }}>{exp.direction}</td>
                          <td>{exp.maturity_date}</td>
                          <td>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: 3,
                              fontSize: "10.5px",
                              fontWeight: 600,
                              color: exp.completeness_status === "Verified" ? "var(--success)" : "var(--danger)",
                              background: exp.completeness_status === "Verified" ? "var(--success-tint)" : "var(--danger-tint)"
                            }}>{exp.completeness_status}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 8px" }} onClick={() => del(`/api/modules/${SLUG}/exposures/${exp.id}`).then(refreshAll)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Natural Hedging Assessment */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 8: Natural Hedge Assessment</h3>
              <p style={{ fontSize: "12.5px", color: "var(--slate-soft)", marginBottom: 14 }}>
                Below are the offsetting currency trade transactions that occur in the same month. By netting receivables against payables, we naturally hedge and reduce the required bank derivative transaction fees.
              </p>
              
              {naturalHedges.length === 0 ? (
                <div style={{ color: "var(--slate)", fontSize: "13px", padding: 10 }}>No natural offsetting exposures found.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                  {naturalHedges.map((nh, idx) => (
                    <div key={idx} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 14, background: "var(--canvas)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <strong style={{ fontSize: "14px", color: "var(--navy)" }}>{nh.currency_pair} ({nh.month})</strong>
                        <span style={{ fontSize: "11px", background: "var(--success-tint)", color: "var(--success)", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                          Natural Offset Opportunity
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Export Receivables:</span>
                          <strong>{fmt(nh.export_amount)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Import Payables:</span>
                          <strong>{fmt(nh.import_amount)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", borderTop: "1px dashed var(--line)", paddingTop: 4, marginTop: 4 }}>
                          <span>Natural Hedged Offset:</span>
                          <strong>{fmt(nh.natural_offset)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger)", fontWeight: 600 }}>
                          <span>Remaining Net Exposure:</span>
                          <span>{fmt(nh.net_exposure)} ({nh.net_direction})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Position Ageing */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 9: Open Position Ageing</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>0 - 30 DAYS</span>
                  <h4 style={{ fontSize: "18px", color: "var(--navy)", marginTop: 6 }}>{fmt(exposures.filter(e => e.status === "Unhedged").slice(0, 2).reduce((a, b) => a + b.amount, 0))}</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Normal settlement outlook</span>
                </div>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>31 - 60 DAYS</span>
                  <h4 style={{ fontSize: "18px", color: "var(--navy)", marginTop: 6 }}>{fmt(exposures.filter(e => e.status === "Unhedged").slice(2, 3).reduce((a, b) => a + b.amount, 0))}</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Aged unhedged positions</span>
                </div>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold-strong)" }}>61 - 90 DAYS</span>
                  <h4 style={{ fontSize: "18px", color: "var(--gold-strong)", marginTop: 6 }}>{fmt(exposures.filter(e => e.status === "Unhedged" && e.currency_pair === "EUR/USD").reduce((a, b) => a + b.amount, 0))}</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Hedge action suggested</span>
                </div>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center", border: "1px solid var(--danger-tint)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--danger)" }}>90+ DAYS PENDING</span>
                  <h4 style={{ fontSize: "18px", color: "var(--danger)", marginTop: 6 }}>{fmt(exposures.filter(e => e.is_anomaly && e.status === "Unhedged").reduce((a, b) => a + b.amount, 0))}</h4>
                  <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 600 }}>Unhedged Limit Breach!</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 3: HEDGE ANALYTICS ─── */}
        {activeTab === "Hedge Analytics" && kpis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              {/* Coverage Ratio & Risks */}
              <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", fontWeight: 700 }}>Hedge Coverage Ratio</h3>
                
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <h2 style={{ fontSize: "36px", color: "var(--navy)", fontWeight: 800 }}>{kpis.hedge_coverage_pct}%</h2>
                  <span style={{ fontSize: "12px", color: "var(--slate-soft)" }}>Total Derivative cover value vs gross corporate assets</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Gross Forex exposure:</span>
                    <strong>{fmt(kpis.total_exposure_amount)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total derivative coverages:</span>
                    <strong style={{ color: "var(--success)" }}>{fmt(kpis.hedged_amount)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Net unhedged exposure:</span>
                    <strong style={{ color: "var(--danger)" }}>{fmt(kpis.unhedged_amount)}</strong>
                  </div>
                </div>
              </div>

              {/* Counterparty Concentration */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Counterparty Bank Exposure Concentration</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>HSBC Bank (Active Limit: $10,000,000)</span>
                      <strong>65% concentration</strong>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: "65%", height: "100%", background: "var(--navy)" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Citibank (Active Limit: $10,000,000)</span>
                      <strong>25% concentration</strong>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: "25%", height: "100%", background: "var(--gold)" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Deutsche Bank (Active Limit: $5,000,000)</span>
                      <strong>10% concentration</strong>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: "10%", height: "100%", background: "var(--slate)" }} />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: 14, background: "var(--canvas)", padding: 12, borderRadius: 6, fontSize: "12px", borderLeft: "3px solid var(--success)" }}>
                  <span>Concentration Risk Status: <strong>{kpis.counterparty_risk_level} Risk</strong>. Corporate guidelines restrict individual counterparty concentration to max 70%.</span>
                </div>
              </div>

            </div>

            {/* Ind AS 109 Effectiveness relationships */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Hedge Relationship Effectiveness (Ind AS 109 Compliance)</h3>
              <table style={{ width: "100%", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>Hedge Deal</th>
                    <th>Linked Exposure ID</th>
                    <th>Contract Type</th>
                    <th>Strike Rate</th>
                    <th>Hedge Amount</th>
                    <th>Ind AS 109 Score</th>
                    <th>Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hedges.filter(h => h.status === "Active").map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700 }}>Deal #{h.id}</td>
                      <td>{h.underlying_exposure_id ? `Exposure #${h.underlying_exposure_id}` : "Unlinked (Speculative)"}</td>
                      <td>{h.contract_type}</td>
                      <td>{h.strike_rate}</td>
                      <td>{fmt(h.amount)}</td>
                      <td style={{ fontWeight: 600, color: h.effectiveness_pct > 80.0 ? "var(--success)" : "var(--danger)" }}>
                        {h.effectiveness_pct > 0 ? `${h.effectiveness_pct}%` : "0.00%"}
                      </td>
                      <td>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: "10.5px",
                          fontWeight: 600,
                          color: h.effectiveness_pct > 80.0 ? "var(--success)" : "var(--danger)",
                          background: h.effectiveness_pct > 80.0 ? "var(--success-tint)" : "var(--danger-tint)"
                        }}>{h.effectiveness_pct > 80.0 ? "Pass (Compliant)" : "Fail"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ─── TAB 4: VALUATION TESTING ─── */}
        {activeTab === "Valuation Testing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", color: "var(--navy)", fontWeight: 700 }}>Mark-to-Market (MTM) Fair Value Valuation Testing</h3>
              <button className="btn btn-primary" onClick={triggerMtmValuation} disabled={actionBusy}>
                Recalculate Portfolio MTM Fair Value
              </button>
            </div>

            {/* MTM derivative values */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>MTM Fair Value & Unrealised Gain/Loss Ledgers</h3>
              <table style={{ width: "100%", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>Hedge Deal</th>
                    <th>Type</th>
                    <th>Strike Rate</th>
                    <th>Mock Spot Rate</th>
                    <th>Hedge Amount</th>
                    <th>MTM Fair Value</th>
                    <th>Unrealised Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {hedges.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700 }}>Deal #{h.id}</td>
                      <td>{h.contract_type}</td>
                      <td>{h.strike_rate}</td>
                      <td>83.50 (USD/INR)</td>
                      <td>{fmt(h.amount)}</td>
                      <td style={{ fontWeight: 600, color: h.fair_value >= 0 ? "var(--success)" : "var(--danger)" }}>
                        {fmt(h.fair_value)}
                      </td>
                      <td style={{ fontWeight: 600, color: h.gain_loss >= 0 ? "var(--success)" : "var(--danger)" }}>
                        {fmt(h.gain_loss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Premium Cost Amortisation */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 13: Premium / Cost Amortisation Schedule</h3>
              <table style={{ width: "100%", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>Deal Reference</th>
                    <th>Option Premium Paid</th>
                    <th>Total Contract Life</th>
                    <th>Months Elapsed</th>
                    <th>Amortised to Date</th>
                    <th>Unamortised Balance</th>
                    <th>Amortisation Accounting Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {hedges.filter(h => h.premium_cost > 0).map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700 }}>Deal #{h.id}</td>
                      <td>{fmt(h.premium_cost)}</td>
                      <td>3 Months</td>
                      <td>1 Month</td>
                      <td>{fmt(h.premium_cost / 3)}</td>
                      <td>{fmt((h.premium_cost / 3) * 2)}</td>
                      <td style={{ color: "var(--slate-soft)" }}>Charged $400.00 to monthly finance cost ledger. No discrepancy.</td>
                    </tr>
                  ))}
                  {hedges.filter(h => h.premium_cost > 0).length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ color: "var(--slate)" }}>No active premium-based option deals.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Restatement Impact */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 14: Restatement Balance Sheet Sensitivity Analysis</h3>
              <p style={{ fontSize: "12.5px", color: "var(--slate-soft)", marginBottom: 14 }}>
                Simulates restatement impact on P&L due to standard +/- shift in base currency rate USD/INR:
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>USD/INR DEPRECIATES 5%</span>
                  <h4 style={{ fontSize: "16px", color: "var(--success)", marginTop: 6 }}>+$124,500 P&L impact</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Export gains outweigh hedge loss</span>
                </div>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>USD/INR STABLE</span>
                  <h4 style={{ fontSize: "16px", color: "var(--navy)", marginTop: 6 }}>$0 P&L impact</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Hedges matched perfectly</span>
                </div>
                <div style={{ background: "var(--canvas)", padding: 14, borderRadius: 6, textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>USD/INR APPRECIATES 5%</span>
                  <h4 style={{ fontSize: "16px", color: "var(--danger)", marginTop: 6 }}>-$124,500 P&L impact</h4>
                  <span style={{ fontSize: "11px", color: "var(--slate-soft)" }}>Hedging covers offset gains</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 5: CONTRACT REVIEW ─── */}
        {activeTab === "Contract Review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Create new Hedge contract */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              <form className="card" style={{ padding: 20 }} onSubmit={addHedge}>
                <h3 style={{ color: "var(--navy)", fontSize: "15px", marginBottom: 14, fontWeight: 700 }}>Book Derivative Hedge Contract</h3>
                
                <div className="field">
                  <label>Contract Type</label>
                  <select
                    className="input"
                    value={hedgeForm.contract_type}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, contract_type: e.target.value })}
                  >
                    <option value="Forward">Forward Contract</option>
                    <option value="Option">Option Contract</option>
                  </select>
                </div>

                <div className="field">
                  <label>Underlying Trade Exposure (Select Invoice Reference)</label>
                  <select
                    className="input"
                    value={hedgeForm.underlying_exposure_id}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, underlying_exposure_id: e.target.value })}
                  >
                    <option value="">No underlying (Speculative Trade)</option>
                    {exposures.filter(e => e.status === "Unhedged").map(e => (
                      <option key={e.id} value={e.id}>
                        Ref #{e.id} ({e.currency_pair} {e.amount.toLocaleString()} - {e.direction})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Contract Coverage Value</label>
                  <input
                    className="input"
                    type="number"
                    value={hedgeForm.amount}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, amount: e.target.value })}
                    placeholder="e.g. 350000"
                    required
                  />
                </div>

                <div className="field">
                  <label>Contract Target Strike Rate</label>
                  <input
                    className="input"
                    type="number"
                    step="0.0001"
                    value={hedgeForm.strike_rate}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, strike_rate: e.target.value })}
                    placeholder="e.g. 83.15"
                    required
                  />
                </div>

                <div className="field">
                  <label>Maturity Delivery Date</label>
                  <input
                    className="input"
                    type="date"
                    value={hedgeForm.maturity_date}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, maturity_date: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label>Broker Counterparty Bank</label>
                  <input
                    className="input"
                    value={hedgeForm.counterparty}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, counterparty: e.target.value })}
                    placeholder="e.g. Citibank"
                  />
                </div>

                <div className="field">
                  <label>Premium Paid (Only for Options)</label>
                  <input
                    className="input"
                    type="number"
                    value={hedgeForm.premium_cost}
                    onChange={(e) => setHedgeForm({ ...hedgeForm, premium_cost: e.target.value })}
                    placeholder="e.g. 1500"
                  />
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={actionBusy}>
                  Book Derivative Position
                </button>
              </form>

              {/* Derivative review ledger */}
              <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", fontWeight: 700 }}>Derivative Deal Verification & Actions</h3>
                
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "12.5px" }}>
                    <thead>
                      <tr>
                        <th>Deal</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Strike</th>
                        <th>Bank Confirmation</th>
                        <th>Status</th>
                        <th>Compliance Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hedges.map((con) => (
                        <tr key={con.id}>
                          <td style={{ fontWeight: 700 }}>Deal #{con.id}</td>
                          <td>{con.contract_type}</td>
                          <td>{fmt(con.amount)}</td>
                          <td>{con.strike_rate}</td>
                          <td>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: 3,
                              fontSize: "10.5px",
                              fontWeight: 600,
                              color: con.bank_confirmation === "Confirmed" ? "var(--success)" : "var(--danger)",
                              background: con.bank_confirmation === "Confirmed" ? "var(--success-tint)" : "var(--danger-tint)"
                            }}>{con.bank_confirmation}</span>
                          </td>
                          <td style={{ fontWeight: 600, color: con.status === "Active" ? "var(--gold-strong)" : "var(--slate-soft)" }}>
                            {con.status}
                          </td>
                          <td>
                            {con.status === "Active" ? (
                              <div style={{ display: "flex", gap: 4 }}>
                                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleHedgeAction(con.id, "rollover")}>
                                  Rollover
                                </button>
                                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }} onClick={() => handleHedgeAction(con.id, "cancel")}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: "11.5px", color: "var(--slate-soft)" }}>Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Speculative Deal Detection */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 11: Speculative Deal Detection</h3>
              <p style={{ fontSize: "12.5px", color: "var(--slate-soft)", marginBottom: 14 }}>
                Speculative transactions are derivatives executed without matching commercial underlying contracts or that exceed board unhedged limits. These are prohibited under standard corporate treasury policy.
              </p>
              
              {speculativeDeals.length === 0 ? (
                <div style={{ color: "var(--success)", fontSize: "13px", fontWeight: 700 }}>✓ All derivative contracts are fully verified against underlying invoices. No speculative trades flagged.</div>
              ) : (
                <table style={{ width: "100%", fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th>Deal</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Strike Rate</th>
                      <th>Banker</th>
                      <th>Maturity</th>
                      <th>Speculative Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speculativeDeals.map((sd) => (
                      <tr key={sd.id} style={{ background: "var(--danger-tint)" }}>
                        <td style={{ fontWeight: 700 }}>Deal #{sd.id}</td>
                        <td>{sd.contract_type}</td>
                        <td>{fmt(sd.amount)}</td>
                        <td>{sd.strike_rate}</td>
                        <td>{sd.counterparty}</td>
                        <td>{sd.maturity_date}</td>
                        <td style={{ color: "var(--danger)", fontWeight: 700 }}>{sd.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* ─── TAB 6: COMPLIANCE ─── */}
        {activeTab === "Compliance" && kpis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 7: FX Board Policy Limit Compliance Dashboard</h3>
              <p style={{ fontSize: "12.5px", color: "var(--slate-soft)", marginBottom: 18 }}>
                Monitors real-time treasury compliance against Board of Directors approved limits:
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 6 }}>
                    <strong>Hedge Coverage Ratio Limit (Min: 60%, Max: 90%)</strong>
                    <span style={{ color: kpis.hedge_coverage_pct < 60 ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                      Current: {kpis.hedge_coverage_pct}% ({kpis.hedge_coverage_pct < 60 ? "BREACHED" : "COMPLIANT"})
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "var(--line-soft)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${kpis.hedge_coverage_pct}%`, height: "100%", background: kpis.hedge_coverage_pct < 60 ? "var(--danger)" : "var(--success)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 6 }}>
                    <strong>Single Broker Concentration Limit (Max: 70%)</strong>
                    <span style={{ color: "var(--success)", fontWeight: 700 }}>Current: 65% (COMPLIANT)</span>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "var(--line-soft)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: "65%", height: "100%", background: "var(--success)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 6 }}>
                    <strong>Derivative Underlyings Validation Ratio (Min: 100%)</strong>
                    <span style={{ color: speculativeDeals.length > 0 ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                      Current: {speculativeDeals.length > 0 ? "90%" : "100%"} ({speculativeDeals.length > 0 ? "BREACHED" : "COMPLIANT"})
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "var(--line-soft)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: speculativeDeals.length > 0 ? "90%" : "100%", height: "100%", background: speculativeDeals.length > 0 ? "var(--danger)" : "var(--success)" }} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 7: DOCUMENTATION VAULT ─── */}
        {activeTab === "Documentation Vault" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              {/* Upload Document Form */}
              <form className="card" style={{ padding: 20 }} onSubmit={uploadDoc}>
                <h3 style={{ color: "var(--navy)", fontSize: "15px", marginBottom: 14, fontWeight: 700 }}>Upload designation & Audit evidence</h3>
                
                <div className="field">
                  <label>Document Title</label>
                  <input
                    className="input"
                    value={docForm.filename}
                    onChange={(e) => setDocForm({ ...docForm, filename: e.target.value })}
                    placeholder="e.g. Citigroup Option cover confirmation"
                    required
                  />
                </div>

                <div className="field">
                  <label>Document Category</label>
                  <select
                    className="input"
                    value={docForm.doc_type}
                    onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                  >
                    <option value="Designation Memo">Designation Memo (Ind AS 109)</option>
                    <option value="Confirmation">Bank confirmation statement</option>
                    <option value="Policy Approval">Board policy limit approval</option>
                  </select>
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={actionBusy}>
                  Upload to Vault
                </button>
              </form>

              {/* Document Listing */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Search Designation Vault & Evidence Files</h3>
                
                <table style={{ width: "100%", fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Document Category</th>
                      <th>Uploaded Time</th>
                      <th>Secured Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 700, color: "var(--gold-strong)" }}>✓ {doc.filename}</td>
                        <td>{doc.doc_type}</td>
                        <td>{doc.uploaded_at}</td>
                        <td style={{ fontFamily: "monospace", color: "var(--slate)" }}>sha256_b78f24a1...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 8: AUDIT FRAMEWORK ─── */}
        {activeTab === "Audit Framework" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Audit Scope / Universe Setup */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 10, fontWeight: 700 }}>Section 17: Scope & Audit Universe</h3>
              <p style={{ fontSize: "12.5px", color: "var(--slate-soft)", marginBottom: 12 }}>
                Define corporate legal entities, business desks, and processes under the scope of current Forex audit:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ background: "var(--canvas)", padding: 12, borderRadius: 6, borderLeft: "3px solid var(--navy)" }}>
                  <strong>Cap Corporate India Pvt Ltd</strong>
                  <p style={{ fontSize: "11.5px", color: "var(--slate)" }}>Treasury Desk: USD/INR hedging operations. Under Scope.</p>
                </div>
                <div style={{ background: "var(--canvas)", padding: 12, borderRadius: 6, borderLeft: "3px solid var(--navy)" }}>
                  <strong>Cap Corporate Europe LLC</strong>
                  <p style={{ fontSize: "11.5px", color: "var(--slate)" }}>Treasury Desk: EUR/USD hedging operations. Under Scope.</p>
                </div>
                <div style={{ background: "var(--canvas)", padding: 12, borderRadius: 6, borderLeft: "3px solid var(--navy)" }}>
                  <strong>Cap Corp Export Desk</strong>
                  <p style={{ fontSize: "11.5px", color: "var(--slate)" }}>Commercial team invoicing system. Under Ingestion.</p>
                </div>
              </div>
            </div>

            {/* Risk & Control Matrix (RCM) */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 18: Risk & Control Matrix (RCM)</h3>
              <table style={{ width: "100%", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>Risk ID</th>
                    <th>Risk Catalogue</th>
                    <th>Key Auditable Control</th>
                    <th>Audit Assertion</th>
                    <th>Control Owner</th>
                    <th>Control Testing Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>R-FX-01</td>
                    <td>FX Derivatives executed without matching business underlyings (speculation)</td>
                    <td>Automatic invoice reference matching check upon derivative booking</td>
                    <td>Existence / Accuracy</td>
                    <td>Risk Manager</td>
                    <td><span style={{ color: "var(--danger)", fontWeight: 700 }}>Exceptions Identified</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>R-FX-02</td>
                    <td>Incorrect valuation of derivatives on balance sheet date</td>
                    <td>System-integrated independent recomputation of fair value MTM</td>
                    <td>Valuation</td>
                    <td>Financial Controller</td>
                    <td><span style={{ color: "var(--success)", fontWeight: 700 }}>Passed</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>R-FX-03</td>
                    <td>Non-compliance with Ind AS 109 hedge documentation rules</td>
                    <td>Mandate designation memo upload within 24 hours of deal execution</td>
                    <td>Completeness / Presentation</td>
                    <td>Head of Treasury</td>
                    <td><span style={{ color: "var(--success)", fontWeight: 700 }}>Passed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rule Config & connectors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              
              {/* Analytics Rule Library */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 12, fontWeight: 700 }}>Section 19: Test & Analytics Rule Library (CAAT)</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>Rule 1: Flag unhedged exposures &gt; $1M</span>
                    <strong>Active (High Severity)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>Rule 2: Flag Ind AS 109 effectiveness &lt; 80%</span>
                    <strong>Active (Medium Severity)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>Rule 3: Flag deals without underlying IDs</span>
                    <strong>Active (Critical Severity)</strong>
                  </div>
                </div>
              </div>

              {/* Connectors */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 12, fontWeight: 700 }}>Section 20: Data Source & API ERP Connectors</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>SAP ERP API Connection</span>
                    <span style={{ color: "var(--success)", fontWeight: 700 }}>● Connected</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>HSBC Banker Daily Treasury Ingest</span>
                    <span style={{ color: "var(--success)", fontWeight: 700 }}>● Connected</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span>Oracle NetSuite Ledger Feed</span>
                    <span style={{ color: "var(--slate-soft)" }}>○ Disconnected</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sampling population builder */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Section 21: Statistical & Judgemental Sampling Builder</h3>
              <form style={{ display: "flex", gap: 18, marginBottom: 16 }} onSubmit={runSampling}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Sampling Methodology</label>
                  <select
                    className="input"
                    value={samplingForm.sampling_type}
                    onChange={(e) => setSamplingForm({ ...samplingForm, sampling_type: e.target.value })}
                  >
                    <option value="statistical">Random Statistical Sampling</option>
                    <option value="judgemental">Judgemental Sampling (Priority to Anomalies)</option>
                  </select>
                </div>
                <div className="field" style={{ width: 140 }}>
                  <label>Sample Population Size</label>
                  <input
                    className="input"
                    type="number"
                    value={samplingForm.sample_size}
                    onChange={(e) => setSamplingForm({ ...samplingForm, sample_size: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit" style={{ marginTop: 22 }}>
                  Extract Audit Samples
                </button>
              </form>

              {samples.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "13px", color: "var(--navy)", marginBottom: 8, fontWeight: 700 }}>Generated Audit Sample Output</h4>
                  <table style={{ width: "100%", fontSize: "12.5px" }}>
                    <thead>
                      <tr>
                        <th>Sample ID</th>
                        <th>Currency Pair</th>
                        <th>Exposure Amount</th>
                        <th>Direction</th>
                        <th>Anomaly Flag</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samples.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>Sample #{s.id}</td>
                          <td>{s.currency_pair}</td>
                          <td>{fmt(s.amount)}</td>
                          <td>{s.direction}</td>
                          <td>{s.is_anomaly ? "YES" : "No"}</td>
                          <td>{s.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── TAB 9: EXCEPTIONS ─── */}
        {activeTab === "Exceptions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Compliance Exceptions & Red-Flag Audit Queue</h3>
              
              <table style={{ width: "100%", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Exception Title</th>
                    <th>Severity</th>
                    <th>Created Time</th>
                    <th>Assigned Auditor</th>
                    <th>Status</th>
                    <th>Clearance Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((exc) => (
                    <tr key={exc.id}>
                      <td style={{ fontWeight: 700 }}>#{exc.id}</td>
                      <td>
                        <strong>{exc.title}</strong>
                        <p style={{ fontSize: "11.5px", color: "var(--slate-soft)", margin: "2px 0" }}>{exc.description}</p>
                      </td>
                      <td>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: "10.5px",
                          fontWeight: 700,
                          color: exc.severity === "Critical" || exc.severity === "High" ? "var(--danger)" : "var(--gold-strong)",
                          background: exc.severity === "Critical" || exc.severity === "High" ? "var(--danger-tint)" : "var(--gold-tint)"
                        }}>{exc.severity}</span>
                      </td>
                      <td>{exc.created_at}</td>
                      <td>{exc.assigned_to}</td>
                      <td style={{ fontWeight: 600, color: exc.status === "Open" ? "var(--danger)" : "var(--success)" }}>
                        {exc.status}
                      </td>
                      <td>
                        {exc.status === "Open" ? (
                          <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => resolveException(exc.id, "Cleared by auditor review")}>
                            Mark Clear
                          </button>
                        ) : (
                          <span style={{ fontSize: "11.5px", color: "var(--success)" }}>Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {exceptions.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ color: "var(--success)", fontWeight: 700, textAlign: "center" }}>✓ No active exception red flags in queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ─── TAB 10: FINDINGS ─── */}
        {activeTab === "Findings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              {/* Add Finding form */}
              <form className="card" style={{ padding: 20 }} onSubmit={addFinding}>
                <h3 style={{ color: "var(--navy)", fontSize: "15px", marginBottom: 14, fontWeight: 700 }}>Record Formal Audit Finding</h3>
                
                <div className="field">
                  <label>Finding Title</label>
                  <input
                    className="input"
                    value={findingForm.title}
                    onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })}
                    placeholder="e.g. Lack of daily hedge confirmation check"
                    required
                  />
                </div>

                <div className="field">
                  <label>Severity</label>
                  <select
                    className="input"
                    value={findingForm.severity}
                    onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="field">
                  <label>Detailed Finding Description</label>
                  <textarea
                    className="input"
                    value={findingForm.description}
                    onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                    style={{ height: 60 }}
                    required
                  />
                </div>

                <div className="field">
                  <label>Root Cause Analysis</label>
                  <textarea
                    className="input"
                    value={findingForm.root_cause}
                    onChange={(e) => setFindingForm({ ...findingForm, root_cause: e.target.value })}
                    style={{ height: 50 }}
                  />
                </div>

                <div className="field">
                  <label>Auditor Recommendation</label>
                  <textarea
                    className="input"
                    value={findingForm.recommendation}
                    onChange={(e) => setFindingForm({ ...findingForm, recommendation: e.target.value })}
                    style={{ height: 50 }}
                  />
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={actionBusy}>
                  Log Audit Finding
                </button>
              </form>

              {/* Findings listing */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Observation & Finding Logs</h3>
                
                {findings.map((fnd) => (
                  <div key={fnd.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "13.5px", color: "var(--navy)" }}>Finding #{fnd.id}: {fnd.title}</strong>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--danger)", background: "var(--danger-tint)", padding: "2px 6px", borderRadius: 4 }}>
                        {fnd.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: "12.5px", color: "var(--navy)", marginTop: 6 }}>{fnd.description}</p>
                    <div style={{ fontSize: "12px", marginTop: 8, background: "var(--canvas)", padding: 8, borderRadius: 4 }}>
                      <span style={{ fontWeight: 600 }}>Root Cause:</span> {fnd.root_cause}
                      <br />
                      <span style={{ fontWeight: 600, color: "var(--success)" }}>Recommendation:</span> {fnd.recommendation}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 11: REMEDIATION TRACKER ─── */}
        {activeTab === "Remediation Tracker" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
              
              {/* Add Action plan */}
              <form className="card" style={{ padding: 20 }} onSubmit={addRemediation}>
                <h3 style={{ color: "var(--navy)", fontSize: "15px", marginBottom: 14, fontWeight: 700 }}>Initiate Remediation CAPA Action</h3>
                
                <div className="field">
                  <label>Select Audit Finding ID</label>
                  <select
                    className="input"
                    value={remediationForm.finding_id}
                    onChange={(e) => setRemediationForm({ ...remediationForm, finding_id: e.target.value })}
                  >
                    <option value="">Select Finding Reference</option>
                    {findings.map((fnd) => (
                      <option key={fnd.id} value={fnd.id}>Finding #{fnd.id} - {fnd.title}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Remediation Action Plan (CAPA)</label>
                  <textarea
                    className="input"
                    value={remediationForm.capa_action}
                    onChange={(e) => setRemediationForm({ ...remediationForm, capa_action: e.target.value })}
                    style={{ height: 60 }}
                    placeholder="e.g. Establish formal checker workflows..."
                    required
                  />
                </div>

                <div className="field">
                  <label>Action Owner</label>
                  <input
                    className="input"
                    value={remediationForm.owner}
                    onChange={(e) => setRemediationForm({ ...remediationForm, owner: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    required
                  />
                </div>

                <div className="field">
                  <label>Remediation Target Due Date</label>
                  <input
                    className="input"
                    type="date"
                    value={remediationForm.due_date}
                    onChange={(e) => setRemediationForm({ ...remediationForm, due_date: e.target.value })}
                    required
                  />
                </div>

                <button className="btn btn-primary btn-block" type="submit" disabled={actionBusy}>
                  Assign Action Plan
                </button>
              </form>

              {/* Remediation actions lists */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "15px", color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Corrective and Preventive Action (CAPA) Logs</h3>
                
                <table style={{ width: "100%", fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th>Finding</th>
                      <th>Remediation CAPA Action</th>
                      <th>Owner</th>
                      <th>Target Date</th>
                      <th>Status</th>
                      <th>Retesting Check</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remediations.map((rem) => (
                      <tr key={rem.id}>
                        <td>Finding #{rem.finding_id}</td>
                        <td>{rem.capa_action}</td>
                        <td><strong>{rem.owner}</strong></td>
                        <td>{rem.due_date}</td>
                        <td style={{ fontWeight: 600, color: rem.status === "Completed" ? "var(--success)" : "var(--gold-strong)" }}>
                          {rem.status}
                        </td>
                        <td>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: rem.retesting_status === "Passed" ? "var(--success)" : rem.retesting_status === "Failed" ? "var(--danger)" : "var(--gold-strong)",
                            background: rem.retesting_status === "Passed" ? "var(--success-tint)" : rem.retesting_status === "Failed" ? "var(--danger-tint)" : "var(--gold-tint)"
                          }}>{rem.retesting_status}</span>
                        </td>
                        <td>
                          {rem.status !== "Completed" ? (
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "10.5px" }} onClick={() => updateRemediationStatus(rem.id, "Completed", "Passed")}>
                                Pass Retest
                              </button>
                              <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "10.5px", color: "var(--danger)" }} onClick={() => updateRemediationStatus(rem.id, "Pending Re-test", "Failed")}>
                                Fail
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--success)" }}>Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 12: SETTINGS ─── */}
        {activeTab === "Settings" && (
          <div className="card" style={{ padding: 22, maxWidth: 600 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>System Configuration Settings</h3>
            
            <div className="field">
              <label>Single Transaction Audit Threshold (USD Equivalent)</label>
              <input className="input" type="number" defaultValue="1000000" />
            </div>

            <div className="field">
              <label>Maximum Permissible Unhedged Ratio</label>
              <input className="input" type="text" defaultValue="30%" />
            </div>

            <div className="field">
              <label>System Evaluation Engine Interval</label>
              <select className="input" defaultValue="Real-time">
                <option value="Real-time">Real-time (On ledger updates)</option>
                <option value="Daily">Daily End-of-Day Batch</option>
                <option value="Weekly">Weekly Auditor Ingestion</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={() => alert("Settings saved successfully (Simulated).")}>
              Save Config
            </button>
          </div>
        )}

        {/* ─── TAB 13: PROFILE ─── */}
        {activeTab === "Profile" && (
          <div className="card" style={{ padding: 22, maxWidth: 500 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14, fontWeight: 700 }}>Auditor Session Registry</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13.5px" }}>
              <div>
                <span style={{ color: "var(--slate-soft)" }}>Audit Organization Tenant ID:</span>
                <strong style={{ marginLeft: 8 }}>Tenant #1 (Demo Workspace)</strong>
              </div>
              <div>
                <span style={{ color: "var(--slate-soft)" }}>Current Session Role:</span>
                <strong style={{ marginLeft: 8, color: "var(--gold-strong)" }}>Auditor (Read/Write Scope)</strong>
              </div>
              <div>
                <span style={{ color: "var(--slate-soft)" }}>Audit Engine Signature Hash:</span>
                <strong style={{ marginLeft: 8, fontFamily: "monospace" }}>fwd_hedging_sha_2.0.41</strong>
              </div>
              <div style={{ marginTop: 14, background: "var(--canvas)", padding: 12, borderRadius: 6, borderLeft: "3px solid var(--gold)" }}>
                <span>This session is protected by row-level tenant security isolation policies. Any actions performed are permanently registered in the system audit trail.</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
