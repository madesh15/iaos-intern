from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import TradeScheme, TradeClaim, PromoSpend, OutletAudit
from .schemas import (
    TradeSchemeCreate, TradeSchemeOut,
    TradeClaimCreate, TradeClaimOut,
    PromoSpendCreate, PromoSpendOut,
    OutletAuditCreate, OutletAuditOut,
)

MANIFEST = {
    "name": "trade_scheme_promotion_audit",
    "title": "Trade Scheme & Promotion Audit",
    "description": "Assurance over trade-spend and promotions — a top leakage area — validating scheme design, claim settlement and ROI across channels.",
    "icon": "cart",
    "group": "Industry Packs",
    "industry": "Retail / FMCG",
    "version": "1.0.0",
    "owner": "intern-72",
}

router = APIRouter()


# ── TradeScheme Endpoints ─────────────────────────────────────────
@router.get("/schemes", response_model=list[TradeSchemeOut])
def list_schemes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(TradeScheme), current_user)
    return [TradeSchemeOut.model_validate(s) for s in q.order_by(TradeScheme.id.desc()).all()]


@router.post("/schemes", response_model=TradeSchemeOut, status_code=201)
def create_scheme(body: TradeSchemeCreate, current_user: CurrentUser, db: DbSession):
    record = TradeScheme(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return TradeSchemeOut.model_validate(record)


@router.delete("/schemes/{record_id}", status_code=204)
def delete_scheme(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(TradeScheme).filter(TradeScheme.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Trade scheme not found")
    db.delete(record)
    db.commit()


# ── TradeClaim Endpoints ──────────────────────────────────────────
@router.get("/claims", response_model=list[TradeClaimOut])
def list_claims(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(TradeClaim), current_user)
    return [TradeClaimOut.model_validate(c) for c in q.order_by(TradeClaim.id.desc()).all()]


@router.post("/claims", response_model=TradeClaimOut, status_code=201)
def create_claim(body: TradeClaimCreate, current_user: CurrentUser, db: DbSession):
    record = TradeClaim(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return TradeClaimOut.model_validate(record)


@router.delete("/claims/{record_id}", status_code=204)
def delete_claim(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(TradeClaim).filter(TradeClaim.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Trade claim not found")
    db.delete(record)
    db.commit()


# ── PromoSpend Endpoints ──────────────────────────────────────────
@router.get("/spend", response_model=list[PromoSpendOut])
def list_spend(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(PromoSpend), current_user)
    return [PromoSpendOut.model_validate(s) for s in q.order_by(PromoSpend.id.desc()).all()]


@router.post("/spend", response_model=PromoSpendOut, status_code=201)
def create_spend(body: PromoSpendCreate, current_user: CurrentUser, db: DbSession):
    record = PromoSpend(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return PromoSpendOut.model_validate(record)


@router.delete("/spend/{record_id}", status_code=204)
def delete_spend(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(PromoSpend).filter(PromoSpend.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Promo spend record not found")
    db.delete(record)
    db.commit()


# ── OutletAudit Endpoints ─────────────────────────────────────────
@router.get("/outlets", response_model=list[OutletAuditOut])
def list_outlets(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(OutletAudit), current_user)
    return [OutletAuditOut.model_validate(o) for o in q.order_by(OutletAudit.id.desc()).all()]


@router.post("/outlets", response_model=OutletAuditOut, status_code=201)
def create_outlet(body: OutletAuditCreate, current_user: CurrentUser, db: DbSession):
    record = OutletAudit(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return OutletAuditOut.model_validate(record)


@router.delete("/outlets/{record_id}", status_code=204)
def delete_outlet(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(OutletAudit).filter(OutletAudit.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Outlet audit record not found")
    db.delete(record)
    db.commit()
