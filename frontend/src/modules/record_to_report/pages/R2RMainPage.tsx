import React, { useState } from "react";

import DashboardPage from "./DashboardPage";
import JournalExplorerPage from "./JournalExplorerPage";
import JournalUploadPage from "./JournalUploadPage";
import RiskOverviewPage from "./RiskOverviewPage";
import ManualRiskPage from "./ManualRiskPage";
import OddHourPage from "./OddHourPage";
import BlankNarrationPage from "./BlankNarrationPage";
import SensitiveAccountsPage from "./SensitiveAccountsPage";
import TopValuePage from "./TopValuePage";
import SuspenseAgeingPage from "./SuspenseAgeingPage";
import PostClosePage from "./PostClosePage";
import RoundNumberPage from "./RoundNumberPage";
import SODPage from "./SODPage";
import RecurringPage from "./RecurringPage";
import ReversalPage from "./ReversalPage";
import IntercompanyPage from "./IntercompanyPage";
import CloseCalendarPage from "./CloseCalendarPage";
import ReconciliationPage from "./ReconciliationPage";
import GLSubledgerPage from "./GLSubledgerPage";
import ScopePage from "./ScopePage";
import RCMPage from "./RCMPage";
import RuleLibraryPage from "./RuleLibraryPage";
import SamplingPage from "./SamplingPage";
import ExceptionQueuePage from "./ExceptionQueuePage";
import WorkpapersPage from "./WorkpapersPage";
import ObservationLogPage from "./ObservationLogPage";
import ActionTrackerPage from "./ActionTrackerPage";
import SettingsPage from "./SettingsPage";

interface NavItem {
  key: string;
  label: string;
}

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Dashboard",
    icon: "📊",
    items: [{ key: "dashboard", label: "Dashboard" }],
  },
  {
    title: "Journal Management",
    icon: "📒",
    items: [
      { key: "upload", label: "Journal Upload" },
      { key: "explorer", label: "Journal Explorer" },
    ],
  },
  {
    title: "Risk Analysis",
    icon: "🔴",
    items: [
      { key: "risk-overview", label: "Risk Overview" },
      { key: "manual-risk", label: "Manual JE Risk" },
      { key: "odd-hour", label: "Odd Hour Posting" },
      { key: "blank-narration", label: "Blank Narration" },
      { key: "sensitive", label: "Sensitive Accounts" },
      { key: "top-value", label: "Top Value JEs" },
      { key: "suspense-ageing", label: "Suspense Ageing" },
      { key: "post-close", label: "Post Close Entries" },
      { key: "round-number", label: "Round Number Detection" },
      { key: "sod", label: "SOD Violations" },
      { key: "recurring", label: "Recurring JEs" },
      { key: "reversal", label: "Reversal Pattern" },
      { key: "intercompany", label: "Intercompany Elimination" },
    ],
  },
  {
    title: "Close & Reconciliation",
    icon: "📋",
    items: [
      { key: "close-calendar", label: "Close Calendar" },
      { key: "reconciliation", label: "Account Reconciliation" },
      { key: "gl-subledger", label: "GL vs Subledger" },
    ],
  },
  {
    title: "Audit Workspace",
    icon: "🔍",
    items: [
      { key: "scope", label: "Scope Management" },
      { key: "rcm", label: "Risk Control Matrix" },
      { key: "rules", label: "Rule Library" },
      { key: "sampling", label: "Sampling" },
      { key: "exceptions", label: "Exception Queue" },
      { key: "workpapers", label: "Working Papers" },
      { key: "observations", label: "Observation Log" },
      { key: "actions", label: "Action Tracker" },
    ],
  },
  {
    title: "Settings",
    icon: "⚙️",
    items: [{ key: "settings", label: "Settings" }],
  },
];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem" }}>{title}</h2>
      <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--slate)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚧</div>
        <div>This section is under development</div>
      </div>
    </div>
  );
}

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  upload: JournalUploadPage,
  explorer: JournalExplorerPage,
  "risk-overview": RiskOverviewPage,
  "manual-risk": ManualRiskPage,
  "odd-hour": OddHourPage,
  "blank-narration": BlankNarrationPage,
  sensitive: SensitiveAccountsPage,
  "top-value": TopValuePage,
  "suspense-ageing": SuspenseAgeingPage,
  "post-close": PostClosePage,
  "round-number": RoundNumberPage,
  sod: SODPage,
  recurring: RecurringPage,
  reversal: ReversalPage,
  intercompany: IntercompanyPage,
  "close-calendar": CloseCalendarPage,
  reconciliation: ReconciliationPage,
  "gl-subledger": GLSubledgerPage,
  scope: ScopePage,
  rcm: RCMPage,
  rules: RuleLibraryPage,
  sampling: SamplingPage,
  exceptions: ExceptionQueuePage,
  workpapers: WorkpapersPage,
  observations: ObservationLogPage,
  actions: ActionTrackerPage,
  settings: SettingsPage,
};

const styles = {
  wrapper: { display: "flex", minHeight: "calc(100vh - 60px)" } as React.CSSProperties,
  sidebar: {
    width: 280,
    minWidth: 280,
    background: "var(--navy-deep)",
    color: "#fff",
    overflowY: "auto",
    padding: "0.75rem 0",
  } as React.CSSProperties,
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 1.25rem",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.45)",
    cursor: "pointer",
    userSelect: "none" as const,
  } as React.CSSProperties,
  navItem: (active: boolean) =>
    ({
      display: "block",
      padding: "0.45rem 1.25rem 0.45rem 2.25rem",
      fontSize: "0.8rem",
      color: active ? "var(--gold)" : "rgba(255,255,255,0.7)",
      background: active ? "rgba(212,168,67,0.1)" : "transparent",
      borderLeft: active ? "3px solid var(--gold)" : "3px solid transparent",
      cursor: "pointer",
      transition: "all 0.15s",
      textDecoration: "none" as const,
    }) as React.CSSProperties,
  content: {
    flex: 1,
    background: "var(--canvas)",
    padding: "1.5rem",
    overflowY: "auto",
    minWidth: 0,
  } as React.CSSProperties,
};

export default function R2RMainPage() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const PageComponent = PAGE_MAP[active] || DashboardPage;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.sidebar}>
        <div style={{ padding: "0.75rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--gold)" }}>Record to Report</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Internal Audit Module</div>
        </div>

        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsed[section.title] ?? (section.title !== "Dashboard");
          return (
            <div key={section.title}>
              <div style={styles.sectionTitle} onClick={() => toggleSection(section.title)}>
                <span>{section.icon}</span>
                <span style={{ flex: 1 }}>{section.title}</span>
                <span style={{ fontSize: "0.65rem" }}>{isCollapsed ? "▶" : "▼"}</span>
              </div>
              {(!isCollapsed || section.title === "Dashboard") &&
                section.items.map((item) => (
                  <div
                    key={item.key}
                    style={styles.navItem(active === item.key)}
                    onClick={() => setActive(item.key)}
                  >
                    {item.label}
                  </div>
                ))}
            </div>
          );
        })}
      </nav>

      <main style={styles.content}>
        <PageComponent />
      </main>
    </div>
  );
}
