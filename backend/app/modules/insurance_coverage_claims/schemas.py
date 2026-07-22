from datetime import date

from pydantic import BaseModel, Field


# ── Policies ─────────────────────────────────────────────────────────
class PolicyCreate(BaseModel):
    policy_number: str
    policy_type: str
    insurer_name: str
    broker_name: str = ""
    asset_or_entity_covered: str = ""
    asset_value: float = 0
    sum_insured: float = 0
    premium_amount: float = 0
    policy_start_date: date
    policy_end_date: date
    department: str = ""
    location: str = ""
    exclusions: str = ""
    status: str = "active"
    notes: str = ""


class PolicyUpdate(BaseModel):
    policy_number: str | None = None
    policy_type: str | None = None
    insurer_name: str | None = None
    broker_name: str | None = None
    asset_or_entity_covered: str | None = None
    asset_value: float | None = None
    sum_insured: float | None = None
    premium_amount: float | None = None
    policy_start_date: date | None = None
    policy_end_date: date | None = None
    department: str | None = None
    location: str | None = None
    exclusions: str | None = None
    status: str | None = None
    notes: str | None = None


class PolicyOut(BaseModel):
    id: int
    policy_number: str
    policy_type: str
    insurer_name: str
    broker_name: str
    asset_or_entity_covered: str
    asset_value: float
    sum_insured: float
    premium_amount: float
    policy_start_date: date
    policy_end_date: date
    department: str
    location: str
    exclusions: str
    status: str
    notes: str

    coverage_pct: float = Field(0, description="sum_insured / asset_value * 100")
    days_to_expiry: int = 0

    model_config = {"from_attributes": True}


# ── Claims ───────────────────────────────────────────────────────────
class ClaimCreate(BaseModel):
    policy_id: int
    claim_number: str
    incident_date: date
    claim_lodged_date: date
    settlement_date: date | None = None
    claim_amount: float = 0
    approved_amount: float = 0
    recovery_amount: float = 0
    surveyor_name: str = ""
    rejection_reason: str = ""
    status: str = "lodged"
    notes: str = ""


class ClaimUpdate(BaseModel):
    claim_number: str | None = None
    incident_date: date | None = None
    claim_lodged_date: date | None = None
    settlement_date: date | None = None
    claim_amount: float | None = None
    approved_amount: float | None = None
    recovery_amount: float | None = None
    surveyor_name: str | None = None
    rejection_reason: str | None = None
    status: str | None = None
    notes: str | None = None


class ClaimOut(BaseModel):
    id: int
    policy_id: int
    claim_number: str
    incident_date: date
    claim_lodged_date: date
    settlement_date: date | None = None
    claim_amount: float
    approved_amount: float
    recovery_amount: float
    surveyor_name: str
    rejection_reason: str
    status: str
    notes: str

    lodgement_delay_days: int = 0
    outstanding_amount: float = 0
    settlement_delay_days: int | None = None
    recovery_pct: float = 0

    model_config = {"from_attributes": True}


class PagedPolicies(BaseModel):
    total: int
    items: list[PolicyOut]


class PagedClaims(BaseModel):
    total: int
    items: list[ClaimOut]


class DashboardSummary(BaseModel):
    total_policies: int
    active_policies: int
    expired_policies: int
    expiring_in_30_days: int
    total_sum_insured: float
    total_asset_value: float
    underinsured_count: int
    total_premium: float
    open_claims: int
    total_claim_amount: float
    total_recovery_amount: float
    total_outstanding: float
    average_lodgement_delay_days: float


# ── Computed analytics (derived from Policies/Claims, no new tables) ──
class CoverageAdequacyOut(BaseModel):
    policy_id: int
    policy_number: str
    asset_or_entity_covered: str
    asset_value: float
    sum_insured: float
    coverage_pct: float
    status: str  # underinsured | adequate | overinsured
    risk_rating: str  # low | medium | high


class UninsuredAssetOut(BaseModel):
    policy_id: int
    asset_or_entity_covered: str
    location: str
    asset_value: float
    insured_value: float
    coverage_gap: float
    risk_level: str


class LodgementTimelinessOut(BaseModel):
    claim_id: int
    claim_number: str
    incident_date: date
    claim_date: date
    delay_days: int
    sla_status: str  # on_time | breach
    late_claim: bool


class PremiumBenchmarkOut(BaseModel):
    policy_id: int
    policy_number: str
    premium: float
    coverage: float
    premium_pct: float  # premium / coverage * 100
    benchmark_pct: float
    variance_pct: float


class DuplicateCoverOut(BaseModel):
    asset_or_entity_covered: str
    policy_type: str
    policy_count: int
    policy_numbers: list[str]
    total_premium: float


