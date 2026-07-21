import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import RateCompliancePage from "./pages/analytics/RateCompliancePage";
import WeightVariancePage from "./pages/analytics/WeightVariancePage";
import RouteDistancePage from "./pages/analytics/RouteDistancePage";
import DetentionDemurragePage from "./pages/analytics/DetentionDemurragePage";
import CarrierPerformancePage from "./pages/analytics/CarrierPerformancePage";
import DuplicateBillingPage from "./pages/analytics/DuplicateBillingPage";
import MultiModalCostPage from "./pages/analytics/MultiModalCostPage";
import FuelSurchargePage from "./pages/analytics/FuelSurchargePage";
import EmptyReturnPage from "./pages/analytics/EmptyReturnPage";
import LRPODMatchPage from "./pages/analytics/LRPODMatchPage";
import ProvisionAccuracyPage from "./pages/analytics/ProvisionAccuracyPage";
import TransitSLAPage from "./pages/analytics/TransitSLAPage";
import DamageClaimsPage from "./pages/analytics/DamageClaimsPage";
import VehiclePlacementPage from "./pages/analytics/VehiclePlacementPage";
import CostTrendPage from "./pages/analytics/CostTrendPage";
import ModuleDashboardKPIsPage from "./pages/ModuleDashboardKPIsPage";
import ScopePage from "./pages/ScopePage";
import RiskControlPage from "./pages/RiskControlPage";
import TestRulePage from "./pages/TestRulePage";
import DataSourcePage from "./pages/DataSourcePage";
import SamplingPage from "./pages/SamplingPage";
import ExceptionQueuePage from "./pages/ExceptionQueuePage";
import WorkingPapersPage from "./pages/WorkingPapersPage";
import FindingsPage from "./pages/FindingsPage";
import ActionTrackerPage from "./pages/ActionTrackerPage";

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

const PAGES: Record<string, () => JSX.Element> = {
  dashboard: DashboardPage,
  "rate-compliance": RateCompliancePage,
  "weight-variance": WeightVariancePage,
  "route-distance": RouteDistancePage,
  detention: DetentionDemurragePage,
  "carrier-score": CarrierPerformancePage,
  "duplicate-billing": DuplicateBillingPage,
  "multimodal-cost": MultiModalCostPage,
  "fuel-surcharge": FuelSurchargePage,
  "empty-return": EmptyReturnPage,
  "lr-pod-match": LRPODMatchPage,
  provision: ProvisionAccuracyPage,
  "transit-sla": TransitSLAPage,
  "damage-claims": DamageClaimsPage,
  "vehicle-placement": VehiclePlacementPage,
  "cost-trend": CostTrendPage,
  "kpi-dashboard": ModuleDashboardKPIsPage,
  scope: ScopePage,
  risk: RiskControlPage,
  tests: TestRulePage,
  datasource: DataSourcePage,
  sampling: SamplingPage,
  exceptions: ExceptionQueuePage,
  workingpapers: WorkingPapersPage,
  findings: FindingsPage,
  actions: ActionTrackerPage,
};

export default function LogisticsFreightPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });
  const PageComponent = PAGES[activeTab] || DashboardPage;

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
                <div
                  onClick={() => toggleGroup(gidx)}
                  style={{
                    padding: "10px 14px 4px", fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "1px",
                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                    display: "flex", justifyContent: "space-between",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{group.label}</span>
                  <span style={{ transform: expandedGroups[gidx] ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▸</span>
                </div>
              )}
              {(!group.label || expandedGroups[gidx] || !sidebarOpen) && group.items.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    padding: "7px 14px", cursor: "pointer",
                    fontSize: sidebarOpen ? 12 : 16,
                    whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6,
                    background: activeTab === item.key
                      ? "rgba(255,255,255,0.12)"
 : "transparent",
                    borderLeft: activeTab === item.key
                      ? "3px solid var(--gold)"
                      : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: activeTab === item.key
                      ? "var(--gold)"
                      : "rgba(255,255,255,0.3)",
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
