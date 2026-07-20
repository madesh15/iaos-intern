"""Business logic service layer for Vendor Master & Management analytics."""

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
    VendorBlacklist,
    VendorKYC,
    VendorRelationship,
)
from .utils import (
    normalise_account,
    normalise_email,
    normalise_gst,
    normalise_pan,
    normalise_phone,
    similarity_score,
    classify_risk_level,
    days_between,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# =========================================================================
# 1. Duplicate Vendors
# =========================================================================
def detect_duplicate_vendors(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results: list[dict] = []
    seen: set[tuple[int, int]] = set()

    for i, a in enumerate(vendors):
        for b in vendors[i + 1 :]:
            pair = tuple(sorted([a.id, b.id]))
            if pair in seen:
                continue

            reasons: list[str] = []
            total_score = 0.0

            if a.gst_number and b.gst_number and normalise_gst(a.gst_number) == normalise_gst(b.gst_number):
                reasons.append("Same GST")
                total_score += 1.0

            if a.pan_number and b.pan_number and normalise_pan(a.pan_number) == normalise_pan(b.pan_number):
                reasons.append("Same PAN")
                total_score += 1.0

            if a.phone and b.phone and normalise_phone(a.phone) == normalise_phone(b.phone):
                reasons.append("Same Phone")
                total_score += 0.6

            if a.email and b.email and normalise_email(a.email) == normalise_email(b.email):
                reasons.append("Same Email")
                total_score += 0.6

            if a.account_number and b.account_number and normalise_account(a.account_number) == normalise_account(b.account_number):
                reasons.append("Same Bank Account")
                total_score += 0.8

            name_score = similarity_score(a.vendor_name, b.vendor_name)
            if name_score >= 0.6:
                reasons.append(f"Name Similarity ({name_score:.0%})")
                total_score += name_score * 0.5

            if a.address and b.address:
                addr_score = similarity_score(a.address, b.address)
                if addr_score >= 0.7:
                    reasons.append(f"Address Similarity ({addr_score:.0%})")
                    total_score += addr_score * 0.3

            if reasons:
                seen.add(pair)
                final_score = min(total_score / 2.0, 1.0)
                results.append({
                    "vendor_a_id": a.id,
                    "vendor_a_code": a.vendor_code,
                    "vendor_a_name": a.vendor_name,
                    "vendor_b_id": b.id,
                    "vendor_b_code": b.vendor_code,
                    "vendor_b_name": b.vendor_name,
                    "duplicate_score": round(final_score, 2),
                    "reason": "; ".join(reasons),
                })

    results.sort(key=lambda x: x["duplicate_score"], reverse=True)
    return results


# =========================================================================
# 2. Bank Detail Change Log
# =========================================================================
def get_bank_change_log(db: Session, tenant_id: int) -> list[dict]:
    history = db.query(VendorBankHistory).filter(VendorBankHistory.tenant_id == tenant_id).order_by(VendorBankHistory.changed_date.desc()).all()
    results = []
    vendor_cache: dict[int, Vendor] = {}

    for h in history:
        if h.vendor_id not in vendor_cache:
            v = db.query(Vendor).filter(Vendor.id == h.vendor_id).first()
            vendor_cache[h.vendor_id] = v
        v = vendor_cache.get(h.vendor_id)
        results.append({
            "vendor_id": h.vendor_id,
            "vendor_name": v.vendor_name if v else "Unknown",
            "vendor_code": v.vendor_code if v else "N/A",
            "old_account": h.old_account_number,
            "new_account": h.new_account_number,
            "old_ifsc": h.old_ifsc,
            "new_ifsc": h.new_ifsc,
            "changed_by": h.changed_by,
            "changed_date": h.changed_date.isoformat() if h.changed_date else None,
            "approval_status": h.approval_status,
        })
    return results


# =========================================================================
# 3. KYC Validation
# =========================================================================
def validate_kyc(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results = []

    for v in vendors:
        kyc = db.query(VendorKYC).filter(VendorKYC.vendor_id == v.id).first()
        missing: list[str] = []

        if not v.gst_number:
            missing.append("GST Number")
        if not v.pan_number:
            missing.append("PAN Number")

        gst_ok = bool(kyc and kyc.gst_verified) if v.gst_number else False
        pan_ok = bool(kyc and kyc.pan_verified) if v.pan_number else False
        msme_ok = bool(kyc and kyc.msme_verified) if v.msme_status else False

        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "gst_number": v.gst_number,
            "pan_number": v.pan_number,
            "gst_verified": gst_ok,
            "pan_verified": pan_ok,
            "msme_verified": msme_ok,
            "kyc_status": kyc.kyc_status if kyc else "pending",
            "missing_fields": missing,
        })
    return results


# =========================================================================
# 4. Vendor Concentration
# =========================================================================
def calculate_concentration(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.status == "active").all()
    total_spend = sum(v.spend_amount or 0 for v in vendors)
    results = []

    for v in vendors:
        pct = ((v.spend_amount or 0) / total_spend * 100) if total_spend > 0 else 0
        level = "high" if pct >= 15 else "medium" if pct >= 8 else "low"
        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "spend_amount": v.spend_amount or 0,
            "percentage": round(pct, 2),
            "risk_level": level,
        })

    results.sort(key=lambda x: x["spend_amount"], reverse=True)
    return results


