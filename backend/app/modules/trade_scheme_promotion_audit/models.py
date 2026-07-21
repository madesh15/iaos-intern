"""Module data models for Trade Scheme & Promotion Audit (Module 72).

RULES for zero-conflict, tenant-safe modules:
  1. Prefix every table with `mod_trade_scheme_promotion_audit_`
  2. Inherit `TenantMixin` on anything tenant-owned.
"""
from datetime import date
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class TradeScheme(Base, TenantMixin):
    """Scheme design, approval and overlap detection."""
    __tablename__ = "mod_trade_scheme_promotion_audit_schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_code: Mapped[str] = mapped_column(String(100), index=True)
    scheme_name: Mapped[str] = mapped_column(String(255))
    scheme_type: Mapped[str] = mapped_column(String(100))  # Volume, Cash, Combo, Loyalty, Seasonal
    channel: Mapped[str] = mapped_column(String(100))  # Modern Trade, General Trade, E-Commerce, HoReCa
    product_category: Mapped[str] = mapped_column(String(150), default="")
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    budget_allocated: Mapped[float] = mapped_column(Float, default=0.0)
    approval_status: Mapped[str] = mapped_column(String(50), default="Draft")  # Draft, Pending, Approved, Rejected
    approved_by: Mapped[str] = mapped_column(String(150), default="")
    overlap_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    overlap_schemes: Mapped[str] = mapped_column(Text, default="")  # comma-separated scheme codes
    notes: Mapped[str] = mapped_column(Text, default="")


class TradeClaim(Base, TenantMixin):
    """Claim validation, settlement, duplicate detection and ageing."""
    __tablename__ = "mod_trade_scheme_promotion_audit_claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    claim_id: Mapped[str] = mapped_column(String(100), index=True)
    distributor_name: Mapped[str] = mapped_column(String(200))
    scheme_code: Mapped[str] = mapped_column(String(100))
    channel: Mapped[str] = mapped_column(String(100))
    claim_amount: Mapped[float] = mapped_column(Float, default=0.0)
    settled_amount: Mapped[float] = mapped_column(Float, default=0.0)
    proof_of_performance: Mapped[bool] = mapped_column(Boolean, default=False)
    validation_status: Mapped[str] = mapped_column(String(50), default="Pending")  # Valid, Invalid, Pending, Under Review
    settlement_status: Mapped[str] = mapped_column(String(50), default="Unsettled")  # Settled, Partial, Unsettled, Rejected
    duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    duplicate_claim_refs: Mapped[str] = mapped_column(Text, default="")
    inflation_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    ageing_days: Mapped[int] = mapped_column(Integer, default=0)
    claim_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    settlement_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class PromoSpend(Base, TenantMixin):
    """Promo ROI, off-invoice, slab, free-goods, display, price-protection and accrual tracking."""
    __tablename__ = "mod_trade_scheme_promotion_audit_spend"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    promo_name: Mapped[str] = mapped_column(String(255))
    promo_type: Mapped[str] = mapped_column(String(100))  # Off-Invoice, Bill-Back, Free Goods, Display, Price Protection, Slab
    channel: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(150), default="")
    spend_amount: Mapped[float] = mapped_column(Float, default=0.0)
    uplift_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    roi_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    mechanism: Mapped[str] = mapped_column(String(100), default="")  # Off-Invoice, Bill-Back, N/A
    slab_tier: Mapped[str] = mapped_column(String(50), default="")
    target_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    achieved_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    slab_qualified: Mapped[bool] = mapped_column(Boolean, default=False)
    free_goods_qty: Mapped[float] = mapped_column(Float, default=0.0)
    free_goods_reconciled: Mapped[bool] = mapped_column(Boolean, default=False)
    display_spend: Mapped[float] = mapped_column(Float, default=0.0)
    display_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    price_protection_amount: Mapped[float] = mapped_column(Float, default=0.0)
    price_protection_validated: Mapped[bool] = mapped_column(Boolean, default=False)
    accrual_amount: Mapped[float] = mapped_column(Float, default=0.0)
    actual_spend: Mapped[float] = mapped_column(Float, default=0.0)
    variance: Mapped[float] = mapped_column(Float, default=0.0)
    promo_period_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    promo_period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class OutletAudit(Base, TenantMixin):
    """Ghost outlets, competitor benchmark, unclaimed schemes and outlet-level checks."""
    __tablename__ = "mod_trade_scheme_promotion_audit_outlets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    outlet_name: Mapped[str] = mapped_column(String(255))
    outlet_code: Mapped[str] = mapped_column(String(100), index=True)
    outlet_type: Mapped[str] = mapped_column(String(100))  # Kirana, Supermarket, Hypermarket, E-Commerce, HoReCa
    channel: Mapped[str] = mapped_column(String(100))
    distributor: Mapped[str] = mapped_column(String(200), default="")
    is_ghost: Mapped[bool] = mapped_column(Boolean, default=False)
    performance_status: Mapped[str] = mapped_column(String(50), default="Active")  # Active, Low-Performing, Non-Performing, Ghost
    competitor_spend_ratio: Mapped[float] = mapped_column(Float, default=0.0)  # % of competitor trade spend
    trade_spend_ratio: Mapped[float] = mapped_column(Float, default=0.0)  # company spend / industry avg
    unclaimed_amount: Mapped[float] = mapped_column(Float, default=0.0)
    unclaimed_scheme_codes: Mapped[str] = mapped_column(Text, default="")
    last_audit_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
