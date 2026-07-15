import { useState } from "react";
import ChangeLogTab from "./tabs/ChangeLog";
import GovernanceControlsTab from "./tabs/GovernanceControls";
import AnalyticsQualityTab from "./tabs/AnalyticsQuality";
import DashboardKPIsTab from "./tabs/DashboardKPIs";
import AuditFrameworkTab from "./tabs/AuditFramework";

type Tab =
  | "critical_field" | "coa" | "cost_centre" | "bank"
  | "maker_checker" | "after_hours" | "orphan" | "bulk_upload" | "field_access"
  | "quality" | "duplicates" | "reference" | "ageing" | "reconciliation" | "alerting"
  | "dashboard"
  | "scope" | "rcm" | "rules" | "data_sources" | "sampling"
  | "exceptions" | "working_papers" | "findings" | "remediation";

interface TabDef { key: Tab; label: string; group: string }

const TABS: TabDef[] = [
  { key: "critical_field", label: "1. Critical-Field Change Log", group: "Change Tracking" },
  { key: "coa", label: "2. Chart-of-Accounts Governance", group: "Change Tracking" },
  { key: "cost_centre", label: "3. Cost-Centre / Profit-Centre", group: "Change Tracking" },
  { key: "bank", label: "4. Bank-Master Governance", group: "Change Tracking" },
  { key: "maker_checker", label: "5. Maker-Checker Enforcement", group: "Governance Controls" },
  { key: "after_hours", label: "6. After-Hours Changes", group: "Governance Controls" },
  { key: "orphan", label: "7. Orphan / Unmapped Records", group: "Governance Controls" },
  { key: "bulk_upload", label: "8. Bulk-Upload Controls", group: "Governance Controls" },
  { key: "field_access", label: "9. Field-Level Access Review", group: "Governance Controls" },
  { key: "quality", label: "10. Data-Quality Scorecard", group: "Analytics & Quality" },
  { key: "duplicates", label: "11. Duplicate Detection", group: "Analytics & Quality" },
  { key: "reference", label: "12. Reference-Data Consistency", group: "Analytics & Quality" },
  { key: "ageing", label: "13. Change-Approval Ageing", group: "Analytics & Quality" },
  { key: "reconciliation", label: "14. Master Reconciliation", group: "Analytics & Quality" },
  { key: "alerting", label: "15. Sensitive-Change Alerting", group: "Analytics & Quality" },
  { key: "dashboard", label: "16. Dashboard & KPIs", group: "Dashboard" },
  { key: "scope", label: "17. Scope & Audit Universe", group: "Audit Framework" },
  { key: "rcm", label: "18. Risk & Control Matrix", group: "Audit Framework" },
  { key: "rules", label: "19. Test Rule Library", group: "Audit Framework" },
  { key: "data_sources", label: "20. Data Source Setup", group: "Audit Framework" },
  { key: "sampling", label: "21. Sampling & Population", group: "Audit Framework" },
  { key: "exceptions", label: "22. Exception & Red-Flag Queue", group: "Audit Framework" },
  { key: "working_papers", label: "23. Working Papers & Evidence", group: "Audit Framework" },
  { key: "findings", label: "24. Observation & Finding Log", group: "Audit Framework" },
  { key: "remediation", label: "25. Remediation / Action Tracker", group: "Audit Framework" },
];

const GROUPS = ["Change Tracking", "Governance Controls", "Analytics & Quality", "Dashboard", "Audit Framework"];

export default function MasterDataChangeGovernancePage() {
  const [active, setActive] = useState<Tab>("dashboard");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(g: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  }

  function renderContent() {
    if (active === "dashboard") return <DashboardKPIsTab />;

    const changeTabs: Tab[] = ["critical_field", "coa", "cost_centre", "bank"];
    if (changeTabs.includes(active)) return <ChangeLogTab subTab={active as any} />;

    const govTabs: Tab[] = ["maker_checker", "after_hours", "orphan", "bulk_upload", "field_access"];
    if (govTabs.includes(active)) return <GovernanceControlsTab subTab={active as any} />;

    const analyticsTabs: Tab[] = ["quality", "duplicates", "reference", "ageing", "reconciliation", "alerting"];
    if (analyticsTabs.includes(active)) return <AnalyticsQualityTab subTab={active as any} />;

    const frameworkTabs: Tab[] = ["scope", "rcm", "rules", "data_sources", "sampling", "exceptions", "working_papers", "findings", "remediation"];
    if (frameworkTabs.includes(active)) return <AuditFrameworkTab subTab={active as any} />;

    return <DashboardKPIsTab />;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: "var(--navy)", margin: 0 }}>Master Data Change Governance</h2>
        <p style={{ color: "var(--slate)", margin: "4px 0 0", fontSize: 14 }}>
          Cross-cutting oversight of critical master data with change control and integrity analytics.
        </p>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar navigation */}
        <nav style={{ width: 260, flexShrink: 0 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {GROUPS.map((g) => {
              const groupTabs = TABS.filter((t) => t.group === g);
              const collapsed = collapsedGroups.has(g);
              return (
                <div key={g}>
                  <button
                    onClick={() => toggleGroup(g)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "10px 14px", background: "var(--navy)", color: "#fff",
                      border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {collapsed ? "▸" : "▾"} {g}
                  </button>
                  {!collapsed && groupTabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActive(t.key)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "8px 14px 8px 24px",
                        background: active === t.key ? "var(--accent, #e0e7ff)" : "transparent",
                        color: active === t.key ? "var(--navy)" : "var(--text, #334155)",
                        border: "none", borderLeft: active === t.key ? "3px solid var(--navy)" : "3px solid transparent",
                        cursor: "pointer", fontSize: 13, fontWeight: active === t.key ? 600 : 400,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