# =========================================================================
# 5. Active but No Transaction (Dormant)
# =========================================================================
def find_dormant_vendors(db: Session, tenant_id: int, days_threshold: int = 90) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.status == "active").all()
    now = _utcnow()
    results = []

    for v in vendors:
        lp = v.last_purchase_date
        lpay = v.last_payment_date
        ref_date = lp or lpay
        idle = days_between(ref_date, now) if ref_date else 9999

        if idle >= days_threshold:
            results.append({
                "vendor_id": v.id,
                "vendor_name": v.vendor_name,
                "vendor_code": v.vendor_code,
                "status": v.status,
                "last_purchase_date": lp.isoformat() if lp else None,
                "last_payment_date": lpay.isoformat() if lpay else None,
                "idle_days": idle,
            })

    results.sort(key=lambda x: x["idle_days"], reverse=True)
    return results


# =========================================================================
# 6. Vendor-Employee Overlap
# =========================================================================
def detect_employee_overlap(db: Session, tenant_id: int, employees: Optional[list[dict]] = None) -> list[dict]:
    """Compare vendor data against employee records for fraud detection.

    employees: list of dicts with keys pan, phone, email, address, bank_account, email
    In a real system this would query the HR/Employee module.
    """
    if not employees:
        return []

    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results = []

    for v in vendors:
        for emp in employees:
            matches: list[str] = []

            if v.pan_number and emp.get("pan") and normalise_pan(v.pan_number) == normalise_pan(emp["pan"]):
                matches.append("PAN")
            if v.phone and emp.get("phone") and normalise_phone(v.phone) == normalise_phone(emp["phone"]):
                matches.append("Phone")
            if v.email and emp.get("email") and normalise_email(v.email) == normalise_email(emp["email"]):
                matches.append("Email")
            if v.address and emp.get("address") and similarity_score(v.address, emp["address"]) >= 0.8:
                matches.append("Address")
            if v.account_number and emp.get("bank_account") and normalise_account(v.account_number) == normalise_account(emp["bank_account"]):
                matches.append("Bank Account")

            if matches:
                score = len(matches) / 5.0
                results.append({
                    "vendor_id": v.id,
                    "vendor_name": v.vendor_name,
                    "vendor_code": v.vendor_code,
                    "match_type": ", ".join(matches),
                    "match_value": f"Employee: {emp.get('name', 'Unknown')}",
                    "risk_score": round(score, 2),
                })

    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results


