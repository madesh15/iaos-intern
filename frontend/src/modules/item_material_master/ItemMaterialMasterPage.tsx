import { useState, lazy, Suspense } from "react";
import { Icon } from "../../components/Icon";

const DashboardView = lazy(() => import("./views/DashboardView"));
const DuplicateDetectionView = lazy(() => import("./views/DuplicateDetectionView"));
const HSNValidationView = lazy(() => import("./views/HSNValidationView"));
const ValuationIntegrityView = lazy(() => import("./views/ValuationIntegrityView"));
const UOMConsistencyView = lazy(() => import("./views/UOMConsistencyView"));
const ObsoleteBlockedView = lazy(() => import("./views/ObsoleteBlockedView"));
const MasterCompletenessView = lazy(() => import("./views/MasterCompletenessView"));
const CostChangesView = lazy(() => import("./views/CostChangesView"));
const ReorderGovernanceView = lazy(() => import("./views/ReorderGovernanceView"));
const BOMLinkageView = lazy(() => import("./views/BOMLinkageView"));
const BatchSerialControlView = lazy(() => import("./views/BatchSerialControlView"));
const ItemCategorisationView = lazy(() => import("./views/ItemCategorisationView"));
const ApprovalWorkflowView = lazy(() => import("./views/ApprovalWorkflowView"));
const CrossPlantView = lazy(() => import("./views/CrossPlantView"));
const NamingConventionView = lazy(() => import("./views/NamingConventionView"));
const DeadStockView = lazy(() => import("./views/DeadStockView"));
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
  section: "dashboard" | "analytics" | "workspace";
  view: React.ComponentType;
}

const SUB_PAGES: SubPage[] = [
  { id: 0, name: "Dashboard", section: "dashboard", view: DashboardView },

  { id: 1, name: "Duplicate Item Detection", section: "analytics", view: DuplicateDetectionView },
  { id: 2, name: "HSN / Tax-Code Mapping", section: "analytics", view: HSNValidationView },
  { id: 3, name: "Valuation-Class Integrity", section: "analytics", view: ValuationIntegrityView },
  { id: 4, name: "UoM Consistency", section: "analytics", view: UOMConsistencyView },
  { id: 5, name: "Obsolete / Blocked Items", section: "analytics", view: ObsoleteBlockedView },
  { id: 6, name: "Master Completeness", section: "analytics", view: MasterCompletenessView },
  { id: 7, name: "Price / Cost Master Changes", section: "analytics", view: CostChangesView },
  { id: 8, name: "Reorder-Level Governance", section: "analytics", view: ReorderGovernanceView },
  { id: 9, name: "BOM Linkage Integrity", section: "analytics", view: BOMLinkageView },
  { id: 10, name: "Batch / Serial Control Flags", section: "analytics", view: BatchSerialControlView },
  { id: 11, name: "Item Categorisation", section: "analytics", view: ItemCategorisationView },
  { id: 12, name: "Approval Workflow Audit", section: "analytics", view: ApprovalWorkflowView },
  { id: 13, name: "Cross-Plant Extension", section: "analytics", view: CrossPlantView },
  { id: 14, name: "Naming-Convention Compliance", section: "analytics", view: NamingConventionView },
  { id: 15, name: "Dead-Stock Item Flag", section: "analytics", view: DeadStockView },

  { id: 16, name: "Module Dashboard & KPIs", section: "workspace", view: ModuleDashboardView },
  { id: 17, name: "Scope & Audit Universe", section: "workspace", view: ScopeUniverseView },
  { id: 18, name: "Risk & Control Matrix (RCM)", section: "workspace", view: RCMView },
  { id: 19, name: "Test & Analytics Rule Library", section: "workspace", view: RuleLibraryView },
  { id: 20, name: "Data Source & Connector Setup", section: "workspace", view: DataSourceView },
  { id: 21, name: "Sampling & Population Builder", section: "workspace", view: SamplingBuilderView },
  { id: 22, name: "Exception & Red-Flag Queue", section: "workspace", view: ExceptionQueueView },
  { id: 23, name: "Working Papers & Evidence", section: "workspace", view: WorkingPapersView },
  { id: 24, name: "Observation & Finding Log", section: "workspace", view: FindingLogView },
  { id: 25, name: "Remediation / Action Tracker", section: "workspace", view: ActionTrackerView },
];

