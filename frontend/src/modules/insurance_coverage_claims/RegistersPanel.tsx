import { useState } from "react";
import GenericRegisterPanel, { type ColumnDef, type FieldDef } from "./GenericRegisterPanel";

const BASE = "/api/modules/insurance_coverage_claims";

type Key =
  | "exclusions"
  | "bi-cover"
  | "marine-cover"
  | "employee-cover"
  | "recovery-accounting"
  | "broker-performance"
  | "cost-allocation";

const TABS: { key: Key; label: string }[] = [
  { key: "exclusions", label: "Exclusions & Warranty" },
  { key: "bi-cover", label: "Business Interruption" },
  { key: "marine-cover", label: "Marine / Transit" },
  { key: "employee-cover", label: "Employee & Liability" },
  { key: "recovery-accounting", label: "Claim Recovery Accounting" },
  { key: "broker-performance", label: "Broker Performance" },
  { key: "cost-allocation", label: "Cost Allocation" },
];

const EXCLUSION_FIELDS: FieldDef[] = [
  { key: "policy_id", label: "Policy ID", type: "number", required: true },
  { key: "clause_type", label: "Clause Type", type: "select", options: ["exclusion", "warranty"] },
  { key: "description", label: "Description", type: "textarea" },
  { key: "compliance_status", label: "Compliance", type: "select", options: ["compliant", "breach", "at_risk"] },
];
const EXCLUSION_COLS: ColumnDef[] = [
  { key: "policy_id", label: "Policy ID" },
  { key: "clause_type", label: "Type" },
  { key: "description", label: "Description" },
  { key: "compliance_status", label: "Compliance" },
];

const BI_FIELDS: FieldDef[] = [
  { key: "site", label: "Site / Business Unit", type: "text", required: true },
  { key: "waiting_period_days", label: "Waiting Period (days)", type: "number" },
  { key: "indemnity_period_months", label: "Indemnity Period (months)", type: "number" },
  { key: "coverage_amount", label: "Coverage Amount", type: "number" },
  { key: "annual_gross_profit", label: "Annual Gross Profit", type: "number" },
  { key: "adequacy", label: "Adequacy", type: "select", options: ["adequate", "inadequate"] },
];
const BI_COLS: ColumnDef[] = [
  { key: "site", label: "Site" },
  { key: "waiting_period_days", label: "Waiting Period" },
  { key: "coverage_amount", label: "Coverage" },
  { key: "annual_gross_profit", label: "Revenue / GP" },
  { key: "adequacy", label: "Adequacy" },
];

const MARINE_FIELDS: FieldDef[] = [
  { key: "shipment_ref", label: "Shipment Ref", type: "text", required: true },
  { key: "goods_description", label: "Goods Description", type: "text" },
  { key: "goods_value", label: "Goods / Transit Value", type: "number" },
  { key: "coverage_amount", label: "Coverage Amount", type: "number" },
  { key: "carrier", label: "Carrier", type: "text" },
  { key: "transit_mode", label: "Mode", type: "select", options: ["sea", "air", "road", "rail"] },
  { key: "status", label: "Status", type: "select", options: ["in_transit", "delivered", "claimed"] },
];
const MARINE_COLS: ColumnDef[] = [
  { key: "shipment_ref", label: "Shipment" },
  { key: "goods_value", label: "Transit Value" },
  { key: "coverage_amount", label: "Coverage" },
  { key: "carrier", label: "Carrier" },
  { key: "status", label: "Status" },
];

const EMP_FIELDS: FieldDef[] = [
  { key: "cover_type", label: "Cover Type", type: "select", options: ["GPA", "GMC", "D&O", "Product Liability", "Public Liability"] },
  { key: "insured_entity", label: "Insured Entity", type: "text" },
  { key: "headcount_or_scope", label: "Headcount / Scope", type: "text" },
  { key: "sum_insured", label: "Sum Insured", type: "number" },
  { key: "premium_amount", label: "Premium", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["active", "expired", "lapsed"] },
];
const EMP_COLS: ColumnDef[] = [
  { key: "cover_type", label: "Cover Type" },
  { key: "insured_entity", label: "Entity" },
  { key: "sum_insured", label: "Sum Insured" },
  { key: "premium_amount", label: "Premium" },
  { key: "status", label: "Status" },
];

