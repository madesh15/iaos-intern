from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    CaseAssignment,
    CaseComment,
    CaseDisciplinary,
    CaseFeedback,
    CaseLink,
    CaseOutcome,
    CaseProtection,
    EthicsSurvey,
    WhistleblowerCase,
)
from .schemas import (
    AssignmentCreate,
    AssignmentOut,
    CaseCreate,
    CaseOut,
    CaseUpdate,
    CommentCreate,
    CommentOut,
    DisciplinaryCreate,
    DisciplinaryOut,
    FeedbackCreate,
    FeedbackOut,
    LinkCreate,
    LinkOut,
    OutcomeCreate,
    OutcomeOut,
    ProtectionCreate,
    ProtectionOut,
    SurveyCreate,
    SurveyOut,
)

MANIFEST = {
    "name": "whistleblower_grievance",
    "title": "Whistleblower & Grievance",
    "description": "Confidential ethics-and-grievance channel with intake, triage, investigation, protection and closure.",
    "icon": "shield",
    "group": "Tax, Legal & Compliance",
    "industry": "All industries",
    "version": "1.0.0",
    "owner": "intern-58",
}

router = APIRouter()


def _generate_case_number(db: DbSession, tenant_id: int) -> str:
    year = datetime.now(timezone.utc).year
    count = db.query(WhistleblowerCase).filter(
        WhistleblowerCase.tenant_id == tenant_id
    ).count()
    return f"WB-{year}-{count + 1:04d}"


# ── Cases CRUD ────────────────────────────────────────────────────────

@router.get("/cases", response_model=list[CaseOut])
def list_cases(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(WhistleblowerCase), current_user
    ).order_by(WhistleblowerCase.id.desc())
    return [CaseOut.model_validate(c) for c in q.all()]