const SECTION_META: Record<string, { title: string; icon: string }> = {
  dashboard: { title: "Dashboard", icon: "dashboard" },
  analytics: { title: "Signature Analytics", icon: "trending-up" },
  workspace: { title: "Audit Workspace", icon: "file-check" },
};

export default function ItemMaterialMasterPage() {
  const [selectedPageId, setSelectedPageId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    analytics: true,
    workspace: true,
  });

  const activeSubPage = SUB_PAGES.find((p) => p.id === selectedPageId) || SUB_PAGES[0];
  const ActiveView = activeSubPage.view;
  const sectionMeta = SECTION_META[activeSubPage.section];

  const filteredPages = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dashboardPages = filteredPages.filter((p) => p.section === "dashboard");
  const analyticsPages = filteredPages.filter((p) => p.section === "analytics");
  const workspacePages = filteredPages.filter((p) => p.section === "workspace");

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
        .inner-subnav-btn.dashboard-btn {
          font-weight: 700;
          font-size: 14px;
          color: var(--gold);
        }
        .inner-subnav-btn.dashboard-btn.active {
          background: var(--gold-tint) !important;
          color: var(--gold-strong) !important;
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
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ position: "absolute", left: 12, top: 12, color: "var(--slate-soft)", display: "flex" }}>
            <Icon name="dashboard" size={16} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Dashboard Section */}
          <div>
            <button
              onClick={() => setExpandedSections((g) => ({ ...g, dashboard: !g.dashboard }))}
              style={{
                display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between",
                padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "var(--slate)",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", border: "none",
                background: "transparent",
              }}
            >
              <span>📊 Dashboard</span>
              <Icon name="chevron-right" size={14} style={{
                transform: expandedSections.dashboard ? "rotate(90deg)" : "none",
                transition: "transform 0.15s ease",
              }} />
            </button>
            {expandedSections.dashboard && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {dashboardPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn dashboard-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Signature Analytics Section */}
          <div>
            <button
              onClick={() => setExpandedSections((g) => ({ ...g, analytics: !g.analytics }))}
              style={{
                display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between",
                padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "var(--slate)",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", border: "none",
                background: "transparent",
              }}
            >
              <span>🔍 Signature Analytics ({analyticsPages.length})</span>
              <Icon name="chevron-right" size={14} style={{
                transform: expandedSections.analytics ? "rotate(90deg)" : "none",
                transition: "transform 0.15s ease",
              }} />
            </button>
            {expandedSections.analytics && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {analyticsPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {analyticsPages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Audit Workspace Section */}
          <div>
            <button
              onClick={() => setExpandedSections((g) => ({ ...g, workspace: !g.workspace }))}
              style={{
                display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between",
                padding: "4px 8px", fontWeight: 700, fontSize: 12, color: "var(--slate)",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", border: "none",
                background: "transparent",
              }}
            >
              <span>📋 Audit Workspace ({workspacePages.length})</span>
              <Icon name="chevron-right" size={14} style={{
                transform: expandedSections.workspace ? "rotate(90deg)" : "none",
                transition: "transform 0.15s ease",
              }} />
            </button>
            {expandedSections.workspace && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {workspacePages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {workspacePages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <span
            className="badge badge-slate"
            style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}
          >
            {sectionMeta.title}
          </span>
          <h2 style={{ color: "var(--navy)", margin: 0 }}>{activeSubPage.name}</h2>
        </div>
        <Suspense
          fallback={
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
              Loading...
            </div>
          }
        >
          <ActiveView />
        </Suspense>
      </div>
    </div>
  );
}
