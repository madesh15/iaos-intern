import { lazy, Suspense, useState } from "react";

const ProceduresView = lazy(() => import("./views/ProceduresView"));
const DashboardView = lazy(() => import("./views/DashboardView"));
const SimplePrivacyListTab = lazy(() => import("./views/SimplePrivacyListTab"));

type PageId = number;

interface SubPage {
  id: number;
  name: string;
  category: "signature" | "shell";
  endpoint?: string;
  columns?: string[];
  emptyItem?: Record<string, unknown>;
}

const SUB_PAGES: SubPage[] = [
  { id: 1, name: "Personal-Data Inventory (RoPA)", category: "signature" },
  { id: 2, name: "Consent-Management Review", category: "signature" },
  { id: 3, name: "Purpose-Limitation Testing", category: "signature" },
  { id: 4, name: "Data-Retention & Erasure", category: "signature" },
  { id: 5, name: "Data-Subject-Rights Handling", category: "signature" },
  { id: 6, name: "Cross-Border Transfer Controls", category: "signature" },
  { id: 7, name: "Third-Party Processor Diligence", category: "signature" },
  { id: 8, name: "Breach-Notification Readiness", category: "signature" },
  { id: 9, name: "Data-Minimisation Review", category: "signature" },
  { id: 10, name: "Sensitive-Data Handling", category: "signature" },
  { id: 11, name: "Privacy-by-Design Assessment", category: "signature" },
  { id: 12, name: "Access & Encryption Controls", category: "signature" },
  { id: 13, name: "DPO & Governance Structure", category: "signature" },
  { id: 14, name: "Consent-Withdrawal Handling", category: "signature" },
  { id: 15, name: "Privacy-Notice Adequacy", category: "signature" },
  { id: 16, name: "Module Dashboard & KPIs", category: "shell" },
  {
    id: 17,
    name: "Scope & Audit Universe",
    category: "shell",
    endpoint: "scope",
    columns: ["unit_name", "description", "process_owner", "status"],
    emptyItem: { unit_name: "", description: "", process_owner: "", status: "in_scope" },
  },
  {
    id: 18,
    name: "Risk & Control Matrix (RCM)",
    category: "shell",
    endpoint: "rcm",
    columns: ["risk_id", "control_desc", "assertion", "control_owner", "status"],
    emptyItem: { risk_id: "", control_desc: "", assertion: "", control_owner: "", status: "effective" },
  },
  {
    id: 19,
    name: "Test & Analytics Rule Library",
    category: "shell",
    endpoint: "rules",
    columns: ["rule_name", "rule_type", "threshold", "description", "active"],
    emptyItem: { rule_name: "", rule_type: "threshold", threshold: "", description: "", active: true },
  },
  {
    id: 20,
    name: "Data Source & Connector Setup",
    category: "shell",
    endpoint: "datasources",
    columns: ["source_name", "connector_type", "status"],
    emptyItem: { source_name: "", connector_type: "upload", connection_string: "", status: "not_connected" },
  },
  {
    id: 21,
    name: "Sampling & Population Builder",
    category: "shell",
    endpoint: "samples",
    columns: ["population_desc", "sample_size", "method", "notes"],
    emptyItem: { population_desc: "", sample_size: 0, method: "judgemental", notes: "" },
  },
  {
    id: 22,
    name: "Exception & Red-Flag Queue",
    category: "shell",
    endpoint: "exceptions",
    columns: ["title", "description", "severity", "status", "disposition"],
    emptyItem: { title: "", description: "", severity: "medium", status: "open", disposition: "" },
  },
  {
    id: 23,
    name: "Working Papers & Evidence",
    category: "shell",
    endpoint: "evidence",
    columns: ["title", "file_ref", "description"],
    emptyItem: { title: "", file_ref: "", description: "" },
  },
  {
    id: 24,
    name: "Observation & Finding Log",
    category: "shell",
    endpoint: "findings",
    columns: ["title", "description", "severity", "status", "control_owner"],
    emptyItem: { title: "", description: "", severity: "medium", status: "open", control_owner: "" },
  },
  {
    id: 25,
    name: "Remediation / Action Tracker",
    category: "shell",
    endpoint: "actions",
    columns: ["title", "description", "owner", "due_date", "status", "retest_status"],
    emptyItem: { title: "", description: "", owner: "", due_date: "", status: "open", retest_status: "not_started" },
  },
];

export default function DataPrivacyDpdpPage() {
  const [selectedPageId, setSelectedPageId] = useState<PageId>(16);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const signaturePages = SUB_PAGES.filter((p) => p.category === "signature");
  const shellPages = SUB_PAGES.filter((p) => p.category === "shell");

  const filterPages = (pages: SubPage[]) =>
    search ? pages.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : pages;

  const filteredSignature = filterPages(signaturePages);
  const filteredShell = filterPages(shellPages);

  const selectedPage = SUB_PAGES.find((p) => p.id === selectedPageId);

  function renderContent() {
    if (!selectedPage) return null;

    if (selectedPage.category === "signature") {
      return <ProceduresView highlightStep={selectedPage.id} />;
    }

    if (selectedPage.id === 16) {
      return <DashboardView />;
    }

    return (
      <SimplePrivacyListTab
        endpoint={selectedPage.endpoint!}
        columns={selectedPage.columns!}
        emptyItem={selectedPage.emptyItem!}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 120px)" }}>
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
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Data Privacy & DPDP</h2>
        <input
          className="input"
          placeholder="Search sub-pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 12, fontSize: 13 }}
        />

        <button
          onClick={() => setCollapsed((c) => ({ ...c, signature: !c.signature }))}
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
          {collapsed.signature ? "\u25B6" : "\u25BC"} Signature Procedures ({filteredSignature.length})
        </button>
        {!collapsed.signature &&
          filteredSignature.map((p) => (
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

        <button
          onClick={() => setCollapsed((c) => ({ ...c, shell: !c.shell }))}
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
          {collapsed.shell ? "\u25B6" : "\u25BC"} Audit Framework ({filteredShell.length})
        </button>
        {!collapsed.shell &&
          filteredShell.map((p) => (
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

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>{selectedPage?.name ?? "Data Privacy & DPDP"}</h1>
        <p style={{ opacity: 0.6, marginTop: 0, marginBottom: 16, fontSize: 13 }}>
          {selectedPage?.id && selectedPage.id <= 15
            ? `Signature procedure #${selectedPage.id} of 15 — sign off when testing is complete.`
            : selectedPage?.id === 16
              ? "Live risk score, open exceptions, coverage % and trend for this domain."
              : "Manage audit supporting data for this domain."}
        </p>
        <Suspense fallback={<p>Loading...</p>}>{renderContent()}</Suspense>
      </main>
    </div>
  );
}
