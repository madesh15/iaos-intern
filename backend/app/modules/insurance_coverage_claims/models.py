"""Insurance Coverage & Claims — data models.

Two tenant-scoped tables:
  mod_insurance_coverage_claims_policies  — the policy register (coverage side)
  mod_insurance_coverage_claims_claims    — claims lodged against a policy

Both inherit TenantMixin (tenant_id + created_at/updated_at) per platform rules.
"""
from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


class InsurancePolicy(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_policies"

    id: Mapped[int] = mapped_column(primary_key=True)

    policy_number: Mapped[str] = mapped_column(String(100), index=True)
    policy_type: Mapped[str] = mapped_column(String(100))  # e.g. Fire, Marine, GPA, D&O
    insurer_name: Mapped[str] = mapped_column(String(255))
    broker_name: Mapped[str] = mapped_column(String(255), default="")

    asset_or_entity_covered: Mapped[str] = mapped_column(String(255), default="")
    asset_value: Mapped[float] = mapped_column(Float, default=0)
    sum_insured: Mapped[float] = mapped_column(Float, default=0)
    premium_amount: Mapped[float] = mapped_column(Float, default=0)

    policy_start_date: Mapped[date] = mapped_column(Date)
    policy_end_date: Mapped[date] = mapped_column(Date)

    department: Mapped[str] = mapped_column(String(150), default="")
    location: Mapped[str] = mapped_column(String(150), default="")

    exclusions: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="active")  # active, expired, lapsed, renewed

    notes: Mapped[str] = mapped_column(Text, default="")

    claims: Mapped[list["InsuranceClaim"]] = relationship(
        back_populates="policy", cascade="all, delete-orphan"
    )


class InsuranceClaim(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_claims"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(
        ForeignKey("mod_insurance_coverage_claims_policies.id", ondelete="CASCADE"),
        index=True,
    )

    claim_number: Mapped[str] = mapped_column(String(100), index=True)
    incident_date: Mapped[date] = mapped_column(Date)
    claim_lodged_date: Mapped[date] = mapped_column(Date)
    settlement_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    claim_amount: Mapped[float] = mapped_column(Float, default=0)
    approved_amount: Mapped[float] = mapped_column(Float, default=0)
    recovery_amount: Mapped[float] = mapped_column(Float, default=0)

    surveyor_name: Mapped[str] = mapped_column(String(255), default="")
    rejection_reason: Mapped[str] = mapped_column(Text, default="")

    status: Mapped[str] = mapped_column(
        String(30), default="lodged"
    )  # lodged, under_review, approved, settled, rejected

    notes: Mapped[str] = mapped_column(Text, default="")

    policy: Mapped["InsurancePolicy"] = relationship(back_populates="claims")


# ── Specialty covers & registers ─────────────────────────────────────
class ExclusionWarranty(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_exclusions"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(
        ForeignKey("mod_insurance_coverage_claims_policies.id", ondelete="CASCADE"), index=True
    )
    clause_type: Mapped[str] = mapped_column(String(30), default="exclusion")  # exclusion | warranty
    description: Mapped[str] = mapped_column(Text, default="")
    compliance_status: Mapped[str] = mapped_column(String(30), default="compliant")  # compliant | breach | at_risk
    notes: Mapped[str] = mapped_column(Text, default="")


