"""Thin route handlers for Item Material Master Governance.

Each handler delegates to the service layer after dependency injection.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DbSession

from .schemas import (
    AnalyticsRequest,
    AnalyticsResponse,
    DashboardStats,
    ExceptionCreate,
    ExceptionOut,
    ExceptionUpdate,
    FindingCreate,
    FindingOut,
    FindingUpdate,
    ItemCreate,
    ItemOut,
    ItemUpdate,
    RemediationCreate,
    RemediationOut,
    RemediationUpdate,
)
from .service import ItemGovernanceService

logger = logging.getLogger(__name__)

api_router = APIRouter()


def get_service(
    db: DbSession,
    current_user: CurrentUser,
) -> ItemGovernanceService:
    return ItemGovernanceService(db=db, current_user=current_user)


ServiceDep = Annotated[ItemGovernanceService, Depends(get_service)]


# ── Dashboard ───────────────────────────────────────────────────────────────

@api_router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(svc: ServiceDep):
    return svc.get_dashboard_stats()


# ── Items CRUD ──────────────────────────────────────────────────────────────

@api_router.get("/items", response_model=list[ItemOut])
def list_items(
    svc: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    items = svc.list_items(skip=skip, limit=limit)
    return [ItemOut.model_validate(i) for i in items]


@api_router.get("/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int, svc: ServiceDep):
    item = svc.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemOut.model_validate(item)


@api_router.post("/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(body: ItemCreate, svc: ServiceDep):
    item = svc.create_item(body.model_dump())
    return ItemOut.model_validate(item)


@api_router.put("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, body: ItemUpdate, svc: ServiceDep):
    item = svc.update_item(item_id, body.model_dump(exclude_none=True))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemOut.model_validate(item)


@api_router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, svc: ServiceDep):
    if not svc.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found")


# ── Analytics ───────────────────────────────────────────────────────────────

@api_router.post("/analytics/duplicate", response_model=AnalyticsResponse)
def run_duplicate_analysis(svc: ServiceDep):
    results = svc.run_duplicate_check()
    return AnalyticsResponse(
        rule_type="duplicate",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/master-completeness", response_model=AnalyticsResponse)
def run_completeness_analysis(svc: ServiceDep):
    results = svc.run_completeness_check()
    return AnalyticsResponse(
        rule_type="master_completeness",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/hsn", response_model=AnalyticsResponse)
def run_hsn_analysis(svc: ServiceDep):
    results = svc.run_hsn_check()
    return AnalyticsResponse(
        rule_type="hsn",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/uom", response_model=AnalyticsResponse)
def run_uom_analysis(svc: ServiceDep):
    results = svc.run_uom_check()
    return AnalyticsResponse(
        rule_type="uom",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/valuation", response_model=AnalyticsResponse)
def run_valuation_analysis(svc: ServiceDep):
    results = svc.run_valuation_check()
    return AnalyticsResponse(
        rule_type="valuation",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/dead-stock", response_model=AnalyticsResponse)
def run_dead_stock_analysis(body: AnalyticsRequest, svc: ServiceDep):
    threshold = body.threshold_days or 180
    results = svc.run_dead_stock_check(threshold_days=threshold)
    return AnalyticsResponse(
        rule_type="dead_stock",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/bom", response_model=AnalyticsResponse)
def run_bom_analysis(svc: ServiceDep):
    results = svc.run_bom_check()
    return AnalyticsResponse(
        rule_type="bom",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/workflow", response_model=AnalyticsResponse)
def run_workflow_analysis(svc: ServiceDep):
    results = svc.run_workflow_check()
    return AnalyticsResponse(
        rule_type="workflow",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/naming", response_model=AnalyticsResponse)
def run_naming_analysis(svc: ServiceDep):
    results = svc.run_naming_check()
    return AnalyticsResponse(
        rule_type="naming",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/cross-plant", response_model=AnalyticsResponse)
def run_cross_plant_analysis(svc: ServiceDep):
    results = svc.run_cross_plant_check()
    return AnalyticsResponse(
        rule_type="cross_plant",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.post("/analytics/reorder", response_model=AnalyticsResponse)
def run_reorder_analysis(svc: ServiceDep):
    results = svc.run_reorder_check()
    return AnalyticsResponse(
        rule_type="reorder",
        total_checked=len(results),
        issues_found=len(results),
        results=results,
    )


@api_router.get("/analytics/cost-history", response_model=list[dict])
def get_cost_audit_history(
    svc: ServiceDep,
    item_id: int | None = Query(None),
):
    return svc.get_cost_audit_history(item_id=item_id)


# ── Exceptions ──────────────────────────────────────────────────────────────

@api_router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(
    svc: ServiceDep,
    exception_type: str | None = Query(None),
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    excs = svc.list_exceptions(
        exception_type=exception_type, status=status, skip=skip, limit=limit
    )
    return [ExceptionOut.model_validate(e) for e in excs]


@api_router.put("/exceptions/{exception_id}", response_model=ExceptionOut)
def update_exception(exception_id: int, body: ExceptionUpdate, svc: ServiceDep):
    exc = svc.update_exception(exception_id, body.model_dump(exclude_none=True))
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    return ExceptionOut.model_validate(exc)


# ── Findings ────────────────────────────────────────────────────────────────

@api_router.get("/findings", response_model=list[FindingOut])
def list_findings(
    svc: ServiceDep,
    finding_type: str | None = Query(None),
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    findings = svc.list_findings(
        finding_type=finding_type, status=status, skip=skip, limit=limit
    )
    return [FindingOut.model_validate(f) for f in findings]


@api_router.post("/findings", response_model=FindingOut, status_code=status.HTTP_201_CREATED)
def create_finding(body: FindingCreate, svc: ServiceDep):
    finding = svc.create_finding(body.model_dump())
    return FindingOut.model_validate(finding)


@api_router.put("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: int, body: FindingUpdate, svc: ServiceDep):
    finding = svc.update_finding(finding_id, body.model_dump(exclude_none=True))
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return FindingOut.model_validate(finding)


# ── Remediation ─────────────────────────────────────────────────────────────

@api_router.get("/remediation", response_model=list[RemediationOut])
def list_remediations(
    svc: ServiceDep,
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    rems = svc.list_remediations(status=status, skip=skip, limit=limit)
    return [RemediationOut.model_validate(r) for r in rems]


@api_router.post("/remediation", response_model=RemediationOut, status_code=status.HTTP_201_CREATED)
def create_remediation(body: RemediationCreate, svc: ServiceDep):
    rem = svc.create_remediation(body.model_dump())
    return RemediationOut.model_validate(rem)


@api_router.put("/remediation/{remediation_id}", response_model=RemediationOut)
def update_remediation(remediation_id: int, body: RemediationUpdate, svc: ServiceDep):
    rem = svc.update_remediation(remediation_id, body.model_dump(exclude_none=True))
    if not rem:
        raise HTTPException(status_code=404, detail="Remediation not found")
    return RemediationOut.model_validate(rem)
