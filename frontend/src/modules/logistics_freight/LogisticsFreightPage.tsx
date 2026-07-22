import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ContractsPage from "./pages/ContractsPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import InvoicesPage from "./pages/InvoicesPage";
import RoutesPage from "./pages/RoutesPage";
import CarriersPage from "./pages/CarriersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ClaimsPage from "./pages/ClaimsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ScopePage from "./pages/ScopePage";
import RiskControlPage from "./pages/RiskControlPage";
import TestRulePage from "./pages/TestRulePage";
import DataSourcePage from "./pages/DataSourcePage";
import SamplingPage from "./pages/SamplingPage";
import ExceptionQueuePage from "./pages/ExceptionQueuePage";
import WorkingPapersPage from "./pages/WorkingPapersPage";
import FindingsPage from "./pages/FindingsPage";
import ActionTrackerPage from "./pages/ActionTrackerPage";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "scope", label: "Scope & Audit Universe", icon: "layers" },
  { key: "risk", label: "Risk & Control Matrix", icon: "shield" },
  { key: "tests", label: "Test & Analytics Rules", icon: "activity" },
  { key: "datasource", label: "Data Sources", icon: "server" },
  { key: "sampling", label: "Sampling & Population", icon: "clipboard" },
  { key: "exceptions", label: "Exception & Red Flag Queue", icon: "alert-triangle" },
  { key: "workingpapers", label: "Working Papers & Evidence", icon: "briefcase" },
  { key: "findings", label: "Observation & Finding Log", icon: "file-check" },
  { key: "actions", label: "Remediation / Action Tracker", icon: "check" },
  { key: "contracts", label: "Freight Contracts", icon: "file-check" },
  { key: "shipments", label: "Shipments", icon: "truck" },
  { key: "invoices", label: "Invoices", icon: "wallet" },
  { key: "routes", label: "Routes", icon: "activity" },
  { key: "carriers", label: "Carriers", icon: "users" },
  { key: "analytics", label: "Analytics", icon: "trending-up" },
  { key: "claims", label: "Claims", icon: "alert-triangle" },
  { key: "reports", label: "Reports", icon: "clipboard" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const PAGES: Record<string, () => JSX.Element> = {
  dashboard: DashboardPage,
  scope: ScopePage,
  risk: RiskControlPage,
  tests: TestRulePage,
  datasource: DataSourcePage,
  sampling: SamplingPage,
  exceptions: ExceptionQueuePage,
  workingpapers: WorkingPapersPage,
  findings: FindingsPage,
  actions: ActionTrackerPage,
  contracts: ContractsPage,
  shipments: ShipmentsPage,
  invoices: InvoicesPage,
  routes: RoutesPage,
  carriers: CarriersPage,
  analytics: AnalyticsPage,
  claims: ClaimsPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

export default function LogisticsFreightPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const PageComponent = PAGES[activeTab] || DashboardPage;

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 120px)" }}>
      <nav style={{
        width: sidebarOpen ? 220 : 48,
        background: "var(--navy)",
        color: "#fff",
        transition: "width 0.2s",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: 8,
      }}>
        <div style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span style={{ fontSize: 20 }}>☰</span>
          {sidebarOpen && <strong style={{ fontSize: 13 }}>Logistics & Freight</strong>}
        </div>
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.key} onClick={() => setActiveTab(item.key)}
              style={{
                padding: "8px 12px", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 8,
                background: activeTab === item.key ? "rgba(255,255,255,0.15)" : "transparent",
                borderRadius: 4, margin: "2px 4px",
              }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {item.icon === "dashboard" && "📊"}
                {item.icon === "layers" && "📋"}
                {item.icon === "shield" && "🛡"}
                {item.icon === "activity" && "📈"}
                {item.icon === "server" && "💾"}
                {item.icon === "clipboard" && "📋"}
                {item.icon === "alert-triangle" && "⚠"}
                {item.icon === "briefcase" && "💼"}
                {item.icon === "file-check" && "✅"}
                {item.icon === "check" && "✓"}
                {item.icon === "truck" && "🚚"}
                {item.icon === "wallet" && "💰"}
                {item.icon === "users" && "👥"}
                {item.icon === "trending-up" && "📊"}
                {item.icon === "settings" && "⚙"}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </div>
      </nav>
      <div style={{ flex: 1, overflow: "auto", padding: "0 0 0 20px" }}>
        <PageComponent />
      </div>
    </div>
  );
}
