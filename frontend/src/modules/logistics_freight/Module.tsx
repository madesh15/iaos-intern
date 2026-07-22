import { useState } from "react";
import Dashboard from "./Dashboard";

interface NavGroup {
  label: string;
  items: { key: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ key: "dashboard", label: "Dashboard" }],
  },
  {
    label: "Signature Analytics",
    items: [
      { key: "rate-compliance", label: "1. Freight Rate-Contract Compliance" },
      { key: "weight-variance", label: "2. Weight / Volume Variance" },
      { key: "route-distance", label: "3. Route & Distance Analytics" },
      { key: "detention", label: "4. Detention & Demurrage" },
      { key: "carrier-score", label: "5. Carrier Performance Scoring" },
      { key: "duplicate-billing", label: "6. Duplicate Freight Billing" },
      { key: "multimodal-cost", label: "7. Multi-Modal Cost Comparison" },
      { key: "fuel-surcharge", label: "8. Fuel Surcharge Validation" },
      { key: "empty-return", label: "9. Empty Return / Backhaul" },
      { key: "lr-pod-match", label: "10. Lorry Receipt / POD Match" },
      { key: "provision", label: "11. Freight Provision Accuracy" },
      { key: "transit-sla", label: "12. Transit-Time SLA" },
      { key: "damage-claims", label: "13. Damage & Shortage Claims" },
      { key: "vehicle-placement", label: "14. Vehicle Placement Efficiency" },
      { key: "cost-trend", label: "15. Freight Cost per Unit Trend" },
    ],
  },
  {
    label: "Audit Workspace",
    items: [
      { key: "kpi-dashboard", label: "16. Module Dashboard & KPIs" },
      { key: "scope", label: "17. Scope & Audit Universe" },
      { key: "risk", label: "18. Risk & Control Matrix" },
      { key: "tests", label: "19. Test & Analytics Rule Library" },
      { key: "datasource", label: "20. Data Source & Connector Setup" },
      { key: "sampling", label: "21. Sampling & Population Builder" },
      { key: "exceptions", label: "22. Exception & Red Flag Queue" },
      { key: "workingpapers", label: "23. Working Papers & Evidence" },
      { key: "findings", label: "24. Observation & Finding Log" },
      { key: "actions", label: "25. Remediation / Action Tracker" },
    ],
  },
];

interface PageModule {
  default: () => JSX.Element;
}

const PAGE_MODULES: Record<string, () => Promise<PageModule>> = {
  dashboard: () => Promise.resolve({ default: Dashboard }),
  "rate-compliance": () => import("./pages/analytics/RateCompliancePage"),
  "weight-variance": () => import("./pages/analytics/WeightVariancePage"),
  "route-distance": () => import("./pages/analytics/RouteDistancePage"),
  detention: () => import("./pages/analytics/DetentionDemurragePage"),
  "carrier-score": () => import("./pages/analytics/CarrierPerformancePage"),
  "duplicate-billing": () => import("./pages/analytics/DuplicateBillingPage"),
  "multimodal-cost": () => import("./pages/analytics/MultiModalCostPage"),
  "fuel-surcharge": () => import("./pages/analytics/FuelSurchargePage"),
  "empty-return": () => import("./pages/analytics/EmptyReturnPage"),
  "lr-pod-match": () => import("./pages/analytics/LRPODMatchPage"),
  provision: () => import("./pages/analytics/ProvisionAccuracyPage"),
  "transit-sla": () => import("./pages/analytics/TransitSLAPage"),
  "damage-claims": () => import("./pages/analytics/DamageClaimsPage"),
  "vehicle-placement": () => import("./pages/analytics/VehiclePlacementPage"),
  "cost-trend": () => import("./pages/analytics/CostTrendPage"),
  "kpi-dashboard": () => import("./pages/ModuleDashboardKPIsPage"),
  scope: () => import("./pages/ScopePage"),
  risk: () => import("./pages/RiskControlPage"),
  tests: () => import("./pages/TestRulePage"),
  datasource: () => import("./pages/DataSourcePage"),
  sampling: () => import("./pages/SamplingPage"),
  exceptions: () => import("./pages/ExceptionQueuePage"),
  workingpapers: () => import("./pages/WorkingPapersPage"),
  findings: () => import("./pages/FindingsPage"),
  actions: () => import("./pages/ActionTrackerPage"),
};

export default function Module() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({
    1: true, 2: true,
  });
  const [PageComponent, setPageComponent] = useState<() => JSX.Element>(() => Dashboard);

  function navigate(key: string) {
    setActiveTab(key);
    const loader = PAGE_MODULES[key];
    if (loader) {
      loader().then((m) => setPageComponent(() => m.default));
    }
  }

  function toggleGroup(idx: number) {
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 120px)" }}>
      <nav style={{
        width: sidebarOpen ? 240 : 44,
        background: "var(--navy)", color: "#fff",
        transition: "width 0.25s ease", overflow: "hidden",
        flexShrink: 0, borderRadius: 8, position: "relative",
      }}>
        <div style={{
          padding: "14px 10px", display: "flex", alignItems: "center",
          gap: 8, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.1)",
        }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>☰</span>
          {sidebarOpen && (
            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              Logistics & Freight
            </span>
          )}
        </div>

        <div style={{
          overflowY: "auto", overflowX: "hidden",
          maxHeight: "calc(100vh - 200px)", padding: "4px 0",
        }}>
          {NAV_GROUPS.map((group, gidx) => (
            <div key={gidx}>
              {group.label && sidebarOpen && (
                <div onClick={() => toggleGroup(gidx)} style={{
                  padding: "10px 14px 4px", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "1px",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", whiteSpace: "nowrap",
                }}>
                  <span>{group.label}</span>
                  <span style={{
                    transform: expandedGroups[gidx] ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}>▸</span>
                </div>
              )}
              {(!group.label || expandedGroups[gidx] || !sidebarOpen) && group.items.map((item) => (
                <div key={item.key} onClick={() => navigate(item.key)}
                  title={!sidebarOpen ? item.label : undefined} style={{
                    padding: "7px 14px", cursor: "pointer",
                    fontSize: sidebarOpen ? 12 : 16,
                    whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6,
                    background: activeTab === item.key ? "rgba(255,255,255,0.12)" : "transparent",
                    borderLeft: activeTab === item.key ? "3px solid var(--gold)" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: activeTab === item.key ? "var(--gold)" : "rgba(255,255,255,0.3)",
                  }} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1, overflow: "auto", padding: "0 0 0 20px", minWidth: 0 }}>
        <PageComponent />
      </div>
    </div>
  );
}
