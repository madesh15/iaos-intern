import { useState, lazy, Suspense } from "react";
import { Icon } from "../../components/Icon";

const ReraEscrowView = lazy(() => import("./views/ReraEscrowView"));
const BudgetControlView = lazy(() => import("./views/BudgetControlView"));
const WithdrawalCertView = lazy(() => import("./views/WithdrawalCertView"));
const FundDiversionView = lazy(() => import("./views/FundDiversionView"));
const BuyerCollectionView = lazy(() => import("./views/BuyerCollectionView"));
const RevenueRecognitionView = lazy(() => import("./views/RevenueRecognitionView"));
const CostToCompleteView = lazy(() => import("./views/CostToCompleteView"));
const ContractorBillView = lazy(() => import("./views/ContractorBillView"));
const ApprovalSanctionView = lazy(() => import("./views/ApprovalSanctionView"));
const UnsoldInventoryView = lazy(() => import("./views/UnsoldInventoryView"));
const CustomerAdvanceView = lazy(() => import("./views/CustomerAdvanceView"));
const RegistrationPossessionView = lazy(() => import("./views/RegistrationPossessionView"));
const InterestPenaltyView = lazy(() => import("./views/InterestPenaltyView"));
const LandCostTitleView = lazy(() => import("./views/LandCostTitleView"));
const ProjectCashflowView = lazy(() => import("./views/ProjectCashflowView"));
const ModuleDashboardView = lazy(() => import("./views/ModuleDashboardView"));
const ScopeUniverseView = lazy(() => import("./views/ScopeUniverseView"));
const RCMView = lazy(() => import("./views/RCMView"));
const RuleLibraryView = lazy(() => import("./views/RuleLibraryView"));
const DataSourceView = lazy(() => import("./views/DataSourceView"));
const SamplingBuilderView = lazy(() => import("./views/SamplingBuilderView"));
const ExceptionQueueView = lazy(() => import("./views/ExceptionQueueView"));
const WorkingPapersView = lazy(() => import("./views/WorkingPapersView"));
const FindingLogView = lazy(() => import("./views/FindingLogView"));
const ActionTrackerView = lazy(() => import("./views/ActionTrackerView"));

interface SubPage {
  id: number;
  name: string;
  category: "core" | "framework";
  view: React.ComponentType;
}

const SUB_PAGES: SubPage[] = [
  { id: 1, name: "RERA Escrow Compliance", category: "core", view: ReraEscrowView },
  { id: 2, name: "Project-Cost Budget Control", category: "core", view: BudgetControlView },
  { id: 3, name: "Withdrawal-Certificate Validation", category: "core", view: WithdrawalCertView },
  { id: 4, name: "Fund-Diversion Detection", category: "core", view: FundDiversionView },
  { id: 5, name: "Buyer-Collection Tracking", category: "core", view: BuyerCollectionView },
  { id: 6, name: "Revenue Recognition (Ind AS 115)", category: "core", view: RevenueRecognitionView },
  { id: 7, name: "Cost-to-Complete Estimate", category: "core", view: CostToCompleteView },
  { id: 8, name: "Contractor / RA-Bill Certification", category: "core", view: ContractorBillView },
  { id: 9, name: "Approval & Sanction Compliance", category: "core", view: ApprovalSanctionView },
  { id: 10, name: "Unsold-Inventory Valuation", category: "core", view: UnsoldInventoryView },
  { id: 11, name: "Customer-Advance Ageing", category: "core", view: CustomerAdvanceView },
  { id: 12, name: "Registration & Possession", category: "core", view: RegistrationPossessionView },
  { id: 13, name: "Interest / Penalty to Buyers", category: "core", view: InterestPenaltyView },
  { id: 14, name: "Land-Cost & Title", category: "core", view: LandCostTitleView },
  { id: 15, name: "Project-Cashflow Monitoring", category: "core", view: ProjectCashflowView },
  { id: 16, name: "Module Dashboard & KPIs", category: "framework", view: ModuleDashboardView },
  { id: 17, name: "Scope & Audit Universe", category: "framework", view: ScopeUniverseView },
  { id: 18, name: "Risk & Control Matrix (RCM)", category: "framework", view: RCMView },
  { id: 19, name: "Test & Analytics Rule Library", category: "framework", view: RuleLibraryView },
  { id: 20, name: "Data Source & Connector Setup", category: "framework", view: DataSourceView },
  { id: 21, name: "Sampling & Population Builder", category: "framework", view: SamplingBuilderView },
  { id: 22, name: "Exception & Red-Flag Queue", category: "framework", view: ExceptionQueueView },
  { id: 23, name: "Working Papers & Evidence", category: "framework", view: WorkingPapersView },
  { id: 24, name: "Observation & Finding Log", category: "framework", view: FindingLogView },
  { id: 25, name: "Remediation / Action Tracker", category: "framework", view: ActionTrackerView },
];

