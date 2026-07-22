from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session, joinedload

from app.core.tenancy import tenant_scoped

from .models import (
    Carrier, FreightShipment, FreightInvoice, POD, FuelIndex,
    Claim, DetentionCharge, FreightRateContract, Route, Vehicle,
)


def _base_query(db: Session, model, current_user):
    return tenant_scoped(
        db.query(model).filter(model.is_deleted == False), current_user
    )


def rate_compliance_analysis(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.contract_rate > 0, FreightShipment.billed_rate > 0)
        .all()
    )
    results = []
    for s in shipments:
        diff = s.billed_rate - s.contract_rate
        pct = (diff / s.contract_rate * 100) if s.contract_rate > 0 else 0
        if pct > 5:
            results.append({
                "shipment_id": s.id,
                "shipment_number": s.shipment_number,
                "contract_rate": s.contract_rate,
                "billed_rate": s.billed_rate,
                "difference": round(diff, 2),
                "overbilling_pct": round(pct, 2),
            })
    return results


def weight_variance_analysis(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.actual_weight_kg > 0, FreightShipment.charged_weight_kg > 0)
        .all()
    )
    results = []
    for s in shipments:
        variance = ((s.charged_weight_kg - s.actual_weight_kg) / s.actual_weight_kg) * 100
        if abs(variance) > 10:
            results.append({
                "shipment_id": s.id,
                "shipment_number": s.shipment_number,
                "actual_weight": s.actual_weight_kg,
                "charged_weight": s.charged_weight_kg,
                "variance_pct": round(variance, 2),
            })
    return results


def route_distance_analytics(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.expected_distance_km > 0, FreightShipment.actual_distance_km > 0)
        .all()
    )
    results = []
    for s in shipments:
        variance = ((s.actual_distance_km - s.expected_distance_km) / s.expected_distance_km) * 100
        if variance > 10:
            results.append({
                "shipment_id": s.id,
                "shipment_number": s.shipment_number,
                "expected_distance": s.expected_distance_km,
                "actual_distance": s.actual_distance_km,
                "variance_pct": round(variance, 2),
            })
    return results


def detention_demurrage_analysis(db: Session, current_user):
    charges = (
        _base_query(db, DetentionCharge, current_user)
        .all()
    )
    total_amount = sum(c.total_amount for c in charges)
    avoidable_amount = sum(c.total_amount for c in charges if c.is_avoidable)
    total_hours = sum(c.actual_hours for c in charges)
    chargeable_hours = sum(c.chargeable_hours for c in charges)

    shipments_with_charges = len(set(c.shipment_id for c in charges))

    return {
        "total_detention_amount": round(total_amount, 2),
        "avoidable_amount": round(avoidable_amount, 2),
        "avoidable_pct": round((avoidable_amount / total_amount * 100), 2) if total_amount > 0 else 0,
        "total_hours": total_hours,
        "chargeable_hours": chargeable_hours,
        "shipments_with_charges": shipments_with_charges,
    }


def carrier_performance_analysis(db: Session, current_user):
    carriers = (
        _base_query(db, Carrier, current_user)
        .filter(Carrier.performance_score > 0)
        .all()
    )
    results = []
    for c in carriers:
        score = (
            c.on_time_percentage * 0.35
            + (100 - c.damage_percentage) * 0.25
            + (100 - c.claim_percentage) * 0.20
            + (100 - c.delay_percentage) * 0.20
        )
        results.append({
            "carrier_id": c.id,
            "carrier_name": c.name,
            "on_time_pct": c.on_time_percentage,
            "damage_pct": c.damage_percentage,
            "claim_pct": c.claim_percentage,
            "delay_pct": c.delay_percentage,
            "overall_score": round(score, 2),
        })
    return sorted(results, key=lambda x: x["overall_score"])


def duplicate_billing_analysis(db: Session, current_user):
    invoices = (
        _base_query(db, FreightInvoice, current_user)
        .options(joinedload(FreightInvoice.shipment))
        .all()
    )
    results = []
    seen = {}
    for inv in invoices:
        key = (inv.invoice_number, inv.total_amount)
        if key in seen:
            prev = seen[key]
            results.append({
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "shipment_number": inv.shipment.shipment_number if inv.shipment else "",
                "lr_number": inv.shipment.lr_number if inv.shipment else "",
                "amount": inv.total_amount,
                "match_reason": f"Duplicate invoice number: {inv.invoice_number}",
            })
        else:
            seen[key] = inv
    return results


