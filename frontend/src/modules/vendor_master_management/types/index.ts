export interface Vendor {
  id: number;
  tenant_id: number;
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  gst_number: string | null;
  pan_number: string | null;
  msme_status: string | null;
  msme_reg_number: string | null;
  msme_expiry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  spend_amount: number;
  last_purchase_date: string | null;
  last_payment_date: string | null;
  open_po_count: number;
  open_invoice_count: number;
  change_count: number;
  created_by: string | null;
  created_date: string | null;
  modified_by: string | null;
  modified_date: string | null;
}

export interface VendorCreate {
  vendor_code: string;
  vendor_name: string;
  vendor_type?: string;
  gst_number?: string;
  pan_number?: string;
  msme_status?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface VendorUpdate {
  vendor_name?: string;
  vendor_type?: string;
  gst_number?: string;
  pan_number?: string;
  msme_status?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  status?: string;
  spend_amount?: number;
}

export interface BankHistory {
  id: number;
  tenant_id: number;
  vendor_id: number;
  old_account_number: string | null;
  new_account_number: string | null;
  old_ifsc: string | null;
  new_ifsc: string | null;
  old_bank_name: string | null;
  new_bank_name: string | null;
  changed_by: string | null;
  changed_date: string;
  approval_status: string;
  remarks: string | null;
}

export interface KYCRecord {
  id: number;
  tenant_id: number;
  vendor_id: number;
  gst_verified: boolean;
  pan_verified: boolean;
  msme_verified: boolean;
  kyc_status: string;
  verification_date: string | null;
  verified_by: string | null;
  remarks: string | null;
}

export interface AuditLog {
  id: number;
  tenant_id: number;
  vendor_id: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  performed_at: string;
  ip_address: string | null;
}

export interface BlacklistEntry {
  id: number;
  tenant_id: number;
  vendor_name: string | null;
  pan_number: string | null;
  gst_number: string | null;
  source: string;
  reason: string | null;
  listed_date: string;
}

export interface Approval {
  id: number;
  tenant_id: number;
  vendor_id: number;
  action_type: string;
  maker: string | null;
  maker_date: string | null;
  checker: string | null;
  checker_date: string | null;
  status: string;
  remarks: string | null;
}

export interface Relationship {
  id: number;
  tenant_id: number;
  vendor_id: number;
  related_vendor_id: number | null;
  relationship_type: string;
  shared_field: string | null;
  shared_value: string | null;
  risk_score: number;
  created_date: string;
}

export interface DashboardStats {
  total_vendors: number;
  active_vendors: number;
  dormant_vendors: number;
  duplicate_vendors: number;
  missing_gst: number;
  missing_pan: number;
  pending_kyc: number;
  duplicate_bank_accounts: number;
  high_risk_vendors: number;
  vendor_concentration_pct: number;
  open_findings: number;
  capa_pending: number;
}

export interface DashboardData {
  stats: DashboardStats;
  vendor_status: { status: string; count: number }[];
  vendor_category: { category: string; count: number }[];
  risk_distribution: { level: string; count: number }[];
  monthly_creation: { month: string; count: number }[];
  bank_change_trend: { month: string; count: number }[];
  top_vendors_by_spend: { vendor_name: string; spend_amount: number }[];
  exception_trend: { month: string; count: number }[];
}

export interface DuplicateVendorResult {
  vendor_a_id: number;
  vendor_a_code: string;
  vendor_a_name: string;
  vendor_b_id: number;
  vendor_b_code: string;
  vendor_b_name: string;
  duplicate_score: number;
  reason: string;
}

export interface BankChangeResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  old_account: string | null;
  new_account: string | null;
  old_ifsc: string | null;
  new_ifsc: string | null;
  changed_by: string | null;
  changed_date: string | null;
  approval_status: string;
}

export interface KYCValidationResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  gst_number: string | null;
  pan_number: string | null;
  gst_verified: boolean;
  pan_verified: boolean;
  msme_verified: boolean;
  kyc_status: string;
  missing_fields: string[];
}

export interface ConcentrationResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  spend_amount: number;
  percentage: number;
  risk_level: string;
}

export interface DormantVendorResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  status: string;
  last_purchase_date: string | null;
  last_payment_date: string | null;
  idle_days: number;
}

export interface EmployeeOverlapResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  match_type: string;
  match_value: string;
  risk_score: number;
}

export interface BlacklistResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  matched_field: string;
  matched_value: string;
  blacklist_source: string;
  reason: string | null;
}

export interface DuplicateBankResult {
  account_number: string;
  ifsc: string | null;
  bank_name: string | null;
  vendors: { id: number; name: string; code: string }[];
}

export interface CompletenessResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  total_fields: number;
  filled_fields: number;
  completeness_pct: number;
  missing_fields: string[];
}

export interface ApprovalAuditResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  action_type: string;
  maker: string | null;
  maker_date: string | null;
  checker: string | null;
  checker_date: string | null;
  status: string;
  remarks: string | null;
}

export interface CategoryValidationResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  vendor_type: string;
  is_valid: boolean;
  issue: string | null;
}

export interface MSMEValidationResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  msme_status: string | null;
  msme_reg_number: string | null;
  msme_expiry: string | null;
  is_valid: boolean;
  issue: string | null;
}

export interface ChangeFrequencyResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  change_count: number;
  risk_level: string;
}

export interface RelatedPartyResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  related_vendor_id: number | null;
  related_vendor_name: string | null;
  relationship_type: string;
  shared_field: string | null;
  risk_score: number;
}

export interface DeactivationResult {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  status: string;
  open_po_count: number;
  open_invoice_count: number;
  has_blockers: boolean;
  issues: string[];
}