class BusinessInterruptionCover(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_bi_cover"

    id: Mapped[int] = mapped_column(primary_key=True)
    site: Mapped[str] = mapped_column(String(255))
    waiting_period_days: Mapped[int] = mapped_column(Integer, default=0)
    indemnity_period_months: Mapped[int] = mapped_column(Integer, default=12)
    coverage_amount: Mapped[float] = mapped_column(Float, default=0)
    annual_gross_profit: Mapped[float] = mapped_column(Float, default=0)
    adequacy: Mapped[str] = mapped_column(String(30), default="adequate")  # adequate | inadequate
    notes: Mapped[str] = mapped_column(Text, default="")


class MarineTransitCover(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_marine_cover"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_ref: Mapped[str] = mapped_column(String(150))
    goods_description: Mapped[str] = mapped_column(String(255), default="")
    goods_value: Mapped[float] = mapped_column(Float, default=0)
    coverage_amount: Mapped[float] = mapped_column(Float, default=0)
    carrier: Mapped[str] = mapped_column(String(255), default="")
    transit_mode: Mapped[str] = mapped_column(String(50), default="sea")  # sea | air | road | rail
    status: Mapped[str] = mapped_column(String(30), default="in_transit")  # in_transit | delivered | claimed
    notes: Mapped[str] = mapped_column(Text, default="")


class EmployeeLiabilityCover(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_employee_liability"

    id: Mapped[int] = mapped_column(primary_key=True)
    cover_type: Mapped[str] = mapped_column(String(30))  # GPA | GMC | D&O | Product Liability | Public Liability
    insured_entity: Mapped[str] = mapped_column(String(255), default="")
    headcount_or_scope: Mapped[str] = mapped_column(String(255), default="")
    sum_insured: Mapped[float] = mapped_column(Float, default=0)
    premium_amount: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(30), default="active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Recovery, brokers & cost allocation ──────────────────────────────
class ClaimRecoveryAccounting(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_recovery_accounting"

    id: Mapped[int] = mapped_column(primary_key=True)
    claim_id: Mapped[int] = mapped_column(
        ForeignKey("mod_insurance_coverage_claims_claims.id", ondelete="CASCADE"), index=True
    )
    journal_ref: Mapped[str] = mapped_column(String(100), default="")
    debit_account: Mapped[str] = mapped_column(String(150), default="")
    credit_account: Mapped[str] = mapped_column(String(150), default="")
    amount: Mapped[float] = mapped_column(Float, default=0)
    recon_status: Mapped[str] = mapped_column(String(30), default="pending")  # pending | reconciled | variance
    notes: Mapped[str] = mapped_column(Text, default="")


class BrokerPerformance(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_broker_performance"

    id: Mapped[int] = mapped_column(primary_key=True)
    broker_name: Mapped[str] = mapped_column(String(255))
    claims_handled: Mapped[int] = mapped_column(Integer, default=0)
    avg_response_days: Mapped[float] = mapped_column(Float, default=0)
    renewal_success_pct: Mapped[float] = mapped_column(Float, default=0)
    client_rating: Mapped[float] = mapped_column(Float, default=0)  # 1-5
    review_period: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class CostAllocation(Base, TenantMixin):
    __tablename__ = "mod_insurance_coverage_claims_cost_allocation"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(
        ForeignKey("mod_insurance_coverage_claims_policies.id", ondelete="CASCADE"), index=True
    )
    department: Mapped[str] = mapped_column(String(150), default="")
    plant: Mapped[str] = mapped_column(String(150), default="")
    business_unit: Mapped[str] = mapped_column(String(150), default="")
    cost_centre: Mapped[str] = mapped_column(String(150), default="")
    allocated_amount: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Common audit workspace (Scope, RCM, Rule Library, Data Sources,
#    Sampling, Exceptions, Working Papers, Findings, Remediation) ────
class AuditArtifact(Base, TenantMixin):
    """One generic, typed table backing the nine 'common audit page'
    shells so each gets full CRUD without 9 near-identical tables.
    `page_type` discriminates which shell page a row belongs to.
    """

    __tablename__ = "mod_insurance_coverage_claims_audit_artifacts"

    id: Mapped[int] = mapped_column(primary_key=True)
    page_type: Mapped[str] = mapped_column(String(30), index=True)
    # scope | rcm | rule_library | data_source | sampling |
    # exception | working_paper | finding | remediation

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(150), default="")  # e.g. risk category, rule threshold, source type
    owner: Mapped[str] = mapped_column(String(150), default="")
    severity: Mapped[str] = mapped_column(String(30), default="medium")  # low | medium | high | critical
    status: Mapped[str] = mapped_column(String(30), default="open")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    reference_link: Mapped[str] = mapped_column(String(500), default="")  # evidence URL / sample ref / journal ref
    notes: Mapped[str] = mapped_column(Text, default="")
