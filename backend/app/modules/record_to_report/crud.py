"""CRUD operations for the Record-to-Report module."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from .models import (
    JournalEntry,
    R2RException,
    R2RReconciliation,
    R2RCloseTask,
    R2RFinding,
    R2RWorkpaper,
    R2RAction,
    R2RRule,
    R2RAuditScope,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _parse_date(val: Optional[str]) -> Optional[datetime]:
    if not val:
        return None
    try:
        return datetime.fromisoformat(val.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


# ---------------------------------------------------------------------------
# Journal Entry CRUD
# ---------------------------------------------------------------------------
def list_journals(db: Session, tenant_id: int) -> Sequence[JournalEntry]:
    return db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id).order_by(JournalEntry.id.desc()).all()


def get_journal(db: Session, tenant_id: int, je_id: int) -> Optional[JournalEntry]:
    return db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id, JournalEntry.id == je_id).first()


def create_journal(db: Session, tenant_id: int, data: dict, user_email: str = "") -> JournalEntry:
    je = JournalEntry(tenant_id=tenant_id, created_by=user_email, modified_by=user_email, **data)
    db.add(je)
    db.commit()
    db.refresh(je)
    return je


def bulk_create_journals(db: Session, tenant_id: int, entries: list[dict], user_email: str = "") -> int:
    count = 0
    for data in entries:
        je = JournalEntry(tenant_id=tenant_id, created_by=user_email, **data)
        db.add(je)
        count += 1
    db.commit()
    return count


def update_journal(db: Session, tenant_id: int, je_id: int, data: dict) -> Optional[JournalEntry]:
    je = get_journal(db, tenant_id, je_id)
    if not je:
        return None
    for field, value in data.items():
        setattr(je, field, value)
    je.modified_by = data.get("modified_by", je.modified_by)
    db.commit()
    db.refresh(je)
    return je


def delete_journal(db: Session, tenant_id: int, je_id: int) -> bool:
    je = get_journal(db, tenant_id, je_id)
    if not je:
        return False
    db.delete(je)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Exception CRUD
# ---------------------------------------------------------------------------
def list_exceptions(db: Session, tenant_id: int) -> Sequence[R2RException]:
    return db.query(R2RException).filter(R2RException.tenant_id == tenant_id).order_by(R2RException.id.desc()).all()


def create_exception(db: Session, tenant_id: int, data: dict) -> R2RException:
    exc = R2RException(tenant_id=tenant_id, **data)
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return exc


def update_exception(db: Session, tenant_id: int, exc_id: int, data: dict) -> Optional[R2RException]:
    exc = db.query(R2RException).filter(R2RException.tenant_id == tenant_id, R2RException.id == exc_id).first()
    if not exc:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(exc, field, value)
    if data.get("status") in ("resolved", "closed"):
        exc.resolved_date = _utcnow()
    db.commit()
    db.refresh(exc)
    return exc


# ---------------------------------------------------------------------------
# Reconciliation CRUD
# ---------------------------------------------------------------------------
def list_reconciliations(db: Session, tenant_id: int) -> Sequence[R2RReconciliation]:
    return db.query(R2RReconciliation).filter(R2RReconciliation.tenant_id == tenant_id).all()


def create_reconciliation(db: Session, tenant_id: int, data: dict) -> R2RReconciliation:
    recon = R2RReconciliation(tenant_id=tenant_id, **data)
    recon.difference = (data.get("gl_balance") or 0) - (data.get("subledger_balance") or 0)
    db.add(recon)
    db.commit()
    db.refresh(recon)
    return recon


def update_reconciliation(db: Session, tenant_id: int, recon_id: int, data: dict) -> Optional[R2RReconciliation]:
    recon = db.query(R2RReconciliation).filter(R2RReconciliation.tenant_id == tenant_id, R2RReconciliation.id == recon_id).first()
    if not recon:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(recon, field, value)
    recon.difference = recon.gl_balance - recon.subledger_balance
    if data.get("status") in ("approved", "closed"):
        recon.approved_date = _utcnow()
    db.commit()
    db.refresh(recon)
    return recon


# ---------------------------------------------------------------------------
# Close Task CRUD
# ---------------------------------------------------------------------------
def list_close_tasks(db: Session, tenant_id: int) -> Sequence[R2RCloseTask]:
    return db.query(R2RCloseTask).filter(R2RCloseTask.tenant_id == tenant_id).all()


def create_close_task(db: Session, tenant_id: int, data: dict) -> R2RCloseTask:
    task = R2RCloseTask(tenant_id=tenant_id, **data)
    if data.get("due_date"):
        task.due_date = _parse_date(data["due_date"])
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_close_task(db: Session, tenant_id: int, task_id: int, data: dict) -> Optional[R2RCloseTask]:
    task = db.query(R2RCloseTask).filter(R2RCloseTask.tenant_id == tenant_id, R2RCloseTask.id == task_id).first()
    if not task:
        return None
    for field, value in data.items():
        if field == "due_date" or field == "completed_date":
            setattr(task, field, _parse_date(value))
        elif value is not None:
            setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


# ---------------------------------------------------------------------------
# Finding CRUD
# ---------------------------------------------------------------------------
def list_findings(db: Session, tenant_id: int) -> Sequence[R2RFinding]:
    return db.query(R2RFinding).filter(R2RFinding.tenant_id == tenant_id).order_by(R2RFinding.id.desc()).all()


def create_finding(db: Session, tenant_id: int, data: dict) -> R2RFinding:
    finding = R2RFinding(tenant_id=tenant_id, **data)
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return finding


def update_finding(db: Session, tenant_id: int, finding_id: int, data: dict) -> Optional[R2RFinding]:
    finding = db.query(R2RFinding).filter(R2RFinding.tenant_id == tenant_id, R2RFinding.id == finding_id).first()
    if not finding:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(finding, field, value)
    if data.get("status") in ("closed", "resolved"):
        finding.closed_date = _utcnow()
    db.commit()
    db.refresh(finding)
    return finding


# ---------------------------------------------------------------------------
# Workpaper CRUD
# ---------------------------------------------------------------------------
def list_workpapers(db: Session, tenant_id: int) -> Sequence[R2RWorkpaper]:
    return db.query(R2RWorkpaper).filter(R2RWorkpaper.tenant_id == tenant_id).all()


def create_workpaper(db: Session, tenant_id: int, data: dict) -> R2RWorkpaper:
    wp = R2RWorkpaper(tenant_id=tenant_id, **data)
    db.add(wp)
    db.commit()
    db.refresh(wp)
    return wp


def update_workpaper(db: Session, tenant_id: int, wp_id: int, data: dict) -> Optional[R2RWorkpaper]:
    wp = db.query(R2RWorkpaper).filter(R2RWorkpaper.tenant_id == tenant_id, R2RWorkpaper.id == wp_id).first()
    if not wp:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(wp, field, value)
    wp.modified_date = _utcnow()
    db.commit()
    db.refresh(wp)
    return wp


# ---------------------------------------------------------------------------
# Action CRUD
# ---------------------------------------------------------------------------
def list_actions(db: Session, tenant_id: int) -> Sequence[R2RAction]:
    return db.query(R2RAction).filter(R2RAction.tenant_id == tenant_id).order_by(R2RAction.id.desc()).all()


def create_action(db: Session, tenant_id: int, data: dict) -> R2RAction:
    action = R2RAction(tenant_id=tenant_id, **data)
    if data.get("due_date"):
        action.due_date = _parse_date(data["due_date"])
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def update_action(db: Session, tenant_id: int, action_id: int, data: dict) -> Optional[R2RAction]:
    action = db.query(R2RAction).filter(R2RAction.tenant_id == tenant_id, R2RAction.id == action_id).first()
    if not action:
        return None
    for field, value in data.items():
        if field in ("due_date", "completed_date", "retest_date"):
            setattr(action, field, _parse_date(value))
        elif value is not None:
            setattr(action, field, value)
    db.commit()
    db.refresh(action)
    return action


# ---------------------------------------------------------------------------
# Rule CRUD
# ---------------------------------------------------------------------------
def list_rules(db: Session, tenant_id: int) -> Sequence[R2RRule]:
    return db.query(R2RRule).filter(R2RRule.tenant_id == tenant_id).all()


def create_rule(db: Session, tenant_id: int, data: dict) -> R2RRule:
    rule = R2RRule(tenant_id=tenant_id, **data)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def update_rule(db: Session, tenant_id: int, rule_id: int, data: dict) -> Optional[R2RRule]:
    rule = db.query(R2RRule).filter(R2RRule.tenant_id == tenant_id, R2RRule.id == rule_id).first()
    if not rule:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


# ---------------------------------------------------------------------------
# Scope CRUD
# ---------------------------------------------------------------------------
def list_scopes(db: Session, tenant_id: int) -> Sequence[R2RAuditScope]:
    return db.query(R2RAuditScope).filter(R2RAuditScope.tenant_id == tenant_id).all()


def create_scope(db: Session, tenant_id: int, data: dict) -> R2RAuditScope:
    scope = R2RAuditScope(tenant_id=tenant_id, **data)
    db.add(scope)
    db.commit()
    db.refresh(scope)
    return scope


def update_scope(db: Session, tenant_id: int, scope_id: int, data: dict) -> Optional[R2RAuditScope]:
    scope = db.query(R2RAuditScope).filter(R2RAuditScope.tenant_id == tenant_id, R2RAuditScope.id == scope_id).first()
    if not scope:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(scope, field, value)
    db.commit()
    db.refresh(scope)
    return scope
