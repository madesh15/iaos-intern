"""Pydantic schemas for the Vendor Master & Management module."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================================================================
# Vendor
# =========================================================================
class VendorCreate(BaseModel):
    vendor_code: str
    vendor_name: str
    vendor_type: str = "domestic"
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    msme_status: Optional[str] = None
    msme_reg_number: Optional[str] = None
    msme_expiry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = "active"
    spend_amount: float = 0.0
    last_purchase_date: Optional[str] = None
    last_payment_date: Optional[str] = None
    open_po_count: int = 0
    open_invoice_count: int = 0


class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    vendor_type: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    msme_status: Optional[str] = None
    msme_reg_number: Optional[str] = None
    msme_expiry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    spend_amount: Optional[float] = None
    last_purchase_date: Optional[str] = None
    last_payment_date: Optional[str] = None
    open_po_count: Optional[int] = None
    open_invoice_count: Optional[int] = None


class VendorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_code: str
    vendor_name: str
    vendor_type: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    msme_status: Optional[str] = None
    msme_reg_number: Optional[str] = None
    msme_expiry: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str
    spend_amount: float
    last_purchase_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None
    open_po_count: int
    open_invoice_count: int
    change_count: int
    created_by: Optional[str] = None
    created_date: Optional[datetime] = None
    modified_by: Optional[str] = None
    modified_date: Optional[datetime] = None


# =========================================================================
# Bank History
# =========================================================================
class BankHistoryCreate(BaseModel):
    vendor_id: int
    old_account_number: Optional[str] = None
    new_account_number: Optional[str] = None
    old_ifsc: Optional[str] = None
    new_ifsc: Optional[str] = None
    old_bank_name: Optional[str] = None
    new_bank_name: Optional[str] = None
    changed_by: Optional[str] = None
    approval_status: str = "pending"
    remarks: Optional[str] = None


class BankHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_id: int
    old_account_number: Optional[str] = None
    new_account_number: Optional[str] = None
    old_ifsc: Optional[str] = None
    new_ifsc: Optional[str] = None
    old_bank_name: Optional[str] = None
    new_bank_name: Optional[str] = None
    changed_by: Optional[str] = None
    changed_date: datetime
    approval_status: str
    remarks: Optional[str] = None


# =========================================================================
# KYC
# =========================================================================
class KYCCreate(BaseModel):
    vendor_id: int
    gst_verified: bool = False
    pan_verified: bool = False
    msme_verified: bool = False
    kyc_status: str = "pending"
    verified_by: Optional[str] = None
    remarks: Optional[str] = None


class KYCUpdate(BaseModel):
    gst_verified: Optional[bool] = None
    pan_verified: Optional[bool] = None
    msme_verified: Optional[bool] = None
    kyc_status: Optional[str] = None
    verified_by: Optional[str] = None
    remarks: Optional[str] = None


class KYCOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_id: int
    gst_verified: bool
    pan_verified: bool
    msme_verified: bool
    kyc_status: str
    verification_date: Optional[datetime] = None
    verified_by: Optional[str] = None
    remarks: Optional[str] = None


# =========================================================================
# Audit Log
# =========================================================================
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_id: int
    action: str
    field_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    performed_by: Optional[str] = None
    performed_at: datetime
    ip_address: Optional[str] = None


# =========================================================================
# Blacklist
# =========================================================================
class BlacklistCreate(BaseModel):
    vendor_name: Optional[str] = None
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    source: str = "internal"
    reason: Optional[str] = None


class BlacklistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_name: Optional[str] = None
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    source: str
    reason: Optional[str] = None
    listed_date: datetime


# =========================================================================
# Approval Workflow
# =========================================================================
class ApprovalCreate(BaseModel):
    vendor_id: int
    action_type: str
    maker: Optional[str] = None
    checker: Optional[str] = None
    status: str = "pending"
    remarks: Optional[str] = None


class ApprovalUpdate(BaseModel):
    checker: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class ApprovalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_id: int
    action_type: str
    maker: Optional[str] = None
    maker_date: Optional[datetime] = None
    checker: Optional[str] = None
    checker_date: Optional[datetime] = None
    status: str
    remarks: Optional[str] = None


# =========================================================================
# Relationship
# =========================================================================
class RelationshipCreate(BaseModel):
    vendor_id: int
    related_vendor_id: Optional[int] = None
    relationship_type: str
    shared_field: Optional[str] = None
    shared_value: Optional[str] = None


class RelationshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    vendor_id: int
    related_vendor_id: Optional[int] = None
    relationship_type: str
    shared_field: Optional[str] = None
    shared_value: Optional[str] = None
    risk_score: float
    created_date: datetime


# =========================================================================
# Dashboard
# =========================================================================
class DashboardStats(BaseModel):
    total_vendors: int = 0
    active_vendors: int = 0
    dormant_vendors: int = 0
    duplicate_vendors: int = 0
    missing_gst: int = 0
    missing_pan: int = 0
    pending_kyc: int = 0
    duplicate_bank_accounts: int = 0
    high_risk_vendors: int = 0
    vendor_concentration_pct: float = 0.0
    open_findings: int = 0
    capa_pending: int = 0


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class MonthlyCreation(BaseModel):
    month: str
    count: int


class RiskDistribution(BaseModel):
    level: str
    count: int


class BankChangeTrend(BaseModel):
    month: str
    count: int


class TopVendorSpend(BaseModel):
    vendor_name: str
    spend_amount: float


class ExceptionTrend(BaseModel):
    month: str
    count: int


class DashboardOut(BaseModel):
    stats: DashboardStats
    vendor_status: list[StatusCount] = []
    vendor_category: list[CategoryCount] = []
    risk_distribution: list[RiskDistribution] = []
    monthly_creation: list[MonthlyCreation] = []
    bank_change_trend: list[BankChangeTrend] = []
    top_vendors_by_spend: list[TopVendorSpend] = []
    exception_trend: list[ExceptionTrend] = []


# =========================================================================
# Analytics result schemas
# =========================================================================
class DuplicateVendorResult(BaseModel):
    vendor_a_id: int
    vendor_a_code: str
    vendor_a_name: str
    vendor_b_id: int
    vendor_b_code: str
    vendor_b_name: str
    duplicate_score: float
    reason: str


class BankChangeResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    old_account: Optional[str] = None
    new_account: Optional[str] = None
    old_ifsc: Optional[str] = None
    new_ifsc: Optional[str] = None
    changed_by: Optional[str] = None
    changed_date: Optional[datetime] = None
    approval_status: str


class KYCValidationResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    gst_verified: bool = False
    pan_verified: bool = False
    msme_verified: bool = False
    kyc_status: str = "pending"
    missing_fields: list[str] = []


class ConcentrationResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    spend_amount: float
    percentage: float
    risk_level: str


class DormantVendorResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    status: str
    last_purchase_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None
    idle_days: int


class EmployeeOverlapResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    match_type: str
    match_value: str
    risk_score: float


class BlacklistResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    matched_field: str
    matched_value: str
    blacklist_source: str
    reason: Optional[str] = None


class DuplicateBankResult(BaseModel):
    account_number: str
    ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    vendors: list[dict] = []


class CompletenessResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    total_fields: int
    filled_fields: int
    completeness_pct: float
    missing_fields: list[str] = []


class ApprovalAuditResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    action_type: str
    maker: Optional[str] = None
    maker_date: Optional[datetime] = None
    checker: Optional[str] = None
    checker_date: Optional[datetime] = None
    status: str
    remarks: Optional[str] = None


class CategoryValidationResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    vendor_type: str
    is_valid: bool
    issue: Optional[str] = None


class MSMEValidationResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    msme_status: Optional[str] = None
    msme_reg_number: Optional[str] = None
    msme_expiry: Optional[datetime] = None
    is_valid: bool
    issue: Optional[str] = None


class ChangeFrequencyResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    change_count: int
    risk_level: str


class RelatedPartyResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    related_vendor_id: Optional[int] = None
    related_vendor_name: Optional[str] = None
    relationship_type: str
    shared_field: Optional[str] = None
    risk_score: float


class DeactivationResult(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_code: str
    status: str
    open_po_count: int
    open_invoice_count: int
    has_blockers: bool
    issues: list[str] = []
