"""Analytics & dashboard computation for Item Material Master Governance.

Consolidates KPI computation, risk scoring, trend analysis, and distribution
breakdowns used by the dashboard and summary views.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Sequence

from sqlalchemy.orm import Session

from . import crud
from . import rules
from .constants import ExceptionType
from .models import ItemMaterialMasterGovernanceItem as ItemModel
from .schemas import DashboardStats, ExceptionOut, FindingOut

logger = logging.getLogger(__name__)


def compute_risk_score(
    db: Session,
    tenant_id: int,
) -> float:
    """Compute a governance risk score (0-100) where higher = riskier."""
    total = crud.count_items(db, tenant_id)
    if total == 0:
        return 0.0

    exceptions = crud.count_exceptions(db, tenant_id)
    open_findings = crud.count_open_findings(db, tenant_id)
    blocked = crud.count_blocked_items(db, tenant_id)

    raw = (exceptions * 5 + open_findings * 10 + blocked * 3) / total * 100
    return round(min(raw, 100), 1)


def compute_compliance_pct(
    db: Session,
    tenant_id: int,
) -> float:
    """Compute master data completeness / compliance percentage."""
    total = crud.count_items(db, tenant_id)
    if total == 0:
        return 100.0
    exceptions = crud.count_exceptions(db, tenant_id)
    compliant = max(0, total - exceptions)
    return round(compliant / total * 100, 1)


def get_category_distribution(
    db: Session,
    tenant_id: int,
) -> list[dict[str, Any]]:
    """Return item count per category."""
    categories = crud.get_distinct_categories(db, tenant_id)
    result = []
    for cat in categories:
        stmt_items = __import__("sqlalchemy").select(ItemModel).where(
            ItemModel.tenant_id == tenant_id,
            ItemModel.item_category == cat,
        )
        count = len(db.execute(stmt_items).scalars().all())
        result.append({"category": cat, "count": count})
    return result


def get_plant_distribution(
    db: Session,
    tenant_id: int,
) -> list[dict[str, Any]]:
    """Return item count per plant."""
    plants = crud.get_distinct_plants(db, tenant_id)
    result = []
    for plant in plants:
        stmt_items = __import__("sqlalchemy").select(ItemModel).where(
            ItemModel.tenant_id == tenant_id,
            ItemModel.plant == plant,
        )
        count = len(db.execute(stmt_items).scalars().all())
        result.append({"plant": plant, "count": count})
    return result


def get_exception_trend(
    db: Session,
    tenant_id: int,
    days: int = 30,
) -> list[dict[str, Any]]:
    """Return exception counts grouped by day for trend charts."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    exceptions = crud.list_exceptions(db, tenant_id, limit=10000)
    daily: dict[str, int] = {}
    for exc in exceptions:
        if exc.created_at and exc.created_at >= since:
            key = exc.created_at.strftime("%Y-%m-%d")
            daily[key] = daily.get(key, 0) + 1
    return [{"date": d, "count": c} for d, c in sorted(daily.items())]


def compute_all_kpis(db: Session, tenant_id: int) -> dict[str, Any]:
    """Compute all dashboard KPIs in one call."""
    total = crud.count_items(db, tenant_id)
    active = crud.count_active_items(db, tenant_id)
    blocked = crud.count_blocked_items(db, tenant_id)
    total_exc = crud.count_exceptions(db, tenant_id)
    open_exc = crud.count_open_exceptions(db, tenant_id)
    total_findings = crud.count_findings(db, tenant_id)
    open_findings = crud.count_open_findings(db, tenant_id)
    severity_counts = crud.count_findings_by_severity(db, tenant_id)

    exc_by_type = crud.count_exceptions_by_type(db, tenant_id)
    duplicates = exc_by_type.get("duplicate", 0)
    missing_hsn = exc_by_type.get("hsn", 0)
    missing_val = exc_by_type.get("valuation", 0)
    uom_conflicts = exc_by_type.get("uom", 0)
    obsolete = exc_by_type.get("obsolete", 0)
    dead_stock = exc_by_type.get("dead_stock", 0)

    risk_score = compute_risk_score(db, tenant_id)
    compliance_pct = compute_compliance_pct(db, tenant_id)

    category_dist = get_category_distribution(db, tenant_id)
    plant_dist = get_plant_distribution(db, tenant_id)
    exception_trend = get_exception_trend(db, tenant_id)

    recent_exceptions = crud.get_recent_exceptions(db, tenant_id)
    recent_findings = crud.get_recent_findings(db, tenant_id)

    return {
        "total_items": total,
        "active_items": active,
        "blocked_items": blocked,
        "total_exceptions": total_exc,
        "open_exceptions": open_exc,
        "total_findings": total_findings,
        "open_findings": open_findings,
        "critical_findings": severity_counts.get("critical", 0),
        "high_findings": severity_counts.get("high", 0),
        "medium_findings": severity_counts.get("medium", 0),
        "low_findings": severity_counts.get("low", 0),
        "duplicate_items": duplicates,
        "missing_hsn": missing_hsn,
        "missing_valuation": missing_val,
        "uom_conflicts": uom_conflicts,
        "obsolete_items": obsolete,
        "dead_stock_items": dead_stock,
        "capa_pending": open_findings,
        "risk_score": risk_score,
        "compliance_pct": compliance_pct,
        "category_distribution": category_dist,
        "plant_distribution": plant_dist,
        "exception_trend": exception_trend,
        "recent_exceptions": [ExceptionOut.model_validate(e) for e in recent_exceptions],
        "recent_findings": [FindingOut.model_validate(f) for f in recent_findings],
    }
