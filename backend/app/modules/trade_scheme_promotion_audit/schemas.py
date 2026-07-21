from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


# --- TradeScheme ---
class TradeSchemeCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    scheme_type: str
    channel: str
    product_category: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_allocated: float = 0.0
    approval_status: str = "Draft"
    approved_by: str = ""
    overlap_flag: bool = False
    overlap_schemes: str = ""
    notes: str = ""


class TradeSchemeOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    scheme_type: str
    channel: str
    product_category: str
    start_date: Optional[date]
    end_date: Optional[date]
    budget_allocated: float
    approval_status: str
    approved_by: str
    overlap_flag: bool
    overlap_schemes: str
    notes: str

    model_config = {"from_attributes": True}


# --- TradeClaim ---
class TradeClaimCreate(BaseModel):
    claim_id: str
    distributor_name: str
    scheme_code: str
    channel: str
    claim_amount: float = 0.0
    settled_amount: float = 0.0
    proof_of_performance: bool = False
    validation_status: str = "Pending"
    settlement_status: str = "Unsettled"
    duplicate_flag: bool = False
    duplicate_claim_refs: str = ""
    inflation_flag: bool = False
    ageing_days: int = 0
    claim_date: Optional[date] = None
    settlement_date: Optional[date] = None
    notes: str = ""


class TradeClaimOut(BaseModel):
    id: int
    claim_id: str
    distributor_name: str
    scheme_code: str
    channel: str
    claim_amount: float
    settled_amount: float
    proof_of_performance: bool
    validation_status: str
    settlement_status: str
    duplicate_flag: bool
    duplicate_claim_refs: str
    inflation_flag: bool
    ageing_days: int
    claim_date: Optional[date]
    settlement_date: Optional[date]
    notes: str

    model_config = {"from_attributes": True}


# --- PromoSpend ---
class PromoSpendCreate(BaseModel):
    promo_name: str
    promo_type: str
    channel: str
    region: str = ""
    spend_amount: float = 0.0
    uplift_revenue: float = 0.0
    roi_percentage: float = 0.0
    mechanism: str = ""
    slab_tier: str = ""
    target_quantity: float = 0.0
    achieved_quantity: float = 0.0
    slab_qualified: bool = False
    free_goods_qty: float = 0.0
    free_goods_reconciled: bool = False
    display_spend: float = 0.0
    display_verified: bool = False
    price_protection_amount: float = 0.0
    price_protection_validated: bool = False
    accrual_amount: float = 0.0
    actual_spend: float = 0.0
    variance: float = 0.0
    promo_period_start: Optional[date] = None
    promo_period_end: Optional[date] = None
    notes: str = ""


class PromoSpendOut(BaseModel):
    id: int
    promo_name: str
    promo_type: str
    channel: str
    region: str
    spend_amount: float
    uplift_revenue: float
    roi_percentage: float
    mechanism: str
    slab_tier: str
    target_quantity: float
    achieved_quantity: float
    slab_qualified: bool
    free_goods_qty: float
    free_goods_reconciled: bool
    display_spend: float
    display_verified: bool
    price_protection_amount: float
    price_protection_validated: bool
    accrual_amount: float
    actual_spend: float
    variance: float
    promo_period_start: Optional[date]
    promo_period_end: Optional[date]
    notes: str

    model_config = {"from_attributes": True}


# --- OutletAudit ---
class OutletAuditCreate(BaseModel):
    outlet_name: str
    outlet_code: str
    outlet_type: str
    channel: str
    distributor: str = ""
    is_ghost: bool = False
    performance_status: str = "Active"
    competitor_spend_ratio: float = 0.0
    trade_spend_ratio: float = 0.0
    unclaimed_amount: float = 0.0
    unclaimed_scheme_codes: str = ""
    last_audit_date: Optional[date] = None
    notes: str = ""


class OutletAuditOut(BaseModel):
    id: int
    outlet_name: str
    outlet_code: str
    outlet_type: str
    channel: str
    distributor: str
    is_ghost: bool
    performance_status: str
    competitor_spend_ratio: float
    trade_spend_ratio: float
    unclaimed_amount: float
    unclaimed_scheme_codes: str
    last_audit_date: Optional[date]
    notes: str

    model_config = {"from_attributes": True}
