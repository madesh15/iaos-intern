import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "../../lib/api";
import ComplianceRegistryView from "./ComplianceRegistryView";
import AnalyticsCalculatorView from "./AnalyticsCalculatorView";
import StandardAuditShellView from "./StandardAuditShellView";

interface SubPageConfig {
  id: string;
  name: string;
  category: string;
  viewType: "registry" | "calculator" | "shell";
  registryType?: string;
}

const SUB_PAGES: SubPageConfig[] = [
  // Category 1: Applicability & Coverage
  { id: "clra-app", name: "CLRA Applicability Mapping", category: "Applicability & Coverage", viewType: "registry", registryType: "applicability" },
  { id: "pf-esi-cov", name: "PF/ESI Coverage Mapping", category: "Applicability & Coverage", viewType: "registry", registryType: "applicability" },
  { id: "shops-est", name: "Shops & Establishments Mapping", category: "Applicability & Coverage", viewType: "registry", registryType: "applicability" },

  // Category 2: Licensing & Approvals
  { id: "contractor-lic", name: "Contractor License Tracking", category: "Licensing & Approvals", viewType: "registry", registryType: "licence" },

  // Category 3: Wages & Benefits Audit
  { id: "min-wage-audit", name: "Minimum Wage Reconciliation", category: "Wages & Benefits Audit", viewType: "calculator" },

  // Category 4: Statutory Registers
  { id: "form-d-muster", name: "Form D (Muster Roll) Register", category: "Statutory Registers", viewType: "registry", registryType: "registers" },
  { id: "form-c-bonus", name: "Form C (Bonus) Register", category: "Statutory Registers", viewType: "registry", registryType: "registers" },
  { id: "form-i-ii-fines", name: "Form I & II (Fines/Deductions)", category: "Statutory Registers", viewType: "registry", registryType: "registers" },

  // Category 5: Contractor PF/ESI Verification
  { id: "ecr-challan-audit", name: "ECR Challan Validation", category: "Contractor PF/ESI Verification", viewType: "calculator" },

  // Category 6: Notices & Returns
  { id: "form-v-notice", name: "Form V Notice of Commencement", category: "Notices & Returns", viewType: "registry", registryType: "notices" },
  { id: "annual-return", name: "Annual Return Form XXV", category: "Notices & Returns", viewType: "registry", registryType: "notices" },
  { id: "notice-boards", name: "Notice Board Displays", category: "Notices & Returns", viewType: "registry", registryType: "notices" },
  { id: "maternity-ben", name: "Maternity Benefit Register", category: "Notices & Returns", viewType: "registry", registryType: "registers" },
  { id: "equal-remun", name: "Equal Remuneration Register", category: "Notices & Returns", viewType: "registry", registryType: "registers" },
  { id: "gratuity-notice", name: "Gratuity Form U Notice", category: "Notices & Returns", viewType: "registry", registryType: "notices" },

  // Category 7: Audit Planning & RCM
  { id: "rcm-matrix", name: "Risk Control Matrix (RCM)", category: "Audit Planning & RCM", viewType: "shell" },
  { id: "rule-library", name: "Compliance Rule Library", category: "Audit Planning & RCM", viewType: "shell" },
  { id: "sampling-builder", name: "Sample Builder & Selector", category: "Audit Planning & RCM", viewType: "shell" },
  { id: "evidence-vault", name: "Evidence Digital Vault", category: "Audit Planning & RCM", viewType: "shell" },

  // Category 8: Findings & Remediation
  { id: "risk-dashboard", name: "Live Risk Dashboard", category: "Findings & Remediation", viewType: "shell" },
  { id: "finding-logs", name: "Non-Compliance Finding Logs", category: "Findings & Remediation", viewType: "shell" },
  { id: "capa-tracker", name: "CAPA Action Tracking", category: "Findings & Remediation", viewType: "shell" },
  { id: "defaulter-escalation", name: "PF/ESI Defaulter Escalations", category: "Findings & Remediation", viewType: "shell" },
  { id: "underpayment-recovery", name: "Under-payment Recovery Register", category: "Findings & Remediation", viewType: "shell" },
  { id: "compliance-cert", name: "Compliance Certification", category: "Findings & Remediation", viewType: "shell" }
];

const CATEGORIES = [
  "Applicability & Coverage",
  "Licensing & Approvals",
  "Wages & Benefits Audit",
  "Statutory Registers",
  "Contractor PF/ESI Verification",
  "Notices & Returns",
  "Audit Planning & RCM",
  "Findings & Remediation"
];

interface SummaryStats {
  live_risk_index: number;
  coverage_pct: number;
  open_exception_count: number;
  pending_capa_count: number;
}

