import { useState } from "react";
import GateEntryMatchPage from "./pages/GateEntryMatchPage";
import PutawayBinAccuracyPage from "./pages/PutawayBinAccuracyPage";
import PickPackDispatchAccuracyPage from "./pages/PickPackDispatchAccuracyPage";
import UnauthorisedMovementPage from "./pages/UnauthorisedMovementPage";
import SpaceBinUtilisationPage from "./pages/SpaceBinUtilisationPage";
import DamageHandlingLossPage from "./pages/DamageHandlingLossPage";
import FIFOFEFOCompliancePage from "./pages/FIFOFEFOCompliancePage";
import ReturnRTVProcessingPage from "./pages/ReturnRTVProcessingPage";
import CycleCountSystemPage from "./pages/CycleCountSystemPage";
import DockToStockTimePage from "./pages/DockToStockTimePage";
import ManpowerProductivityPage from "./pages/ManpowerProductivityPage";
import CrossDockControlsPage from "./pages/CrossDockControlsPage";
import SecurityCCTVCoveragePage from "./pages/SecurityCCTVCoveragePage";
import ThirdPLReconciliationPage from "./pages/ThirdPLReconciliationPage";
import SlottingOptimisationReviewPage from "./pages/SlottingOptimisationReviewPage";
import ModuleDashboardPage from "./pages/ModuleDashboardPage";
import ScopeAuditUniversePage from "./pages/ScopeAuditUniversePage";
import RiskControlMatrixPage from "./pages/RiskControlMatrixPage";
import TestAnalyticsRuleLibraryPage from "./pages/TestAnalyticsRuleLibraryPage";
import DataSourceConnectorSetupPage from "./pages/DataSourceConnectorSetupPage";
import SamplingPopulationBuilderPage from "./pages/SamplingPopulationBuilderPage";
import ExceptionRedFlagQueuePage from "./pages/ExceptionRedFlagQueuePage";
import WorkingPapersEvidencePage from "./pages/WorkingPapersEvidencePage";
import ObservationFindingLogPage from "./pages/ObservationFindingLogPage";
import RemediationActionTrackerPage from "./pages/RemediationActionTrackerPage";

const DOMAIN_PAGES = [
  { id: "gate-entry", label: "Gate-Entry to GRN Match", component: GateEntryMatchPage },
  { id: "putaway-bin", label: "Put-away & Bin Accuracy", component: PutawayBinAccuracyPage },
  { id: "pick-pack", label: "Pick-Pack-Dispatch Accuracy", component: PickPackDispatchAccuracyPage },
  { id: "unauthorised", label: "Unauthorised Movement", component: UnauthorisedMovementPage },
  { id: "space-bin", label: "Space & Bin Utilisation", component: SpaceBinUtilisationPage },
  { id: "damage-loss", label: "Damage & Handling Loss", component: DamageHandlingLossPage },
  { id: "fifo-fefo", label: "FIFO/FEFO Compliance", component: FIFOFEFOCompliancePage },
  { id: "return-rtv", label: "Return/RTV Processing", component: ReturnRTVProcessingPage },
  { id: "cycle-count", label: "Cycle-Count vs System", component: CycleCountSystemPage },
  { id: "dock-to-stock", label: "Dock-to-Stock Time", component: DockToStockTimePage },
  { id: "manpower", label: "Manpower Productivity", component: ManpowerProductivityPage },
  { id: "cross-dock", label: "Cross-Dock Controls", component: CrossDockControlsPage },
  { id: "security-cctv", label: "Security & CCTV Coverage", component: SecurityCCTVCoveragePage },
  { id: "3pl-recon", label: "3PL Reconciliation", component: ThirdPLReconciliationPage },
  { id: "slotting", label: "Slotting Optimisation Review", component: SlottingOptimisationReviewPage },
];

const STANDARD_PAGES = [
  { id: "dashboard", label: "Module Dashboard & KPIs", component: ModuleDashboardPage },
  { id: "scope", label: "Scope & Audit Universe", component: ScopeAuditUniversePage },
  { id: "rcm", label: "Risk & Control Matrix (RCM)", component: RiskControlMatrixPage },
  { id: "rule-library", label: "Test & Analytics Rule Library", component: TestAnalyticsRuleLibraryPage },
  { id: "data-source", label: "Data Source & Connector Setup", component: DataSourceConnectorSetupPage },
  { id: "sampling", label: "Sampling & Population Builder", component: SamplingPopulationBuilderPage },
  { id: "exception-queue", label: "Exception & Red-Flag Queue", component: ExceptionRedFlagQueuePage },
  { id: "working-papers", label: "Working Papers & Evidence", component: WorkingPapersEvidencePage },
  { id: "finding-log", label: "Observation & Finding Log", component: ObservationFindingLogPage },
  { id: "remediation", label: "Remediation / Action Tracker", component: RemediationActionTrackerPage },
];

export default function WarehouseMovementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const activePage =
    DOMAIN_PAGES.find((p) => p.id === activeTab) ||
    STANDARD_PAGES.find((p) => p.id === activeTab);

  const ActiveComponent = activePage ? activePage.component : () => null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px", alignItems: "start" }}>
      {/* Sidebar Navigation */}
      <div className="card" style={{ padding: "16px 0" }}>
        <div style={{ padding: "0 16px", marginBottom: "12px", fontSize: "12px", fontWeight: 600, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Standard Framework
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {STANDARD_PAGES.map((page) => (
            <li key={page.id}>
              <button
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: activeTab === page.id ? "var(--navy-tint)" : "transparent",
                  color: activeTab === page.id ? "var(--navy)" : "var(--ink)",
                  fontWeight: activeTab === page.id ? 600 : 400,
                  borderLeft: activeTab === page.id ? "3px solid var(--navy)" : "3px solid transparent",
                }}
                onClick={() => setActiveTab(page.id)}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ padding: "0 16px", margin: "24px 0 12px 0", fontSize: "12px", fontWeight: 600, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Domain Specific
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {DOMAIN_PAGES.map((page) => (
            <li key={page.id}>
              <button
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 16px",
                  fontSize: "14px",
                  background: activeTab === page.id ? "var(--navy-tint)" : "transparent",
                  color: activeTab === page.id ? "var(--navy)" : "var(--ink)",
                  fontWeight: activeTab === page.id ? 600 : 400,
                  borderLeft: activeTab === page.id ? "3px solid var(--navy)" : "3px solid transparent",
                }}
                onClick={() => setActiveTab(page.id)}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
}