const RECOVERY_FIELDS: FieldDef[] = [
  { key: "claim_id", label: "Claim ID", type: "number", required: true },
  { key: "journal_ref", label: "GL Journal Ref", type: "text" },
  { key: "debit_account", label: "Debit Account", type: "text" },
  { key: "credit_account", label: "Credit Account", type: "text" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "recon_status", label: "Reconciliation", type: "select", options: ["pending", "reconciled", "variance"] },
];
const RECOVERY_COLS: ColumnDef[] = [
  { key: "claim_id", label: "Claim ID" },
  { key: "journal_ref", label: "GL Posting" },
  { key: "amount", label: "Amount" },
  { key: "recon_status", label: "Status" },
];

const BROKER_FIELDS: FieldDef[] = [
  { key: "broker_name", label: "Broker", type: "text", required: true },
  { key: "claims_handled", label: "Claims Handled", type: "number" },
  { key: "avg_response_days", label: "Avg Response (days)", type: "number" },
  { key: "renewal_success_pct", label: "Renewal Success %", type: "number" },
  { key: "client_rating", label: "Rating (1-5)", type: "number" },
  { key: "review_period", label: "Review Period", type: "text" },
];
const BROKER_COLS: ColumnDef[] = [
  { key: "broker_name", label: "Broker" },
  { key: "claims_handled", label: "Claims" },
  { key: "avg_response_days", label: "Response (d)" },
  { key: "renewal_success_pct", label: "Settlement/Renewal %" },
  { key: "client_rating", label: "Rating" },
];

const COST_FIELDS: FieldDef[] = [
  { key: "policy_id", label: "Policy ID", type: "number", required: true },
  { key: "department", label: "Department", type: "text" },
  { key: "plant", label: "Plant", type: "text" },
  { key: "business_unit", label: "Business Unit", type: "text" },
  { key: "cost_centre", label: "Cost Centre", type: "text" },
  { key: "allocated_amount", label: "Allocated Amount", type: "number" },
];
const COST_COLS: ColumnDef[] = [
  { key: "policy_id", label: "Policy ID" },
  { key: "department", label: "Department" },
  { key: "business_unit", label: "Business Unit" },
  { key: "cost_centre", label: "Cost Centre" },
  { key: "allocated_amount", label: "Allocated Amount" },
];

export default function RegistersPanel() {
  const [tab, setTab] = useState<Key>("exclusions");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === tab ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "6px 14px", fontSize: 13 }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "exclusions" && (
        <GenericRegisterPanel
          title="Exclusion / Warranty"
          endpoint={`${BASE}/exclusions`}
          fields={EXCLUSION_FIELDS}
          columns={EXCLUSION_COLS}
          statusField="compliance_status"
          statusOptions={["compliant", "breach", "at_risk"]}
        />
      )}
      {tab === "bi-cover" && (
        <GenericRegisterPanel
          title="Business Interruption Cover"
          endpoint={`${BASE}/bi-cover`}
          fields={BI_FIELDS}
          columns={BI_COLS}
          statusField="adequacy"
          statusOptions={["adequate", "inadequate"]}
        />
      )}
      {tab === "marine-cover" && (
        <GenericRegisterPanel
          title="Marine / Transit Cover"
          endpoint={`${BASE}/marine-cover`}
          fields={MARINE_FIELDS}
          columns={MARINE_COLS}
          statusField="status"
          statusOptions={["in_transit", "delivered", "claimed"]}
        />
      )}
      {tab === "employee-cover" && (
        <GenericRegisterPanel
          title="Employee & Liability Cover"
          endpoint={`${BASE}/employee-cover`}
          fields={EMP_FIELDS}
          columns={EMP_COLS}
          statusField="status"
          statusOptions={["active", "expired", "lapsed"]}
        />
      )}
      {tab === "recovery-accounting" && (
        <GenericRegisterPanel
          title="Claim Recovery Accounting"
          endpoint={`${BASE}/recovery-accounting`}
          fields={RECOVERY_FIELDS}
          columns={RECOVERY_COLS}
          statusField="recon_status"
          statusOptions={["pending", "reconciled", "variance"]}
        />
      )}
      {tab === "broker-performance" && (
        <GenericRegisterPanel
          title="Broker Performance"
          endpoint={`${BASE}/broker-performance`}
          fields={BROKER_FIELDS}
          columns={BROKER_COLS}
        />
      )}
      {tab === "cost-allocation" && (
        <GenericRegisterPanel
          title="Insurance Cost Allocation"
          endpoint={`${BASE}/cost-allocation`}
          fields={COST_FIELDS}
          columns={COST_COLS}
        />
      )}
    </div>
  );
}
