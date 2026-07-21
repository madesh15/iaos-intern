import { lazy, Suspense, useState } from "react";

const ProceduresView = lazy(() => import("./views/ProceduresView"));
const DashboardView = lazy(() => import("./views/DashboardView"));
const SimpleCyberListTab = lazy(() => import("./views/SimpleCyberListTab"));

type PageId = number;

interface SubPage {
  id: number;
  name: string;
  category: "core" | "framework";
  endpoint?: string;
  columns?: string[];
  emptyItem?: Record<string, any>;
}

const SUB_PAGES: SubPage[] = [
  { id: 1, name: "Perimeter & Firewall Review", category: "core" },
  { id: 2, name: "Endpoint & Antivirus Coverage", category: "core" },
  { id: 3, name: "Vulnerability Scan Results", category: "core" },
  { id: 4, name: "Penetration-Test Follow-up", category: "core" },
  { id: 5, name: "Incident-Response Readiness", category: "core" },
  { id: 6, name: "Data-Loss Prevention (DLP)", category: "core" },
  { id: 7, name: "Email & Phishing Defence", category: "core" },
  { id: 8, name: "Encryption at Rest / Transit", category: "core" },
  { id: 9, name: "Security-Log Monitoring (SIEM)", category: "core" },
  { id: 10, name: "Multi-Factor Authentication", category: "core" },
  { id: 11, name: "Third-Party / Cloud Security", category: "core" },
  { id: 12, name: "Security-Patch Timeliness", category: "core" },
  { id: 13, name: "Access to Sensitive Data", category: "core" },
  { id: 14, name: "Security-Awareness Training", category: "core" },
  { id: 15, name: "Breach & Ransomware Preparedness", category: "core" },
  {
    id: 16,
    name: "Module Dashboard & KPIs",
    category: "framework",
  },
  {
    id: 17,
    name: "Scope & Audit Universe",
    category: "framework",
    endpoint: "scope",
    columns: ["unit_name", "description", "process_owner", "status"],
    emptyItem: { unit_name: "", description: "", process_owner: "", status: "in_scope" },
  },
  {
    id: 18,
    name: "Risk & Control Matrix (RCM)",
    category: "framework",
    endpoint: "rcm",
    columns: ["risk_id", "control_desc", "assertion", "control_owner", "status"],
    emptyItem: { risk_id: "", control_desc: "", assertion: "", control_owner: "", status: "effective" },
  },
  {
    id: 19,
    name: "Test & Analytics Rule Library",
    category: "framework",
    endpoint: "rules",
    columns: ["rule_name", "rule_type", "threshold", "description", "active"],
    emptyItem: { rule_name: "", rule_type: "threshold", threshold: "", description: "", active: true },
  },
  {
    id: 20,
    name: "Data Source & Connector Setup",
    category: "framework",
    endpoint: "datasources",
    columns: ["source_name", "connector_type", "status"],
    emptyItem: { source_name: "", connector_type: "upload", connection_string: "", status: "not_connected" },
  },
  {
    id: 21,
    name: "Sampling & Population Builder",
    category: "framework",
    endpoint: "samples",
    columns: ["population_desc", "sample_size", "method", "notes"],
    emptyItem: { population_desc: "", sample_size: 0, method: "judgemental", notes: "" },
  },
  {
    id: 22,
    name: "Exception & Red-Flag Queue",
    category: "framework",
    endpoint: "exceptions",
    columns: ["title", "description", "severity", "status", "disposition"],
    emptyItem: { title: "", description: "", severity: "medium", status: "open", disposition: "" },
  },
  {
    id: 23,
    name: "Working Papers & Evidence",
    category: "framework",
    endpoint: "evidence",
    columns: ["title", "file_ref", "description"],
    emptyItem: { title: "", file_ref: "", description: "" },
  },
  {
    id: 24,
    name: "Observation & Finding Log",
    category: "framework",
    endpoint: "findings",
    columns: ["title", "description", "severity", "status", "control_owner"],
    emptyItem: { title: "", description: "", severity: "medium", status: "open", control_owner: "" },
  },
  {
    id: 25,
    name: "Remediation / Action Tracker",
    category: "framework",
    endpoint: "actions",
    columns: ["title", "description", "owner", "due_date", "status", "retest_status"],
    emptyItem: { title: "", description: "", owner: "", due_date: "", status: "open", retest_status: "not_started" },
  },
];