def multimodal_cost_comparison(db: Session, current_user, shipment_id: Optional[int] = None):
    query = _base_query(db, FreightShipment, current_user).filter(
        FreightShipment.total_amount > 0,
        FreightShipment.actual_distance_km > 0
    )
    if shipment_id:
        query = query.filter(FreightShipment.id == shipment_id)

    shipments = query.all()
    modes = {}
    for s in shipments:
        cost_per_km = s.total_amount / s.actual_distance_km if s.actual_distance_km > 0 else 0
        cost_per_kg = s.total_amount / s.actual_weight_kg if s.actual_weight_kg > 0 else 0
        if s.mode not in modes:
            modes[s.mode] = {"count": 0, "total_cost": 0, "total_km": 0, "total_weight": 0}
        modes[s.mode]["count"] += 1
        modes[s.mode]["total_cost"] += s.total_amount
        modes[s.mode]["total_km"] += s.actual_distance_km
        modes[s.mode]["total_weight"] += s.actual_weight_kg

    results = []
    for mode, data in modes.items():
        results.append({
            "mode": mode,
            "shipment_count": data["count"],
            "total_cost": round(data["total_cost"], 2),
            "avg_cost_per_km": round(data["total_cost"] / data["total_km"], 2) if data["total_km"] > 0 else 0,
            "avg_cost_per_kg": round(data["total_cost"] / data["total_weight"], 2) if data["total_weight"] > 0 else 0,
        })
    return sorted(results, key=lambda x: x["avg_cost_per_km"])


def fuel_surcharge_validation(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.fuel_surcharge > 0, FreightShipment.freight_amount > 0)
        .all()
    )
    fuel_indices = _base_query(db, FuelIndex, current_user).all()
    fuel_map = {f.fuel_type: f for f in fuel_indices}

    results = []
    for s in shipments:
        base_surcharge_pct = (s.fuel_surcharge / s.freight_amount) * 100 if s.freight_amount > 0 else 0
        fi = fuel_map.get("Diesel")
        if fi and fi.base_price > 0:
            price_change = ((fi.current_price - fi.base_price) / fi.base_price) * 100
            expected_surcharge = s.freight_amount * (base_surcharge_pct / 100) * (1 + price_change / 100)
            variance = expected_surcharge - s.fuel_surcharge
            results.append({
                "shipment_id": s.id,
                "shipment_number": s.shipment_number,
                "expected_surcharge": round(expected_surcharge, 2),
                "billed_surcharge": round(s.fuel_surcharge, 2),
                "variance": round(variance, 2),
            })
    return results


def empty_return_analysis(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.total_amount > 0)
        .all()
    )
    total_trips = len(shipments)
    return_trips = sum(1 for s in shipments if s.status == "Return Trip" or s.total_amount < s.freight_amount * 0.3)
    utilization_pct = ((total_trips - return_trips) / total_trips * 100) if total_trips > 0 else 0

    return {
        "total_trips": total_trips,
        "return_trips": return_trips,
        "utilization_pct": round(utilization_pct, 2),
    }


def lr_pod_match_analysis(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .options(joinedload(FreightShipment.pod), joinedload(FreightShipment.invoices))
        .filter(FreightShipment.lr_number != "")
        .all()
    )
    results = []
    for s in shipments:
        has_pod = s.pod is not None and s.pod.is_delivered
        has_invoice = len(s.invoices) > 0
        invoice_numbers = ", ".join(i.invoice_number for i in s.invoices)

        mismatches = []
        if s.lr_number and not has_pod:
            mismatches.append("Missing POD")
        if s.lr_number and not has_invoice:
            mismatches.append("Missing Invoice")

        results.append({
            "shipment_id": s.id,
            "shipment_number": s.shipment_number,
            "lr_number": s.lr_number,
            "pod_number": s.pod.pod_number if s.pod else "",
            "invoice_number": invoice_numbers,
            "is_matched": len(mismatches) == 0,
            "mismatch_details": "; ".join(mismatches) if mismatches else "Matched",
        })
    return results


def freight_provision_accuracy(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.accrued_freight > 0, FreightShipment.total_amount > 0)
        .all()
    )
    results = []
    for s in shipments:
        variance = s.total_amount - s.accrued_freight
        variance_pct = (variance / s.accrued_freight * 100) if s.accrued_freight > 0 else 0
        results.append({
            "shipment_id": s.id,
            "shipment_number": s.shipment_number,
            "accrued_freight": s.accrued_freight,
            "actual_freight": s.total_amount,
            "variance": round(variance, 2),
            "variance_pct": round(variance_pct, 2),
        })
    return results


