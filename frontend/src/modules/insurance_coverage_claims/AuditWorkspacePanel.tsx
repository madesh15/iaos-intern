import { useState } from "react";
import GenericRegisterPanel, { type ColumnDef, type FieldDef } from "./GenericRegisterPanel";

const ENDPOINT = "/api/modules/insurance_coverage_claims/audit-artifacts";

type PageType =
  | "scope"
  | "rcm"
  | "rule_library"
  | "data_source"
  | "sampling"
  | "exception"
  | "working_paper"
  | "finding"
  | "remediation";

const TABS: { key: PageType; label: string; categoryLabel: string; refLabel: string }[] = [
  { key: "scope", label: "Scope & Audit Universe", categoryLabel: "Business Unit / Location", refLabel: "Included?" },
  { key: "rcm", label: "Risk & Control Matrix", categoryLabel: "Control Frequency", refLabel: "Testing Method" },
  { key: "rule_library", label: "Test & Analytics Rule Library", categoryLabel: "Threshold", refLabel: "Rule Reference" },
  { key: "data_source", label: "Data Source & Connector Setup", categoryLabel: "Source Type (ERP/API/Excel/DB)", refLabel: "Connection Ref" },
  { key: "sampling", label: "Sampling & Population Builder", categoryLabel: "Sampling Method", refLabel: "Sample Size" },
  { key: "exception", label: "Exception & Red Flag Queue", categoryLabel: "Rule Triggered", refLabel: "Evidence Link" },
  { key: "working_paper", label: "Working Papers & Evidence", categoryLabel: "Version", refLabel: "Attachment Link" },
  { key: "finding", label: "Observation & Finding Log", categoryLabel: "Recommendation", refLabel: "Evidence Link" },
  { key: "remediation", label: "Remediation / Action Tracker (CAPA)", categoryLabel: "Progress", refLabel: "Retest Evidence" },
];

const COLUMNS: ColumnDef[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Detail" },
  { key: "owner", label: "Owner" },
  { key: "severity", label: "Severity" },
  { key: "due_date", label: "Due Date" },
];

export default function AuditWorkspacePanel() {
  const [tab, setTab] = useState<PageType>("scope");
  const active = TABS.find((t) => t.key === tab)!;

  const fields: FieldDef[] = [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "category", label: active.categoryLabel, type: "text" },
    { key: "owner", label: "Owner", type: "text" },
    { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"] },
    { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "closed"] },
    { key: "due_date", label: "Due Date", type: "date" },
    { key: "reference_link", label: active.refLabel, type: "text" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === tab ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "6px 14px", fontSize: 12 }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <GenericRegisterPanel
        key={tab}
        title={active.label}
        endpoint={ENDPOINT}
        fields={fields}
        columns={COLUMNS}
        fixedFields={{ page_type: tab }}
        listParams={{ page_type: tab }}
        statusField="status"
        statusOptions={["open", "in_progress", "closed"]}
        searchPlaceholder={`Search ${active.label.toLowerCase()}…`}
      />
    </div>
  );
}