export default function CybersecurityPage() {
  const [selectedPageId, setSelectedPageId] = useState<PageId>(16);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const corePages = SUB_PAGES.filter((p) => p.category === "core");
  const frameworkPages = SUB_PAGES.filter((p) => p.category === "framework");

  const filterPages = (pages: SubPage[]) =>
    search ? pages.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : pages;

  const filteredCore = filterPages(corePages);
  const filteredFramework = filterPages(frameworkPages);

  const selectedPage = SUB_PAGES.find((p) => p.id === selectedPageId);

  function renderContent() {
    if (!selectedPage) return null;

    if (selectedPage.category === "core") {
      return <ProceduresView highlightStep={selectedPage.id} />;
    }

    if (selectedPage.id === 16) {
      return <DashboardView />;
    }

    return (
      <SimpleCyberListTab
        endpoint={selectedPage.endpoint!}
        columns={selectedPage.columns!}
        emptyItem={selectedPage.emptyItem!}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 120px)" }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 300,
          minWidth: 300,
          borderRight: "1px solid var(--border, #e2e8f0)",
          padding: 16,
          overflowY: "auto",
          background: "var(--sidebar-bg, #f8fafc)",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Cybersecurity & InfoSec</h2>
        <input
          className="input"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 12, fontSize: 13 }}
        />

        {/* Core Checks */}
        <button
          onClick={() => setCollapsed((c) => ({ ...c, core: !c.core }))}
          style={{
            background: "none",
            border: "none",
            fontWeight: 700,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            padding: "6px 0",
            color: "var(--text, #1e293b)",
          }}
        >
          {collapsed.core ? "\u25B6" : "\u25BC"} Core Cybersecurity Checks ({filteredCore.length})
        </button>
        {!collapsed.core &&
          filteredCore.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPageId(p.id)}
              className={`inner-subnav-btn${selectedPageId === p.id ? " active" : ""}`}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 8px 6px 16px",
                fontSize: 13,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginBottom: 2,
                background: selectedPageId === p.id ? "var(--primary, #3b82f6)" : "transparent",
                color: selectedPageId === p.id ? "#fff" : "var(--text, #334155)",
              }}
            >
              {p.id}. {p.name}
            </button>
          ))}

        {/* Framework */}
        <button
          onClick={() => setCollapsed((c) => ({ ...c, framework: !c.framework }))}
          style={{
            background: "none",
            border: "none",
            fontWeight: 700,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            padding: "6px 0",
            marginTop: 8,
            color: "var(--text, #1e293b)",
          }}
        >
          {collapsed.framework ? "\u25B6" : "\u25BC"} Audit & Compliance Framework ({filteredFramework.length})
        </button>
        {!collapsed.framework &&
          filteredFramework.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPageId(p.id)}
              className={`inner-subnav-btn${selectedPageId === p.id ? " active" : ""}`}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 8px 6px 16px",
                fontSize: 13,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginBottom: 2,
                background: selectedPageId === p.id ? "var(--primary, #3b82f6)" : "transparent",
                color: selectedPageId === p.id ? "#fff" : "var(--text, #334155)",
              }}
            >
              {p.id}. {p.name}
            </button>
          ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>{selectedPage?.name ?? "Cybersecurity"}</h1>
        <p style={{ opacity: 0.6, marginTop: 0, marginBottom: 16, fontSize: 13 }}>
          {selectedPage?.id && selectedPage.id <= 15
            ? `Signature check #${selectedPage.id} of 15 — sign off when complete.`
            : selectedPage?.id === 16
              ? "Live risk score, open exceptions, coverage % and trend."
              : "Manage audit supporting data for this domain."}
        </p>
        <Suspense fallback={<p>Loading...</p>}>{renderContent()}</Suspense>
      </main>
    </div>
  );
}
