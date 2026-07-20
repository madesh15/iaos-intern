"""
Labour Law & PF/ESI Compliance — SQLAlchemy Models
===================================================
15 signature features + 1 legacy stub.

Table prefix: mod_labour_compliance_
Every model inherits TenantMixin for row-level multi-tenancy.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ---------------------------------------------------------------------------
# Legacy stub (backward-compat with original scaffold)
# ---------------------------------------------------------------------------
class LabourComplianceItem(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")


# ═══════════════════════════════════════════════════════════════════════════
# 1. APPLICABILITY MAPPING
# ═══════════════════════════════════════════════════════════════════════════
class ApplicabilityMapping(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_applicability"

    id: Mapped[int] = mapped_column(primary_key=True)
    site: Mapped[str] = mapped_column(String(255), index=True)
    state: Mapped[str] = mapped_column(String(100))
    industry: Mapped[str] = mapped_column(String(100))
    employee_count: Mapped[int] = mapped_column(Integer, default=0)
    factory_act: Mapped[bool] = mapped_column(Boolean, default=False)
    shops_establishment: Mapped[bool] = mapped_column(Boolean, default=False)
    clra: Mapped[bool] = mapped_column(Boolean, default=False)
    minimum_wages: Mapped[bool] = mapped_column(Boolean, default=False)
    pf_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    esi_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    bonus_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    gratuity_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    posh_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    lwf_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 2. STATUTORY REGISTER CHECK
# ═══════════════════════════════════════════════════════════════════════════
class StatutoryRegisterCheck(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_registers"

    id: Mapped[int] = mapped_column(primary_key=True)
    site: Mapped[str] = mapped_column(String(255), index=True)
    register_type: Mapped[str] = mapped_column(String(100))
    attendance_register: Mapped[bool] = mapped_column(Boolean, default=False)
    wage_register: Mapped[bool] = mapped_column(Boolean, default=False)
    leave_register: Mapped[bool] = mapped_column(Boolean, default=False)
    muster_roll: Mapped[bool] = mapped_column(Boolean, default=False)
    fine_register: Mapped[bool] = mapped_column(Boolean, default=False)
    overtime_register: Mapped[bool] = mapped_column(Boolean, default=False)
    is_updated: Mapped[bool] = mapped_column(Boolean, default=False)
    last_updated_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    responsible_person: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 3. LICENCE & REGISTRATION
# ═══════════════════════════════════════════════════════════════════════════
class LicenceRegistration(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_licenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    site: Mapped[str] = mapped_column(String(255), index=True)
    licence_type: Mapped[str] = mapped_column(String(100))
    registration_number: Mapped[str] = mapped_column(String(100))
    issue_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    renewal_due: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    authority: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    document_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="active",
        comment="active | expired | suspended | pending_renewal"
    )
    reminder_days: Mapped[int] = mapped_column(Integer, default=30)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 4. CONTRACT LABOUR COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class ContractLabourCompliance(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_contract_labour"

    id: Mapped[int] = mapped_column(primary_key=True)
    principal_employer: Mapped[str] = mapped_column(String(255), index=True)
    contractor: Mapped[str] = mapped_column(String(255))
    license_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    contract_period_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    contract_period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    worker_count: Mapped[int] = mapped_column(Integer, default=0)
    agreement_available: Mapped[bool] = mapped_column(Boolean, default=False)
    labour_license_valid: Mapped[bool] = mapped_column(Boolean, default=False)
    returns_submitted: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(
        String(20), default="compliant",
        comment="compliant | non_compliant | under_review"
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 5. MINIMUM WAGES COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class MinimumWagesCompliance(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_min_wages"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_name: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    minimum_wage: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    actual_wage: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    difference: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    is_compliant: Mapped[bool] = mapped_column(Boolean, default=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 6. PF / ESI COVERAGE
# ═══════════════════════════════════════════════════════════════════════════
class PfEsiCoverage(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_pf_esi"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_name: Mapped[str] = mapped_column(String(255), index=True)
    uan: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    esic_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pf_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    esi_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    employer_contribution: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    employee_contribution: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    deposit_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    challan_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="deposited",
        comment="deposited | pending | overdue | reconciled"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 7. BONUS & GRATUITY
# ═══════════════════════════════════════════════════════════════════════════
class BonusGratuity(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_bonus_gratuity"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_name: Mapped[str] = mapped_column(String(255), index=True)
    bonus_eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    bonus_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    bonus_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gratuity_eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    gratuity_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    years_of_service: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="paid | pending | partially_paid"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 8. WORKING HOURS & OVERTIME
# ═══════════════════════════════════════════════════════════════════════════
class WorkingHoursOvertime(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_working_hours"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_name: Mapped[str] = mapped_column(String(255), index=True)
    attendance_date: Mapped[date] = mapped_column(Date)
    working_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    overtime_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    weekly_off: Mapped[bool] = mapped_column(Boolean, default=False)
    holiday: Mapped[bool] = mapped_column(Boolean, default=False)
    is_violation: Mapped[bool] = mapped_column(Boolean, default=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 9. CONTRACTOR PF/ESI VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════
class ContractorPfEsiVerification(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_contractor_pf_esi"

    id: Mapped[int] = mapped_column(primary_key=True)
    contractor: Mapped[str] = mapped_column(String(255), index=True)
    month: Mapped[str] = mapped_column(String(7))
    pf_challan_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    esi_challan_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    worker_count: Mapped[int] = mapped_column(Integer, default=0)
    verification_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="verified | pending | rejected"
    )
    document_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 10. POSH COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class PoshCompliance(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_posh"

    id: Mapped[int] = mapped_column(primary_key=True)
    site: Mapped[str] = mapped_column(String(255), index=True)
    icc_formed: Mapped[bool] = mapped_column(Boolean, default=False)
    members: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    training_conducted: Mapped[bool] = mapped_column(Boolean, default=False)
    annual_report_filed: Mapped[bool] = mapped_column(Boolean, default=False)
    complaint_count: Mapped[int] = mapped_column(Integer, default=0)
    pending_cases: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(20), default="compliant",
        comment="compliant | non_compliant | partial"
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 11. LABOUR WELFARE FUND
# ═══════════════════════════════════════════════════════════════════════════
class LabourWelfareFund(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_lwf"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_name: Mapped[str] = mapped_column(String(255), index=True)
    lwf_deduction: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    employer_share: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    employee_share: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    deposit_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    challan: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="deposited | pending | overdue"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 12. RETURN FILING TRACKER
# ═══════════════════════════════════════════════════════════════════════════
class ReturnFilingTracker(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_returns"

    id: Mapped[int] = mapped_column(primary_key=True)
    return_name: Mapped[str] = mapped_column(String(255), index=True)
    frequency: Mapped[str] = mapped_column(
        String(20), comment="monthly | quarterly | half_yearly | annual"
    )
    due_date: Mapped[date] = mapped_column(Date)
    filed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="filed | pending | overdue | extension"
    )
    penalty: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 13. INSPECTION NOTICE LOG
# ═══════════════════════════════════════════════════════════════════════════
class InspectionNoticeLog(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_inspections"

    id: Mapped[int] = mapped_column(primary_key=True)
    inspection_date: Mapped[date] = mapped_column(Date)
    inspector_name: Mapped[str] = mapped_column(String(255))
    department: Mapped[str] = mapped_column(String(255))
    notice_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    observation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_taken: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="open",
        comment="open | resolved | escalated"
    )
    attachment_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 14. WAGE CODE READINESS
# ═══════════════════════════════════════════════════════════════════════════
class WageCodeReadiness(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_wage_code"

    id: Mapped[int] = mapped_column(primary_key=True)
    requirement: Mapped[str] = mapped_column(String(500), index=True)
    status: Mapped[str] = mapped_column(
        String(20), default="not_started",
        comment="not_started | in_progress | completed | gap_identified"
    )
    gap: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 15. CONTRACT WORKER MASTER
# ═══════════════════════════════════════════════════════════════════════════
class ContractWorkerMaster(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_contract_workers"

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_name: Mapped[str] = mapped_column(String(255), index=True)
    contractor: Mapped[str] = mapped_column(String(255))
    joining_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    aadhaar: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pf_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    esi_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    skill: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="active",
        comment="active | inactive | relieved"
    )
