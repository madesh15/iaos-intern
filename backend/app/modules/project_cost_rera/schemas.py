"""Pydantic schemas for Project Cost & RERA Compliance."""
from pydantic import BaseModel


# --- RERA Escrow ---
class ReraEscrowCreate(BaseModel):
    project_name: str
    escrow_account: str = ""
    total_deposit: float = 0
    eligible_withdrawal: float = 0
    withdrawn_amount: float = 0
    compliance_status: str = "Compliant"
    notes: str = ""


class ReraEscrowOut(BaseModel):
    id: int
    project_name: str
    escrow_account: str
    total_deposit: float
    eligible_withdrawal: float
    withdrawn_amount: float
    compliance_status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Project Cost Budget ---
class ProjectCostBudgetCreate(BaseModel):
    project_name: str
    cost_head: str
    approved_budget: float = 0
    actual_cost: float = 0
    variance_pct: float = 0
    status: str = "On Track"
    notes: str = ""


class ProjectCostBudgetOut(BaseModel):
    id: int
    project_name: str
    cost_head: str
    approved_budget: float
    actual_cost: float
    variance_pct: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Withdrawal Certificate ---
class WithdrawalCertificateCreate(BaseModel):
    project_name: str
    cert_number: str = ""
    cert_type: str = "Architect"
    certified_amount: float = 0
    certifier_name: str = ""
    cert_date: str = ""
    valid: bool = True
    notes: str = ""


class WithdrawalCertificateOut(BaseModel):
    id: int
    project_name: str
    cert_number: str
    cert_type: str
    certified_amount: float
    certifier_name: str
    cert_date: str
    valid: bool
    notes: str
    model_config = {"from_attributes": True}


# --- Fund Diversion ---
class FundDiversionCreate(BaseModel):
    source_project: str
    destination_project: str
    amount: float = 0
    diversion_date: str = ""
    risk_level: str = "Medium"
    status: str = "Under Review"
    notes: str = ""


class FundDiversionOut(BaseModel):
    id: int
    source_project: str
    destination_project: str
    amount: float
    diversion_date: str
    risk_level: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Buyer Collection ---
class BuyerCollectionCreate(BaseModel):
    project_name: str
    buyer_name: str
    flat_unit: str = ""
    demand_amount: float = 0
    collected_amount: float = 0
    collection_date: str = ""
    payment_mode: str = "Bank Transfer"
    notes: str = ""


class BuyerCollectionOut(BaseModel):
    id: int
    project_name: str
    buyer_name: str
    flat_unit: str
    demand_amount: float
    collected_amount: float
    collection_date: str
    payment_mode: str
    notes: str
    model_config = {"from_attributes": True}


# --- Revenue Recognition ---
class RevenueRecognitionCreate(BaseModel):
    project_name: str
    buyer_name: str
    flat_unit: str = ""
    total_consideration: float = 0
    recognised_to_date: float = 0
    recognition_basis: str = "Handover"
    handover_date: str = ""
    notes: str = ""


class RevenueRecognitionOut(BaseModel):
    id: int
    project_name: str
    buyer_name: str
    flat_unit: str
    total_consideration: float
    recognised_to_date: float
    recognition_basis: str
    handover_date: str
    notes: str
    model_config = {"from_attributes": True}


# --- Cost to Complete ---
class CostToCompleteCreate(BaseModel):
    project_name: str
    cost_head: str
    original_estimate: float = 0
    revised_estimate: float = 0
    incurred_to_date: float = 0
    reliability: str = "Medium"
    notes: str = ""


class CostToCompleteOut(BaseModel):
    id: int
    project_name: str
    cost_head: str
    original_estimate: float
    revised_estimate: float
    incurred_to_date: float
    reliability: str
    notes: str
    model_config = {"from_attributes": True}


# --- Contractor Bill ---
class ContractorBillCreate(BaseModel):
    project_name: str
    contractor_name: str
    bill_number: str = ""
    bill_amount: float = 0
    certified_amount: float = 0
    progress_pct: float = 0
    status: str = "Pending"
    notes: str = ""


class ContractorBillOut(BaseModel):
    id: int
    project_name: str
    contractor_name: str
    bill_number: str
    bill_amount: float
    certified_amount: float
    progress_pct: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Approval & Sanction ---
class ApprovalSanctionCreate(BaseModel):
    project_name: str
    approval_type: str
    authority: str
    approval_number: str = ""
    status: str = "Pending"
    valid_until: str = ""
    notes: str = ""


class ApprovalSanctionOut(BaseModel):
    id: int
    project_name: str
    approval_type: str
    authority: str
    approval_number: str
    status: str
    valid_until: str
    notes: str
    model_config = {"from_attributes": True}


# --- Unsold Inventory ---
class UnsoldInventoryCreate(BaseModel):
    project_name: str
    flat_unit: str
    unit_type: str = ""
    carpet_area: float = 0
    booked_price: float = 0
    nrv: float = 0
    status: str = "Unsold"
    notes: str = ""


class UnsoldInventoryOut(BaseModel):
    id: int
    project_name: str
    flat_unit: str
    unit_type: str
    carpet_area: float
    booked_price: float
    nrv: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Customer Advance ---
class CustomerAdvanceCreate(BaseModel):
    project_name: str
    buyer_name: str
    flat_unit: str = ""
    advance_amount: float = 0
    received_date: str = ""
    ageing_days: int = 0
    status: str = "Active"
    notes: str = ""


class CustomerAdvanceOut(BaseModel):
    id: int
    project_name: str
    buyer_name: str
    flat_unit: str
    advance_amount: float
    received_date: str
    ageing_days: int
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Registration & Possession ---
class RegistrationPossessionCreate(BaseModel):
    project_name: str
    buyer_name: str
    flat_unit: str = ""
    agreement_date: str = ""
    registration_date: str = ""
    possession_date: str = ""
    status: str = "Pending"
    notes: str = ""


class RegistrationPossessionOut(BaseModel):
    id: int
    project_name: str
    buyer_name: str
    flat_unit: str
    agreement_date: str
    registration_date: str
    possession_date: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Interest / Penalty ---
class InterestPenaltyCreate(BaseModel):
    project_name: str
    buyer_name: str
    flat_unit: str = ""
    delay_days: int = 0
    penalty_amount: float = 0
    interest_rate: float = 0
    status: str = "Accrued"
    notes: str = ""


class InterestPenaltyOut(BaseModel):
    id: int
    project_name: str
    buyer_name: str
    flat_unit: str
    delay_days: int
    penalty_amount: float
    interest_rate: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


# --- Land Cost & Title ---
class LandCostTitleCreate(BaseModel):
    project_name: str
    land_parcel: str
    acquisition_cost: float = 0
    title_clear: bool = True
    title_insurance: bool = False
    encumbrances: str = "None"
    notes: str = ""


class LandCostTitleOut(BaseModel):
    id: int
    project_name: str
    land_parcel: str
    acquisition_cost: float
    title_clear: bool
    title_insurance: bool
    encumbrances: str
    notes: str
    model_config = {"from_attributes": True}


# --- Project Cashflow ---
class ProjectCashflowCreate(BaseModel):
    project_name: str
    period: str
    opening_balance: float = 0
    inflows: float = 0
    outflows: float = 0
    closing_balance: float = 0
    liquidity_status: str = "Adequate"
    notes: str = ""


class ProjectCashflowOut(BaseModel):
    id: int
    project_name: str
    period: str
    opening_balance: float
    inflows: float
    outflows: float
    closing_balance: float
    liquidity_status: str
    notes: str
    model_config = {"from_attributes": True}
