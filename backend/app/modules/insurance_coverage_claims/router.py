"""Insurance Coverage & Claims API. Mounted automatically at
/api/modules/insurance_coverage_claims.

Covers the two core signature views for the module's first release:
  • Policy Register & Renewal   (+ coverage adequacy, expiry tracking)
  • Claim Lodgement -> Settlement tracking (+ recovery, delay SLA)
Both resources are full CRUD, tenant-isolated, searchable, filterable,
sortable and paginated. A /dashboard endpoint rolls the KPIs used by the
module's dashboard tile.
"""
from datetime import date, datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import or_

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    AuditArtifact,
    BrokerPerformance,
    BusinessInterruptionCover,
    ClaimRecoveryAccounting,
    CostAllocation,
    EmployeeLiabilityCover,
    ExclusionWarranty,
    InsuranceClaim,
    InsurancePolicy,
    MarineTransitCover,
)
from .schemas import (
    AuditArtifactCreate,
    AuditArtifactOut,
    AuditArtifactUpdate,
    BiCoverCreate,
    BiCoverOut,
    BiCoverUpdate,
    BrokerPerformanceCreate,
    BrokerPerformanceOut,
    BrokerPerformanceUpdate,
    ClaimCreate,
    ClaimOut,
    ClaimUpdate,
    CostAllocationCreate,
    CostAllocationOut,
    CostAllocationUpdate,
    CoverageAdequacyOut,
    DashboardSummary,
    DuplicateCoverOut,
    EmployeeCoverCreate,
    EmployeeCoverOut,
    EmployeeCoverUpdate,
    ExclusionCreate,
    ExclusionOut,
    ExclusionUpdate,
    LodgementTimelinessOut,
    MarineCoverCreate,
    MarineCoverOut,
    MarineCoverUpdate,
    PagedClaims,
    PagedPolicies,
    PolicyCreate,
    PolicyOut,
    PolicyUpdate,
    PremiumBenchmarkOut,
    RecoveryAccountingCreate,
    RecoveryAccountingOut,
    RecoveryAccountingUpdate,
    UninsuredAssetOut,
)

MANIFEST = {
    "name": "insurance_coverage_claims",
    "title": "Insurance Coverage & Claims",
    "description": (
        "Track insurance policies, coverage adequacy and claims from "
        "lodgement through settlement and recovery."
    ),
    "icon": "shield",
    "group": "Treasury, Assets & Capital",
    "industry": "",
    "version": "1.0.0",
    "owner": "claude",
}

router = APIRouter()


def _today() -> date:
    return datetime.now(timezone.utc).date()


# ── helpers: attach derived fields ──────────────────────────────────
def _policy_out(p: InsurancePolicy) -> PolicyOut:
    out = PolicyOut.model_validate(p)
    out.coverage_pct = round((p.sum_insured / p.asset_value) * 100, 2) if p.asset_value else 0
    out.days_to_expiry = (p.policy_end_date - _today()).days
    return out


def _claim_out(c: InsuranceClaim) -> ClaimOut:
    out = ClaimOut.model_validate(c)
    out.lodgement_delay_days = (c.claim_lodged_date - c.incident_date).days
    out.outstanding_amount = round(c.approved_amount - c.recovery_amount, 2)
    out.settlement_delay_days = (
        (c.settlement_date - c.claim_lodged_date).days if c.settlement_date else None
    )
    out.recovery_pct = round((c.recovery_amount / c.claim_amount) * 100, 1) if c.claim_amount else 0
    return out


# ══════════════════════════ POLICIES ════════════════════════════════
@router.get("/policies", response_model=PagedPolicies)
def list_policies(
    current_user: CurrentUser,
    db: DbSession,
    search: str = Query("", description="matches policy number, insurer, asset"),
    status: str = Query("", description="active | expired | lapsed | renewed"),
    policy_type: str = Query(""),
    expiring_within_days: int | None = Query(None, ge=0),
    sort_by: str = Query("policy_end_date"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
):
    q = tenant_scoped(db.query(InsurancePolicy), current_user)

    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                InsurancePolicy.policy_number.ilike(like),
                InsurancePolicy.insurer_name.ilike(like),
                InsurancePolicy.asset_or_entity_covered.ilike(like),
                InsurancePolicy.broker_name.ilike(like),
            )
        )
    if status:
        q = q.filter(InsurancePolicy.status == status)
    if policy_type:
        q = q.filter(InsurancePolicy.policy_type == policy_type)
    if expiring_within_days is not None:
        cutoff = _today()
        from datetime import timedelta

        q = q.filter(
            InsurancePolicy.policy_end_date >= cutoff,
            InsurancePolicy.policy_end_date <= cutoff + timedelta(days=expiring_within_days),
        )

    total = q.count()

    sort_col = getattr(InsurancePolicy, sort_by, InsurancePolicy.policy_end_date)
    q = q.order_by(sort_col.desc() if sort_dir == "desc" else sort_col.asc())
    q = q.offset((page - 1) * page_size).limit(page_size)

    return PagedPolicies(total=total, items=[_policy_out(p) for p in q.all()])


