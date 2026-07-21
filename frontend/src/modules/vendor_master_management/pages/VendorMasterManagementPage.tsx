import React, { useState } from "react";

import DashboardPage from "./DashboardPage";
import DuplicateVendorsPage from "./DuplicateVendorsPage";
import BankChangeLogPage from "./BankChangeLogPage";
import KYCValidationPage from "./KYCValidationPage";
import VendorConcentrationPage from "./VendorConcentrationPage";
import ActiveNoTransactionPage from "./ActiveNoTransactionPage";
import VendorEmployeeOverlapPage from "./VendorEmployeeOverlapPage";
import BlacklistScreeningPage from "./BlacklistScreeningPage";
import DuplicateBankAccountsPage from "./DuplicateBankAccountsPage";
import MasterFieldCompletenessPage from "./MasterFieldCompletenessPage";
import ApprovalWorkflowAuditPage from "./ApprovalWorkflowAuditPage";
import VendorCategorisationPage from "./VendorCategorisationPage";
import MSMEValidationPage from "./MSMEValidationPage";
import ChangeFrequencyPage from "./ChangeFrequencyPage";
import RelatedPartyVendorsPage from "./RelatedPartyVendorsPage";
import VendorDeactivationPage from "./VendorDeactivationPage";
import ScopeAuditUniversePage from "./ScopeAuditUniversePage";
import RiskControlMatrixPage from "./RiskControlMatrixPage";
import RuleLibraryPage from "./RuleLibraryPage";
import DataSourceSetupPage from "./DataSourceSetupPage";
import SamplingBuilderPage from "./SamplingBuilderPage";
import ExceptionQueuePage from "./ExceptionQueuePage";
import WorkingPapersPage from "./WorkingPapersPage";
import ObservationLogPage from "./ObservationLogPage";
import ActionTrackerPage from "./ActionTrackerPage";

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
    title: "Signature Analytics",
    icon: "🔍",
    items: [
      { key: "duplicate", label: "Duplicate Vendors" },
      { key: "bank-changes", label: "Bank Detail Change Log" },
      { key: "kyc", label: "KYC & GST Validation" },
      { key: "concentration", label: "Vendor Concentration" },
      { key: "no-transactions", label: "Active but No Transaction" },
      { key: "employee-overlap", label: "Vendor Employee Overlap" },
      { key: "blacklist", label: "Blacklist Screening" },
      { key: "duplicate-bank", label: "Duplicate Bank Accounts" },
      { key: "completeness", label: "Master Field Completeness" },
      { key: "approval", label: "Approval Workflow Audit" },
      { key: "category", label: "Vendor Categorisation" },
      { key: "msme", label: "MSME Validation" },
      { key: "change-frequency", label: "Change Frequency Analytics" },
      { key: "related-party", label: "Related Party Vendors" },
      { key: "deactivation", label: "Vendor Deactivation" },
    ],
  },
  {
    title: "Audit Workspace",
    icon: "📋",
    items: [
      { key: "scope", label: "Scope & Audit Universe" },
      { key: "rcm", label: "Risk & Control Matrix" },
      { key: "rules", label: "Rule Library" },
      { key: "data-source", label: "Data Source Setup" },
      { key: "sampling", label: "Sampling Builder" },
      { key: "exceptions", label: "Exception Queue" },
      { key: "working-papers", label: "Working Papers" },
      { key: "observations", label: "Observation Log" },
      { key: "actions", label: "Action Tracker" },
    ],
  },
];

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  duplicate: DuplicateVendorsPage,
  "bank-changes": BankChangeLogPage,
  kyc: KYCValidationPage,
  concentration: VendorConcentrationPage,
  "no-transactions": ActiveNoTransactionPage,
  "employee-overlap": VendorEmployeeOverlapPage,
  blacklist: BlacklistScreeningPage,
  "duplicate-bank": DuplicateBankAccountsPage,
  completeness: MasterFieldCompletenessPage,
  approval: ApprovalWorkflowAuditPage,
  category: VendorCategorisationPage,
  msme: MSMEValidationPage,
  "change-frequency": ChangeFrequencyPage,
  "related-party": RelatedPartyVendorsPage,
  deactivation: VendorDeactivationPage,
  scope: ScopeAuditUniversePage,
  rcm: RiskControlMatrixPage,
  rules: RuleLibraryPage,
  "data-source": DataSourceSetupPage,
  sampling: SamplingBuilderPage,
  exceptions: ExceptionQueuePage,
  "working-papers": WorkingPapersPage,
  observations: ObservationLogPage,
  actions: ActionTrackerPage,
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

export default function VendorMasterManagementPage() {
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
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--gold)" }}>Vendor Master</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Management Module</div>
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
