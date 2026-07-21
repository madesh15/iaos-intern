import { useState, lazy, Suspense } from "react";
import { Icon } from "../../components/Icon";

// Lazy-loaded sub-pages — Signature (Core Audit Procedures)
const SchemeDesignApprovalView = lazy(() => import("./views/SchemeDesignApprovalView"));
const ClaimValidationSettlementView = lazy(() => import("./views/ClaimValidationSettlementView"));
const DuplicateInflatedClaimsView = lazy(() => import("./views/DuplicateInflatedClaimsView"));
const PromoROIMeasurementView = lazy(() => import("./views/PromoROIMeasurementView"));
const OffInvoiceBillBackView = lazy(() => import("./views/OffInvoiceBillBackView"));
const SlabTargetAchievementView = lazy(() => import("./views/SlabTargetAchievementView"));
const FreeGoodsSamplingView = lazy(() => import("./views/FreeGoodsSamplingView"));
const DisplayVisibilitySpendView = lazy(() => import("./views/DisplayVisibilitySpendView"));
const DistributorClaimAgeingView = lazy(() => import("./views/DistributorClaimAgeingView"));
const GhostNonPerformingOutletsView = lazy(() => import("./views/GhostNonPerformingOutletsView"));
const PriceProtectionClaimsView = lazy(() => import("./views/PriceProtectionClaimsView"));
const SchemeOverlapDetectionView = lazy(() => import("./views/SchemeOverlapDetectionView"));
const AccrualActualSpendView = lazy(() => import("./views/AccrualActualSpendView"));
const CompetitorBenchmarkSpendView = lazy(() => import("./views/CompetitorBenchmarkSpendView"));
const UnclaimedLapsedSchemeView = lazy(() => import("./views/UnclaimedLapsedSchemeView"));

// Lazy-loaded sub-pages — Shell (Audit Framework)
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
  category: "signature" | "shell";
  view: React.ComponentType;
}

const SUB_PAGES: SubPage[] = [
  // Signature — Core Audit Procedures (1–15)
  { id: 1, name: "Scheme-Design Approval", category: "signature", view: SchemeDesignApprovalView },
  { id: 2, name: "Claim Validation & Settlement", category: "signature", view: ClaimValidationSettlementView },
  { id: 3, name: "Duplicate / Inflated Claims", category: "signature", view: DuplicateInflatedClaimsView },
  { id: 4, name: "Promo ROI Measurement", category: "signature", view: PromoROIMeasurementView },
  { id: 5, name: "Off-Invoice vs Bill-Back", category: "signature", view: OffInvoiceBillBackView },
  { id: 6, name: "Slab / Target Achievement", category: "signature", view: SlabTargetAchievementView },
  { id: 7, name: "Free-Goods & Sampling", category: "signature", view: FreeGoodsSamplingView },
  { id: 8, name: "Display / Visibility Spend", category: "signature", view: DisplayVisibilitySpendView },
  { id: 9, name: "Distributor-Claim Ageing", category: "signature", view: DistributorClaimAgeingView },
  { id: 10, name: "Ghost / Non-Performing Outlets", category: "signature", view: GhostNonPerformingOutletsView },
  { id: 11, name: "Price-Protection Claims", category: "signature", view: PriceProtectionClaimsView },
  { id: 12, name: "Scheme-Overlap Detection", category: "signature", view: SchemeOverlapDetectionView },
  { id: 13, name: "Accrual vs Actual Spend", category: "signature", view: AccrualActualSpendView },
  { id: 14, name: "Competitor-Benchmark Spend", category: "signature", view: CompetitorBenchmarkSpendView },
  { id: 15, name: "Unclaimed / Lapsed Scheme", category: "signature", view: UnclaimedLapsedSchemeView },

  // Shell — Audit Framework (16–25)
  { id: 16, name: "Module Dashboard & KPIs", category: "shell", view: ModuleDashboardView },
  { id: 17, name: "Scope & Audit Universe", category: "shell", view: ScopeUniverseView },
  { id: 18, name: "Risk & Control Matrix (RCM)", category: "shell", view: RCMView },
  { id: 19, name: "Test & Analytics Rule Library", category: "shell", view: RuleLibraryView },
  { id: 20, name: "Data Source & Connector Setup", category: "shell", view: DataSourceView },
  { id: 21, name: "Sampling & Population Builder", category: "shell", view: SamplingBuilderView },
  { id: 22, name: "Exception & Red-Flag Queue", category: "shell", view: ExceptionQueueView },
  { id: 23, name: "Working Papers & Evidence", category: "shell", view: WorkingPapersView },
  { id: 24, name: "Observation & Finding Log", category: "shell", view: FindingLogView },
  { id: 25, name: "Remediation / Action Tracker", category: "shell", view: ActionTrackerView },
];

export default function TradeSchemePromotionPage() {
  const [selectedPageId, setSelectedPageId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    signature: true,
    shell: true,
  });

  const activeSubPage = SUB_PAGES.find((p) => p.id === selectedPageId) || SUB_PAGES[0];
  const ActiveView = activeSubPage.view;

  const filteredPages = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const signaturePages = filteredPages.filter((p) => p.category === "signature");
  const shellPages = filteredPages.filter((p) => p.category === "shell");

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

      {/* Inner Sub-Navigation Sidebar */}
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
          {/* Signature — Core Audit Procedures Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, signature: !g.signature }))}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 8px",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--slate)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              <span>Signature Procedures ({signaturePages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.signature ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.signature && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {signaturePages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {signaturePages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Shell — Audit Framework Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, shell: !g.shell }))}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 8px",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--slate)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              <span>Audit Framework ({shellPages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.shell ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.shell && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {shellPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {shellPages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <span
            className="badge badge-slate"
            style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}
          >
            {activeSubPage.category === "signature" ? "Signature Procedures" : "Audit Framework"} — Page {activeSubPage.id}
          </span>
          <h2 style={{ color: "var(--navy)" }}>{activeSubPage.name}</h2>
        </div>

        <Suspense
          fallback={
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
              Loading audit workspace...
            </div>
          }
        >
          <ActiveView />
        </Suspense>
      </div>
    </div>
  );
}
