from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str

    model_config = {"from_attributes": True}


class SalesDistributionKpis(BaseModel):
    total_sales_audited: float
    scheme_leakage_identified: float
    primary_secondary_mismatch_val: float
    high_risk_red_flags: int
    open_remediation_actions: int
    active_distributors: int
    claim_leakage_recovery_rate: float
    audit_coverage_pct: float


class SubPageDataRequest(BaseModel):
    page_key: str
    filters: Optional[Dict[str, Any]] = None


class SubPageDataResponse(BaseModel):
    page_key: str
    title: str
    category: str
    total_records: int
    summary_metrics: Dict[str, Any]
    items: List[Dict[str, Any]]
