"""ITGC module API — 15 Signature test procedures.

Mounted at /api/modules/itgc.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import ItgcTest, PROCEDURES, TestStatus, RiskRating
from .schemas import TestCreate, TestUpdate, TestOut, ProcedureSummary

MANIFEST = {
    "name": "itgc",
    "title": "IT General Controls (ITGC)",
    "description": "Tests foundational IT controls: change management, access, operations and backup/recovery.",
    "icon": "server",
    "group": "Technology & Resilience",
    "industry": "",
    "version": "1.0.0",
    "owner": "intern-53",
}

router = APIRouter()


# ── helpers ───────────────────────────────────────────────────────────

def _out(t: ItgcTest) -> TestOut:
    return TestOut.model_validate(t)


def _get_or_404(test_id: int, current_user: CurrentUser, db: DbSession) -> ItgcTest:
    item = tenant_scoped(
        db.query(ItgcTest).filter(ItgcTest.id == test_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Test record not found")
    return item


# ── procedure catalogue ──────────────────────────────────────────────

@router.get("/procedures")
def list_procedures():
    """Return the static catalogue of 15 ITGC procedures."""
    return PROCEDURES


# ── CRUD ─────────────────────────────────────────────────────────────

@router.get("/tests", response_model=list[TestOut])
def list_tests(
    current_user: CurrentUser,
    db: DbSession,
    procedure_code: int | None = None,
):
    q = tenant_scoped(db.query(ItgcTest), current_user)
    if procedure_code is not None:
        q = q.filter(ItgcTest.procedure_code == procedure_code)
    return [_out(t) for t in q.order_by(ItgcTest.procedure_code, ItgcTest.id.desc()).all()]


@router.get("/tests/{test_id}", response_model=TestOut)
def get_test(test_id: int, current_user: CurrentUser, db: DbSession):
    return _out(_get_or_404(test_id, current_user, db))


@router.post("/tests", response_model=TestOut, status_code=201)
def create_test(body: TestCreate, current_user: CurrentUser, db: DbSession):
    test = ItgcTest(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(test)
    db.commit()
    db.refresh(test)
    return _out(test)


@router.patch("/tests/{test_id}", response_model=TestOut)
def update_test(test_id: int, body: TestUpdate, current_user: CurrentUser, db: DbSession):
    test = _get_or_404(test_id, current_user, db)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(test, k, v)
    db.commit()
    db.refresh(test)
    return _out(test)


@router.delete("/tests/{test_id}", status_code=204)
def delete_test(test_id: int, current_user: CurrentUser, db: DbSession):
    test = _get_or_404(test_id, current_user, db)
    db.delete(test)
    db.commit()


# ── summary / dashboard ─────────────────────────────────────────────

@router.get("/summary", response_model=list[ProcedureSummary])
def get_summary(current_user: CurrentUser, db: DbSession):
    """Per-procedure roll-up: counts by status + latest risk rating."""
    q = tenant_scoped(db.query(ItgcTest), current_user)
    rows = q.all()

    by_proc: dict[int, list[ItgcTest]] = {}
    for r in rows:
        by_proc.setdefault(r.procedure_code, []).append(r)

    summaries: list[ProcedureSummary] = []
    for proc in PROCEDURES:
        code = proc["code"]
        tests = by_proc.get(code, [])
        status_counts: dict[str, int] = {}
        latest_risk = RiskRating.NONE.value
        for t in tests:
            status_counts[t.status] = status_counts.get(t.status, 0) + 1
            if t.risk_rating not in (RiskRating.NONE.value, ""):
                latest_risk = t.risk_rating
        summaries.append(ProcedureSummary(
            procedure_code=code,
            procedure_name=proc["name"],
            description=proc["description"],
            total=len(tests),
            by_status=status_counts,
            latest_risk=latest_risk,
        ))
    return summaries
