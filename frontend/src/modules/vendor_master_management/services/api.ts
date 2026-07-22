import { get, post, put, del } from "../../../lib/api";
import type {
  Vendor,
  VendorCreate,
  VendorUpdate,
  DashboardData,
  DuplicateVendorResult,
  BankChangeResult,
  KYCValidationResult,
  ConcentrationResult,
  DormantVendorResult,
  EmployeeOverlapResult,
  BlacklistResult,
  DuplicateBankResult,
  CompletenessResult,
  ApprovalAuditResult,
  CategoryValidationResult,
  MSMEValidationResult,
  ChangeFrequencyResult,
  RelatedPartyResult,
  DeactivationResult,
  BankHistory,
  KYCRecord,
  AuditLog,
  BlacklistEntry,
  Approval,
  Relationship,
} from "../types";

const BASE = "/api/modules/vendor_master_management";

export const vendorApi = {
  // Dashboard
  dashboard: () => get<DashboardData>(`${BASE}/dashboard`),

  // Vendor CRUD
  list: () => get<Vendor[]>(`${BASE}/list`),
  create: (data: VendorCreate) => post<Vendor>(`${BASE}/create`, data),
  update: (id: number, data: VendorUpdate) => put<Vendor>(`${BASE}/update/${id}`, data),
  remove: (id: number) => del(`${BASE}/delete/${id}`),

  // Signature Analytics
  duplicates: () => get<DuplicateVendorResult[]>(`${BASE}/duplicate`),
  bankChanges: () => get<BankChangeResult[]>(`${BASE}/bank-changes`),
  kyc: () => get<KYCValidationResult[]>(`${BASE}/kyc`),
  concentration: () => get<ConcentrationResult[]>(`${BASE}/concentration`),
  noTransactions: () => get<DormantVendorResult[]>(`${BASE}/no-transactions`),
  employeeOverlap: () => get<EmployeeOverlapResult[]>(`${BASE}/employee-overlap`),
  blacklist: () => get<BlacklistResult[]>(`${BASE}/blacklist`),
  duplicateBank: () => get<DuplicateBankResult[]>(`${BASE}/duplicate-bank`),
  completeness: () => get<CompletenessResult[]>(`${BASE}/completeness`),
  approvalAudit: () => get<ApprovalAuditResult[]>(`${BASE}/approval`),
  category: () => get<CategoryValidationResult[]>(`${BASE}/category`),
  msme: () => get<MSMEValidationResult[]>(`${BASE}/msme`),
  changeFrequency: () => get<ChangeFrequencyResult[]>(`${BASE}/change-frequency`),
  relatedParty: () => get<RelatedPartyResult[]>(`${BASE}/related-party`),
  deactivation: () => get<DeactivationResult[]>(`${BASE}/deactivation`),

  // Sub-entity CRUD
  bankHistory: (vendorId?: number) =>
    get<BankHistory[]>(`${BASE}/bank-history${vendorId ? `?vendor_id=${vendorId}` : ""}`),
  createBankHistory: (data: Partial<BankHistory>) =>
    post<BankHistory>(`${BASE}/bank-history`, data),

  kycList: () => get<KYCRecord[]>(`${BASE}/kyc-list`),
  updateKyc: (vendorId: number, data: Partial<KYCRecord>) =>
    put<KYCRecord>(`${BASE}/kyc/${vendorId}`, data),

  auditLogs: (vendorId?: number) =>
    get<AuditLog[]>(`${BASE}/audit-logs${vendorId ? `?vendor_id=${vendorId}` : ""}`),

  blacklistList: () => get<BlacklistEntry[]>(`${BASE}/blacklist-list`),
  addToBlacklist: (data: Partial<BlacklistEntry>) =>
    post<BlacklistEntry>(`${BASE}/blacklist`, data),
  removeFromBlacklist: (id: number) => del(`${BASE}/blacklist/${id}`),

  approvals: (vendorId?: number) =>
    get<Approval[]>(`${BASE}/approvals${vendorId ? `?vendor_id=${vendorId}` : ""}`),
  createApproval: (data: Partial<Approval>) => post<Approval>(`${BASE}/approvals`, data),
  updateApproval: (id: number, data: Partial<Approval>) =>
    put<Approval>(`${BASE}/approvals/${id}`, data),

  relationships: () => get<Relationship[]>(`${BASE}/relationships`),
  createRelationship: (data: Partial<Relationship>) =>
    post<Relationship>(`${BASE}/relationships`, data),
  removeRelationship: (id: number) => del(`${BASE}/relationships/${id}`),
};
