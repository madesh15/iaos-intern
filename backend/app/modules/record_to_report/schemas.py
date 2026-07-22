"""Pydantic schemas for the Record-to-Report module."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================================================================
# Journal Entry
# =========================================================================
class JECreate(BaseModel):
    je_number: str
    je_date: str
    period: str
    fiscal_year: int
    company_code: Optional[str] = None
    business_unit: Optional[str] = None
    plant: Optional[str] = None
    account_code: str
    account_name: Optional[str] = None
    account_type: str = "debit"
    cost_center: Optional[str] = None
    profit_center: Optional[str] = None
    debit_amount: float = 0.0
    credit_amount: float = 0.0
    currency: str = "INR"
    narration: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    posting_time: Optional[str] = None
    posting_type: str = "manual"
    status: str = "posted"
    reference_doc: Optional[str] = None
    reversal_of: Optional[str] = None
    source_file: Optional[str] = None


class JEUpdate(BaseModel):
    account_name: Optional[str] = None
    narration: Optional[str] = None
    status: Optional[str] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None


class JEOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    je_number: str
    je_date: datetime
    period: str
    fiscal_year: int
    company_code: Optional[str] = None
    business_unit: Optional[str] = None
    plant: Optional[str] = None
    account_code: str
    account_name: Optional[str] = None
    account_type: str
    cost_center: Optional[str] = None
    profit_center: Optional[str] = None
    debit_amount: float
    credit_amount: float
    currency: str
    narration: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    posting_time: Optional[datetime] = None
    posting_type: str
    status: str
    reference_doc: Optional[str] = None
    reversal_of: Optional[str] = None
    is_post_close: bool
    is_suspense: bool
    risk_score: float
    risk_level: str
    exception_count: int
    source_file: Optional[str] = None
    created_by: Optional[str] = None
    modified_by: Optional[str] = None
    created_date: Optional[datetime] = None


# =========================================================================
# Exception
# =========================================================================
class ExceptionCreate(BaseModel):
    journal_entry_id: Optional[int] = None
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    category: str
    severity: str = "medium"
    description: Optional[str] = None
    status: str = "open"
    owner: Optional[str] = None
    notes: Optional[str] = None


class ExceptionUpdate(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    notes: Optional[str] = None
    severity: Optional[str] = None


class ExceptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    journal_entry_id: Optional[int] = None
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    category: str
    severity: str
    description: Optional[str] = None
    status: str
    owner: Optional[str] = None
    notes: Optional[str] = None
    detected_date: datetime
    resolved_date: Optional[datetime] = None


# =========================================================================
# Reconciliation
# =========================================================================
class ReconCreate(BaseModel):
    journal_entry_id: Optional[int] = None
    account_code: str
    account_name: Optional[str] = None
    gl_balance: float = 0.0
    subledger_balance: float = 0.0
    status: str = "open"
    owner: Optional[str] = None
    notes: Optional[str] = None


class ReconUpdate(BaseModel):
    gl_balance: Optional[float] = None
    subledger_balance: Optional[float] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[str] = None


class ReconOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    journal_entry_id: Optional[int] = None
    account_code: str
    account_name: Optional[str] = None
    gl_balance: float
    subledger_balance: float
    difference: float
    reconciliation_date: Optional[datetime] = None
    status: str
    owner: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[str] = None
    approved_date: Optional[datetime] = None


# =========================================================================
# Close Task
# =========================================================================
class CloseTaskCreate(BaseModel):
    period: str
    task_name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    status: str = "pending"
    due_date: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None
    remarks: Optional[str] = None


class CloseTaskUpdate(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    completed_date: Optional[str] = None
    is_delayed: Optional[bool] = None
    remarks: Optional[str] = None


class CloseTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    period: str
    task_name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_delayed: bool
    priority: str
    category: Optional[str] = None
    remarks: Optional[str] = None


# =========================================================================
# Finding
# =========================================================================
class FindingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    risk_rating: str = "medium"
    status: str = "open"
    owner: Optional[str] = None
    recommendation: Optional[str] = None
    audit_period: Optional[str] = None
    related_je_id: Optional[int] = None


class FindingUpdate(BaseModel):
    status: Optional[str] = None
    risk_rating: Optional[str] = None
    owner: Optional[str] = None
    recommendation: Optional[str] = None


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    title: str
    description: Optional[str] = None
    category: str
    risk_rating: str
    status: str
    owner: Optional[str] = None
    recommendation: Optional[str] = None
    audit_period: Optional[str] = None
    related_je_id: Optional[int] = None
    created_date: datetime
    closed_date: Optional[datetime] = None


# =========================================================================
# Working Paper
# =========================================================================
class WorkpaperCreate(BaseModel):
    title: str
    description: Optional[str] = None
    procedure: Optional[str] = None
    status: str = "draft"
    prepared_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    audit_period: Optional[str] = None


class WorkpaperUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    procedure: Optional[str] = None
    status: Optional[str] = None
    prepared_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    conclusion: Optional[str] = None


class WorkpaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    title: str
    description: Optional[str] = None
    procedure: Optional[str] = None
    status: str
    prepared_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    attachments: Optional[str] = None
    tick_marks: Optional[str] = None
    conclusion: Optional[str] = None
    audit_period: Optional[str] = None
    created_date: datetime
    modified_date: datetime


# =========================================================================
# Action / CAPA
# =========================================================================
class ActionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    action_type: str = "corrective"
    priority: str = "medium"
    status: str = "open"
    owner: Optional[str] = None
    due_date: Optional[str] = None
    evidence: Optional[str] = None
    finding_id: Optional[int] = None


class ActionUpdate(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    completed_date: Optional[str] = None
    retest_date: Optional[str] = None
    evidence: Optional[str] = None


class ActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    title: str
    description: Optional[str] = None
    action_type: str
    priority: str
    status: str
    owner: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    retest_date: Optional[datetime] = None
    evidence: Optional[str] = None
    finding_id: Optional[int] = None
    is_overdue: bool
    created_date: datetime


# =========================================================================
# Rule Library
# =========================================================================
class RuleCreate(BaseModel):
    rule_code: str
    rule_name: str
    description: Optional[str] = None
    category: str
    severity: str = "medium"
    threshold_value: Optional[float] = None
    threshold_unit: Optional[str] = None
    conditions: Optional[str] = None
    is_active: bool = True


class RuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    threshold_value: Optional[float] = None
    is_active: Optional[bool] = None


class RuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    rule_code: str
    rule_name: str
    description: Optional[str] = None
    category: str
    severity: str
    threshold_value: Optional[float] = None
    threshold_unit: Optional[str] = None
    conditions: Optional[str] = None
    is_active: bool
    created_date: datetime


# =========================================================================
# Scope
# =========================================================================
class ScopeCreate(BaseModel):
    scope_name: str
    entity: Optional[str] = None
    business_unit: Optional[str] = None
    plant: Optional[str] = None
    location: Optional[str] = None
    period_from: Optional[str] = None
    period_to: Optional[str] = None
    status: str = "active"
    description: Optional[str] = None


class ScopeUpdate(BaseModel):
    scope_name: Optional[str] = None
    entity: Optional[str] = None
    business_unit: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None


class ScopeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    scope_name: str
    entity: Optional[str] = None
    business_unit: Optional[str] = None
    plant: Optional[str] = None
    location: Optional[str] = None
    period_from: Optional[str] = None
    period_to: Optional[str] = None
    status: str
    description: Optional[str] = None
    created_date: datetime


# =========================================================================
# Dashboard
# =========================================================================
class DashboardStats(BaseModel):
    total_journals: int = 0
    high_risk: int = 0
    medium_risk: int = 0
    low_risk: int = 0
    open_findings: int = 0
    open_capa: int = 0
    open_reconciliation: int = 0
    suspense_balance: float = 0.0


class RiskTrend(BaseModel):
    month: str
    count: int


class RiskDistribution(BaseModel):
    level: str
    count: int


class AmountHistogram(BaseModel):
    bucket: str
    count: int


class MonthlyTrend(BaseModel):
    month: str
    count: int


class TopUser(BaseModel):
    user_name: str
    count: int


class TopAccount(BaseModel):
    account_code: str
    account_name: str
    count: int


class PostingHeatmap(BaseModel):
    hour: int
    day: str
    count: int


class ExceptionTrend(BaseModel):
    month: str
    count: int


class DashboardOut(BaseModel):
    stats: DashboardStats
    risk_trend: list[RiskTrend] = []
    risk_distribution: list[RiskDistribution] = []
    amount_histogram: list[AmountHistogram] = []
    monthly_trend: list[MonthlyTrend] = []
    top_users: list[TopUser] = []
    top_accounts: list[TopAccount] = []
    posting_heatmap: list[PostingHeatmap] = []
    exception_trend: list[ExceptionTrend] = []