@router.post("/cases", response_model=CaseOut, status_code=201)
def create_case(body: CaseCreate, current_user: CurrentUser, db: DbSession):
    case = WhistleblowerCase(
        **body.model_dump(),
        case_number=_generate_case_number(db, current_user.tenant_id),
        status="open",
        date_received=datetime.now(timezone.utc),
        created_by_id=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return CaseOut.model_validate(case)


@router.get("/cases/{case_id}", response_model=CaseOut)
def get_case(case_id: int, current_user: CurrentUser, db: DbSession):
    case = tenant_scoped(
        db.query(WhistleblowerCase).filter(WhistleblowerCase.id == case_id),
        current_user,
    ).first()
    if not case:
        raise HTTPException(404, "Case not found")
    return CaseOut.model_validate(case)


@router.patch("/cases/{case_id}", response_model=CaseOut)
def update_case(
    case_id: int, body: CaseUpdate, current_user: CurrentUser, db: DbSession
):
    case = tenant_scoped(
        db.query(WhistleblowerCase).filter(WhistleblowerCase.id == case_id),
        current_user,
    ).first()
    if not case:
        raise HTTPException(404, "Case not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(case, field, value)
    db.commit()
    db.refresh(case)
    return CaseOut.model_validate(case)


@router.delete("/cases/{case_id}", status_code=204)
def delete_case(case_id: int, current_user: CurrentUser, db: DbSession):
    case = tenant_scoped(
        db.query(WhistleblowerCase).filter(WhistleblowerCase.id == case_id),
        current_user,
    ).first()
    if not case:
        raise HTTPException(404, "Case not found")
    db.delete(case)
    db.commit()


# ── Comments (Sub#4) ─────────────────────────────────────────────────

@router.get("/cases/{case_id}/comments", response_model=list[CommentOut])
def list_comments(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseComment).filter(CaseComment.case_id == case_id), current_user
    ).order_by(CaseComment.id.asc())
    return [CommentOut.model_validate(c) for c in q.all()]


@router.post("/cases/{case_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    case_id: int, body: CommentCreate, current_user: CurrentUser, db: DbSession
):
    comment = CaseComment(
        case_id=case_id,
        user_id=current_user.id,
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut.model_validate(comment)


# ── Assignments (Sub#3) ──────────────────────────────────────────────

@router.get(
    "/cases/{case_id}/assignments", response_model=list[AssignmentOut]
)
def list_assignments(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseAssignment).filter(CaseAssignment.case_id == case_id),
        current_user,
    ).order_by(CaseAssignment.id.desc())
    return [AssignmentOut.model_validate(a) for a in q.all()]


@router.post(
    "/cases/{case_id}/assignments", response_model=AssignmentOut, status_code=201
)
def add_assignment(
    case_id: int, body: AssignmentCreate, current_user: CurrentUser, db: DbSession
):
    # deactivate existing active assignments for this case
    for existing in (
        db.query(CaseAssignment)
        .filter(
            CaseAssignment.case_id == case_id,
            CaseAssignment.is_active.is_(True),
            CaseAssignment.tenant_id == current_user.tenant_id,
        )
        .all()
    ):
        existing.is_active = False

    assignment = CaseAssignment(
        case_id=case_id,
        assigned_to_id=body.assigned_to_id,
        assigned_by_id=current_user.id,
        reason=body.reason,
        tenant_id=current_user.tenant_id,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return AssignmentOut.model_validate(assignment)


# ── Protections (Sub#5) ─────────────────────────────────────────────

@router.get(
    "/cases/{case_id}/protections", response_model=list[ProtectionOut]
)
def list_protections(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseProtection).filter(CaseProtection.case_id == case_id),
        current_user,
    )
    return [ProtectionOut.model_validate(p) for p in q.all()]


@router.post(
    "/cases/{case_id}/protections", response_model=ProtectionOut, status_code=201
)
def add_protection(
    case_id: int, body: ProtectionCreate, current_user: CurrentUser, db: DbSession
):
    protection = CaseProtection(
        case_id=case_id,
        implemented_by_id=current_user.id,
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(protection)
    db.commit()
    db.refresh(protection)
    return ProtectionOut.model_validate(protection)


# ── Outcomes (Sub#7) ────────────────────────────────────────────────

@router.get("/cases/{case_id}/outcomes", response_model=list[OutcomeOut])
def list_outcomes(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseOutcome).filter(CaseOutcome.case_id == case_id), current_user
    )
    return [OutcomeOut.model_validate(o) for o in q.all()]


@router.post(
    "/cases/{case_id}/outcomes", response_model=OutcomeOut, status_code=201
)
def add_outcome(
    case_id: int, body: OutcomeCreate, current_user: CurrentUser, db: DbSession
):
    outcome = CaseOutcome(
        case_id=case_id,
        decided_by_id=current_user.id,
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(outcome)
    db.commit()
    db.refresh(outcome)
    return OutcomeOut.model_validate(outcome)


# ── Disciplinary (Sub#8) ────────────────────────────────────────────

@router.get(
    "/cases/{case_id}/disciplinary", response_model=list[DisciplinaryOut]
)
def list_disciplinary(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseDisciplinary).filter(CaseDisciplinary.case_id == case_id),
        current_user,
    )
    return [DisciplinaryOut.model_validate(d) for d in q.all()]


@router.post(
    "/cases/{case_id}/disciplinary",
    response_model=DisciplinaryOut,
    status_code=201,
)
def add_disciplinary(
    case_id: int,
    body: DisciplinaryCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    disc = CaseDisciplinary(
        case_id=case_id,
        created_by_id=current_user.id,
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(disc)
    db.commit()
    db.refresh(disc)
    return DisciplinaryOut.model_validate(disc)


# ── Feedback (Sub#12) ───────────────────────────────────────────────

@router.get("/cases/{case_id}/feedback", response_model=list[FeedbackOut])
def list_feedback(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseFeedback).filter(CaseFeedback.case_id == case_id),
        current_user,
    )
    return [FeedbackOut.model_validate(f) for f in q.all()]


@router.post(
    "/cases/{case_id}/feedback", response_model=FeedbackOut, status_code=201
)
def add_feedback(
    case_id: int, body: FeedbackCreate, current_user: CurrentUser, db: DbSession
):
    fb = CaseFeedback(
        case_id=case_id,
        sent_by_id=current_user.id,
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return FeedbackOut.model_validate(fb)


# ── Links (Sub#13) ──────────────────────────────────────────────────

@router.get("/cases/{case_id}/links", response_model=list[LinkOut])
def list_links(case_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(CaseLink).filter(
            (CaseLink.case_id_1 == case_id) | (CaseLink.case_id_2 == case_id)
        ),
        current_user,
    )
    return [LinkOut.model_validate(lk) for lk in q.all()]


@router.post("/cases/{case_id}/links", response_model=LinkOut, status_code=201)
def add_link(
    case_id: int, body: LinkCreate, current_user: CurrentUser, db: DbSession
):
    link = CaseLink(
        case_id_1=case_id,
        case_id_2=body.case_id_2,
        relationship_type=body.relationship_type,
        created_by_id=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return LinkOut.model_validate(link)


# ── Surveys (Sub#15) ────────────────────────────────────────────────

@router.get("/surveys", response_model=list[SurveyOut])
def list_surveys(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(
        db.query(EthicsSurvey), current_user
    ).order_by(EthicsSurvey.id.desc())
    return [SurveyOut.model_validate(s) for s in q.all()]


@router.post("/surveys", response_model=SurveyOut, status_code=201)
def create_survey(body: SurveyCreate, current_user: CurrentUser, db: DbSession):
    survey = EthicsSurvey(
        **body.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return SurveyOut.model_validate(survey)


# ── Dashboard KPIs (Sub#16) ─────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard(current_user: CurrentUser, db: DbSession):
    cases = tenant_scoped(
        db.query(WhistleblowerCase), current_user
    ).all()

    total = len(cases)
    open_count = sum(1 for c in cases if c.status != "closed")
    closed_count = sum(1 for c in cases if c.status == "closed")
    anonymous_count = sum(1 for c in cases if c.is_anonymous)

    by_category: dict[str, int] = {}
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    by_routing: dict[str, int] = {}

    for c in cases:
        by_category[c.category] = by_category.get(c.category, 0) + 1
        by_status[c.status] = by_status.get(c.status, 0) + 1
        by_priority[c.priority] = by_priority.get(c.priority, 0) + 1
        by_routing[c.routing] = by_routing.get(c.routing, 0) + 1

    substantiated = sum(1 for c in cases if c.substantiation == "founded")
    unfounded = sum(1 for c in cases if c.substantiation == "unfounded")

    # SLA breach count
    now = datetime.now(timezone.utc)
    sla_breaches = 0
    for c in cases:
        if c.status != "closed" and c.date_received:
            age_days = (now - c.date_received.replace(tzinfo=timezone.utc)).days
            if age_days > c.sla_target_days:
                sla_breaches += 1

    return {
        "total": total,
        "open": open_count,
        "closed": closed_count,
        "anonymous": anonymous_count,
        "sla_breaches": sla_breaches,
        "substantiated": substantiated,
        "unfounded": unfounded,
        "by_category": by_category,
        "by_status": by_status,
        "by_priority": by_priority,
        "by_routing": by_routing,
    }
