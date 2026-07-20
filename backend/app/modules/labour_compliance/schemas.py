"""
Labour Law & PF/ESI Compliance — Pydantic Schemas
==================================================
Create / Update / Out schemas for all 15 signature features.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Legacy stub
# ---------------------------------------------------------------------------
class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 1. APPLICABILITY MAPPING
# ═══════════════════════════════════════════════════════════════════════════
class ApplicabilityMappingCreate(BaseModel):
    site: str = Field(..., max_length=255)
    state: str = Field(..., max_length=100)
    industry: str = Field(..., max_length=100)
    employee_count: int = Field(default=0, ge=0)
    factory_act: bool = False
    shops_establishment: bool = False
    clra: bool = False
    minimum_wages: bool = False
    pf_applicable: bool = False
    esi_applicable: bool = False
    bonus_applicable: bool = False
    gratuity_applicable: bool = False
    posh_applicable: bool = False
    lwf_applicable: bool = False
    remarks: Optional[str] = None


class ApplicabilityMappingUpdate(BaseModel):
    site: Optional[str] = None
    state: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[int] = None
    factory_act: Optional[bool] = None
    shops_establishment: Optional[bool] = None
    clra: Optional[bool] = None
    minimum_wages: Optional[bool] = None
    pf_applicable: Optional[bool] = None
    esi_applicable: Optional[bool] = None
    bonus_applicable: Optional[bool] = None
    gratuity_applicable: Optional[bool] = None
    posh_applicable: Optional[bool] = None
    lwf_applicable: Optional[bool] = None
    remarks: Optional[str] = None


class ApplicabilityMappingOut(BaseModel):
    id: int
    site: str
    state: str
    industry: str
    employee_count: int
    factory_act: bool
    shops_establishment: bool
    clra: bool
    minimum_wages: bool
    pf_applicable: bool
    esi_applicable: bool
    bonus_applicable: bool
    gratuity_applicable: bool
    posh_applicable: bool
    lwf_applicable: bool
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 2. STATUTORY REGISTER CHECK
# ═══════════════════════════════════════════════════════════════════════════
class StatutoryRegisterCheckCreate(BaseModel):
    site: str = Field(..., max_length=255)
    register_type: str = Field(..., max_length=100)
    attendance_register: bool = False
    wage_register: bool = False
    leave_register: bool = False
    muster_roll: bool = False
    fine_register: bool = False
    overtime_register: bool = False
    is_updated: bool = False
    last_updated_date: Optional[date] = None
    responsible_person: Optional[str] = None
    remarks: Optional[str] = None


class StatutoryRegisterCheckUpdate(BaseModel):
    register_type: Optional[str] = None
    attendance_register: Optional[bool] = None
    wage_register: Optional[bool] = None
    leave_register: Optional[bool] = None
    muster_roll: Optional[bool] = None
    fine_register: Optional[bool] = None
    overtime_register: Optional[bool] = None
    is_updated: Optional[bool] = None
    last_updated_date: Optional[date] = None
    responsible_person: Optional[str] = None
    remarks: Optional[str] = None


class StatutoryRegisterCheckOut(BaseModel):
    id: int
    site: str
    register_type: str
    attendance_register: bool
    wage_register: bool
    leave_register: bool
    muster_roll: bool
    fine_register: bool
    overtime_register: bool
    is_updated: bool
    last_updated_date: Optional[date]
    responsible_person: Optional[str]
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 3. LICENCE & REGISTRATION
# ═══════════════════════════════════════════════════════════════════════════
class LicenceRegistrationCreate(BaseModel):
    site: str = Field(..., max_length=255)
    licence_type: str = Field(..., max_length=100)
    registration_number: str = Field(..., max_length=100)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    renewal_due: Optional[date] = None
    authority: Optional[str] = None
    document_path: Optional[str] = None
    status: str = Field(
        default="active",
        pattern="^(active|expired|suspended|pending_renewal)$",
    )
    reminder_days: int = Field(default=30, ge=0)
    remarks: Optional[str] = None


class LicenceRegistrationUpdate(BaseModel):
    licence_type: Optional[str] = None
    registration_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    renewal_due: Optional[date] = None
    authority: Optional[str] = None
    document_path: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(active|expired|suspended|pending_renewal)$",
    )
    reminder_days: Optional[int] = None
    remarks: Optional[str] = None


class LicenceRegistrationOut(BaseModel):
    id: int
    site: str
    licence_type: str
    registration_number: str
    issue_date: Optional[date]
    expiry_date: Optional[date]
    renewal_due: Optional[date]
    authority: Optional[str]
    document_path: Optional[str]
    status: str
    reminder_days: int
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 4. CONTRACT LABOUR COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class ContractLabourComplianceCreate(BaseModel):
    principal_employer: str = Field(..., max_length=255)
    contractor: str = Field(..., max_length=255)
    license_no: Optional[str] = None
    contract_period_start: Optional[date] = None
    contract_period_end: Optional[date] = None
    worker_count: int = Field(default=0, ge=0)
    agreement_available: bool = False
    labour_license_valid: bool = False
    returns_submitted: bool = False
    status: str = Field(
        default="compliant",
        pattern="^(compliant|non_compliant|under_review)$",
    )
    remarks: Optional[str] = None


class ContractLabourComplianceUpdate(BaseModel):
    contractor: Optional[str] = None
    license_no: Optional[str] = None
    contract_period_start: Optional[date] = None
    contract_period_end: Optional[date] = None
    worker_count: Optional[int] = None
    agreement_available: Optional[bool] = None
    labour_license_valid: Optional[bool] = None
    returns_submitted: Optional[bool] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(compliant|non_compliant|under_review)$",
    )
    remarks: Optional[str] = None


class ContractLabourComplianceOut(BaseModel):
    id: int
    principal_employer: str
    contractor: str
    license_no: Optional[str]
    contract_period_start: Optional[date]
    contract_period_end: Optional[date]
    worker_count: int
    agreement_available: bool
    labour_license_valid: bool
    returns_submitted: bool
    status: str
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 5. MINIMUM WAGES COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class MinimumWagesComplianceCreate(BaseModel):
    employee_name: str = Field(..., max_length=255)
    category: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    minimum_wage: Decimal
    actual_wage: Decimal
    difference: Decimal = Decimal("0")
    is_compliant: bool = True
    remarks: Optional[str] = None


class MinimumWagesComplianceUpdate(BaseModel):
    category: Optional[str] = None
    state: Optional[str] = None
    minimum_wage: Optional[Decimal] = None
    actual_wage: Optional[Decimal] = None
    difference: Optional[Decimal] = None
    is_compliant: Optional[bool] = None
    remarks: Optional[str] = None


class MinimumWagesComplianceOut(BaseModel):
    id: int
    employee_name: str
    category: str
    state: str
    minimum_wage: Decimal
    actual_wage: Decimal
    difference: Decimal
    is_compliant: bool
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 6. PF / ESI COVERAGE
# ═══════════════════════════════════════════════════════════════════════════
class PfEsiCoverageCreate(BaseModel):
    employee_name: str = Field(..., max_length=255)
    uan: Optional[str] = None
    esic_number: Optional[str] = None
    pf_applicable: bool = False
    esi_applicable: bool = False
    employer_contribution: Decimal = Decimal("0")
    employee_contribution: Decimal = Decimal("0")
    deposit_date: Optional[date] = None
    challan_number: Optional[str] = None
    status: str = Field(
        default="deposited",
        pattern="^(deposited|pending|overdue|reconciled)$",
    )


class PfEsiCoverageUpdate(BaseModel):
    uan: Optional[str] = None
    esic_number: Optional[str] = None
    pf_applicable: Optional[bool] = None
    esi_applicable: Optional[bool] = None
    employer_contribution: Optional[Decimal] = None
    employee_contribution: Optional[Decimal] = None
    deposit_date: Optional[date] = None
    challan_number: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(deposited|pending|overdue|reconciled)$",
    )


class PfEsiCoverageOut(BaseModel):
    id: int
    employee_name: str
    uan: Optional[str]
    esic_number: Optional[str]
    pf_applicable: bool
    esi_applicable: bool
    employer_contribution: Decimal
    employee_contribution: Decimal
    deposit_date: Optional[date]
    challan_number: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 7. BONUS & GRATUITY
# ═══════════════════════════════════════════════════════════════════════════
class BonusGratuityCreate(BaseModel):
    employee_name: str = Field(..., max_length=255)
    bonus_eligible: bool = False
    bonus_paid: Decimal = Decimal("0")
    bonus_date: Optional[date] = None
    gratuity_eligible: bool = False
    gratuity_amount: Decimal = Decimal("0")
    years_of_service: int = Field(default=0, ge=0)
    status: str = Field(
        default="pending",
        pattern="^(paid|pending|partially_paid)$",
    )


class BonusGratuityUpdate(BaseModel):
    bonus_eligible: Optional[bool] = None
    bonus_paid: Optional[Decimal] = None
    bonus_date: Optional[date] = None
    gratuity_eligible: Optional[bool] = None
    gratuity_amount: Optional[Decimal] = None
    years_of_service: Optional[int] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(paid|pending|partially_paid)$",
    )


class BonusGratuityOut(BaseModel):
    id: int
    employee_name: str
    bonus_eligible: bool
    bonus_paid: Decimal
    bonus_date: Optional[date]
    gratuity_eligible: bool
    gratuity_amount: Decimal
    years_of_service: int
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 8. WORKING HOURS & OVERTIME
# ═══════════════════════════════════════════════════════════════════════════
class WorkingHoursOvertimeCreate(BaseModel):
    employee_name: str = Field(..., max_length=255)
    attendance_date: date
    working_hours: Decimal
    overtime_hours: Decimal = Decimal("0")
    weekly_off: bool = False
    holiday: bool = False
    is_violation: bool = False
    remarks: Optional[str] = None


class WorkingHoursOvertimeUpdate(BaseModel):
    working_hours: Optional[Decimal] = None
    overtime_hours: Optional[Decimal] = None
    weekly_off: Optional[bool] = None
    holiday: Optional[bool] = None
    is_violation: Optional[bool] = None
    remarks: Optional[str] = None


class WorkingHoursOvertimeOut(BaseModel):
    id: int
    employee_name: str
    attendance_date: date
    working_hours: Decimal
    overtime_hours: Decimal
    weekly_off: bool
    holiday: bool
    is_violation: bool
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 9. CONTRACTOR PF/ESI VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════
class ContractorPfEsiVerificationCreate(BaseModel):
    contractor: str = Field(..., max_length=255)
    month: str = Field(..., max_length=7)
    pf_challan_path: Optional[str] = None
    esi_challan_path: Optional[str] = None
    worker_count: int = Field(default=0, ge=0)
    verification_status: str = Field(
        default="pending",
        pattern="^(verified|pending|rejected)$",
    )
    document_path: Optional[str] = None
    remarks: Optional[str] = None


class ContractorPfEsiVerificationUpdate(BaseModel):
    pf_challan_path: Optional[str] = None
    esi_challan_path: Optional[str] = None
    worker_count: Optional[int] = None
    verification_status: Optional[str] = Field(
        default=None,
        pattern="^(verified|pending|rejected)$",
    )
    document_path: Optional[str] = None
    remarks: Optional[str] = None


class ContractorPfEsiVerificationOut(BaseModel):
    id: int
    contractor: str
    month: str
    pf_challan_path: Optional[str]
    esi_challan_path: Optional[str]
    worker_count: int
    verification_status: str
    document_path: Optional[str]
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 10. POSH COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════
class PoshComplianceCreate(BaseModel):
    site: str = Field(..., max_length=255)
    icc_formed: bool = False
    members: Optional[str] = None
    training_conducted: bool = False
    annual_report_filed: bool = False
    complaint_count: int = Field(default=0, ge=0)
    pending_cases: int = Field(default=0, ge=0)
    status: str = Field(
        default="compliant",
        pattern="^(compliant|non_compliant|partial)$",
    )
    remarks: Optional[str] = None


class PoshComplianceUpdate(BaseModel):
    icc_formed: Optional[bool] = None
    members: Optional[str] = None
    training_conducted: Optional[bool] = None
    annual_report_filed: Optional[bool] = None
    complaint_count: Optional[int] = None
    pending_cases: Optional[int] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(compliant|non_compliant|partial)$",
    )
    remarks: Optional[str] = None


class PoshComplianceOut(BaseModel):
    id: int
    site: str
    icc_formed: bool
    members: Optional[str]
    training_conducted: bool
    annual_report_filed: bool
    complaint_count: int
    pending_cases: int
    status: str
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 11. LABOUR WELFARE FUND
# ═══════════════════════════════════════════════════════════════════════════
class LabourWelfareFundCreate(BaseModel):
    employee_name: str = Field(..., max_length=255)
    lwf_deduction: Decimal = Decimal("0")
    employer_share: Decimal = Decimal("0")
    employee_share: Decimal = Decimal("0")
    deposit_date: Optional[date] = None
    challan: Optional[str] = None
    status: str = Field(
        default="pending",
        pattern="^(deposited|pending|overdue)$",
    )


class LabourWelfareFundUpdate(BaseModel):
    lwf_deduction: Optional[Decimal] = None
    employer_share: Optional[Decimal] = None
    employee_share: Optional[Decimal] = None
    deposit_date: Optional[date] = None
    challan: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(deposited|pending|overdue)$",
    )


class LabourWelfareFundOut(BaseModel):
    id: int
    employee_name: str
    lwf_deduction: Decimal
    employer_share: Decimal
    employee_share: Decimal
    deposit_date: Optional[date]
    challan: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 12. RETURN FILING TRACKER
# ═══════════════════════════════════════════════════════════════════════════
class ReturnFilingTrackerCreate(BaseModel):
    return_name: str = Field(..., max_length=255)
    frequency: str = Field(..., pattern="^(monthly|quarterly|half_yearly|annual)$")
    due_date: date
    filed_date: Optional[date] = None
    status: str = Field(
        default="pending",
        pattern="^(filed|pending|overdue|extension)$",
    )
    penalty: Decimal = Decimal("0")
    remarks: Optional[str] = None


class ReturnFilingTrackerUpdate(BaseModel):
    frequency: Optional[str] = Field(default=None, pattern="^(monthly|quarterly|half_yearly|annual)$")
    due_date: Optional[date] = None
    filed_date: Optional[date] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(filed|pending|overdue|extension)$",
    )
    penalty: Optional[Decimal] = None
    remarks: Optional[str] = None


class ReturnFilingTrackerOut(BaseModel):
    id: int
    return_name: str
    frequency: str
    due_date: date
    filed_date: Optional[date]
    status: str
    penalty: Decimal
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 13. INSPECTION NOTICE LOG
# ═══════════════════════════════════════════════════════════════════════════
class InspectionNoticeLogCreate(BaseModel):
    inspection_date: date
    inspector_name: str = Field(..., max_length=255)
    department: str = Field(..., max_length=255)
    notice_number: Optional[str] = None
    observation: Optional[str] = None
    action_taken: Optional[str] = None
    status: str = Field(
        default="open",
        pattern="^(open|resolved|escalated)$",
    )
    attachment_path: Optional[str] = None


class InspectionNoticeLogUpdate(BaseModel):
    inspector_name: Optional[str] = None
    department: Optional[str] = None
    notice_number: Optional[str] = None
    observation: Optional[str] = None
    action_taken: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(open|resolved|escalated)$",
    )
    attachment_path: Optional[str] = None


class InspectionNoticeLogOut(BaseModel):
    id: int
    inspection_date: date
    inspector_name: str
    department: str
    notice_number: Optional[str]
    observation: Optional[str]
    action_taken: Optional[str]
    status: str
    attachment_path: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 14. WAGE CODE READINESS
# ═══════════════════════════════════════════════════════════════════════════
class WageCodeReadinessCreate(BaseModel):
    requirement: str = Field(..., max_length=500)
    status: str = Field(
        default="not_started",
        pattern="^(not_started|in_progress|completed|gap_identified)$",
    )
    gap: Optional[str] = None
    action: Optional[str] = None
    owner: Optional[str] = None
    target_date: Optional[date] = None


class WageCodeReadinessUpdate(BaseModel):
    requirement: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(not_started|in_progress|completed|gap_identified)$",
    )
    gap: Optional[str] = None
    action: Optional[str] = None
    owner: Optional[str] = None
    target_date: Optional[date] = None


class WageCodeReadinessOut(BaseModel):
    id: int
    requirement: str
    status: str
    gap: Optional[str]
    action: Optional[str]
    owner: Optional[str]
    target_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 15. CONTRACT WORKER MASTER
# ═══════════════════════════════════════════════════════════════════════════
class ContractWorkerMasterCreate(BaseModel):
    worker_name: str = Field(..., max_length=255)
    contractor: str = Field(..., max_length=255)
    joining_date: Optional[date] = None
    aadhaar: Optional[str] = None
    pf_applicable: bool = False
    esi_applicable: bool = False
    skill: Optional[str] = None
    department: Optional[str] = None
    status: str = Field(
        default="active",
        pattern="^(active|inactive|relieved)$",
    )


class ContractWorkerMasterUpdate(BaseModel):
    contractor: Optional[str] = None
    joining_date: Optional[date] = None
    aadhaar: Optional[str] = None
    pf_applicable: Optional[bool] = None
    esi_applicable: Optional[bool] = None
    skill: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(active|inactive|relieved)$",
    )


class ContractWorkerMasterOut(BaseModel):
    id: int
    worker_name: str
    contractor: str
    joining_date: Optional[date]
    aadhaar: Optional[str]
    pf_applicable: bool
    esi_applicable: bool
    skill: Optional[str]
    department: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
