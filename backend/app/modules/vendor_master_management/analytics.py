"""Analytics aggregation layer for Vendor Master & Management."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import (
    Vendor,
    VendorApproval,
    VendorAuditLog,
    VendorBankHistory,
    VendorKYC,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def compute_dashboard(db: Session, tenant_id: int) -> dict:
    """Compute all dashboard KPIs and chart data."""
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    total = len(vendors)
    active = sum(1 for v in vendors if v.status == "active")
    dormant = sum(1 for v in vendors if v.status == "dormant")
    missing_gst = sum(1 for v in vendors if not v.gst_number)
    missing_pan = sum(1 for v in vendors if not v.pan_number)

    # KYC pending
    kyc_pending = 0
    for v in vendors:
        kyc = db.query(VendorKYC).filter(VendorKYC.vendor_id == v.id).first()
        if not kyc or kyc.kyc_status == "pending":
            kyc_pending += 1

    # Duplicate bank accounts
    from .utils import normalise_account
    acct_map: dict[str, list] = {}
    for v in vendors:
        key = normalise_account(v.account_number) if v.account_number else ""
        if key:
            acct_map.setdefault(key, []).append(v)
    dup_bank = sum(1 for vs in acct_map.values() if len(vs) > 1)

    # Duplicate vendors (simplified)
    dup_vendors = 0
    pan_map: dict[str, list] = {}
    gst_map: dict[str, list] = {}
    for v in vendors:
        if v.pan_number:
            pan_map.setdefault(v.pan_number.upper().strip(), []).append(v)
        if v.gst_number:
            gst_map.setdefault(v.gst_number.upper().strip(), []).append(v)
    seen_ids: set[int] = set()
    for group in list(pan_map.values()) + list(gst_map.values()):
        ids = [v.id for v in group if len(group) > 1]
        new_ids = set(ids) - seen_ids
        if len(new_ids) > 1:
            dup_vendors += 1
        seen_ids.update(new_ids)

    # High risk vendors (those with 3+ issues)
    high_risk = 0
    for v in vendors:
        issues = 0
        if not v.gst_number:
            issues += 1
        if not v.pan_number:
            issues += 1
        if v.change_count and v.change_count >= 5:
            issues += 1
        kyc = db.query(VendorKYC).filter(VendorKYC.vendor_id == v.id).first()
        if not kyc or kyc.kyc_status != "verified":
            issues += 1
        if issues >= 3:
            high_risk += 1

    # Vendor concentration (top vendor % of total spend)
    total_spend = sum(v.spend_amount or 0 for v in vendors)
    max_spend = max((v.spend_amount or 0 for v in vendors), default=0)
    concentration = round((max_spend / total_spend * 100) if total_spend > 0 else 0, 1)

    # Open findings (pending approvals + audit logs)
    open_findings = db.query(VendorApproval).filter(VendorApproval.tenant_id == tenant_id, VendorApproval.status == "pending").count()
    capa_pending = db.query(VendorApproval).filter(VendorApproval.tenant_id == tenant_id, VendorApproval.status.in_(["pending", "rejected"])).count()

    # --- Chart data ---

    # Vendor status distribution
    status_map: dict[str, int] = {}
    for v in vendors:
        status_map[v.status] = status_map.get(v.status, 0) + 1
    vendor_status = [{"status": k, "count": c} for k, c in status_map.items()]

    # Vendor category distribution
    cat_map: dict[str, int] = {}
    for v in vendors:
        cat_map[v.vendor_type] = cat_map.get(v.vendor_type, 0) + 1
    vendor_category = [{"category": k, "count": c} for k, c in cat_map.items()]

    # Risk distribution
    risk_map: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for v in vendors:
        issues = 0
        if not v.gst_number:
            issues += 1
        if not v.pan_number:
            issues += 1
        if v.change_count and v.change_count >= 5:
            issues += 1
        level = "critical" if issues >= 3 else "high" if issues >= 2 else "medium" if issues >= 1 else "low"
        risk_map[level] += 1
    risk_distribution = [{"level": k, "count": c} for k, c in risk_map.items()]

    # Monthly creation trend (last 12 months)
    now = _utcnow()
    monthly: dict[str, int] = {}
    for i in range(12):
        d = now - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        monthly[key] = 0
    for v in vendors:
        if v.created_at:
            key = v.created_at.strftime("%Y-%m")
            if key in monthly:
                monthly[key] += 1
    monthly_creation = [{"month": k, "count": c} for k, c in sorted(monthly.items())]

    # Bank change trend
    bank_changes = db.query(VendorBankHistory).filter(VendorBankHistory.tenant_id == tenant_id).all()
    bc_monthly: dict[str, int] = {}
    for i in range(12):
        d = now - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        bc_monthly[key] = 0
    for bc in bank_changes:
        if bc.changed_date:
            key = bc.changed_date.strftime("%Y-%m")
            if key in bc_monthly:
                bc_monthly[key] += 1
    bank_change_trend = [{"month": k, "count": c} for k, c in sorted(bc_monthly.items())]

    # Top vendors by spend
    sorted_vendors = sorted(vendors, key=lambda v: v.spend_amount or 0, reverse=True)[:10]
    top_vendors = [{"vendor_name": v.vendor_name, "spend_amount": v.spend_amount or 0} for v in sorted_vendors]

    # Exception trend (audit logs per month)
    logs = db.query(VendorAuditLog).filter(VendorAuditLog.tenant_id == tenant_id).all()
    exc_monthly: dict[str, int] = {}
    for i in range(12):
        d = now - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        exc_monthly[key] = 0
    for log in logs:
        if log.performed_at:
            key = log.performed_at.strftime("%Y-%m")
            if key in exc_monthly:
                exc_monthly[key] += 1
    exception_trend = [{"month": k, "count": c} for k, c in sorted(exc_monthly.items())]

    return {
        "stats": {
            "total_vendors": total,
            "active_vendors": active,
            "dormant_vendors": dormant,
            "duplicate_vendors": dup_vendors,
            "missing_gst": missing_gst,
            "missing_pan": missing_pan,
            "pending_kyc": kyc_pending,
            "duplicate_bank_accounts": dup_bank,
            "high_risk_vendors": high_risk,
            "vendor_concentration_pct": concentration,
            "open_findings": open_findings,
            "capa_pending": capa_pending,
        },
        "vendor_status": vendor_status,
        "vendor_category": vendor_category,
        "risk_distribution": risk_distribution,
        "monthly_creation": monthly_creation,
        "bank_change_trend": bank_change_trend,
        "top_vendors_by_spend": top_vendors,
        "exception_trend": exception_trend,
    }