@router.post("/policies", response_model=PolicyOut, status_code=201)
def create_policy(body: PolicyCreate, current_user: CurrentUser, db: DbSession):
    policy = InsurancePolicy(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return _policy_out(policy)


@router.get("/policies/{policy_id}", response_model=PolicyOut)
def get_policy(policy_id: int, current_user: CurrentUser, db: DbSession):
    policy = tenant_scoped(
        db.query(InsurancePolicy).filter(InsurancePolicy.id == policy_id), current_user
    ).first()
    if not policy:
        raise HTTPException(404, "Policy not found")
    return _policy_out(policy)


@router.patch("/policies/{policy_id}", response_model=PolicyOut)
def update_policy(policy_id: int, body: PolicyUpdate, current_user: CurrentUser, db: DbSession):
    policy = tenant_scoped(
        db.query(InsurancePolicy).filter(InsurancePolicy.id == policy_id), current_user
    ).first()
    if not policy:
        raise HTTPException(404, "Policy not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return _policy_out(policy)


@router.delete("/policies/{policy_id}", status_code=204)
def delete_policy(policy_id: int, current_user: CurrentUser, db: DbSession):
    policy = tenant_scoped(
        db.query(InsurancePolicy).filter(InsurancePolicy.id == policy_id), current_user
    ).first()
    if not policy:
        raise HTTPException(404, "Policy not found")
    db.delete(policy)
    db.commit()


# ══════════════════════════ CLAIMS ══════════════════════════════════
@router.get("/claims", response_model=PagedClaims)
def list_claims(
    current_user: CurrentUser,
    db: DbSession,
    search: str = Query("", description="matches claim number, surveyor"),
    status: str = Query(""),
    policy_id: int | None = Query(None),
    sort_by: str = Query("claim_lodged_date"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
):
    q = tenant_scoped(db.query(InsuranceClaim), current_user)

    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                InsuranceClaim.claim_number.ilike(like),
                InsuranceClaim.surveyor_name.ilike(like),
            )
        )
    if status:
        q = q.filter(InsuranceClaim.status == status)
    if policy_id is not None:
        q = q.filter(InsuranceClaim.policy_id == policy_id)

    total = q.count()

    sort_col = getattr(InsuranceClaim, sort_by, InsuranceClaim.claim_lodged_date)
    q = q.order_by(sort_col.desc() if sort_dir == "desc" else sort_col.asc())
    q = q.offset((page - 1) * page_size).limit(page_size)

    return PagedClaims(total=total, items=[_claim_out(c) for c in q.all()])


@router.post("/claims", response_model=ClaimOut, status_code=201)
def create_claim(body: ClaimCreate, current_user: CurrentUser, db: DbSession):
    policy = tenant_scoped(
        db.query(InsurancePolicy).filter(InsurancePolicy.id == body.policy_id), current_user
    ).first()
    if not policy:
        raise HTTPException(404, "Policy not found for this claim")

    claim = InsuranceClaim(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return _claim_out(claim)


@router.get("/claims/{claim_id}", response_model=ClaimOut)
def get_claim(claim_id: int, current_user: CurrentUser, db: DbSession):
    claim = tenant_scoped(
        db.query(InsuranceClaim).filter(InsuranceClaim.id == claim_id), current_user
    ).first()
    if not claim:
        raise HTTPException(404, "Claim not found")
    return _claim_out(claim)


@router.patch("/claims/{claim_id}", response_model=ClaimOut)
def update_claim(claim_id: int, body: ClaimUpdate, current_user: CurrentUser, db: DbSession):
    claim = tenant_scoped(
        db.query(InsuranceClaim).filter(InsuranceClaim.id == claim_id), current_user
    ).first()
    if not claim:
        raise HTTPException(404, "Claim not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(claim, field, value)
    db.commit()
    db.refresh(claim)
    return _claim_out(claim)


@router.delete("/claims/{claim_id}", status_code=204)
def delete_claim(claim_id: int, current_user: CurrentUser, db: DbSession):
    claim = tenant_scoped(
        db.query(InsuranceClaim).filter(InsuranceClaim.id == claim_id), current_user
    ).first()
    if not claim:
        raise HTTPException(404, "Claim not found")
    db.delete(claim)
    db.commit()


# ══════════════════════════ DASHBOARD ═══════════════════════════════
@router.get("/dashboard", response_model=DashboardSummary)
def dashboard(current_user: CurrentUser, db: DbSession):
    from datetime import timedelta

    policies = tenant_scoped(db.query(InsurancePolicy), current_user).all()
    claims = tenant_scoped(db.query(InsuranceClaim), current_user).all()

    today = _today()
    cutoff30 = today + timedelta(days=30)

    active = [p for p in policies if p.status == "active" and p.policy_end_date >= today]
    expired = [p for p in policies if p.policy_end_date < today]
    expiring_soon = [p for p in active if p.policy_end_date <= cutoff30]
    underinsured = [
        p for p in policies if p.asset_value and p.sum_insured < p.asset_value * 0.9
    ]

    open_claims = [c for c in claims if c.status not in ("settled", "rejected")]
    delays = [
        (c.claim_lodged_date - c.incident_date).days
        for c in claims
        if c.claim_lodged_date and c.incident_date
    ]

    return DashboardSummary(
        total_policies=len(policies),
        active_policies=len(active),
        expired_policies=len(expired),
        expiring_in_30_days=len(expiring_soon),
        total_sum_insured=round(sum(p.sum_insured for p in policies), 2),
        total_asset_value=round(sum(p.asset_value for p in policies), 2),
        underinsured_count=len(underinsured),
        total_premium=round(sum(p.premium_amount for p in policies), 2),
        open_claims=len(open_claims),
        total_claim_amount=round(sum(c.claim_amount for c in claims), 2),
        total_recovery_amount=round(sum(c.recovery_amount for c in claims), 2),
        total_outstanding=round(
            sum(c.approved_amount - c.recovery_amount for c in claims), 2
        ),
        average_lodgement_delay_days=round(sum(delays) / len(delays), 1) if delays else 0,
    )


# ══════════════════ COMPUTED ANALYTICS (no new tables) ═══════════════
@router.get("/analytics/coverage-adequacy", response_model=list[CoverageAdequacyOut])
def coverage_adequacy(
    current_user: CurrentUser,
    db: DbSession,
    status: str = Query("", description="underinsured | adequate | overinsured"),
    search: str = Query(""),
):
    policies = tenant_scoped(db.query(InsurancePolicy), current_user).all()
    rows = []
    for p in policies:
        pct = round((p.sum_insured / p.asset_value) * 100, 2) if p.asset_value else 0
        if pct == 0:
            row_status = "adequate"
        elif pct < 90:
            row_status = "underinsured"
        elif pct <= 110:
            row_status = "adequate"
        else:
            row_status = "overinsured"
        risk = "high" if pct and pct < 75 else "medium" if pct and pct < 90 else "low"
        rows.append(
            CoverageAdequacyOut(
                policy_id=p.id,
                policy_number=p.policy_number,
                asset_or_entity_covered=p.asset_or_entity_covered,
                asset_value=p.asset_value,
                sum_insured=p.sum_insured,
                coverage_pct=pct,
                status=row_status,
                risk_rating=risk,
            )
        )
    if status:
        rows = [r for r in rows if r.status == status]
    if search:
        s = search.lower()
        rows = [
            r
            for r in rows
            if s in r.policy_number.lower() or s in r.asset_or_entity_covered.lower()
        ]
    return rows


@router.get("/analytics/uninsured-assets", response_model=list[UninsuredAssetOut])
def uninsured_assets(current_user: CurrentUser, db: DbSession, min_gap: float = Query(0)):
    policies = tenant_scoped(db.query(InsurancePolicy), current_user).all()
    rows = []
    for p in policies:
        gap = round(p.asset_value - p.sum_insured, 2)
        if gap <= min_gap:
            continue
        gap_pct = (gap / p.asset_value * 100) if p.asset_value else 0
        risk = "high" if gap_pct > 25 else "medium" if gap_pct > 10 else "low"
        rows.append(
            UninsuredAssetOut(
                policy_id=p.id,
                asset_or_entity_covered=p.asset_or_entity_covered,
                location=p.location,
                asset_value=p.asset_value,
                insured_value=p.sum_insured,
                coverage_gap=gap,
                risk_level=risk,
            )
        )
    return sorted(rows, key=lambda r: r.coverage_gap, reverse=True)


@router.get("/analytics/lodgement-timeliness", response_model=list[LodgementTimelinessOut])
def lodgement_timeliness(current_user: CurrentUser, db: DbSession, sla_days: int = Query(30)):
    claims = tenant_scoped(db.query(InsuranceClaim), current_user).all()
    rows = []
    for c in claims:
        delay = (c.claim_lodged_date - c.incident_date).days
        rows.append(
            LodgementTimelinessOut(
                claim_id=c.id,
                claim_number=c.claim_number,
                incident_date=c.incident_date,
                claim_date=c.claim_lodged_date,
                delay_days=delay,
                sla_status="breach" if delay > sla_days else "on_time",
                late_claim=delay > sla_days,
            )
        )
    return sorted(rows, key=lambda r: r.delay_days, reverse=True)


@router.get("/analytics/premium-benchmark", response_model=list[PremiumBenchmarkOut])
def premium_benchmark(current_user: CurrentUser, db: DbSession, benchmark_pct: float = Query(1.5)):
    policies = tenant_scoped(db.query(InsurancePolicy), current_user).all()
    rows = []
    for p in policies:
        premium_pct = round((p.premium_amount / p.sum_insured) * 100, 3) if p.sum_insured else 0
        rows.append(
            PremiumBenchmarkOut(
                policy_id=p.id,
                policy_number=p.policy_number,
                premium=p.premium_amount,
                coverage=p.sum_insured,
                premium_pct=premium_pct,
                benchmark_pct=benchmark_pct,
                variance_pct=round(premium_pct - benchmark_pct, 3),
            )
        )
    return rows


@router.get("/analytics/duplicate-cover", response_model=list[DuplicateCoverOut])
def duplicate_cover(current_user: CurrentUser, db: DbSession):
    policies = tenant_scoped(
        db.query(InsurancePolicy).filter(InsurancePolicy.status == "active"), current_user
    ).all()
    groups: dict[tuple[str, str], list[InsurancePolicy]] = {}
    for p in policies:
        key = (p.asset_or_entity_covered.strip().lower(), p.policy_type)
        groups.setdefault(key, []).append(p)

    rows = []
    for (asset, ptype), items in groups.items():
        if len(items) > 1 and asset:
            rows.append(
                DuplicateCoverOut(
                    asset_or_entity_covered=items[0].asset_or_entity_covered,
                    policy_type=ptype,
                    policy_count=len(items),
                    policy_numbers=[i.policy_number for i in items],
                    total_premium=round(sum(i.premium_amount for i in items), 2),
                )
            )
    return sorted(rows, key=lambda r: r.policy_count, reverse=True)


@router.get("/analytics/coverage-adequacy/export.csv")
def export_coverage_adequacy(current_user: CurrentUser, db: DbSession):
    import csv
    import io

    from fastapi.responses import StreamingResponse

    rows = coverage_adequacy(current_user, db, status="", search="")
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Policy #", "Asset", "Asset Value", "Sum Insured", "Coverage %", "Status", "Risk"])
    for r in rows:
        writer.writerow(
            [r.policy_number, r.asset_or_entity_covered, r.asset_value, r.sum_insured, r.coverage_pct, r.status, r.risk_rating]
        )
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=coverage_adequacy.csv"},
    )


# ══════════════════ SPECIALTY COVERS & REGISTERS ══════════════════════
def _simple_crud(
    router: APIRouter,
    path: str,
    model,
    create_schema,
    update_schema,
    out_schema,
    default_sort: str,
):
    """Registers a small tenant-scoped CRUD set for a straightforward
    register table (exclusions, BI cover, marine cover, employee cover,
    recovery accounting, broker performance, cost allocation)."""

    @router.get(path, response_model=dict, name=f"list_{path}")
    def _list(
        current_user: CurrentUser,
        db: DbSession,
        search: str = Query(""),
        page: int = Query(1, ge=1),
        page_size: int = Query(50, ge=1, le=200),
    ):
        q = tenant_scoped(db.query(model), current_user)
        total = q.count()
        q = q.order_by(getattr(model, default_sort).desc()).offset((page - 1) * page_size).limit(page_size)
        items = [out_schema.model_validate(r).model_dump(mode="json") for r in q.all()]
        return {"total": total, "items": items}

    @router.post(path, response_model=out_schema, status_code=201, name=f"create_{path}")
    def _create(body: create_schema, current_user: CurrentUser, db: DbSession):
        row = model(**body.model_dump(), tenant_id=current_user.tenant_id)
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    @router.patch(path + "/{row_id}", response_model=out_schema, name=f"update_{path}")
    def _update(row_id: int, body: update_schema, current_user: CurrentUser, db: DbSession):
        row = tenant_scoped(db.query(model).filter(model.id == row_id), current_user).first()
        if not row:
            raise HTTPException(404, "Not found")
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(row, field, value)
        db.commit()
        db.refresh(row)
        return row

    @router.delete(path + "/{row_id}", status_code=204, name=f"delete_{path}")
    def _delete(row_id: int, current_user: CurrentUser, db: DbSession):
        row = tenant_scoped(db.query(model).filter(model.id == row_id), current_user).first()
        if not row:
            raise HTTPException(404, "Not found")
        db.delete(row)
        db.commit()


_simple_crud(router, "/exclusions", ExclusionWarranty, ExclusionCreate, ExclusionUpdate, ExclusionOut, "id")
_simple_crud(router, "/bi-cover", BusinessInterruptionCover, BiCoverCreate, BiCoverUpdate, BiCoverOut, "id")
_simple_crud(router, "/marine-cover", MarineTransitCover, MarineCoverCreate, MarineCoverUpdate, MarineCoverOut, "id")
_simple_crud(
    router, "/employee-cover", EmployeeLiabilityCover, EmployeeCoverCreate, EmployeeCoverUpdate, EmployeeCoverOut, "id"
)
_simple_crud(
    router,
    "/recovery-accounting",
    ClaimRecoveryAccounting,
    RecoveryAccountingCreate,
    RecoveryAccountingUpdate,
    RecoveryAccountingOut,
    "id",
)
_simple_crud(
    router,
    "/broker-performance",
    BrokerPerformance,
    BrokerPerformanceCreate,
    BrokerPerformanceUpdate,
    BrokerPerformanceOut,
    "id",
)
_simple_crud(
    router, "/cost-allocation", CostAllocation, CostAllocationCreate, CostAllocationUpdate, CostAllocationOut, "id"
)


# ══════════════════ COMMON AUDIT WORKSPACE (generic) ══════════════════
AUDIT_PAGE_TYPES = {
    "scope",
    "rcm",
    "rule_library",
    "data_source",
    "sampling",
    "exception",
    "working_paper",
    "finding",
    "remediation",
}


@router.get("/audit-artifacts", response_model=dict)
def list_audit_artifacts(
    current_user: CurrentUser,
    db: DbSession,
    page_type: str = Query(..., description="one of: " + ", ".join(sorted(AUDIT_PAGE_TYPES))),
    search: str = Query(""),
    status: str = Query(""),
    severity: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    if page_type not in AUDIT_PAGE_TYPES:
        raise HTTPException(400, f"Unknown page_type '{page_type}'")

    q = tenant_scoped(db.query(AuditArtifact), current_user).filter(AuditArtifact.page_type == page_type)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(AuditArtifact.title.ilike(like), AuditArtifact.owner.ilike(like)))
    if status:
        q = q.filter(AuditArtifact.status == status)
    if severity:
        q = q.filter(AuditArtifact.severity == severity)

    total = q.count()
    q = q.order_by(AuditArtifact.id.desc()).offset((page - 1) * page_size).limit(page_size)
    items = [AuditArtifactOut.model_validate(r).model_dump(mode="json") for r in q.all()]
    return {"total": total, "items": items}


@router.post("/audit-artifacts", response_model=AuditArtifactOut, status_code=201)
def create_audit_artifact(body: AuditArtifactCreate, current_user: CurrentUser, db: DbSession):
    if body.page_type not in AUDIT_PAGE_TYPES:
        raise HTTPException(400, f"Unknown page_type '{body.page_type}'")
    row = AuditArtifact(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/audit-artifacts/{artifact_id}", response_model=AuditArtifactOut)
def update_audit_artifact(
    artifact_id: int, body: AuditArtifactUpdate, current_user: CurrentUser, db: DbSession
):
    row = tenant_scoped(
        db.query(AuditArtifact).filter(AuditArtifact.id == artifact_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/audit-artifacts/{artifact_id}", status_code=204)
def delete_audit_artifact(artifact_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(AuditArtifact).filter(AuditArtifact.id == artifact_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()