export default function ProjectCostReraPage() {
  const [selectedPageId, setSelectedPageId] = useState<number>(16);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({ core: true, framework: true });

  const activeSubPage = SUB_PAGES.find((p) => p.id === selectedPageId) || SUB_PAGES[15];
  const ActiveView = activeSubPage.view;

  const filteredPages = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const corePages = filteredPages.filter((p) => p.category === "core");
  const frameworkPages = filteredPages.filter((p) => p.category === "framework");

  return (
    <div style={{ display: "flex", gap: 24, minHeight: "calc(100vh - 180px)", alignItems: "flex-start" }}>
      <style>{`
        .inner-subnav-btn {
          text-align: left;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          font-weight: 500;
          background: transparent;
          color: var(--slate);
          transition: all 0.1s ease;
          cursor: pointer;
          display: block;
          width: 100%;
          border: none;
        }
        .inner-subnav-btn:hover {
          background: var(--line-soft) !important;
          color: var(--navy);
        }
        .inner-subnav-btn.active {
          font-weight: 600;
          background: var(--navy-tint) !important;
          color: var(--navy) !important;
        }
      `}</style>

      <div
        className="card"
        style={{
          width: 300,
          flexShrink: 0,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "calc(100vh - 160px)",
          position: "sticky",
          top: 20,
          overflowY: "auto",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            className="input"
            style={{ paddingLeft: 36, fontSize: 13.5 }}
            placeholder="Search sub-pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ position: "absolute", left: 12, top: 12, color: "var(--slate-soft)", display: "flex" }}>
            <Icon name="dashboard" size={16} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, core: !g.core }))}
              style={{
                display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between",
                padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "var(--slate)",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer",
              }}
            >
              <span>Real Estate Core ({corePages.length})</span>
              <Icon name="chevron-right" size={14} style={{ transform: expandedGroups.core ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }} />
            </button>
            {expandedGroups.core && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {corePages.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPageId(p.id)} className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}>
                    {p.id}. {p.name}
                  </button>
                ))}
                {corePages.length === 0 && <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>No matching pages</span>}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, framework: !g.framework }))}
              style={{
                display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between",
                padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "var(--slate)",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer",
              }}
            >
              <span>Audit Framework ({frameworkPages.length})</span>
              <Icon name="chevron-right" size={14} style={{ transform: expandedGroups.framework ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }} />
            </button>
            {expandedGroups.framework && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {frameworkPages.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPageId(p.id)} className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}>
                    {p.id}. {p.name}
                  </button>
                ))}
                {frameworkPages.length === 0 && <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>No matching pages</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <span className="badge badge-slate" style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>
            {activeSubPage.category === "core" ? "Real Estate Core" : "Audit & Compliance Framework"} — Page {activeSubPage.id}
          </span>
          <h2 style={{ color: "var(--navy)" }}>{activeSubPage.name}</h2>
        </div>

        <Suspense fallback={<div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading audit workspace...</div>}>
          <ActiveView />
        </Suspense>
      </div>
    </div>
  );
}