# =========================================================================
# 7. Blacklist Screening
# =========================================================================
def screen_blacklist(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    blacklist = db.query(VendorBlacklist).filter(VendorBlacklist.tenant_id == tenant_id).all()
    results = []

    for v in vendors:
        for bl in blacklist:
            matched_field = ""
            matched_value = ""

            if bl.pan_number and v.pan_number and normalise_pan(bl.pan_number) == normalise_pan(v.pan_number):
                matched_field = "PAN"
                matched_value = v.pan_number
            elif bl.gst_number and v.gst_number and normalise_gst(bl.gst_number) == normalise_gst(v.gst_number):
                matched_field = "GST"
                matched_value = v.gst_number
            elif bl.vendor_name and v.vendor_name and similarity_score(bl.vendor_name, v.vendor_name) >= 0.8:
                matched_field = "Name"
                matched_value = v.vendor_name

            if matched_field:
                results.append({
                    "vendor_id": v.id,
                    "vendor_name": v.vendor_name,
                    "vendor_code": v.vendor_code,
                    "matched_field": matched_field,
                    "matched_value": matched_value,
                    "blacklist_source": bl.source,
                    "reason": bl.reason,
                })
    return results


# =========================================================================
# 8. Duplicate Bank Accounts
# =========================================================================
def find_duplicate_bank_accounts(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.account_number.isnot(None), Vendor.account_number != "").all()

    account_map: dict[str, list[Vendor]] = {}
    for v in vendors:
        key = normalise_account(v.account_number) or ""
        if key:
            account_map.setdefault(key, []).append(v)

    results = []
    for acct, vlist in account_map.items():
        if len(vlist) > 1:
            results.append({
                "account_number": acct,
                "ifsc": vlist[0].ifsc,
                "bank_name": vlist[0].bank_name,
                "vendors": [{"id": v.id, "name": v.vendor_name, "code": v.vendor_code} for v in vlist],
            })
    return results


# =========================================================================
# 9. Master Field Completeness
# =========================================================================
def assess_completeness(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    fields = ["gst_number", "pan_number", "msme_status", "address", "phone", "email", "bank_name", "account_number", "ifsc", "city", "state", "country"]
    results = []

    for v in vendors:
        missing: list[str] = []
        filled = 0
        for f in fields:
            val = getattr(v, f, None)
            if val:
                filled += 1
            else:
                label = f.replace("_", " ").title()
                missing.append(label)
        pct = round(filled / len(fields) * 100, 1)
        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "total_fields": len(fields),
            "filled_fields": filled,
            "completeness_pct": pct,
            "missing_fields": missing,
        })

    results.sort(key=lambda x: x["completeness_pct"])
    return results


# =========================================================================
# 10. Approval Workflow Audit
# =========================================================================
def audit_approval_workflow(db: Session, tenant_id: int) -> list[dict]:
    approvals = db.query(VendorApproval).filter(VendorApproval.tenant_id == tenant_id).all()
    results = []
    vendor_cache: dict[int, Vendor] = {}

    for a in approvals:
        if a.vendor_id not in vendor_cache:
            vendor_cache[a.vendor_id] = db.query(Vendor).filter(Vendor.id == a.vendor_id).first()
        v = vendor_cache.get(a.vendor_id)
        results.append({
            "vendor_id": a.vendor_id,
            "vendor_name": v.vendor_name if v else "Unknown",
            "vendor_code": v.vendor_code if v else "N/A",
            "action_type": a.action_type,
            "maker": a.maker,
            "maker_date": a.maker_date.isoformat() if a.maker_date else None,
            "checker": a.checker,
            "checker_date": a.checker_date.isoformat() if a.checker_date else None,
            "status": a.status,
            "remarks": a.remarks,
        })
    return results


# =========================================================================
# 11. Vendor Categorisation
# =========================================================================
def validate_categorisation(db: Session, tenant_id: int) -> list[dict]:
    valid_types = {"domestic", "foreign", "msme", "contractor", "material_supplier", "service_provider"}
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results = []

    for v in vendors:
        is_valid = v.vendor_type in valid_types
        issue = None if is_valid else f"Unknown type '{v.vendor_type}'"
        if v.vendor_type == "msme" and not v.msme_status:
            issue = "MSME type but no MSME status set"
            is_valid = False
        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "vendor_type": v.vendor_type,
            "is_valid": is_valid,
            "issue": issue,
        })
    return results


