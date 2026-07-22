"""Dashboard endpoint helper for the Record-to-Report module."""

from __future__ import annotations

from sqlalchemy.orm import Session

from .service import compute_dashboard
from .schemas import (
    DashboardOut,
    DashboardStats,
    RiskTrend,
    RiskDistribution,
    AmountHistogram,
    MonthlyTrend,
    TopUser,
    TopAccount,
    PostingHeatmap,
    ExceptionTrend,
)


def get_dashboard_data(db: Session, tenant_id: int) -> DashboardOut:
    raw = compute_dashboard(db, tenant_id)
    return DashboardOut(
        stats=DashboardStats(**raw["stats"]),
        risk_trend=[RiskTrend(**r) for r in raw["risk_trend"]],
        risk_distribution=[RiskDistribution(**r) for r in raw["risk_distribution"]],
        amount_histogram=[AmountHistogram(**r) for r in raw["amount_histogram"]],
        monthly_trend=[MonthlyTrend(**r) for r in raw["monthly_trend"]],
        top_users=[TopUser(**u) for u in raw["top_users"]],
        top_accounts=[TopAccount(**a) for a in raw["top_accounts"]],
        posting_heatmap=[PostingHeatmap(**h) for h in raw["posting_heatmap"]],
        exception_trend=[ExceptionTrend(**e) for e in raw["exception_trend"]],
    )