export default function LabourLawPfEsiPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSub = searchParams.get("sub") || "dashboard";
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<SummaryStats>({
    live_risk_index: 100.0,
    coverage_pct: 100.0,
    open_exception_count: 0,
    pending_capa_count: 0
  });

  async function loadSummary() {
    try {
      const data = await get<SummaryStats>("/api/modules/labour_law_pf_esi/dashboard-summary");
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary stats", err);
    }
  }

  useEffect(() => {
    loadSummary();
  }, [currentSub]);

  // Debounced/Immediate Search filtering for the sidebar
  const filteredSubPages = SUB_PAGES.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPageConfig = SUB_PAGES.find(p => p.id === currentSub);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
      {/* Dynamic Glassmorphic KPI Header */}
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          padding: "20px 24px",
          background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-deep) 100%)",
          color: "#fff",
          border: "none"
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>Module 36: Labour Law & PF/ESI Compliance</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 13, marginTop: 4 }}>
            Tax, Legal & Compliance Domain • Cap Corporate Platform
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ textAlign: "right", borderRight: "1px solid rgba(255, 255, 255, 0.15)", paddingRight: 20 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Live Risk Index</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: summary.live_risk_index >= 90 ? "#38ef7d" : summary.live_risk_index >= 70 ? "#ffb347" : "#ff4d4d" }}>
              {summary.live_risk_index}/100
            </div>
          </div>
          <div style={{ textAlign: "right", borderRight: "1px solid rgba(255, 255, 255, 0.15)", paddingRight: 20 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Compliance Coverage</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#38ef7d" }}>{summary.coverage_pct}%</div>
          </div>
          <div style={{ textAlign: "right", borderRight: "1px solid rgba(255, 255, 255, 0.15)", paddingRight: 20 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Open Exceptions</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: summary.open_exception_count > 0 ? "#ff4d4d" : "#38ef7d" }}>
              {summary.open_exception_count}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Pending CAPA</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: summary.pending_capa_count > 0 ? "#ffb347" : "#38ef7d" }}>
              {summary.pending_capa_count}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, flex: 1, minHeight: 0 }}>
        {/* Left Sidebar Menu */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            padding: 16,
            overflowY: "auto"
          }}
        >
          {/* Search bar */}
          <div style={{ marginBottom: 16 }}>
            <input
              className="input"
              type="text"
              placeholder="Search 25 sub-pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: 13, padding: "8px 12px" }}
            />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Dashboard Link */}
            <button
              onClick={() => setSearchParams({ sub: "dashboard" })}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 600,
                color: currentSub === "dashboard" ? "var(--navy)" : "var(--slate)",
                backgroundColor: currentSub === "dashboard" ? "var(--navy-tint)" : "transparent",
                transition: "all 0.15s ease"
              }}
            >
              📊 Core Dashboard
            </button>

            {CATEGORIES.map(category => {
              const pagesInCategory = filteredSubPages.filter(p => p.category === category);
              if (pagesInCategory.length === 0) return null;
              return (
                <div key={category} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--slate-soft)",
                      paddingLeft: 12,
                      marginBottom: 2
                    }}
                  >
                    {category}
                  </span>
                  {pagesInCategory.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSearchParams({ sub: page.id })}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        fontWeight: currentSub === page.id ? "600" : "500",
                        color: currentSub === page.id ? "var(--navy)" : "var(--slate)",
                        backgroundColor: currentSub === page.id ? "var(--navy-tint)" : "transparent",
                        marginLeft: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "all 0.12s ease"
                      }}
                      title={page.name}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content Pane */}
        <div style={{ overflowY: "auto", paddingRight: 4 }}>
          {currentSub === "dashboard" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Summary Cards */}
              <div className="card" style={{ padding: 24, background: "var(--surface)" }}>
                <h3 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 8 }}>Welcome to the Labour Compliance Console</h3>
                <p style={{ color: "var(--slate)", fontSize: 14, lineHeight: 1.6 }}>
                  This dashboard consolidates Labour laws, Employees' Provident Fund (EPF), and Employees' State Insurance (ESIC) compliance details. Use the navigation panel on the left to verify statutory checklists, run automated rules comparison audits on contractors, or track CAPA action items to resolution.
                </p>
              </div>

              {/* Warnings/Overview Alerts Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h4 style={{ fontSize: 15, color: "var(--navy)", marginBottom: 12 }}>Compliance Registry Status Overview</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>Applicability Checks</span>
                      <span style={{ fontWeight: 600, color: "var(--success)" }}>100% Compliant</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>Contractor Licences</span>
                      <span style={{ fontWeight: 600, color: "var(--gold-strong)" }}>Pending Renewal</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>Registers Maintained</span>
                      <span style={{ fontWeight: 600, color: "var(--success)" }}>Form A, C & D Compliant</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>Notices & Posters</span>
                      <span style={{ fontWeight: 600, color: "var(--danger)" }}>1 Non-Compliance</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 20, borderLeft: "4px solid var(--danger)" }}>
                  <h4 style={{ fontSize: 15, color: "var(--navy)", marginBottom: 12 }}>Unresolved Audit Red Flags</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {summary.open_exception_count > 0 ? (
                      <>
                        <div style={{ background: "var(--danger-tint)", padding: 10, borderRadius: 8, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>
                          ⚠️ Critical wage rate compliance violations under review. Action required.
                        </div>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "8px 12px", fontSize: 12, width: "fit-content" }}
                          onClick={() => setSearchParams({ sub: "finding-logs" })}
                        >
                          View Finding Logs
                        </button>
                      </>
                    ) : (
                      <p style={{ color: "var(--success)", fontSize: 13 }}>
                        ✅ All compliance parameters resolved. Zero open exceptions.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedPageConfig?.viewType === "registry" ? (
            <ComplianceRegistryView
              registryType={selectedPageConfig.registryType!}
              title={selectedPageConfig.name}
              onMutation={loadSummary}
            />
          ) : selectedPageConfig?.viewType === "calculator" ? (
            <AnalyticsCalculatorView
              calculatorType={selectedPageConfig.id as any}
              onExceptionGenerated={loadSummary}
            />
          ) : selectedPageConfig?.viewType === "shell" ? (
            <StandardAuditShellView
              subPage={selectedPageConfig.id}
              onMutation={loadSummary}
            />
          ) : (
            <p style={{ color: "var(--slate)" }}>Page not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