# =========================================================================
# 12. MSME Validation
# =========================================================================
def validate_msme(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.msme_status.isnot(None)).all()
    now = _utcnow()
    results = []

    for v in vendors:
        issue = None
        is_valid = True
        if not v.msme_reg_number:
            issue = "Missing MSME Registration Number"
            is_valid = False
        elif v.msme_expiry and v.msme_expiry < now.date():
            issue = "MSME Certificate Expired"
            is_valid = False

        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "msme_status": v.msme_status,
            "msme_reg_number": v.msme_reg_number,
            "msme_expiry": v.msme_expiry.isoformat() if v.msme_expiry else None,
            "is_valid": is_valid,
            "issue": issue,
        })
    return results


# =========================================================================
# 13. Change Frequency Analytics
# =========================================================================
def analyse_change_frequency(db: Session, tenant_id: int, threshold: int = 5) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results = []

    for v in vendors:
        count = v.change_count or 0
        if count > 0:
            level = "critical" if count >= threshold * 2 else "high" if count >= threshold else "medium" if count >= threshold // 2 else "low"
            results.append({
                "vendor_id": v.id,
                "vendor_name": v.vendor_name,
                "vendor_code": v.vendor_code,
                "change_count": count,
                "risk_level": level,
            })

    results.sort(key=lambda x: x["change_count"], reverse=True)
    return results


# =========================================================================
# 14. Related Party Vendors
# =========================================================================
def find_related_parties(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id).all()
    results: list[dict] = []
    seen: set[tuple[int, int]] = set()

    for i, a in enumerate(vendors):
        for b in vendors[i + 1 :]:
            pair = tuple(sorted([a.id, b.id]))
            if pair in seen:
                continue

            shared_fields: list[str] = []
            shared_values: list[str] = []

            if a.pan_number and b.pan_number and normalise_pan(a.pan_number) == normalise_pan(b.pan_number):
                shared_fields.append("PAN")
                shared_values.append(a.pan_number)

            if a.address and b.address and similarity_score(a.address, b.address) >= 0.8:
                shared_fields.append("Address")
                shared_values.append(a.address[:50])

            if a.phone and b.phone and normalise_phone(a.phone) == normalise_phone(b.phone):
                shared_fields.append("Phone")
                shared_values.append(a.phone)

            if a.email and b.email and normalise_email(a.email) == normalise_email(b.email):
                shared_fields.append("Email")
                shared_values.append(a.email)

            if a.account_number and b.account_number and normalise_account(a.account_number) == normalise_account(b.account_number):
                shared_fields.append("Bank Account")
                shared_values.append(a.account_number)

            if shared_fields:
                seen.add(pair)
                score = len(shared_fields) / 5.0
                results.append({
                    "vendor_id": a.id,
                    "vendor_name": a.vendor_name,
                    "vendor_code": a.vendor_code,
                    "related_vendor_id": b.id,
                    "related_vendor_name": b.vendor_name,
                    "relationship_type": "shared_" + "_".join(f.lower() for f in shared_fields),
                    "shared_field": ", ".join(shared_fields),
                    "risk_score": round(score, 2),
                })

    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results


# =========================================================================
# 15. Vendor Deactivation
# =========================================================================
def assess_deactivation(db: Session, tenant_id: int) -> list[dict]:
    vendors = db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.status.in_(["inactive", "suspended", "blocked"])).all()
    results = []

    for v in vendors:
        issues: list[str] = []
        if (v.open_po_count or 0) > 0:
            issues.append(f"{v.open_po_count} open Purchase Order(s)")
        if (v.open_invoice_count or 0) > 0:
            issues.append(f"{v.open_invoice_count} open Invoice(s)")
        if v.status == "blocked":
            issues.append("Vendor is blocked")

        results.append({
            "vendor_id": v.id,
            "vendor_name": v.vendor_name,
            "vendor_code": v.vendor_code,
            "status": v.status,
            "open_po_count": v.open_po_count or 0,
            "open_invoice_count": v.open_invoice_count or 0,
            "has_blockers": len(issues) > 0,
            "issues": issues,
        })
    return results
