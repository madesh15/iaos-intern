"""
Data Privacy & DPDP Compliance module — API router.
Mounted at /api/modules/data_privacy_dpdp
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import models as m
from . import schemas as s

router = APIRouter()

MANIFEST = {
    "name": "data_privacy_dpdp",
    "title": "Data Privacy & DPDP Compliance",
    "description": (
        "Assurance over personal-data handling under DPDP/GDPR: data inventory, consent, "
        "retention, breach readiness and cross-border transfer controls."
    ),
    "icon": "scale",
    "group": "Tax, Legal & Compliance",
    "industry": "",
    "version": "1.0.0",
    "owner": "intern",
}

DEFAULT_PROCEDURES = [
    (1, "Personal-Data Inventory (RoPA)", "Map what PII is held and where"),
    (2, "Consent-Management Review", "Valid consent capture and refresh"),
    (3, "Purpose-Limitation Testing", "Data used only for stated purpose"),
    (4, "Data-Retention & Erasure", "Deletion after retention period"),
    (5, "Data-Subject-Rights Handling", "Access/correction/erasure requests"),
    (6, "Cross-Border Transfer Controls", "Transfer-mechanism validation"),
    (7, "Third-Party Processor Diligence", "Processor contract controls"),
    (8, "Breach-Notification Readiness", "72-hour notification capability"),
    (9, "Data-Minimisation Review", "Excess-collection detection"),
    (10, "Sensitive-Data Handling", "Special-category data controls"),
    (11, "Privacy-by-Design Assessment", "New-system privacy review"),
    (12, "Access & Encryption Controls", "PII security testing"),
    (13, "DPO & Governance Structure", "Accountability framework"),
    (14, "Consent-Withdrawal Handling", "Opt-out processing"),
    (15, "Privacy-Notice Adequacy", "Notice completeness and clarity"),
]


def _ensure_seeded(db: DbSession, current_user: CurrentUser) -> None:
    existing = tenant_scoped(db.query(m.DataPrivacyDpdpProcedure), current_user).count()
    if existing:
        return
    for step_no, title, desc in DEFAULT_PROCEDURES:
        db.add(
            m.DataPrivacyDpdpProcedure(
                tenant_id=current_user.tenant_id,
                step_no=step_no,
                title=title,
                description=desc,
            )
        )
    db.commit()


def _get_or_404(db: DbSession, current_user: CurrentUser, model, obj_id: int):
    obj = tenant_scoped(db.query(model), current_user).filter(model.id == obj_id).first()
    if not obj:
        raise HTTPException(404, f"{model.__name__} {obj_id} not found")
    return obj


@router.get("/procedures", response_model=list[s.ProcedureOut])
def list_procedures(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)
    q = tenant_scoped(db.query(m.DataPrivacyDpdpProcedure), current_user).order_by(
        m.DataPrivacyDpdpProcedure.step_no
    )
    return [s.ProcedureOut.model_validate(p) for p in q.all()]


@router.patch("/procedures/{proc_id}", response_model=s.ProcedureOut)
def update_procedure(proc_id: int, payload: s.ProcedureUpdate, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.DataPrivacyDpdpProcedure, proc_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proc, field, value)
    db.commit()
    db.refresh(proc)
    return s.ProcedureOut.model_validate(proc)


@router.post("/procedures/{proc_id}/sign", response_model=s.ProcedureOut)
def sign_procedure(proc_id: int, payload: s.ProcedureSign, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.DataPrivacyDpdpProcedure, proc_id)
    proc.signed_by = payload.signed_by
    proc.signed_at = datetime.utcnow()
    proc.status = "completed"
    db.commit()
    db.refresh(proc)
    return s.ProcedureOut.model_validate(proc)


@router.get("/scope", response_model=list[s.ScopeOut])
def list_scope(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpScope), current_user)
    return [s.ScopeOut.model_validate(i) for i in q.all()]


@router.post("/scope", response_model=s.ScopeOut)
def create_scope(payload: s.ScopeIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpScope(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ScopeOut.model_validate(item)


@router.delete("/scope/{item_id}")
def delete_scope(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpScope, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/rcm", response_model=list[s.RiskControlOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpRiskControl), current_user)
    return [s.RiskControlOut.model_validate(i) for i in q.all()]


@router.post("/rcm", response_model=s.RiskControlOut)
def create_rcm(payload: s.RiskControlIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpRiskControl(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.RiskControlOut.model_validate(item)


@router.delete("/rcm/{item_id}")
def delete_rcm(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpRiskControl, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/rules", response_model=list[s.TestRuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpTestRule), current_user)
    return [s.TestRuleOut.model_validate(i) for i in q.all()]


@router.post("/rules", response_model=s.TestRuleOut)
def create_rule(payload: s.TestRuleIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpTestRule(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.TestRuleOut.model_validate(item)


@router.delete("/rules/{item_id}")
def delete_rule(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpTestRule, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/datasources", response_model=list[s.DataSourceOut])
def list_datasources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpDataSource), current_user)
    return [s.DataSourceOut.model_validate(i) for i in q.all()]


@router.post("/datasources", response_model=s.DataSourceOut)
def create_datasource(payload: s.DataSourceIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpDataSource(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.DataSourceOut.model_validate(item)


@router.delete("/datasources/{item_id}")
def delete_datasource(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpDataSource, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/samples", response_model=list[s.SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpSample), current_user)
    return [s.SampleOut.model_validate(i) for i in q.all()]


@router.post("/samples", response_model=s.SampleOut)
def create_sample(payload: s.SampleIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpSample(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.SampleOut.model_validate(item)


@router.delete("/samples/{item_id}")
def delete_sample(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpSample, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/exceptions", response_model=list[s.ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpException), current_user).order_by(
        m.DataPrivacyDpdpException.created_at.desc()
    )
    return [s.ExceptionOut.model_validate(i) for i in q.all()]


@router.post("/exceptions", response_model=s.ExceptionOut)
def create_exception(payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpException(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


@router.patch("/exceptions/{item_id}", response_model=s.ExceptionOut)
def update_exception(item_id: int, payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpException, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


@router.delete("/exceptions/{item_id}")
def delete_exception(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpException, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/evidence", response_model=list[s.EvidenceOut])
def list_evidence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpEvidence), current_user).order_by(
        m.DataPrivacyDpdpEvidence.created_at.desc()
    )
    return [s.EvidenceOut.model_validate(i) for i in q.all()]


@router.post("/evidence", response_model=s.EvidenceOut)
def create_evidence(payload: s.EvidenceIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpEvidence(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.EvidenceOut.model_validate(item)


@router.delete("/evidence/{item_id}")
def delete_evidence(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpEvidence, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/findings", response_model=list[s.FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpFinding), current_user).order_by(
        m.DataPrivacyDpdpFinding.created_at.desc()
    )
    return [s.FindingOut.model_validate(i) for i in q.all()]


@router.post("/findings", response_model=s.FindingOut)
def create_finding(payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpFinding(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


@router.patch("/findings/{item_id}", response_model=s.FindingOut)
def update_finding(item_id: int, payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpFinding, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


@router.delete("/findings/{item_id}")
def delete_finding(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpFinding, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/actions", response_model=list[s.ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataPrivacyDpdpAction), current_user).order_by(
        m.DataPrivacyDpdpAction.created_at.desc()
    )
    return [s.ActionOut.model_validate(i) for i in q.all()]


@router.post("/actions", response_model=s.ActionOut)
def create_action(payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = m.DataPrivacyDpdpAction(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


@router.patch("/actions/{item_id}", response_model=s.ActionOut)
def update_action(item_id: int, payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpAction, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


@router.delete("/actions/{item_id}")
def delete_action(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.DataPrivacyDpdpAction, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/dashboard", response_model=s.DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)

    procedures = tenant_scoped(db.query(m.DataPrivacyDpdpProcedure), current_user).all()
    total = len(procedures)
    completed = sum(1 for p in procedures if p.status == "completed")
    coverage = round((completed / total) * 100, 1) if total else 0.0

    open_exceptions = (
        tenant_scoped(db.query(m.DataPrivacyDpdpException), current_user)
        .filter(m.DataPrivacyDpdpException.status != "closed")
        .count()
    )
    open_findings = (
        tenant_scoped(db.query(m.DataPrivacyDpdpFinding), current_user)
        .filter(m.DataPrivacyDpdpFinding.status != "closed")
        .count()
    )
    open_actions = (
        tenant_scoped(db.query(m.DataPrivacyDpdpAction), current_user)
        .filter(m.DataPrivacyDpdpAction.status != "done")
        .count()
    )

    high_findings = (
        tenant_scoped(db.query(m.DataPrivacyDpdpFinding), current_user)
        .filter(
            m.DataPrivacyDpdpFinding.status != "closed",
            m.DataPrivacyDpdpFinding.severity.in_(["high", "critical"]),
        )
        .count()
    )
    if high_findings > 0 or open_exceptions > 5:
        risk_score = "high"
    elif open_exceptions > 0 or open_findings > 0:
        risk_score = "medium"
    else:
        risk_score = "low"

    return s.DashboardOut(
        total_procedures=total,
        completed_procedures=completed,
        coverage_pct=coverage,
        open_exceptions=open_exceptions,
        open_findings=open_findings,
        open_actions=open_actions,
        risk_score=risk_score,
    )
