from pydantic import BaseModel
from typing import Optional, List


class ExposureCreate(BaseModel):
    currency_pair: str
    amount: float
    direction: str
    maturity_date: str
    status: Optional[str] = "Unhedged"
    completeness_status: Optional[str] = "Verified"
    notes: Optional[str] = ""


class ExposureOut(BaseModel):
    id: int
    tenant_id: int
    currency_pair: str
    amount: float
    direction: str
    maturity_date: str
    status: str
    completeness_status: str
    is_anomaly: bool
    notes: Optional[str] = ""

    class Config:
        from_attributes = True


class HedgeCreate(BaseModel):
    contract_type: str
    underlying_exposure_id: Optional[int] = None
    amount: float
    strike_rate: float
    maturity_date: str
    counterparty: Optional[str] = "HSBC Bank"
    premium_cost: Optional[float] = 0.0


class HedgeOut(BaseModel):
    id: int
    tenant_id: int
    contract_type: str
    underlying_exposure_id: Optional[int]
    amount: float
    strike_rate: float
    fair_value: float
    gain_loss: float
    effectiveness_pct: float
    maturity_date: str
    bank_confirmation: str
    is_speculative: bool
    status: str
    counterparty: str
    premium_cost: float

    class Config:
        from_attributes = True


class ExceptionCreate(BaseModel):
    title: str
    description: str
    severity: str
    assigned_to: Optional[str] = "Unassigned"


class ExceptionUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None


class ExceptionOut(BaseModel):
    id: int
    tenant_id: int
    title: str
    description: str
    severity: str
    status: str
    assigned_to: str
    created_at: str

    class Config:
        from_attributes = True


class FindingCreate(BaseModel):
    title: str
    description: str
    severity: str
    root_cause: str
    recommendation: str


class FindingOut(BaseModel):
    id: int
    tenant_id: int
    title: str
    description: str
    severity: str
    root_cause: str
    recommendation: str
    created_at: str

    class Config:
        from_attributes = True


class RemediationCreate(BaseModel):
    finding_id: int
    capa_action: str
    owner: str
    due_date: str


class RemediationUpdate(BaseModel):
    status: str
    retesting_status: Optional[str] = None


class RemediationOut(BaseModel):
    id: int
    tenant_id: int
    finding_id: int
    capa_action: str
    owner: str
    due_date: str
    status: str
    retesting_status: str

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    filename: str
    doc_type: str


class DocumentOut(BaseModel):
    id: int
    tenant_id: int
    filename: str
    doc_type: str
    uploaded_at: str

    class Config:
        from_attributes = True


class DashboardKpisOut(BaseModel):
    overall_risk_score: float
    total_exposure_amount: float
    hedged_amount: float
    unhedged_amount: float
    hedge_coverage_pct: float
    open_unhedged_positions: int
    pending_exceptions: int
    counterparty_risk_level: str
    hedge_effectiveness_pct: float
    natural_hedged_opportunities: int


class AISummaryOut(BaseModel):
    summary: str
    insights: List[str]
    recommendations: List[str]