# ── Specialty covers & registers ──────────────────────────────────────
class ExclusionCreate(BaseModel):
    policy_id: int
    clause_type: str = "exclusion"
    description: str = ""
    compliance_status: str = "compliant"
    notes: str = ""


class ExclusionUpdate(BaseModel):
    clause_type: str | None = None
    description: str | None = None
    compliance_status: str | None = None
    notes: str | None = None


class ExclusionOut(ExclusionCreate):
    id: int
    model_config = {"from_attributes": True}


class BiCoverCreate(BaseModel):
    site: str
    waiting_period_days: int = 0
    indemnity_period_months: int = 12
    coverage_amount: float = 0
    annual_gross_profit: float = 0
    adequacy: str = "adequate"
    notes: str = ""


class BiCoverUpdate(BaseModel):
    site: str | None = None
    waiting_period_days: int | None = None
    indemnity_period_months: int | None = None
    coverage_amount: float | None = None
    annual_gross_profit: float | None = None
    adequacy: str | None = None
    notes: str | None = None


class BiCoverOut(BiCoverCreate):
    id: int
    model_config = {"from_attributes": True}


class MarineCoverCreate(BaseModel):
    shipment_ref: str
    goods_description: str = ""
    goods_value: float = 0
    coverage_amount: float = 0
    carrier: str = ""
    transit_mode: str = "sea"
    status: str = "in_transit"
    notes: str = ""


class MarineCoverUpdate(BaseModel):
    shipment_ref: str | None = None
    goods_description: str | None = None
    goods_value: float | None = None
    coverage_amount: float | None = None
    carrier: str | None = None
    transit_mode: str | None = None
    status: str | None = None
    notes: str | None = None


class MarineCoverOut(MarineCoverCreate):
    id: int
    model_config = {"from_attributes": True}


class EmployeeCoverCreate(BaseModel):
    cover_type: str
    insured_entity: str = ""
    headcount_or_scope: str = ""
    sum_insured: float = 0
    premium_amount: float = 0
    status: str = "active"
    notes: str = ""


class EmployeeCoverUpdate(BaseModel):
    cover_type: str | None = None
    insured_entity: str | None = None
    headcount_or_scope: str | None = None
    sum_insured: float | None = None
    premium_amount: float | None = None
    status: str | None = None
    notes: str | None = None


class EmployeeCoverOut(EmployeeCoverCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Recovery, brokers, cost allocation ────────────────────────────────
class RecoveryAccountingCreate(BaseModel):
    claim_id: int
    journal_ref: str = ""
    debit_account: str = ""
    credit_account: str = ""
    amount: float = 0
    recon_status: str = "pending"
    notes: str = ""


class RecoveryAccountingUpdate(BaseModel):
    journal_ref: str | None = None
    debit_account: str | None = None
    credit_account: str | None = None
    amount: float | None = None
    recon_status: str | None = None
    notes: str | None = None


class RecoveryAccountingOut(RecoveryAccountingCreate):
    id: int
    model_config = {"from_attributes": True}


class BrokerPerformanceCreate(BaseModel):
    broker_name: str
    claims_handled: int = 0
    avg_response_days: float = 0
    renewal_success_pct: float = 0
    client_rating: float = 0
    review_period: str = ""
    notes: str = ""


class BrokerPerformanceUpdate(BaseModel):
    broker_name: str | None = None
    claims_handled: int | None = None
    avg_response_days: float | None = None
    renewal_success_pct: float | None = None
    client_rating: float | None = None
    review_period: str | None = None
    notes: str | None = None


class BrokerPerformanceOut(BrokerPerformanceCreate):
    id: int
    model_config = {"from_attributes": True}


class CostAllocationCreate(BaseModel):
    policy_id: int
    department: str = ""
    plant: str = ""
    business_unit: str = ""
    cost_centre: str = ""
    allocated_amount: float = 0
    notes: str = ""


class CostAllocationUpdate(BaseModel):
    department: str | None = None
    plant: str | None = None
    business_unit: str | None = None
    cost_centre: str | None = None
    allocated_amount: float | None = None
    notes: str | None = None


class CostAllocationOut(CostAllocationCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Common audit workspace (generic, typed) ───────────────────────────
class AuditArtifactCreate(BaseModel):
    page_type: str
    title: str
    description: str = ""
    category: str = ""
    owner: str = ""
    severity: str = "medium"
    status: str = "open"
    due_date: date | None = None
    reference_link: str = ""
    notes: str = ""


class AuditArtifactUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    owner: str | None = None
    severity: str | None = None
    status: str | None = None
    due_date: date | None = None
    reference_link: str | None = None
    notes: str | None = None


class AuditArtifactOut(AuditArtifactCreate):
    id: int
    model_config = {"from_attributes": True}


class PagedGeneric(BaseModel):
    total: int
    items: list
