from datetime import date, datetime
from typing import Optional

from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.core.tenancy import tenant_scoped

from .models import (
    Carrier, Vehicle, Route, FreightRateContract, FreightShipment,
    FreightInvoice, POD, FuelIndex, Claim, DetentionCharge,
    DashboardKPI, Finding, ActionTracker,
)


def soft_delete_query(db: Session, model, current_user):
    return tenant_scoped(db.query(model).filter(model.is_deleted == False), current_user)


def paginate(query, page: int = 1, page_size: int = 20):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = max(1, (total + page_size - 1) // page_size)
    return items, total, page, page_size, total_pages


def search_query(query, model, search_term: str, fields: list):
    if not search_term:
        return query
    filters = [getattr(model, f).ilike(f"%{search_term}%") for f in fields if hasattr(model, f)]
    if filters:
        query = query.filter(or_(*filters))
    return query


def get_dashboard_summary(db: Session, current_user):
    base = lambda m: soft_delete_query(db, m, current_user)

    total_shipments = base(FreightShipment).count()
    total_freight_spend = base(FreightShipment).with_entities(
        func.coalesce(func.sum(FreightShipment.total_amount), 0)
    ).scalar()

    duplicate_bills = base(FreightInvoice).filter(
        FreightInvoice.difference_amount > 0
    ).count()

    open_claims = base(Claim).filter(Claim.status == "Open").count()

    today = date.today()
    delayed = base(FreightShipment).filter(
        FreightShipment.actual_delivery_date.is_(None),
        FreightShipment.expected_delivery_date < today
    ).count()

    avg_score = base(Carrier).with_entities(
        func.avg(Carrier.performance_score)
    ).scalar() or 0

    avg_cost = 0
    if total_shipments > 0:
        avg_cost = total_freight_spend / total_shipments

    risk_score = _calculate_risk_score(db, current_user)

    total_contracts = base(FreightRateContract).count()
    active_carriers = base(Carrier).filter(Carrier.status == "Active").count()
    pending_invoices = base(FreightInvoice).filter(FreightInvoice.status == "Pending").count()
    total_findings = base(Finding).count()

    return {
        "total_shipments": total_shipments,
        "total_freight_spend": round(total_freight_spend, 2),
        "duplicate_bills": duplicate_bills,
        "open_claims": open_claims,
        "delayed_deliveries": delayed,
        "avg_carrier_score": round(avg_score, 2),
        "avg_freight_cost": round(avg_cost, 2),
        "risk_score": round(risk_score, 2),
        "total_contracts": total_contracts,
        "active_carriers": active_carriers,
        "pending_invoices": pending_invoices,
        "total_findings": total_findings,
    }


def _calculate_risk_score(db: Session, current_user):
    base = lambda m: soft_delete_query(db, m, current_user)
    score = 50

    overdue_shipments = base(FreightShipment).filter(
        FreightShipment.actual_delivery_date.is_(None),
        FreightShipment.expected_delivery_date < date.today()
    ).count()
    score += min(overdue_shipments * 2, 15)

    open_claims = base(Claim).filter(Claim.status == "Open").count()
    score += min(open_claims * 3, 15)

    overbilled = base(FreightInvoice).filter(
        FreightInvoice.difference_amount > 0
    ).count()
    score += min(overbilled * 1, 10)

    below_avg_carriers = base(Carrier).filter(
        Carrier.performance_score < 60, Carrier.performance_score > 0
    ).count()
    score += min(below_avg_carriers * 2, 10)

    return min(score, 100)


def check_duplicate_invoice(db: Session, invoice_number: str, current_user):
    existing = soft_delete_query(db, FreightInvoice, current_user).filter(
        FreightInvoice.invoice_number == invoice_number
    ).first()
    return existing is not None


def compute_carrier_performance(db: Session, carrier_id: int):
    carrier = db.query(Carrier).filter(Carrier.id == carrier_id).first()
    if not carrier:
        return 0
    score = (
        carrier.on_time_percentage * 0.35
        + (100 - carrier.damage_percentage) * 0.25
        + (100 - carrier.claim_percentage) * 0.20
        + (100 - carrier.delay_percentage) * 0.20
    )
    return round(score, 2)


def validate_fuel_surcharge(
    current_price: float,
    base_price: float,
    billed_surcharge: float,
    contract_surcharge_pct: float,
) -> dict:
    if base_price <= 0:
        return {"expected": 0, "variance": -billed_surcharge, "is_valid": False}
    price_change_pct = ((current_price - base_price) / base_price) * 100
    expected_surcharge = billed_surcharge * (1 + price_change_pct / 100 * contract_surcharge_pct / 100)
    variance = expected_surcharge - billed_surcharge
    return {
        "expected": round(expected_surcharge, 2),
        "variance": round(variance, 2),
        "is_valid": abs(variance) < 0.01 * billed_surcharge,
    }
