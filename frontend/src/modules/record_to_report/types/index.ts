export interface JournalEntry {
  id: number;
  tenant_id: number;
  je_number: string;
  je_date: string;
  period: string;
  fiscal_year: number;
  company_code: string | null;
  business_unit: string | null;
  plant: string | null;
  account_code: string;
  account_name: string | null;
  account_type: string;
  cost_center: string | null;
  profit_center: string | null;
  debit_amount: number;
  credit_amount: number;
  currency: string;
  narration: string | null;
  user_id: string | null;
  user_name: string | null;
  posting_time: string | null;
  posting_type: string;
  status: string;
  reference_doc: string | null;
  reversal_of: string | null;
  is_post_close: boolean;
  is_suspense: boolean;
  risk_score: number;
  risk_level: string;
  exception_count: number;
  source_file: string | null;
  created_by: string | null;
  modified_by: string | null;
  created_date: string | null;
}

export interface R2RException {
  id: number;
  tenant_id: number;
  journal_entry_id: number | null;
  rule_id: string | null;
  rule_name: string | null;
  category: string;
  severity: string;
  description: string | null;
  status: string;
  owner: string | null;
  notes: string | null;
  detected_date: string;
  resolved_date: string | null;
}

export interface Reconciliation {
  id: number;
  tenant_id: number;
  journal_entry_id: number | null;
  account_code: string;
  account_name: string | null;
  gl_balance: number;
  subledger_balance: number;
  difference: number;
  reconciliation_date: string | null;
  status: string;
  owner: string | null;
  notes: string | null;
  approved_by: string | null;
  approved_date: string | null;
}

export interface CloseTask {
  id: number;
  tenant_id: number;
  period: string;
  task_name: string;
  description: string | null;
  owner: string | null;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  is_delayed: boolean;
  priority: string;
  category: string | null;
  remarks: string | null;
}

export interface Finding {
  id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  category: string;
  risk_rating: string;
  status: string;
  owner: string | null;
  recommendation: string | null;
  audit_period: string | null;
  related_je_id: number | null;
  created_date: string;
  closed_date: string | null;
}

export interface Workpaper {
  id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  procedure: string | null;
  status: string;
  prepared_by: string | null;
  reviewed_by: string | null;
  attachments: string | null;
  tick_marks: string | null;
  conclusion: string | null;
  audit_period: string | null;
  created_date: string;
  modified_date: string;
}

export interface Action {
  id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  action_type: string;
  priority: string;
  status: string;
  owner: string | null;
  due_date: string | null;
  completed_date: string | null;
  retest_date: string | null;
  evidence: string | null;
  finding_id: number | null;
  is_overdue: boolean;
  created_date: string;
}

export interface Rule {
  id: number;
  tenant_id: number;
  rule_code: string;
  rule_name: string;
  description: string | null;
  category: string;
  severity: string;
  threshold_value: number | null;
  threshold_unit: string | null;
  conditions: string | null;
  is_active: boolean;
  created_date: string;
}

export interface AuditScope {
  id: number;
  tenant_id: number;
  scope_name: string;
  entity: string | null;
  business_unit: string | null;
  plant: string | null;
  location: string | null;
  period_from: string | null;
  period_to: string | null;
  status: string;
  description: string | null;
  created_date: string;
}

export interface DashboardStats {
  total_journals: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  open_findings: number;
  open_capa: number;
  open_reconciliation: number;
  suspense_balance: number;
}

export interface DashboardData {
  stats: DashboardStats;
  risk_trend: { month: string; count: number }[];
  risk_distribution: { level: string; count: number }[];
  amount_histogram: { bucket: string; count: number }[];
  monthly_trend: { month: string; count: number }[];
  top_users: { user_name: string; count: number }[];
  top_accounts: { account_code: string; account_name: string; count: number }[];
  posting_heatmap: { hour: number; day: string; count: number }[];
  exception_trend: { month: string; count: number }[];
}