def transit_time_sla_analysis(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(
            FreightShipment.expected_delivery_date.isnot(None),
            FreightShipment.actual_delivery_date.isnot(None),
        )
        .all()
    )
    results = []
    breached_count = 0
    for s in shipments:
        delay_days = (s.actual_delivery_date - s.expected_delivery_date).days
        is_breached = delay_days > 0
        if is_breached:
            breached_count += 1
        results.append({
            "shipment_id": s.id,
            "shipment_number": s.shipment_number,
            "expected_delivery": s.expected_delivery_date.isoformat(),
            "actual_delivery": s.actual_delivery_date.isoformat() if s.actual_delivery_date else None,
            "delay_days": delay_days,
            "sla_breached": is_breached,
        })

    total = len(shipments)
    return {
        "results": results,
        "total_shipments": total,
        "breached_count": breached_count,
        "sla_compliance_pct": round(((total - breached_count) / total * 100), 2) if total > 0 else 100,
    }


def damage_shortage_claims(db: Session, current_user):
    claims = (
        _base_query(db, Claim, current_user)
        .all()
    )
    total_value = sum(c.claim_value for c in claims)
    total_recovered = sum(c.recovered_amount for c in claims)
    total_pending = sum(c.pending_amount for c in claims)
    total_rejected = sum(c.rejected_amount for c in claims)

    by_type = {}
    for c in claims:
        if c.claim_type not in by_type:
            by_type[c.claim_type] = {"count": 0, "value": 0, "recovered": 0}
        by_type[c.claim_type]["count"] += 1
        by_type[c.claim_type]["value"] += c.claim_value
        by_type[c.claim_type]["recovered"] += c.recovered_amount

    return {
        "total_claims": len(claims),
        "total_value": round(total_value, 2),
        "total_recovered": round(total_recovered, 2),
        "total_pending": round(total_pending, 2),
        "total_rejected": round(total_rejected, 2),
        "recovery_rate": round((total_recovered / total_value * 100), 2) if total_value > 0 else 0,
        "by_type": by_type,
    }


def vehicle_placement_efficiency(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(
            FreightShipment.indent_date.isnot(None),
            FreightShipment.vehicle_placement_date.isnot(None),
        )
        .all()
    )
    delays = []
    for s in shipments:
        delay = (s.vehicle_placement_date - s.indent_date).days
        delays.append({
            "shipment_id": s.id,
            "shipment_number": s.shipment_number,
            "indent_date": s.indent_date.isoformat(),
            "placement_date": s.vehicle_placement_date.isoformat(),
            "delay_days": max(0, delay),
        })

    avg_delay = sum(d["delay_days"] for d in delays) / len(delays) if delays else 0
    on_time = sum(1 for d in delays if d["delay_days"] <= 1)
    return {
        "results": delays,
        "total_shipments": len(delays),
        "avg_delay_days": round(avg_delay, 2),
        "on_time_placement": on_time,
        "on_time_pct": round((on_time / len(delays) * 100), 2) if delays else 0,
    }


def freight_cost_per_unit_trend(db: Session, current_user):
    shipments = (
        _base_query(db, FreightShipment, current_user)
        .filter(FreightShipment.total_amount > 0)
        .order_by(FreightShipment.shipment_date)
        .all()
    )
    monthly = {}
    for s in shipments:
        key = s.shipment_date.strftime("%Y-%m")
        if key not in monthly:
            monthly[key] = {"count": 0, "total_cost": 0, "total_weight": 0, "total_km": 0}
        monthly[key]["count"] += 1
        monthly[key]["total_cost"] += s.total_amount
        monthly[key]["total_weight"] += s.actual_weight_kg
        monthly[key]["total_km"] += s.actual_distance_km

    trends = []
    for month in sorted(monthly.keys()):
        d = monthly[month]
        trends.append({
            "period": month,
            "shipment_count": d["count"],
            "total_cost": round(d["total_cost"], 2),
            "cost_per_shipment": round(d["total_cost"] / d["count"], 2),
            "cost_per_ton": round(d["total_cost"] / (d["total_weight"] / 1000), 2) if d["total_weight"] > 0 else 0,
            "cost_per_km": round(d["total_cost"] / d["total_km"], 2) if d["total_km"] > 0 else 0,
        })
    return trends
