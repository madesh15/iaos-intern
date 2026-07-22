"""Module data models for Project Cost & RERA Compliance."""
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


def _utcnow():
    return datetime.now(timezone.utc)


class ReraEscrowRecord(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_escrow"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    escrow_account: Mapped[str] = mapped_column(String(120))
    total_deposit: Mapped[float] = mapped_column(Float, default=0)
    eligible_withdrawal: Mapped[float] = mapped_column(Float, default=0)
    withdrawn_amount: Mapped[float] = mapped_column(Float, default=0)
    compliance_status: Mapped[str] = mapped_column(String(60), default="Compliant")
    notes: Mapped[str] = mapped_column(Text, default="")


class ProjectCostBudget(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_budgets"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    cost_head: Mapped[str] = mapped_column(String(255))
    approved_budget: Mapped[float] = mapped_column(Float, default=0)
    actual_cost: Mapped[float] = mapped_column(Float, default=0)
    variance_pct: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(60), default="On Track")
    notes: Mapped[str] = mapped_column(Text, default="")


class WithdrawalCertificate(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_withdrawals"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    cert_number: Mapped[str] = mapped_column(String(120))
    cert_type: Mapped[str] = mapped_column(String(60), default="Architect")
    certified_amount: Mapped[float] = mapped_column(Float, default=0)
    certifier_name: Mapped[str] = mapped_column(String(255), default="")
    cert_date: Mapped[str] = mapped_column(String(30), default="")
    valid: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class FundDiversionRecord(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_diversions"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_project: Mapped[str] = mapped_column(String(255))
    destination_project: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float] = mapped_column(Float, default=0)
    diversion_date: Mapped[str] = mapped_column(String(30), default="")
    risk_level: Mapped[str] = mapped_column(String(60), default="Medium")
    status: Mapped[str] = mapped_column(String(60), default="Under Review")
    notes: Mapped[str] = mapped_column(Text, default="")


class BuyerCollection(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_collections"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    buyer_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    demand_amount: Mapped[float] = mapped_column(Float, default=0)
    collected_amount: Mapped[float] = mapped_column(Float, default=0)
    collection_date: Mapped[str] = mapped_column(String(30), default="")
    payment_mode: Mapped[str] = mapped_column(String(60), default="Bank Transfer")
    notes: Mapped[str] = mapped_column(Text, default="")


class RevenueRecognition(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_revenue"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    buyer_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    total_consideration: Mapped[float] = mapped_column(Float, default=0)
    recognised_to_date: Mapped[float] = mapped_column(Float, default=0)
    recognition_basis: Mapped[str] = mapped_column(String(120), default="Handover")
    handover_date: Mapped[str] = mapped_column(String(30), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class CostToComplete(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_ctc"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    cost_head: Mapped[str] = mapped_column(String(255))
    original_estimate: Mapped[float] = mapped_column(Float, default=0)
    revised_estimate: Mapped[float] = mapped_column(Float, default=0)
    incurred_to_date: Mapped[float] = mapped_column(Float, default=0)
    reliability: Mapped[str] = mapped_column(String(60), default="Medium")
    notes: Mapped[str] = mapped_column(Text, default="")


class ContractorBill(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_bills"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    contractor_name: Mapped[str] = mapped_column(String(255))
    bill_number: Mapped[str] = mapped_column(String(120))
    bill_amount: Mapped[float] = mapped_column(Float, default=0)
    certified_amount: Mapped[float] = mapped_column(Float, default=0)
    progress_pct: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(60), default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class ApprovalSanction(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_approvals"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    approval_type: Mapped[str] = mapped_column(String(255))
    authority: Mapped[str] = mapped_column(String(255))
    approval_number: Mapped[str] = mapped_column(String(120), default="")
    status: Mapped[str] = mapped_column(String(60), default="Pending")
    valid_until: Mapped[str] = mapped_column(String(30), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class UnsoldInventory(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_inventory"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    unit_type: Mapped[str] = mapped_column(String(120))
    carpet_area: Mapped[float] = mapped_column(Float, default=0)
    booked_price: Mapped[float] = mapped_column(Float, default=0)
    nrv: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(60), default="Unsold")
    notes: Mapped[str] = mapped_column(Text, default="")


class CustomerAdvance(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_advances"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    buyer_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    advance_amount: Mapped[float] = mapped_column(Float, default=0)
    received_date: Mapped[str] = mapped_column(String(30), default="")
    ageing_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(60), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


class RegistrationPossession(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_registrations"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    buyer_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    agreement_date: Mapped[str] = mapped_column(String(30), default="")
    registration_date: Mapped[str] = mapped_column(String(30), default="")
    possession_date: Mapped[str] = mapped_column(String(30), default="")
    status: Mapped[str] = mapped_column(String(60), default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class InterestPenalty(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_penalties"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    buyer_name: Mapped[str] = mapped_column(String(255))
    flat_unit: Mapped[str] = mapped_column(String(120))
    delay_days: Mapped[int] = mapped_column(Integer, default=0)
    penalty_amount: Mapped[float] = mapped_column(Float, default=0)
    interest_rate: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(60), default="Accrued")
    notes: Mapped[str] = mapped_column(Text, default="")


class LandCostTitle(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_land"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    land_parcel: Mapped[str] = mapped_column(String(255))
    acquisition_cost: Mapped[float] = mapped_column(Float, default=0)
    title_clear: Mapped[bool] = mapped_column(Boolean, default=True)
    title_insurance: Mapped[bool] = mapped_column(Boolean, default=False)
    encumbrances: Mapped[str] = mapped_column(String(255), default="None")
    notes: Mapped[str] = mapped_column(Text, default="")


class ProjectCashflow(Base, TenantMixin):
    __tablename__ = "mod_project_cost_rera_cashflow"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    period: Mapped[str] = mapped_column(String(30))
    opening_balance: Mapped[float] = mapped_column(Float, default=0)
    inflows: Mapped[float] = mapped_column(Float, default=0)
    outflows: Mapped[float] = mapped_column(Float, default=0)
    closing_balance: Mapped[float] = mapped_column(Float, default=0)
    liquidity_status: Mapped[str] = mapped_column(String(60), default="Adequate")
    notes: Mapped[str] = mapped_column(Text, default="")
