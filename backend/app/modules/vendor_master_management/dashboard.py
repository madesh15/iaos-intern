"""Dashboard endpoint helpers for the Vendor Master & Management module."""

from __future__ import annotations

from sqlalchemy.orm import Session

from .analytics import compute_dashboard
from .schemas import (
    BankChangeTrend,
    CategoryCount,
    DashboardOut,
    DashboardStats,
    ExceptionTrend,
    MonthlyCreation,
    RiskDistribution,
    StatusCount,
    TopVendorSpend,
)


def get_dashboard_data(db: Session, tenant_id: int) -> DashboardOut:
    raw = compute_dashboard(db, tenant_id)
    stats = raw["stats"]

    return DashboardOut(
        stats=DashboardStats(**stats),
        vendor_status=[StatusCount(**s) for s in raw["vendor_status"]],
        vendor_category=[CategoryCount(**c) for c in raw["vendor_category"]],
        risk_distribution=[RiskDistribution(**r) for r in raw["risk_distribution"]],
        monthly_creation=[MonthlyCreation(**m) for m in raw["monthly_creation"]],
        bank_change_trend=[BankChangeTrend(**b) for b in raw["bank_change_trend"]],
        top_vendors_by_spend=[TopVendorSpend(**t) for t in raw["top_vendors_by_spend"]],
        exception_trend=[ExceptionTrend(**e) for e in raw["exception_trend"]],
    )
