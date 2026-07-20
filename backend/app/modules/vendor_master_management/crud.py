"""CRUD operations for the Vendor Master & Management module."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.tenancy import tenant_scoped

from .models import (
    Vendor,
    VendorApproval,
    VendorAuditLog,
    VendorBankHistory,
    VendorBlacklist,
    VendorKYC,
    VendorRelationship,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Vendor CRUD
# ---------------------------------------------------------------------------
def list_vendors(db: Session, tenant_id: int) -> Sequence[Vendor]:
    return db.query(Vendor).filter(Vendor.tenant_id == tenant_id).order_by(Vendor.id.desc()).all()


def get_vendor(db: Session, tenant_id: int, vendor_id: int) -> Optional[Vendor]:
    return db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.id == vendor_id).first()


def get_vendor_by_code(db: Session, tenant_id: int, vendor_code: str) -> Optional[Vendor]:
    return db.query(Vendor).filter(Vendor.tenant_id == tenant_id, Vendor.vendor_code == vendor_code).first()


def create_vendor(db: Session, tenant_id: int, data: dict, user_email: str = "") -> Vendor:
    vendor = Vendor(tenant_id=tenant_id, created_by=user_email, modified_by=user_email, **data)
    db.add(vendor)
    db.flush()

    kyc = VendorKYC(tenant_id=tenant_id, vendor_id=vendor.id)
    db.add(kyc)

    log = VendorAuditLog(
        tenant_id=tenant_id,
        vendor_id=vendor.id,
        action="create",
        new_value=vendor.vendor_name,
        performed_by=user_email,
    )
    db.add(log)
    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor(db: Session, tenant_id: int, vendor_id: int, data: dict, user_email: str = "") -> Optional[Vendor]:
    vendor = get_vendor(db, tenant_id, vendor_id)
    if not vendor:
        return None
    for field, value in data.items():
        old_val = getattr(vendor, field, None)
        if old_val != value:
            setattr(vendor, field, value)
            log = VendorAuditLog(
                tenant_id=tenant_id,
                vendor_id=vendor_id,
                action="update",
                field_name=field,
                old_value=str(old_val) if old_val is not None else None,
                new_value=str(value) if value is not None else None,
                performed_by=user_email,
            )
            db.add(log)
    vendor.modified_by = user_email
    vendor.change_count = (vendor.change_count or 0) + 1
    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, tenant_id: int, vendor_id: int) -> bool:
    vendor = get_vendor(db, tenant_id, vendor_id)
    if not vendor:
        return False
    db.delete(vendor)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Bank History CRUD
# ---------------------------------------------------------------------------
def list_bank_history(db: Session, tenant_id: int, vendor_id: Optional[int] = None) -> Sequence[VendorBankHistory]:
    q = db.query(VendorBankHistory).filter(VendorBankHistory.tenant_id == tenant_id)
    if vendor_id is not None:
        q = q.filter(VendorBankHistory.vendor_id == vendor_id)
    return q.order_by(VendorBankHistory.changed_date.desc()).all()


def create_bank_history(db: Session, tenant_id: int, data: dict) -> VendorBankHistory:
    entry = VendorBankHistory(tenant_id=tenant_id, **data)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ---------------------------------------------------------------------------
# KYC CRUD
# ---------------------------------------------------------------------------
def get_kyc(db: Session, tenant_id: int, vendor_id: int) -> Optional[VendorKYC]:
    return db.query(VendorKYC).filter(VendorKYC.tenant_id == tenant_id, VendorKYC.vendor_id == vendor_id).first()


def list_kyc_all(db: Session, tenant_id: int) -> Sequence[VendorKYC]:
    return db.query(VendorKYC).filter(VendorKYC.tenant_id == tenant_id).all()


def update_kyc(db: Session, tenant_id: int, vendor_id: int, data: dict) -> Optional[VendorKYC]:
    kyc = get_kyc(db, tenant_id, vendor_id)
    if not kyc:
        return None
    for field, value in data.items():
        setattr(kyc, field, value)
    kyc.verification_date = _utcnow()
    db.commit()
    db.refresh(kyc)
    return kyc


# ---------------------------------------------------------------------------
# Audit Log CRUD
# ---------------------------------------------------------------------------
def list_audit_logs(db: Session, tenant_id: int, vendor_id: Optional[int] = None) -> Sequence[VendorAuditLog]:
    q = db.query(VendorAuditLog).filter(VendorAuditLog.tenant_id == tenant_id)
    if vendor_id is not None:
        q = q.filter(VendorAuditLog.vendor_id == vendor_id)
    return q.order_by(VendorAuditLog.performed_at.desc()).all()


# ---------------------------------------------------------------------------
# Blacklist CRUD
# ---------------------------------------------------------------------------
def list_blacklist(db: Session, tenant_id: int) -> Sequence[VendorBlacklist]:
    return db.query(VendorBlacklist).filter(VendorBlacklist.tenant_id == tenant_id).all()


def create_blacklist(db: Session, tenant_id: int, data: dict) -> VendorBlacklist:
    entry = VendorBlacklist(tenant_id=tenant_id, **data)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_blacklist(db: Session, tenant_id: int, entry_id: int) -> bool:
    entry = db.query(VendorBlacklist).filter(VendorBlacklist.tenant_id == tenant_id, VendorBlacklist.id == entry_id).first()
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Approval CRUD
# ---------------------------------------------------------------------------
def list_approvals(db: Session, tenant_id: int, vendor_id: Optional[int] = None) -> Sequence[VendorApproval]:
    q = db.query(VendorApproval).filter(VendorApproval.tenant_id == tenant_id)
    if vendor_id is not None:
        q = q.filter(VendorApproval.vendor_id == vendor_id)
    return q.order_by(VendorApproval.id.desc()).all()


def create_approval(db: Session, tenant_id: int, data: dict) -> VendorApproval:
    approval = VendorApproval(tenant_id=tenant_id, maker_date=_utcnow(), **data)
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


def update_approval(db: Session, tenant_id: int, approval_id: int, data: dict) -> Optional[VendorApproval]:
    approval = db.query(VendorApproval).filter(VendorApproval.tenant_id == tenant_id, VendorApproval.id == approval_id).first()
    if not approval:
        return None
    for field, value in data.items():
        setattr(approval, field, value)
    if data.get("status") in ("approved", "rejected"):
        approval.checker_date = _utcnow()
    db.commit()
    db.refresh(approval)
    return approval


# ---------------------------------------------------------------------------
# Relationship CRUD
# ---------------------------------------------------------------------------
def list_relationships(db: Session, tenant_id: int) -> Sequence[VendorRelationship]:
    return db.query(VendorRelationship).filter(VendorRelationship.tenant_id == tenant_id).all()


def create_relationship(db: Session, tenant_id: int, data: dict) -> VendorRelationship:
    rel = VendorRelationship(tenant_id=tenant_id, **data)
    db.add(rel)
    db.commit()
    db.refresh(rel)
    return rel


def delete_relationship(db: Session, tenant_id: int, rel_id: int) -> bool:
    rel = db.query(VendorRelationship).filter(VendorRelationship.tenant_id == tenant_id, VendorRelationship.id == rel_id).first()
    if not rel:
        return False
    db.delete(rel)
    db.commit()
    return True
