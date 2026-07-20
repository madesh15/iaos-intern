"""API router for the Vendor Master & Management module."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import crud
from .dashboard import get_dashboard_data
from .schemas import (
    ApprovalCreate,
    ApprovalOut,
    ApprovalUpdate,
    AuditLogOut,
    BankHistoryCreate,
    BankHistoryOut,
    BlacklistCreate,
    BlacklistOut,
    DashboardOut,
    KYCCreate,
    KYCOut,
    KYCUpdate,
    RelationshipCreate,
    RelationshipOut,
    VendorCreate,
    VendorOut,
    VendorUpdate,
)
from . import service

router = APIRouter()

MANIFEST = {
    "title": "Vendor Master & Management",
    "description": "Governs vendor master data and identifies audit risks including duplicates, ghost vendors, KYC gaps, concentration risk, and more.",
    "icon": "cart",
    "version": "1.0.0",
    "owner": "IAOS Platform",
}


# =========================================================================
# Dashboard
# =========================================================================
@router.get("/dashboard", response_model=DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession):
    return get_dashboard_data(db, current_user.tenant_id)


# =========================================================================
# Vendor CRUD
# =========================================================================
@router.get("/list", response_model=list[VendorOut])
def list_vendors(current_user: CurrentUser, db: DbSession):
    vendors = crud.list_vendors(db, current_user.tenant_id)
    return [VendorOut.model_validate(v) for v in vendors]


@router.post("/create", response_model=VendorOut, status_code=201)
def create_vendor(payload: VendorCreate, current_user: CurrentUser, db: DbSession):
    existing = crud.get_vendor_by_code(db, current_user.tenant_id, payload.vendor_code)
    if existing:
        raise HTTPException(status_code=409, detail=f"Vendor code '{payload.vendor_code}' already exists")
    vendor = crud.create_vendor(db, current_user.tenant_id, payload.model_dump(), current_user.email)
    return VendorOut.model_validate(vendor)


@router.put("/update/{vendor_id}", response_model=VendorOut)
def update_vendor(vendor_id: int, payload: VendorUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    vendor = crud.update_vendor(db, current_user.tenant_id, vendor_id, data, current_user.email)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorOut.model_validate(vendor)


@router.delete("/delete/{vendor_id}")
def delete_vendor(vendor_id: int, current_user: CurrentUser, db: DbSession):
    ok = crud.delete_vendor(db, current_user.tenant_id, vendor_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"ok": True}


# =========================================================================
# Signature Analytics (15 endpoints)
# =========================================================================
@router.get("/duplicate")
def duplicate_vendors(current_user: CurrentUser, db: DbSession):
    return service.detect_duplicate_vendors(db, current_user.tenant_id)


@router.get("/bank-changes")
def bank_changes(current_user: CurrentUser, db: DbSession):
    return service.get_bank_change_log(db, current_user.tenant_id)


@router.get("/kyc")
def kyc_validation(current_user: CurrentUser, db: DbSession):
    return service.validate_kyc(db, current_user.tenant_id)


@router.get("/concentration")
def concentration(current_user: CurrentUser, db: DbSession):
    return service.calculate_concentration(db, current_user.tenant_id)


@router.get("/no-transactions")
def no_transactions(current_user: CurrentUser, db: DbSession, days: int = Query(90, ge=1)):
    return service.find_dormant_vendors(db, current_user.tenant_id, days)


@router.get("/employee-overlap")
def employee_overlap(current_user: CurrentUser, db: DbSession):
    return service.detect_employee_overlap(db, current_user.tenant_id)


@router.get("/blacklist")
def blacklist_screening(current_user: CurrentUser, db: DbSession):
    return service.screen_blacklist(db, current_user.tenant_id)


@router.get("/duplicate-bank")
def duplicate_bank(current_user: CurrentUser, db: DbSession):
    return service.find_duplicate_bank_accounts(db, current_user.tenant_id)


@router.get("/completeness")
def completeness(current_user: CurrentUser, db: DbSession):
    return service.assess_completeness(db, current_user.tenant_id)


@router.get("/approval")
def approval_audit(current_user: CurrentUser, db: DbSession):
    return service.audit_approval_workflow(db, current_user.tenant_id)


@router.get("/category")
def category_validation(current_user: CurrentUser, db: DbSession):
    return service.validate_categorisation(db, current_user.tenant_id)


@router.get("/msme")
def msme_validation(current_user: CurrentUser, db: DbSession):
    return service.validate_msme(db, current_user.tenant_id)


@router.get("/change-frequency")
def change_frequency(current_user: CurrentUser, db: DbSession):
    return service.analyse_change_frequency(db, current_user.tenant_id)


@router.get("/related-party")
def related_party(current_user: CurrentUser, db: DbSession):
    return service.find_related_parties(db, current_user.tenant_id)


@router.get("/deactivation")
def deactivation(current_user: CurrentUser, db: DbSession):
    return service.assess_deactivation(db, current_user.tenant_id)


# =========================================================================
# Bank History CRUD
# =========================================================================
@router.get("/bank-history", response_model=list[BankHistoryOut])
def list_bank_history(current_user: CurrentUser, db: DbSession, vendor_id: Optional[int] = None):
    items = crud.list_bank_history(db, current_user.tenant_id, vendor_id)
    return [BankHistoryOut.model_validate(h) for h in items]


@router.post("/bank-history", response_model=BankHistoryOut, status_code=201)
def create_bank_history_entry(payload: BankHistoryCreate, current_user: CurrentUser, db: DbSession):
    entry = crud.create_bank_history(db, current_user.tenant_id, payload.model_dump())
    return BankHistoryOut.model_validate(entry)


# =========================================================================
# KYC CRUD
# =========================================================================
@router.get("/kyc-list", response_model=list[KYCOut])
def list_kyc(current_user: CurrentUser, db: DbSession):
    items = crud.list_kyc_all(db, current_user.tenant_id)
    return [KYCOut.model_validate(k) for k in items]


@router.put("/kyc/{vendor_id}", response_model=KYCOut)
def update_kyc_entry(vendor_id: int, payload: KYCUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    kyc = crud.update_kyc(db, current_user.tenant_id, vendor_id, data)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC record not found")
    return KYCOut.model_validate(kyc)


# =========================================================================
# Audit Logs
# =========================================================================
@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(current_user: CurrentUser, db: DbSession, vendor_id: Optional[int] = None):
    items = crud.list_audit_logs(db, current_user.tenant_id, vendor_id)
    return [AuditLogOut.model_validate(l) for l in items]


# =========================================================================
# Blacklist CRUD
# =========================================================================
@router.get("/blacklist-list", response_model=list[BlacklistOut])
def list_blacklist_entries(current_user: CurrentUser, db: DbSession):
    items = crud.list_blacklist(db, current_user.tenant_id)
    return [BlacklistOut.model_validate(b) for b in items]


@router.post("/blacklist", response_model=BlacklistOut, status_code=201)
def add_to_blacklist(payload: BlacklistCreate, current_user: CurrentUser, db: DbSession):
    entry = crud.create_blacklist(db, current_user.tenant_id, payload.model_dump())
    return BlacklistOut.model_validate(entry)


@router.delete("/blacklist/{entry_id}")
def remove_from_blacklist(entry_id: int, current_user: CurrentUser, db: DbSession):
    ok = crud.delete_blacklist(db, current_user.tenant_id, entry_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
    return {"ok": True}


# =========================================================================
# Approval CRUD
# =========================================================================
@router.get("/approvals", response_model=list[ApprovalOut])
def list_approvals(current_user: CurrentUser, db: DbSession, vendor_id: Optional[int] = None):
    items = crud.list_approvals(db, current_user.tenant_id, vendor_id)
    return [ApprovalOut.model_validate(a) for a in items]


@router.post("/approvals", response_model=ApprovalOut, status_code=201)
def create_approval(payload: ApprovalCreate, current_user: CurrentUser, db: DbSession):
    entry = crud.create_approval(db, current_user.tenant_id, payload.model_dump())
    return ApprovalOut.model_validate(entry)


@router.put("/approvals/{approval_id}", response_model=ApprovalOut)
def update_approval_entry(approval_id: int, payload: ApprovalUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    entry = crud.update_approval(db, current_user.tenant_id, approval_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Approval not found")
    return ApprovalOut.model_validate(entry)


# =========================================================================
# Relationship CRUD
# =========================================================================
@router.get("/relationships", response_model=list[RelationshipOut])
def list_relationships(current_user: CurrentUser, db: DbSession):
    items = crud.list_relationships(db, current_user.tenant_id)
    return [RelationshipOut.model_validate(r) for r in items]


@router.post("/relationships", response_model=RelationshipOut, status_code=201)
def create_relationship(payload: RelationshipCreate, current_user: CurrentUser, db: DbSession):
    entry = crud.create_relationship(db, current_user.tenant_id, payload.model_dump())
    return RelationshipOut.model_validate(entry)


@router.delete("/relationships/{rel_id}")
def delete_relationship(rel_id: int, current_user: CurrentUser, db: DbSession):
    ok = crud.delete_relationship(db, current_user.tenant_id, rel_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"ok": True}
