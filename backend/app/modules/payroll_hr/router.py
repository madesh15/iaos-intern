"""Payroll & HR Audit module.

Mounted at /api/modules/payroll_hr. Two layers, both tenant-isolated:

  Signature tests   → the 15 payroll/HR-specific red-flag rules, held as
                       rows in the Rule Library (`/rules`) and evaluated
                       into the Exception Queue (`/exceptions`).
  Shell screens      → the ten platform screens every audit module ships
                       with: Dashboard, Scope, RCM, Rule Library, Data
                       Sources, Sampling, Exceptions, Evidence, Findings,
                       Actions.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import models as m
from . import schemas as s

MANIFEST = {
    "name": "payroll_hr",
    "title": "Payroll & HR Audit",
    "description": "Ghost-employee, overtime, and statutory-deduction red-flag testing "
    "plus full scope-to-remediation audit workflow for the payroll & HR cycle.",
    "icon": "wallet",
    "group": "Finance & Close",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()

# ── Signature test catalogue (seeded once per tenant) ──────────────────
SIGNATURE_RULES: list[dict] = [
    {"code": "PHR-01", "name": "Ghost-Employee Detection",
     "description": "Flags duplicate employee accounts and records with no attendance or PAN on file.",
     "threshold": "No attendance in period AND missing PAN"},
    {"code": "PHR-02", "name": "Attendance-to-Pay Reconciliation",
     "description": "Compares paid days against biometric/attendance logs.",
     "threshold": "Paid days > logged days"},
    {"code": "PHR-03", "name": "Overtime Abnormality",
     "description": "Flags excess overtime by department or individual against policy norms.",
     "threshold": "OT hours > 25% of regular hours"},
    {"code": "PHR-04", "name": "Full-and-Final Settlement",
     "description": "Checks dues recovery and correctness on employee exit.",
     "threshold": "F&F not settled within 45 days of exit"},
    {"code": "PHR-05", "name": "Reimbursement vs Entitlement",
     "description": "Validates expense claims against policy entitlement limits.",
     "threshold": "Claim amount > policy limit"},
    {"code": "PHR-06", "name": "Duplicate Bank Accounts",
     "description": "Detects the same bank account used across multiple employee records.",
     "threshold": "Account number shared by 2+ employee IDs"},
    {"code": "PHR-07", "name": "Salary Revision & Arrears",
     "description": "Flags unauthorised increments or arrears payments.",
     "threshold": "Revision without approval reference"},
    {"code": "PHR-08", "name": "Statutory Deduction Accuracy",
     "description": "Recomputes PF/ESI/PT/TDS and compares to amounts deducted.",
     "threshold": "Computed vs deducted variance > 1%"},
    {"code": "PHR-09", "name": "Loan & Advance Recovery",
     "description": "Tracks recovery of employee loans and salary advances.",
     "threshold": "No recovery instalment in 2+ consecutive cycles"},
    {"code": "PHR-10", "name": "Payroll Register Analytics",
     "description": "Statistical outlier detection on gross/net pay across the register.",
     "threshold": "Pay > mean + 3 std. dev. for grade"},
    {"code": "PHR-11", "name": "New-Joiner / Exit Controls",
     "description": "Checks timely addition and removal of employees from payroll.",
     "threshold": "Payroll entry >7 days after joining/exit date"},
    {"code": "PHR-12", "name": "Leave & Encashment",
     "description": "Tests leave balance accuracy and encashment payout calculations.",
     "threshold": "Encashment days > available balance"},
    {"code": "PHR-13", "name": "Contractor vs Payroll Split",
     "description": "Identifies contract labour misclassified as payroll employees, or vice versa.",
     "threshold": "Contractor with payroll-pattern payments"},
    {"code": "PHR-14", "name": "Incentive & Bonus Payout",
     "description": "Validates incentive/bonus payouts against scheme rules and performance data.",
     "threshold": "Payout without matching scheme criteria met"},
    {"code": "PHR-15", "name": "Headcount vs Cost Reconciliation",
     "description": "Reconciles HRMS headcount to total payroll cost booked in the GL.",
     "threshold": "Variance > 2% of budgeted headcount cost"},
]


def _seed_rules_if_empty(db, current_user):
    exists = tenant_scoped(db.query(m.Rule), current_user).first()
    if exists:
        return
    for r in SIGNATURE_RULES:
        db.add(m.Rule(
            code=r["code"], name=r["name"], category="Signature",
            description=r["description"], threshold=r["threshold"],
            enabled=True, tenant_id=current_user.tenant_id,
        ))
    db.commit()


# ── Scope & Audit Universe ─────────────────────────────────────────────
@router.get("/scope", response_model=list[s.ScopeUnitOut])
def list_scope(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.ScopeUnit), current_user).order_by(m.ScopeUnit.id.desc())
    return [s.ScopeUnitOut.model_validate(x) for x in q.all()]


@router.post("/scope", response_model=s.ScopeUnitOut, status_code=201)
def create_scope(body: s.ScopeUnitCreate, current_user: CurrentUser, db: DbSession):
    row = m.ScopeUnit(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ScopeUnitOut.model_validate(row)


@router.delete("/scope/{row_id}", status_code=204)
def delete_scope(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.ScopeUnit).filter(m.ScopeUnit.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Scope unit not found")
    db.delete(row)
    db.commit()


# ── Risk & Control Matrix ──────────────────────────────────────────────
@router.get("/rcm", response_model=list[s.RcmEntryOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RcmEntry), current_user).order_by(m.RcmEntry.id.desc())
    return [s.RcmEntryOut.model_validate(x) for x in q.all()]


@router.post("/rcm", response_model=s.RcmEntryOut, status_code=201)
def create_rcm(body: s.RcmEntryCreate, current_user: CurrentUser, db: DbSession):
    row = m.RcmEntry(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.RcmEntryOut.model_validate(row)


@router.delete("/rcm/{row_id}", status_code=204)
def delete_rcm(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.RcmEntry).filter(m.RcmEntry.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "RCM entry not found")
    db.delete(row)
    db.commit()


# ── Test & Analytics Rule Library ──────────────────────────────────────
@router.get("/rules", response_model=list[s.RuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    _seed_rules_if_empty(db, current_user)
    q = tenant_scoped(db.query(m.Rule), current_user).order_by(m.Rule.code, m.Rule.id)
    return [s.RuleOut.model_validate(x) for x in q.all()]


@router.post("/rules", response_model=s.RuleOut, status_code=201)
def create_rule(body: s.RuleCreate, current_user: CurrentUser, db: DbSession):
    row = m.Rule(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.RuleOut.model_validate(row)


@router.patch("/rules/{rule_id}", response_model=s.RuleOut)
def update_rule(rule_id: int, body: s.RuleUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Rule).filter(m.Rule.id == rule_id), current_user).first()
    if not row:
        raise HTTPException(404, "Rule not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.RuleOut.model_validate(row)


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Rule).filter(m.Rule.id == rule_id), current_user).first()
    if not row:
        raise HTTPException(404, "Rule not found")
    if row.category == "Signature":
        raise HTTPException(400, "Signature tests are fixed — disable instead of deleting.")
    db.delete(row)
    db.commit()


@router.post("/rules/{rule_id}/run", response_model=s.ExceptionOut, status_code=201)
def run_rule(rule_id: int, current_user: CurrentUser, db: DbSession):
    """Raise a red-flag exception against this rule for manual population against source data."""
    rule = tenant_scoped(db.query(m.Rule).filter(m.Rule.id == rule_id), current_user).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    row = m.Exception_(
        rule_id=rule.id, rule_name=rule.name,
        reference="", detail=f"Raised from rule {rule.code}: {rule.threshold}",
        severity="Medium", status="Open", disposition="",
        tenant_id=current_user.tenant_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ExceptionOut.model_validate(row)


# ── Data Source & Connector Setup ──────────────────────────────────────
@router.get("/sources", response_model=list[s.DataSourceOut])
def list_sources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.DataSource), current_user).order_by(m.DataSource.id.desc())
    return [s.DataSourceOut.model_validate(x) for x in q.all()]


@router.post("/sources", response_model=s.DataSourceOut, status_code=201)
def create_source(body: s.DataSourceCreate, current_user: CurrentUser, db: DbSession):
    row = m.DataSource(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.DataSourceOut.model_validate(row)


@router.delete("/sources/{row_id}", status_code=204)
def delete_source(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.DataSource).filter(m.DataSource.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Data source not found")
    db.delete(row)
    db.commit()


# ── Sampling & Population Builder ──────────────────────────────────────
@router.get("/samples", response_model=list[s.SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.Sample), current_user).order_by(m.Sample.id.desc())
    return [s.SampleOut.model_validate(x) for x in q.all()]


@router.post("/samples", response_model=s.SampleOut, status_code=201)
def create_sample(body: s.SampleCreate, current_user: CurrentUser, db: DbSession):
    row = m.Sample(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.SampleOut.model_validate(row)


@router.delete("/samples/{row_id}", status_code=204)
def delete_sample(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Sample).filter(m.Sample.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Sample not found")
    db.delete(row)
    db.commit()


# ── Exception & Red-Flag Queue ─────────────────────────────────────────
@router.get("/exceptions", response_model=list[s.ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.Exception_), current_user).order_by(m.Exception_.id.desc())
    return [s.ExceptionOut.model_validate(x) for x in q.all()]


@router.post("/exceptions", response_model=s.ExceptionOut, status_code=201)
def create_exception(body: s.ExceptionCreate, current_user: CurrentUser, db: DbSession):
    rule_name = ""
    if body.rule_id:
        rule = tenant_scoped(db.query(m.Rule).filter(m.Rule.id == body.rule_id), current_user).first()
        rule_name = rule.name if rule else ""
    row = m.Exception_(**body.model_dump(), rule_name=rule_name, tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ExceptionOut.model_validate(row)


@router.patch("/exceptions/{row_id}", response_model=s.ExceptionOut)
def update_exception(row_id: int, body: s.ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Exception_).filter(m.Exception_.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.ExceptionOut.model_validate(row)


@router.delete("/exceptions/{row_id}", status_code=204)
def delete_exception(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Exception_).filter(m.Exception_.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    db.delete(row)
    db.commit()


# ── Working Papers & Evidence ──────────────────────────────────────────
@router.get("/evidence", response_model=list[s.EvidenceOut])
def list_evidence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.Evidence), current_user).order_by(m.Evidence.id.desc())
    return [s.EvidenceOut.model_validate(x) for x in q.all()]


@router.post("/evidence", response_model=s.EvidenceOut, status_code=201)
def create_evidence(body: s.EvidenceCreate, current_user: CurrentUser, db: DbSession):
    row = m.Evidence(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.EvidenceOut.model_validate(row)


@router.delete("/evidence/{row_id}", status_code=204)
def delete_evidence(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.Evidence).filter(m.Evidence.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Evidence not found")
    db.delete(row)
    db.commit()


# ── Observation & Finding Log ──────────────────────────────────────────
@router.get("/findings", response_model=list[s.FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.PayrollFinding), current_user).order_by(m.PayrollFinding.id.desc())
    return [s.FindingOut.model_validate(x) for x in q.all()]


@router.post("/findings", response_model=s.FindingOut, status_code=201)
def create_finding(body: s.FindingCreate, current_user: CurrentUser, db: DbSession):
    row = m.PayrollFinding(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.FindingOut.model_validate(row)


@router.patch("/findings/{row_id}", response_model=s.FindingOut)
def update_finding(row_id: int, body: s.FindingUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.PayrollFinding).filter(m.PayrollFinding.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.FindingOut.model_validate(row)


@router.delete("/findings/{row_id}", status_code=204)
def delete_finding(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.PayrollFinding).filter(m.PayrollFinding.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    db.delete(row)
    db.commit()


# ── Remediation / Action Tracker ───────────────────────────────────────
@router.get("/actions", response_model=list[s.ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.ActionItem), current_user).order_by(m.ActionItem.id.desc())
    return [s.ActionOut.model_validate(x) for x in q.all()]


@router.post("/actions", response_model=s.ActionOut, status_code=201)
def create_action(body: s.ActionCreate, current_user: CurrentUser, db: DbSession):
    finding_title = ""
    if body.finding_id:
        f = tenant_scoped(db.query(m.PayrollFinding).filter(m.PayrollFinding.id == body.finding_id), current_user).first()
        finding_title = f.title if f else ""
    row = m.ActionItem(**body.model_dump(), finding_title=finding_title, tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ActionOut.model_validate(row)


@router.patch("/actions/{row_id}", response_model=s.ActionOut)
def update_action(row_id: int, body: s.ActionUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.ActionItem).filter(m.ActionItem.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Action not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.ActionOut.model_validate(row)


@router.delete("/actions/{row_id}", status_code=204)
def delete_action(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(m.ActionItem).filter(m.ActionItem.id == row_id), current_user).first()
    if not row:
        raise HTTPException(404, "Action not found")
    db.delete(row)
    db.commit()


# ── Module Dashboard & KPIs ─────────────────────────────────────────────
@router.get("/dashboard", response_model=s.DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession):
    _seed_rules_if_empty(db, current_user)

    scope = tenant_scoped(db.query(m.ScopeUnit), current_user).all()
    rules = tenant_scoped(db.query(m.Rule), current_user).all()
    exceptions = tenant_scoped(db.query(m.Exception_), current_user).all()
    findings = tenant_scoped(db.query(m.PayrollFinding), current_user).all()
    actions = tenant_scoped(db.query(m.ActionItem), current_user).all()

    in_scope = [u for u in scope if u.in_scope]
    open_exc = [e for e in exceptions if e.status == "Open"]
    sev_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for e in open_exc:
        sev_counts[e.severity] = sev_counts.get(e.severity, 0) + 1

    open_findings = [f for f in findings if f.status != "Closed"]
    status_counts: dict[str, int] = {}
    for f in findings:
        status_counts[f.status] = status_counts.get(f.status, 0) + 1

    open_actions = [a for a in actions if a.status != "Completed"]
    overdue = 0
    from datetime import date as _date
    today = _date.today()
    for a in open_actions:
        if a.due_date and a.due_date < today:
            overdue += 1

    coverage_pct = round((len(in_scope) / len(scope) * 100), 1) if scope else 0.0
    rules_enabled = len([r for r in rules if r.enabled])

    # Simple composite risk score: weighted open high/critical exceptions +
    # open findings + overdue actions, capped at 100.
    risk_score = min(
        100,
        sev_counts.get("Critical", 0) * 15
        + sev_counts.get("High", 0) * 8
        + len(open_findings) * 5
        + overdue * 6,
    )

    return s.DashboardOut(
        scope_units=len(scope),
        scope_in_scope=len(in_scope),
        coverage_pct=coverage_pct,
        rules_enabled=rules_enabled,
        rules_total=len(rules),
        open_exceptions=len(open_exc),
        exceptions_by_severity=sev_counts,
        open_findings=len(open_findings),
        findings_by_status=status_counts,
        actions_open=len(open_actions),
        actions_overdue=overdue,
        risk_score=risk_score,
    )
