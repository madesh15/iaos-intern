import { useEffect, useState, useCallback } from "react";
import { del, get, post, patch } from "../../lib/api";

const API_BASE = "/api/modules/labour_compliance";

interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "boolean" | "status";
}

interface FormFieldDef {
  key: string;
  label: string;
  inputType?: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

interface FeatureDef {
  id: string;
  label: string;
  group: "Signature" | "Audit Shell";
  description: string;
  endpoint: string;
  columns: ColumnDef[];
  formFields: FormFieldDef[];
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES: FeatureDef[] = [
  {
    id: "applicability",
    label: "Applicability Mapping",
    group: "Signature",
    description: "Identify labour laws applicable for each site",
    endpoint: "/applicability",
    columns: [
      { key: "site", label: "Site" },
      { key: "state", label: "State" },
      { key: "industry", label: "Industry" },
      { key: "employee_count", label: "Emp. Count", type: "number" },
      { key: "factory_act", label: "Factory Act", type: "boolean" },
      { key: "shops_establishment", label: "S&E", type: "boolean" },
      { key: "clra", label: "CLRA", type: "boolean" },
      { key: "minimum_wages", label: "Min Wages", type: "boolean" },
      { key: "pf_applicable", label: "PF", type: "boolean" },
      { key: "esi_applicable", label: "ESI", type: "boolean" },
      { key: "bonus_applicable", label: "Bonus", type: "boolean" },
      { key: "gratuity_applicable", label: "Gratuity", type: "boolean" },
      { key: "posh_applicable", label: "POSH", type: "boolean" },
      { key: "lwf_applicable", label: "LWF", type: "boolean" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "site", label: "Site", required: true },
      { key: "state", label: "State", required: true },
      { key: "industry", label: "Industry", required: true },
      { key: "employee_count", label: "Employee Count", inputType: "number", defaultValue: 0 },
      { key: "factory_act", label: "Factory Act Applicable", inputType: "checkbox", defaultValue: false },
      { key: "shops_establishment", label: "Shops & Establishment", inputType: "checkbox", defaultValue: false },
      { key: "clra", label: "CLRA Applicable", inputType: "checkbox", defaultValue: false },
      { key: "minimum_wages", label: "Minimum Wages Applicable", inputType: "checkbox", defaultValue: false },
      { key: "pf_applicable", label: "PF Applicable", inputType: "checkbox", defaultValue: false },
      { key: "esi_applicable", label: "ESI Applicable", inputType: "checkbox", defaultValue: false },
      { key: "bonus_applicable", label: "Bonus Applicable", inputType: "checkbox", defaultValue: false },
      { key: "gratuity_applicable", label: "Gratuity Applicable", inputType: "checkbox", defaultValue: false },
      { key: "posh_applicable", label: "POSH Applicable", inputType: "checkbox", defaultValue: false },
      { key: "lwf_applicable", label: "Labour Welfare Fund", inputType: "checkbox", defaultValue: false },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "registers",
    label: "Statutory Register Check",
    group: "Signature",
    description: "Track statutory registers — attendance, wage, leave, muster roll",
    endpoint: "/registers",
    columns: [
      { key: "site", label: "Site" },
      { key: "register_type", label: "Register Type" },
      { key: "attendance_register", label: "Attendance", type: "boolean" },
      { key: "wage_register", label: "Wage", type: "boolean" },
      { key: "leave_register", label: "Leave", type: "boolean" },
      { key: "muster_roll", label: "Muster Roll", type: "boolean" },
      { key: "fine_register", label: "Fine", type: "boolean" },
      { key: "overtime_register", label: "OT Register", type: "boolean" },
      { key: "is_updated", label: "Updated", type: "boolean" },
      { key: "last_updated_date", label: "Last Updated", type: "date" },
      { key: "responsible_person", label: "Responsible" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "site", label: "Site", required: true },
      { key: "register_type", label: "Register Type", required: true, options: ["Wage Register", "Attendance Register", "Leave Register", "Muster Roll", "Fine Register", "Overtime Register"] },
      { key: "attendance_register", label: "Attendance Register", inputType: "checkbox", defaultValue: false },
      { key: "wage_register", label: "Wage Register", inputType: "checkbox", defaultValue: false },
      { key: "leave_register", label: "Leave Register", inputType: "checkbox", defaultValue: false },
      { key: "muster_roll", label: "Muster Roll", inputType: "checkbox", defaultValue: false },
      { key: "fine_register", label: "Fine Register", inputType: "checkbox", defaultValue: false },
      { key: "overtime_register", label: "Overtime Register", inputType: "checkbox", defaultValue: false },
      { key: "is_updated", label: "Is Updated", inputType: "checkbox", defaultValue: false },
      { key: "last_updated_date", label: "Last Updated Date", inputType: "date" },
      { key: "responsible_person", label: "Responsible Person" },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "licenses",
    label: "Licence & Registration",
    group: "Signature",
    description: "Manage factory licences, CLRA, shops & establishment registrations",
    endpoint: "/licenses",
    columns: [
      { key: "site", label: "Site" },
      { key: "licence_type", label: "Licence Type" },
      { key: "registration_number", label: "Reg. No." },
      { key: "issue_date", label: "Issue Date", type: "date" },
      { key: "expiry_date", label: "Expiry Date", type: "date" },
      { key: "renewal_due", label: "Renewal Due", type: "date" },
      { key: "authority", label: "Authority" },
      { key: "status", label: "Status", type: "status" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "site", label: "Site", required: true },
      { key: "licence_type", label: "Licence Type", required: true, options: ["Factory Licence", "Shops & Establishment", "CLRA Licence", "ESI Registration", "PF Registration", "Professional Tax", "LWF Registration", "POSH Registration"] },
      { key: "registration_number", label: "Registration Number", required: true },
      { key: "issue_date", label: "Issue Date", inputType: "date" },
      { key: "expiry_date", label: "Expiry Date", inputType: "date" },
      { key: "renewal_due", label: "Renewal Due Date", inputType: "date" },
      { key: "authority", label: "Issuing Authority" },
      { key: "status", label: "Status", inputType: "select", options: ["active", "expired", "suspended", "pending_renewal"], defaultValue: "active" },
      { key: "reminder_days", label: "Reminder Days", inputType: "number", defaultValue: 30 },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "contract-labour",
    label: "Contract Labour Compliance",
    group: "Signature",
    description: "Track contractor compliance — agreements, licences, returns",
    endpoint: "/contract-labour",
    columns: [
      { key: "principal_employer", label: "Principal Employer" },
      { key: "contractor", label: "Contractor" },
      { key: "license_no", label: "Licence No." },
      { key: "worker_count", label: "Workers", type: "number" },
      { key: "agreement_available", label: "Agreement", type: "boolean" },
      { key: "labour_license_valid", label: "Licence Valid", type: "boolean" },
      { key: "returns_submitted", label: "Returns Filed", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "principal_employer", label: "Principal Employer", required: true },
      { key: "contractor", label: "Contractor", required: true },
      { key: "license_no", label: "Licence Number" },
      { key: "contract_period_start", label: "Contract Start", inputType: "date" },
      { key: "contract_period_end", label: "Contract End", inputType: "date" },
      { key: "worker_count", label: "Worker Count", inputType: "number", defaultValue: 0 },
      { key: "agreement_available", label: "Agreement Available", inputType: "checkbox", defaultValue: false },
      { key: "labour_license_valid", label: "Labour Licence Valid", inputType: "checkbox", defaultValue: false },
      { key: "returns_submitted", label: "Returns Submitted", inputType: "checkbox", defaultValue: false },
      { key: "status", label: "Status", inputType: "select", options: ["compliant", "non_compliant", "under_review"], defaultValue: "compliant" },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "min-wages",
    label: "Minimum Wages Compliance",
    group: "Signature",
    description: "Compare actual wages against government minimum wage rates",
    endpoint: "/min-wages",
    columns: [
      { key: "employee_name", label: "Employee" },
      { key: "category", label: "Category" },
      { key: "state", label: "State" },
      { key: "minimum_wage", label: "Min Wage", type: "number" },
      { key: "actual_wage", label: "Actual Wage", type: "number" },
      { key: "difference", label: "Difference", type: "number" },
      { key: "is_compliant", label: "Compliant", type: "boolean" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "employee_name", label: "Employee Name", required: true },
      { key: "category", label: "Category", required: true, options: ["Skilled", "Semi-Skilled", "Unskilled", "Clerical"] },
      { key: "state", label: "State", required: true },
      { key: "minimum_wage", label: "Minimum Wage (₹)", inputType: "number", required: true },
      { key: "actual_wage", label: "Actual Wage (₹)", inputType: "number", required: true },
      { key: "difference", label: "Difference (₹)", inputType: "number" },
      { key: "is_compliant", label: "Compliant", inputType: "checkbox", defaultValue: true },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "pf-esi",
    label: "PF / ESI Coverage",
    group: "Signature",
    description: "Track UAN, ESIC, contributions, challans, and deposit dates",
    endpoint: "/pf-esi",
    columns: [
      { key: "employee_name", label: "Employee" },
      { key: "uan", label: "UAN" },
      { key: "esic_number", label: "ESIC No." },
      { key: "pf_applicable", label: "PF", type: "boolean" },
      { key: "esi_applicable", label: "ESI", type: "boolean" },
      { key: "employer_contribution", label: "Employer (₹)", type: "number" },
      { key: "employee_contribution", label: "Employee (₹)", type: "number" },
      { key: "deposit_date", label: "Deposit Date", type: "date" },
      { key: "challan_number", label: "Challan No." },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "employee_name", label: "Employee Name", required: true },
      { key: "uan", label: "UAN Number" },
      { key: "esic_number", label: "ESIC Number" },
      { key: "pf_applicable", label: "PF Applicable", inputType: "checkbox", defaultValue: false },
      { key: "esi_applicable", label: "ESI Applicable", inputType: "checkbox", defaultValue: false },
      { key: "employer_contribution", label: "Employer Contribution (₹)", inputType: "number" },
      { key: "employee_contribution", label: "Employee Contribution (₹)", inputType: "number" },
      { key: "deposit_date", label: "Deposit Date", inputType: "date" },
      { key: "challan_number", label: "Challan Number" },
      { key: "status", label: "Status", inputType: "select", options: ["deposited", "pending", "overdue", "reconciled"], defaultValue: "deposited" },
    ],
  },
  {
    id: "bonus-gratuity",
    label: "Bonus & Gratuity",
    group: "Signature",
    description: "Track bonus eligibility, payments, and gratuity entitlements",
    endpoint: "/bonus-gratuity",
    columns: [
      { key: "employee_name", label: "Employee" },
      { key: "bonus_eligible", label: "Bonus Eligible", type: "boolean" },
      { key: "bonus_paid", label: "Bonus Paid (₹)", type: "number" },
      { key: "bonus_date", label: "Bonus Date", type: "date" },
      { key: "gratuity_eligible", label: "Gratuity Eligible", type: "boolean" },
      { key: "gratuity_amount", label: "Gratuity (₹)", type: "number" },
      { key: "years_of_service", label: "Years", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "employee_name", label: "Employee Name", required: true },
      { key: "bonus_eligible", label: "Bonus Eligible", inputType: "checkbox", defaultValue: false },
      { key: "bonus_paid", label: "Bonus Paid (₹)", inputType: "number" },
      { key: "bonus_date", label: "Bonus Date", inputType: "date" },
      { key: "gratuity_eligible", label: "Gratuity Eligible", inputType: "checkbox", defaultValue: false },
      { key: "gratuity_amount", label: "Gratuity Amount (₹)", inputType: "number" },
      { key: "years_of_service", label: "Years of Service", inputType: "number", defaultValue: 0 },
      { key: "status", label: "Status", inputType: "select", options: ["paid", "pending", "partially_paid"], defaultValue: "pending" },
    ],
  },
  {
    id: "working-hours",
    label: "Working Hours & Overtime",
    group: "Signature",
    description: "Track attendance, working hours, OT, and auto-detect violations",
    endpoint: "/working-hours",
    columns: [
      { key: "employee_name", label: "Employee" },
      { key: "attendance_date", label: "Date", type: "date" },
      { key: "working_hours", label: "Work Hrs", type: "number" },
      { key: "overtime_hours", label: "OT Hrs", type: "number" },
      { key: "weekly_off", label: "Weekly Off", type: "boolean" },
      { key: "holiday", label: "Holiday", type: "boolean" },
      { key: "is_violation", label: "Violation", type: "boolean" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "employee_name", label: "Employee Name", required: true },
      { key: "attendance_date", label: "Attendance Date", inputType: "date", required: true },
      { key: "working_hours", label: "Working Hours", inputType: "number", required: true },
      { key: "overtime_hours", label: "Overtime Hours", inputType: "number", defaultValue: 0 },
      { key: "weekly_off", label: "Weekly Off", inputType: "checkbox", defaultValue: false },
      { key: "holiday", label: "Holiday", inputType: "checkbox", defaultValue: false },
      { key: "is_violation", label: "Violation Detected", inputType: "checkbox", defaultValue: false },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "contractor-pf-esi",
    label: "Contractor PF/ESI Verification",
    group: "Signature",
    description: "Verify contractor PF and ESI challan submissions",
    endpoint: "/contractor-pf-esi",
    columns: [
      { key: "contractor", label: "Contractor" },
      { key: "month", label: "Month" },
      { key: "worker_count", label: "Workers", type: "number" },
      { key: "verification_status", label: "Status", type: "status" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "contractor", label: "Contractor Name", required: true },
      { key: "month", label: "Month (YYYY-MM)", required: true, placeholder: "2026-07" },
      { key: "worker_count", label: "Worker Count", inputType: "number", defaultValue: 0 },
      { key: "verification_status", label: "Verification Status", inputType: "select", options: ["verified", "pending", "rejected"], defaultValue: "pending" },
      { key: "pf_challan_path", label: "PF Challan Path" },
      { key: "esi_challan_path", label: "ESI Challan Path" },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "posh",
    label: "POSH Compliance",
    group: "Signature",
    description: "Track ICC formation, training, complaints, and annual reports",
    endpoint: "/posh",
    columns: [
      { key: "site", label: "Site" },
      { key: "icc_formed", label: "ICC Formed", type: "boolean" },
      { key: "training_conducted", label: "Training", type: "boolean" },
      { key: "annual_report_filed", label: "Annual Report", type: "boolean" },
      { key: "complaint_count", label: "Complaints", type: "number" },
      { key: "pending_cases", label: "Pending", type: "number" },
      { key: "status", label: "Status", type: "status" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "site", label: "Site", required: true },
      { key: "icc_formed", label: "ICC Formed", inputType: "checkbox", defaultValue: false },
      { key: "members", label: "ICC Members (comma separated)" },
      { key: "training_conducted", label: "Training Conducted", inputType: "checkbox", defaultValue: false },
      { key: "annual_report_filed", label: "Annual Report Filed", inputType: "checkbox", defaultValue: false },
      { key: "complaint_count", label: "Complaint Count", inputType: "number", defaultValue: 0 },
      { key: "pending_cases", label: "Pending Cases", inputType: "number", defaultValue: 0 },
      { key: "status", label: "Status", inputType: "select", options: ["compliant", "non_compliant", "partial"], defaultValue: "compliant" },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "lwf",
    label: "Labour Welfare Fund",
    group: "Signature",
    description: "Track LWF deductions, employer/employee shares, deposits",
    endpoint: "/lwf",
    columns: [
      { key: "employee_name", label: "Employee" },
      { key: "lwf_deduction", label: "LWF Deduction (₹)", type: "number" },
      { key: "employer_share", label: "Employer Share (₹)", type: "number" },
      { key: "employee_share", label: "Employee Share (₹)", type: "number" },
      { key: "deposit_date", label: "Deposit Date", type: "date" },
      { key: "challan", label: "Challan" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "employee_name", label: "Employee Name", required: true },
      { key: "lwf_deduction", label: "LWF Deduction (₹)", inputType: "number" },
      { key: "employer_share", label: "Employer Share (₹)", inputType: "number" },
      { key: "employee_share", label: "Employee Share (₹)", inputType: "number" },
      { key: "deposit_date", label: "Deposit Date", inputType: "date" },
      { key: "challan", label: "Challan Number" },
      { key: "status", label: "Status", inputType: "select", options: ["deposited", "pending", "overdue"], defaultValue: "pending" },
    ],
  },
  {
    id: "returns",
    label: "Return Filing Tracker",
    group: "Signature",
    description: "Track statutory return due dates, filings, and penalties",
    endpoint: "/returns",
    columns: [
      { key: "return_name", label: "Return Name" },
      { key: "frequency", label: "Frequency" },
      { key: "due_date", label: "Due Date", type: "date" },
      { key: "filed_date", label: "Filed Date", type: "date" },
      { key: "status", label: "Status", type: "status" },
      { key: "penalty", label: "Penalty (₹)", type: "number" },
      { key: "remarks", label: "Remarks" },
    ],
    formFields: [
      { key: "return_name", label: "Return Name", required: true, options: ["PF ECR", "ESI Half-Yearly Return", "Form 5", "Form 10", "Form 19", "Form 10C", "Annual Return (Factories)", "Annual Return (Shops)", "POSH Annual Report", "LWF Return", "Gratuity Return"] },
      { key: "frequency", label: "Frequency", inputType: "select", options: ["monthly", "quarterly", "half_yearly", "annual"], required: true },
      { key: "due_date", label: "Due Date", inputType: "date", required: true },
      { key: "filed_date", label: "Filed Date", inputType: "date" },
      { key: "status", label: "Status", inputType: "select", options: ["filed", "pending", "overdue", "extension"], defaultValue: "pending" },
      { key: "penalty", label: "Penalty (₹)", inputType: "number", defaultValue: 0 },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "inspections",
    label: "Inspection Notice Log",
    group: "Signature",
    description: "Log labour inspector visits, notices, observations, and actions",
    endpoint: "/inspections",
    columns: [
      { key: "inspection_date", label: "Date", type: "date" },
      { key: "inspector_name", label: "Inspector" },
      { key: "department", label: "Department" },
      { key: "notice_number", label: "Notice No." },
      { key: "observation", label: "Observation" },
      { key: "action_taken", label: "Action Taken" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "inspection_date", label: "Inspection Date", inputType: "date", required: true },
      { key: "inspector_name", label: "Inspector Name", required: true },
      { key: "department", label: "Department", required: true, options: ["Labour Department", "Factory Inspectorate", "ESI Department", "PF Department", "Police", "Fire Department"] },
      { key: "notice_number", label: "Notice Number" },
      { key: "observation", label: "Observation", inputType: "textarea" },
      { key: "action_taken", label: "Action Taken", inputType: "textarea" },
      { key: "status", label: "Status", inputType: "select", options: ["open", "resolved", "escalated"], defaultValue: "open" },
    ],
  },
  {
    id: "wage-code",
    label: "Wage Code Readiness",
    group: "Signature",
    description: "Gap assessment for new Labour Codes — requirements, actions, owners",
    endpoint: "/wage-code",
    columns: [
      { key: "requirement", label: "Requirement" },
      { key: "status", label: "Status", type: "status" },
      { key: "gap", label: "Gap" },
      { key: "action", label: "Action" },
      { key: "owner", label: "Owner" },
      { key: "target_date", label: "Target Date", type: "date" },
    ],
    formFields: [
      { key: "requirement", label: "Requirement", required: true },
      { key: "status", label: "Status", inputType: "select", options: ["not_started", "in_progress", "completed", "gap_identified"], defaultValue: "not_started" },
      { key: "gap", label: "Gap Description", inputType: "textarea" },
      { key: "action", label: "Action Plan", inputType: "textarea" },
      { key: "owner", label: "Owner" },
      { key: "target_date", label: "Target Date", inputType: "date" },
    ],
  },
  {
    id: "contract-workers",
    label: "Contract Worker Master",
    group: "Signature",
    description: "Master list of contract workers — contractor, skill, PF, ESI, status",
    endpoint: "/contract-workers",
    columns: [
      { key: "worker_name", label: "Worker Name" },
      { key: "contractor", label: "Contractor" },
      { key: "joining_date", label: "Joining Date", type: "date" },
      { key: "skill", label: "Skill" },
      { key: "department", label: "Department" },
      { key: "pf_applicable", label: "PF", type: "boolean" },
      { key: "esi_applicable", label: "ESI", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "worker_name", label: "Worker Name", required: true },
      { key: "contractor", label: "Contractor", required: true },
      { key: "joining_date", label: "Joining Date", inputType: "date" },
      { key: "aadhaar", label: "Aadhaar Number" },
      { key: "pf_applicable", label: "PF Applicable", inputType: "checkbox", defaultValue: false },
      { key: "esi_applicable", label: "ESI Applicable", inputType: "checkbox", defaultValue: false },
      { key: "skill", label: "Skill", options: ["Skilled", "Semi-Skilled", "Unskilled", "Clerical", "Supervisory"] },
      { key: "department", label: "Department", options: ["Production", "Maintenance", "Warehouse", "Housekeeping", "Security", "Transport", "Other"] },
      { key: "status", label: "Status", inputType: "select", options: ["active", "inactive", "relieved"], defaultValue: "active" },
    ],
  },
  // ─── FEATURES 16-25: COMMON AUDIT SHELL ────────────────────────────────
  { id: "dashboard", label: "Dashboard", group: "Audit Shell", description: "Live KPIs and compliance metrics", endpoint: "/dashboard", columns: [], formFields: [] },
  { id: "scope", label: "Scope & Audit Universe", group: "Audit Shell", description: "Auditable sites, departments, processes", endpoint: "/scope", columns: [], formFields: [] },
  { id: "rcm", label: "Risk & Control Matrix", group: "Audit Shell", description: "Risk, control, owner, frequency, rating", endpoint: "/rcm", columns: [], formFields: [] },
  { id: "test-rules", label: "Test & Analytics Rules", group: "Audit Shell", description: "Automated rules, thresholds, SQL logic", endpoint: "/test-rules", columns: [], formFields: [] },
  { id: "data-sources", label: "Data Source Connector", group: "Audit Shell", description: "ERP, API, CSV upload connections", endpoint: "/data-sources", columns: [], formFields: [] },
  { id: "sampling", label: "Sampling Builder", group: "Audit Shell", description: "Population, sample type, generated samples", endpoint: "/sampling", columns: [], formFields: [] },
  { id: "exceptions", label: "Exception Queue", group: "Audit Shell", description: "Red-flag queue for triage", endpoint: "/exceptions", columns: [], formFields: [] },
  { id: "working-papers", label: "Working Papers", group: "Audit Shell", description: "Evidence, screenshots, reviewer comments", endpoint: "/working-papers", columns: [], formFields: [] },
  { id: "findings", label: "Observation & Finding Log", group: "Audit Shell", description: "Observations, conditions, causes, impact", endpoint: "/findings", columns: [], formFields: [] },
  { id: "remediation", label: "Remediation Tracker", group: "Audit Shell", description: "Corrective actions, retesting, status", endpoint: "/remediation", columns: [], formFields: [] },
];

const SIGNATURE = FEATURES.filter((f) => f.group === "Signature");
const SHELL = FEATURES.filter((f) => f.group === "Audit Shell");

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function renderCellValue(val: unknown, type?: string): string {
  if (val === null || val === undefined) return "—";
  if (type === "boolean") return val ? "Yes" : "No";
  if (type === "date") {
    const d = String(val).slice(0, 10);
    return d || "—";
  }
  if (type === "number") return Number(val).toLocaleString();
  if (type === "status") {
    const s = String(val);
    const colors: Record<string, string> = {
      active: "var(--success)", compliant: "var(--success)", verified: "var(--success)",
      filed: "var(--success)", deposited: "var(--success)", completed: "var(--success)",
      resolved: "var(--success)", paid: "var(--success)",
      pending: "#D97706", pending_renewal: "#D97706", under_review: "#D97706",
      partial: "#D97706", in_progress: "#D97706", overdue: "var(--danger)",
      expired: "var(--danger)", non_compliant: "var(--danger)", rejected: "var(--danger)",
      suspended: "var(--danger)", escalated: "var(--danger)",
      open: "#D97706", extension: "#D97706",
      not_started: "var(--slate)", gap_identified: "var(--danger)",
      inactive: "var(--slate)", relieved: "var(--danger)",
    };
    return s;
  }
  return String(val);
}

function StatusBadge({ val, type }: { val: unknown; type?: string }) {
  if (type !== "status") return <>{renderCellValue(val, type)}</>;
  const s = String(val);
  const bg: Record<string, string> = {
    active: "#ECFDF3", compliant: "#ECFDF3", verified: "#ECFDF3",
    filed: "#ECFDF3", deposited: "#ECFDF3", completed: "#ECFDF3",
    resolved: "#ECFDF3", paid: "#ECFDF3",
    pending: "#FEF3C7", pending_renewal: "#FEF3C7", under_review: "#FEF3C7",
    partial: "#FEF3C7", in_progress: "#FEF3C7",
    overdue: "#FEF2F2", expired: "#FEF2F2", non_compliant: "#FEF2F2",
    rejected: "#FEF2F2", suspended: "#FEF2F2", escalated: "#FEF2F2",
    open: "#FEF3C7", extension: "#FEF3C7",
    not_started: "#F5F7FA", gap_identified: "#FEF2F2",
    inactive: "#F5F7FA", relieved: "#FEF2F2",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        background: bg[s] || "#F5F7FA",
        color: s.includes("compliant") || s === "active" || s === "verified" || s === "filed" || s === "deposited" || s === "completed" || s === "resolved" || s === "paid"
          ? "var(--success)" : s.includes("overdue") || s.includes("expired") || s.includes("non_compliant") || s === "rejected" || s === "suspended" || s === "escalated" || s === "relieved"
          ? "var(--danger)" : s.includes("pending") || s === "under_review" || s === "partial" || s === "in_progress" || s === "open" || s === "extension"
          ? "#92400E" : "var(--slate)",
      }}
    >
      {s.replace(/_/g, " ")}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD VIEW
// ═══════════════════════════════════════════════════════════════════════════

function CrudView({ feature }: { feature: FeatureDef }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<Record<string, unknown>[]>(`${API_BASE}${feature.endpoint}`);
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [feature.endpoint]);

  useEffect(() => { refresh(); }, [refresh]);

  function initForm() {
    const vals: Record<string, unknown> = {};
    for (const f of feature.formFields) {
      vals[f.key] = f.defaultValue ?? (f.inputType === "checkbox" ? false : "");
    }
    setFormValues(vals);
  }

  function handleAdd() {
    initForm();
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post(`${API_BASE}${feature.endpoint}`, formValues);
      setShowForm(false);
      refresh();
    } catch (err: any) {
      alert(err.message || "Error creating record");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    try {
      await del(`${API_BASE}${feature.endpoint}/${id}`);
      refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting record");
    }
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    return JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ flex: 1, maxWidth: 320 }}>
          <input
            className="input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAdd} style={{ padding: "8px 20px" }}>
          + Add Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>New Record</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {feature.formFields.map((f) => (
              <div key={f.key} className="field">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 4, display: "block" }}>
                  {f.label}{f.required && " *"}
                </label>
                {f.inputType === "checkbox" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={!!formValues[f.key]}
                      onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.checked })}
                    />
                    {f.label}
                  </label>
                ) : f.inputType === "select" ? (
                  <select
                    className="input"
                    value={String(formValues[f.key] ?? "")}
                    onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                    required={f.required}
                    style={{ width: "100%" }}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.inputType === "textarea" ? (
                  <textarea
                    className="input"
                    value={String(formValues[f.key] ?? "")}
                    onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                    rows={3}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                ) : (
                  <input
                    className="input"
                    type={f.inputType || "text"}
                    value={String(formValues[f.key] ?? "")}
                    onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                    required={f.required}
                    placeholder={f.placeholder}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ padding: 20 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 36, background: "var(--mist)", borderRadius: 4, marginBottom: 8, opacity: 0.5 - i * 0.08 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--slate)", padding: 20 }}>No records found.</p>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "var(--slate)", whiteSpace: "nowrap" }}>#</th>
                {feature.columns.map((c) => (
                  <th key={c.key} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "var(--slate)", whiteSpace: "nowrap" }}>{c.label}</th>
                ))}
                <th style={{ padding: "10px 12px", width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: any, idx: number) => (
                <tr key={row.id ?? idx} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--slate)" }}>{idx + 1}</td>
                  {feature.columns.map((c) => (
                    <td key={c.key} style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <StatusBadge val={row[c.key]} type={c.type} />
                    </td>
                  ))}
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 11, color: "var(--danger)" }}
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHELL VIEW (JSON / KPI display)
// ═══════════════════════════════════════════════════════════════════════════

function ShellView({ feature }: { feature: FeatureDef }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await get<Record<string, unknown>>(`${API_BASE}${feature.endpoint}`);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [feature.endpoint]);

  if (loading) return <div style={{ padding: 20, color: "var(--slate)" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 20, color: "var(--danger)" }}>Failed to load data.</div>;

  const renderValue = (val: unknown): string => {
    if (Array.isArray(val)) return val.length === 0 ? "No records" : `${val.length} record(s)`;
    if (typeof val === "object" && val !== null) return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <div>
      {Object.entries(data).filter(([k]) => k !== "module" && k !== "status").map(([key, val]) => (
        <div key={key} className="card" style={{ padding: 16, marginBottom: 12 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "var(--navy)", textTransform: "capitalize" }}>
            {key.replace(/_/g, " ")}
          </h4>
          {Array.isArray(val) && val.length > 0 && typeof val[0] === "object" ? (
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--line)" }}>
                    {Object.keys(val[0] as Record<string, unknown>).map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "var(--slate)", textTransform: "capitalize" }}>{h.replace(/_/g, " ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(val as Record<string, unknown>[]).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                      {Object.values(r).map((v, j) => (
                        <td key={j} style={{ padding: "8px 10px" }}>{String(v ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : Array.isArray(val) && val.length === 0 ? (
            <p style={{ color: "var(--slate)", margin: 0, fontSize: 13 }}>No records</p>
          ) : typeof val === "object" && val !== null && !Array.isArray(val) ? (
            <pre style={{ margin: 0, fontSize: 12, background: "var(--mist)", padding: 12, borderRadius: 6, overflow: "auto", maxHeight: 300 }}>
              {JSON.stringify(val, null, 2)}
            </pre>
          ) : (
            <p style={{ margin: 0, fontSize: 14 }}>{renderValue(val)}</p>
          )}
        </div>
      ))}
      <p style={{ color: "var(--slate)", fontSize: 12, marginTop: 12 }}>{String(data.status || "")}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LabourCompliancePage() {
  const [activeId, setActiveId] = useState("applicability");
  const activeFeature = FEATURES.find((f) => f.id === activeId) || FEATURES[0];

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 60px)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: "var(--navyDeep)",
          color: "#fff",
          overflowY: "auto",
          padding: "16px 0",
        }}
      >
        <div style={{ padding: "0 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>Labour Compliance</span>
        </div>

        <div style={{ padding: "12px 16px 4px", fontSize: 10, fontWeight: 700, color: "var(--goldSoft)", textTransform: "uppercase", letterSpacing: 1 }}>
          Signature Features
        </div>
        {SIGNATURE.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(f.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "7px 16px",
              border: "none",
              background: activeId === f.id ? "rgba(200,162,75,0.15)" : "transparent",
              color: activeId === f.id ? "var(--gold)" : "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: activeId === f.id ? 600 : 400,
              cursor: "pointer",
              borderLeft: activeId === f.id ? "3px solid var(--gold)" : "3px solid transparent",
            }}
          >
            {f.label}
          </button>
        ))}

        <div style={{ padding: "12px 16px 4px", marginTop: 8, fontSize: 10, fontWeight: 700, color: "var(--goldSoft)", textTransform: "uppercase", letterSpacing: 1, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
          Audit Shell
        </div>
        {SHELL.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(f.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "7px 16px",
              border: "none",
              background: activeId === f.id ? "rgba(200,162,75,0.15)" : "transparent",
              color: activeId === f.id ? "var(--gold)" : "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: activeId === f.id ? 600 : 400,
              cursor: "pointer",
              borderLeft: activeId === f.id ? "3px solid var(--gold)" : "3px solid transparent",
            }}
          >
            {f.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "20px 24px", overflow: "auto", background: "var(--mist)" }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "var(--slate)" }}>
            Labour Compliance → {activeFeature.group} → {activeFeature.label}
          </span>
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
          {activeFeature.label}
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--slate)" }}>
          {activeFeature.description}
        </p>

        {activeFeature.group === "Signature" ? (
          <CrudView feature={activeFeature} />
        ) : (
          <ShellView feature={activeFeature} />
        )}
      </main>
    </div>
  );
}
