"""API router for the Record-to-Report module."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, UploadFile, File

from app.api.deps import CurrentUser, DbSession

from . import crud
from .analytics import (
    manual_je_risk_scoring, odd_hour_posting, blank_narration,
    sensitive_account_posting, top_value_entries, suspense_ageing,
    post_close_entries, round_number_detection, segregation_of_duties,
    recurring_journal_detection, reversal_pattern, intercompany_elimination,
    close_calendar_status, account_reconciliation_status, gl_vs_subledger,
    dashboard_kpis, scope_coverage, risk_control_matrix, rule_library_summary,
    data_source_summary, sampling_analysis, exception_summary,
    workpaper_summary, observation_summary, capa_tracker,
)
from .dashboard import get_dashboard_data
from .schemas import (
    JECreate, JEOut, JEUpdate,
    ExceptionCreate, ExceptionOut, ExceptionUpdate,
    ReconCreate, ReconOut, ReconUpdate,
    CloseTaskCreate, CloseTaskOut, CloseTaskUpdate,
    FindingCreate, FindingOut, FindingUpdate,
    WorkpaperCreate, WorkpaperOut, WorkpaperUpdate,
    ActionCreate, ActionOut, ActionUpdate,
    RuleCreate, RuleOut, RuleUpdate,
    ScopeCreate, ScopeOut, ScopeUpdate,
    DashboardOut,
)
from .seed import seed_rules, seed_sample_data

router = APIRouter()

MANIFEST = {
    "title": "Record-to-Report & Journal Entries",
    "description": "Analyse GL and Journal Entries to identify high-risk postings, period-end manipulation, reconciliation issues, and segregation of duties violations.",
    "icon": "file-check",
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
# Seed
# =========================================================================
@router.post("/seed")
def seed(current_user: CurrentUser, db: DbSession):
    rules = seed_rules(db, current_user.tenant_id)
    sample = seed_sample_data(db, current_user.tenant_id)
    return {"rules_created": rules, "sample": sample}


# =========================================================================
# Journal Entry CRUD
# =========================================================================
@router.get("/journals", response_model=list[JEOut])
def list_journals(current_user: CurrentUser, db: DbSession):
    return [JEOut.model_validate(j) for j in crud.list_journals(db, current_user.tenant_id)]


@router.post("/journals", response_model=JEOut, status_code=201)
def create_journal(payload: JECreate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump()
    je = crud.create_journal(db, current_user.tenant_id, data, current_user.email)
    return JEOut.model_validate(je)


@router.put("/journals/{je_id}", response_model=JEOut)
def update_journal(je_id: int, payload: JEUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    je = crud.update_journal(db, current_user.tenant_id, je_id, data)
    if not je:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return JEOut.model_validate(je)


@router.delete("/journals/{je_id}")
def delete_journal(je_id: int, current_user: CurrentUser, db: DbSession):
    ok = crud.delete_journal(db, current_user.tenant_id, je_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"ok": True}


# =========================================================================
# Upload (CSV/JSON bulk)
# =========================================================================
@router.post("/upload")
async def upload_journals(entries: list[JECreate], current_user: CurrentUser, db: DbSession):
    count = crud.bulk_create_journals(db, current_user.tenant_id, [e.model_dump() for e in entries], current_user.email)
    return {"uploaded": count}


# =========================================================================
# Risk Analysis
# =========================================================================
@router.post("/risk-analysis")
def run_risk_analysis(current_user: CurrentUser, db: DbSession):
    from .service import run_risk_scoring
    result = run_risk_scoring(db, current_user.tenant_id)
    return result


# =========================================================================
# 25 Analytics Endpoints
# =========================================================================
@router.get("/analytics/manual-risk")
def analytics_manual_risk(current_user: CurrentUser, db: DbSession):
    return manual_je_risk_scoring(db, current_user.tenant_id)


@router.get("/analytics/odd-hour")
def analytics_odd_hour(current_user: CurrentUser, db: DbSession):
    return odd_hour_posting(db, current_user.tenant_id)


@router.get("/analytics/blank-narration")
def analytics_blank_narration(current_user: CurrentUser, db: DbSession):
    return blank_narration(db, current_user.tenant_id)


@router.get("/analytics/sensitive-account")
def analytics_sensitive(current_user: CurrentUser, db: DbSession):
    return sensitive_account_posting(db, current_user.tenant_id)


@router.get("/analytics/top-value")
def analytics_top_value(current_user: CurrentUser, db: DbSession):
    return top_value_entries(db, current_user.tenant_id)


@router.get("/analytics/suspense-ageing")
def analytics_suspense_ageing(current_user: CurrentUser, db: DbSession):
    return suspense_ageing(db, current_user.tenant_id)


@router.get("/analytics/post-close")
def analytics_post_close(current_user: CurrentUser, db: DbSession):
    return post_close_entries(db, current_user.tenant_id)


@router.get("/analytics/round-number")
def analytics_round_number(current_user: CurrentUser, db: DbSession):
    return round_number_detection(db, current_user.tenant_id)


@router.get("/analytics/sod")
def analytics_sod(current_user: CurrentUser, db: DbSession):
    return segregation_of_duties(db, current_user.tenant_id)


@router.get("/analytics/recurring")
def analytics_recurring(current_user: CurrentUser, db: DbSession):
    return recurring_journal_detection(db, current_user.tenant_id)


@router.get("/analytics/reversal")
def analytics_reversal(current_user: CurrentUser, db: DbSession):
    return reversal_pattern(db, current_user.tenant_id)


@router.get("/analytics/intercompany")
def analytics_intercompany(current_user: CurrentUser, db: DbSession):
    return intercompany_elimination(db, current_user.tenant_id)


@router.get("/analytics/close-calendar")
def analytics_close_calendar(current_user: CurrentUser, db: DbSession):
    return close_calendar_status(db, current_user.tenant_id)


@router.get("/analytics/reconciliation")
def analytics_reconciliation(current_user: CurrentUser, db: DbSession):
    return account_reconciliation_status(db, current_user.tenant_id)


@router.get("/analytics/gl-subledger")
def analytics_gl_subledger(current_user: CurrentUser, db: DbSession):
    return gl_vs_subledger(db, current_user.tenant_id)


@router.get("/analytics/kpis")
def analytics_kpis(current_user: CurrentUser, db: DbSession):
    return dashboard_kpis(db, current_user.tenant_id)


@router.get("/analytics/scope")
def analytics_scope(current_user: CurrentUser, db: DbSession):
    return scope_coverage(db, current_user.tenant_id)


@router.get("/analytics/rcm")
def analytics_rcm(current_user: CurrentUser, db: DbSession):
    return risk_control_matrix(db, current_user.tenant_id)


@router.get("/analytics/rules")
def analytics_rules(current_user: CurrentUser, db: DbSession):
    return rule_library_summary(db, current_user.tenant_id)


@router.get("/analytics/data-sources")
def analytics_data_sources(current_user: CurrentUser, db: DbSession):
    return data_source_summary(db, current_user.tenant_id)


@router.get("/analytics/sampling")
def analytics_sampling(current_user: CurrentUser, db: DbSession):
    return sampling_analysis(db, current_user.tenant_id)


@router.get("/analytics/exceptions")
def analytics_exceptions(current_user: CurrentUser, db: DbSession):
    return exception_summary(db, current_user.tenant_id)


@router.get("/analytics/workpapers")
def analytics_workpapers(current_user: CurrentUser, db: DbSession):
    return workpaper_summary(db, current_user.tenant_id)


@router.get("/analytics/observations")
def analytics_observations(current_user: CurrentUser, db: DbSession):
    return observation_summary(db, current_user.tenant_id)


@router.get("/analytics/capa")
def analytics_capa(current_user: CurrentUser, db: DbSession):
    return capa_tracker(db, current_user.tenant_id)


# =========================================================================
# Exception CRUD
# =========================================================================
@router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    return [ExceptionOut.model_validate(e) for e in crud.list_exceptions(db, current_user.tenant_id)]


@router.post("/exceptions", response_model=ExceptionOut, status_code=201)
def create_exception(payload: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    exc = crud.create_exception(db, current_user.tenant_id, payload.model_dump())
    return ExceptionOut.model_validate(exc)


@router.put("/exceptions/{exc_id}", response_model=ExceptionOut)
def update_exception(exc_id: int, payload: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    exc = crud.update_exception(db, current_user.tenant_id, exc_id, data)
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    return ExceptionOut.model_validate(exc)


# =========================================================================
# Reconciliation CRUD
# =========================================================================
@router.get("/reconciliations", response_model=list[ReconOut])
def list_reconciliations(current_user: CurrentUser, db: DbSession):
    return [ReconOut.model_validate(r) for r in crud.list_reconciliations(db, current_user.tenant_id)]


@router.post("/reconciliations", response_model=ReconOut, status_code=201)
def create_reconciliation(payload: ReconCreate, current_user: CurrentUser, db: DbSession):
    recon = crud.create_reconciliation(db, current_user.tenant_id, payload.model_dump())
    return ReconOut.model_validate(recon)


@router.put("/reconciliations/{recon_id}", response_model=ReconOut)
def update_reconciliation(recon_id: int, payload: ReconUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    recon = crud.update_reconciliation(db, current_user.tenant_id, recon_id, data)
    if not recon:
        raise HTTPException(status_code=404, detail="Reconciliation not found")
    return ReconOut.model_validate(recon)


# =========================================================================
# Close Task CRUD
# =========================================================================
@router.get("/close-tasks", response_model=list[CloseTaskOut])
def list_close_tasks(current_user: CurrentUser, db: DbSession):
    return [CloseTaskOut.model_validate(t) for t in crud.list_close_tasks(db, current_user.tenant_id)]


@router.post("/close-tasks", response_model=CloseTaskOut, status_code=201)
def create_close_task(payload: CloseTaskCreate, current_user: CurrentUser, db: DbSession):
    task = crud.create_close_task(db, current_user.tenant_id, payload.model_dump())
    return CloseTaskOut.model_validate(task)


@router.put("/close-tasks/{task_id}", response_model=CloseTaskOut)
def update_close_task(task_id: int, payload: CloseTaskUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    task = crud.update_close_task(db, current_user.tenant_id, task_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Close task not found")
    return CloseTaskOut.model_validate(task)


# =========================================================================
# Finding CRUD
# =========================================================================
@router.get("/findings", response_model=list[FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    return [FindingOut.model_validate(f) for f in crud.list_findings(db, current_user.tenant_id)]


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(payload: FindingCreate, current_user: CurrentUser, db: DbSession):
    finding = crud.create_finding(db, current_user.tenant_id, payload.model_dump())
    return FindingOut.model_validate(finding)


@router.put("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: int, payload: FindingUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    finding = crud.update_finding(db, current_user.tenant_id, finding_id, data)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return FindingOut.model_validate(finding)


# =========================================================================
# Workpaper CRUD
# =========================================================================
@router.get("/workpapers", response_model=list[WorkpaperOut])
def list_workpapers(current_user: CurrentUser, db: DbSession):
    return [WorkpaperOut.model_validate(w) for w in crud.list_workpapers(db, current_user.tenant_id)]


@router.post("/workpapers", response_model=WorkpaperOut, status_code=201)
def create_workpaper(payload: WorkpaperCreate, current_user: CurrentUser, db: DbSession):
    wp = crud.create_workpaper(db, current_user.tenant_id, payload.model_dump())
    return WorkpaperOut.model_validate(wp)


@router.put("/workpapers/{wp_id}", response_model=WorkpaperOut)
def update_workpaper(wp_id: int, payload: WorkpaperUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    wp = crud.update_workpaper(db, current_user.tenant_id, wp_id, data)
    if not wp:
        raise HTTPException(status_code=404, detail="Workpaper not found")
    return WorkpaperOut.model_validate(wp)


# =========================================================================
# Action / CAPA CRUD
# =========================================================================
@router.get("/actions", response_model=list[ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    return [ActionOut.model_validate(a) for a in crud.list_actions(db, current_user.tenant_id)]


@router.post("/actions", response_model=ActionOut, status_code=201)
def create_action(payload: ActionCreate, current_user: CurrentUser, db: DbSession):
    action = crud.create_action(db, current_user.tenant_id, payload.model_dump())
    return ActionOut.model_validate(action)


@router.put("/actions/{action_id}", response_model=ActionOut)
def update_action(action_id: int, payload: ActionUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    action = crud.update_action(db, current_user.tenant_id, action_id, data)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return ActionOut.model_validate(action)


# =========================================================================
# Rule CRUD
# =========================================================================
@router.get("/rules", response_model=list[RuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    return [RuleOut.model_validate(r) for r in crud.list_rules(db, current_user.tenant_id)]


@router.post("/rules", response_model=RuleOut, status_code=201)
def create_rule(payload: RuleCreate, current_user: CurrentUser, db: DbSession):
    rule = crud.create_rule(db, current_user.tenant_id, payload.model_dump())
    return RuleOut.model_validate(rule)


@router.put("/rules/{rule_id}", response_model=RuleOut)
def update_rule(rule_id: int, payload: RuleUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    rule = crud.update_rule(db, current_user.tenant_id, rule_id, data)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return RuleOut.model_validate(rule)


# =========================================================================
# Scope CRUD
# =========================================================================
@router.get("/scopes", response_model=list[ScopeOut])
def list_scopes(current_user: CurrentUser, db: DbSession):
    return [ScopeOut.model_validate(s) for s in crud.list_scopes(db, current_user.tenant_id)]


@router.post("/scopes", response_model=ScopeOut, status_code=201)
def create_scope(payload: ScopeCreate, current_user: CurrentUser, db: DbSession):
    scope = crud.create_scope(db, current_user.tenant_id, payload.model_dump())
    return ScopeOut.model_validate(scope)


@router.put("/scopes/{scope_id}", response_model=ScopeOut)
def update_scope(scope_id: int, payload: ScopeUpdate, current_user: CurrentUser, db: DbSession):
    data = payload.model_dump(exclude_unset=True)
    scope = crud.update_scope(db, current_user.tenant_id, scope_id, data)
    if not scope:
        raise HTTPException(status_code=404, detail="Scope not found")
    return ScopeOut.model_validate(scope)
