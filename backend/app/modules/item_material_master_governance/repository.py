"""Data-access layer for Item Material Master Governance.

Every public method accepts a SQLAlchemy Session and an explicit tenant_id so
the caller (service layer) controls tenant isolation. No tenant_id leak.
"""

import logging
from datetime import datetime
from typing import Sequence

from sqlalchemy import or_, select, update, delete
from sqlalchemy.orm import Session

from .models import (
    ItemMaterialMasterGovernanceItem as ItemModel,
    ItemMaterialMasterGovernanceException as ExceptionModel,
    ItemMaterialMasterGovernanceAudit as AuditModel,
    ItemMaterialMasterGovernanceFinding as FindingModel,
    ItemMaterialMasterGovernanceRemediation as RemediationModel,
    ItemMaterialMasterGovernanceRule as RuleModel,
)

logger = logging.getLogger(__name__)


# ── Item ────────────────────────────────────────────────────────────────────

def list_items(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[ItemModel]:
    stmt = (
        select(ItemModel)
        .where(ItemModel.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .order_by(ItemModel.id.desc())
    )
    return db.execute(stmt).scalars().all()


def get_item(
    db: Session,
    tenant_id: int,
    item_id: int,
) -> ItemModel | None:
    stmt = (
        select(ItemModel)
        .where(ItemModel.tenant_id == tenant_id, ItemModel.id == item_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_item_by_code(
    db: Session,
    tenant_id: int,
    item_code: str,
) -> ItemModel | None:
    stmt = (
        select(ItemModel)
        .where(ItemModel.tenant_id == tenant_id, ItemModel.item_code == item_code)
    )
    return db.execute(stmt).scalar_one_or_none()


def create_item(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    data: dict,
) -> ItemModel:
    item = ItemModel(tenant_id=tenant_id, created_by=user_id, updated_by=user_id, **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    logger.info("Created item %s (id=%d) for tenant %d", item.item_code, item.id, tenant_id)
    return item


def update_item(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    item_id: int,
    data: dict,
) -> ItemModel | None:
    item = get_item(db, tenant_id, item_id)
    if not item:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(item, key, value)
    item.updated_by = user_id
    db.commit()
    db.refresh(item)
    logger.info("Updated item %d for tenant %d", item_id, tenant_id)
    return item


def delete_item(
    db: Session,
    tenant_id: int,
    item_id: int,
) -> bool:
    item = get_item(db, tenant_id, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    logger.info("Deleted item %d for tenant %d", item_id, tenant_id)
    return True


def get_all_items(db: Session, tenant_id: int) -> Sequence[ItemModel]:
    stmt = select(ItemModel).where(ItemModel.tenant_id == tenant_id)
    return db.execute(stmt).scalars().all()


def count_items(db: Session, tenant_id: int) -> int:
    stmt = select(ItemModel).where(ItemModel.tenant_id == tenant_id)
    return len(db.execute(stmt).scalars().all())


def count_active_items(db: Session, tenant_id: int) -> int:
    stmt = (
        select(ItemModel)
        .where(ItemModel.tenant_id == tenant_id, ItemModel.is_active.is_(True))
    )
    return len(db.execute(stmt).scalars().all())


def count_blocked_items(db: Session, tenant_id: int) -> int:
    stmt = (
        select(ItemModel)
        .where(ItemModel.tenant_id == tenant_id, ItemModel.is_blocked.is_(True))
    )
    return len(db.execute(stmt).scalars().all())


# ── Exception ──────────────────────────────────────────────────────────────

def list_exceptions(
    db: Session,
    tenant_id: int,
    exception_type: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[ExceptionModel]:
    stmt = select(ExceptionModel).where(ExceptionModel.tenant_id == tenant_id)
    if exception_type:
        stmt = stmt.where(ExceptionModel.exception_type == exception_type)
    if status:
        stmt = stmt.where(ExceptionModel.status == status)
    stmt = stmt.offset(skip).limit(limit).order_by(ExceptionModel.id.desc())
    return db.execute(stmt).scalars().all()


def get_exception(
    db: Session,
    tenant_id: int,
    exception_id: int,
) -> ExceptionModel | None:
    stmt = (
        select(ExceptionModel)
        .where(ExceptionModel.tenant_id == tenant_id, ExceptionModel.id == exception_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def create_exception(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    data: dict,
) -> ExceptionModel:
    exc = ExceptionModel(tenant_id=tenant_id, created_by=user_id, updated_by=user_id, **data)
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return exc


def update_exception(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    exception_id: int,
    data: dict,
) -> ExceptionModel | None:
    exc = get_exception(db, tenant_id, exception_id)
    if not exc:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(exc, key, value)
    if "resolved_by" in data or "status" in data:
        if data.get("status") == "resolved":
            exc.resolved_at = datetime.utcnow()
    exc.updated_by = user_id
    db.commit()
    db.refresh(exc)
    return exc


def count_exceptions(db: Session, tenant_id: int) -> int:
    stmt = select(ExceptionModel).where(ExceptionModel.tenant_id == tenant_id)
    return len(db.execute(stmt).scalars().all())


def count_open_exceptions(db: Session, tenant_id: int) -> int:
    stmt = (
        select(ExceptionModel)
        .where(ExceptionModel.tenant_id == tenant_id, ExceptionModel.status == "open")
    )
    return len(db.execute(stmt).scalars().all())


def get_recent_exceptions(
    db: Session,
    tenant_id: int,
    limit: int = 10,
) -> Sequence[ExceptionModel]:
    stmt = (
        select(ExceptionModel)
        .where(ExceptionModel.tenant_id == tenant_id)
        .order_by(ExceptionModel.id.desc())
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


# ── Audit ───────────────────────────────────────────────────────────────────

def create_audit_entry(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    item_id: int | None,
    field_changed: str,
    old_value: str | None,
    new_value: str | None,
    change_type: str,
) -> AuditModel:
    entry = AuditModel(
        tenant_id=tenant_id,
        created_by=user_id,
        updated_by=user_id,
        item_id=item_id,
        field_changed=field_changed,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
        change_type=change_type,
    )
    db.add(entry)
    db.commit()
    return entry


def get_cost_audit_history(
    db: Session,
    tenant_id: int,
    item_id: int | None = None,
    limit: int = 100,
) -> Sequence[AuditModel]:
    stmt = (
        select(AuditModel)
        .where(
            AuditModel.tenant_id == tenant_id,
            AuditModel.field_changed == "standard_cost",
        )
    )
    if item_id is not None:
        stmt = stmt.where(AuditModel.item_id == item_id)
    stmt = stmt.order_by(AuditModel.id.desc()).limit(limit)
    return db.execute(stmt).scalars().all()


# ── Finding ─────────────────────────────────────────────────────────────────

def list_findings(
    db: Session,
    tenant_id: int,
    finding_type: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[FindingModel]:
    stmt = select(FindingModel).where(FindingModel.tenant_id == tenant_id)
    if finding_type:
        stmt = stmt.where(FindingModel.finding_type == finding_type)
    if status:
        stmt = stmt.where(FindingModel.status == status)
    stmt = stmt.offset(skip).limit(limit).order_by(FindingModel.id.desc())
    return db.execute(stmt).scalars().all()


def get_finding(
    db: Session,
    tenant_id: int,
    finding_id: int,
) -> FindingModel | None:
    stmt = (
        select(FindingModel)
        .where(FindingModel.tenant_id == tenant_id, FindingModel.id == finding_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def create_finding(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    data: dict,
) -> FindingModel:
    finding = FindingModel(tenant_id=tenant_id, created_by=user_id, updated_by=user_id, **data)
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return finding


def update_finding(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    finding_id: int,
    data: dict,
) -> FindingModel | None:
    finding = get_finding(db, tenant_id, finding_id)
    if not finding:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(finding, key, value)
    finding.updated_by = user_id
    db.commit()
    db.refresh(finding)
    return finding


def count_findings(db: Session, tenant_id: int) -> int:
    stmt = select(FindingModel).where(FindingModel.tenant_id == tenant_id)
    return len(db.execute(stmt).scalars().all())


def count_open_findings(db: Session, tenant_id: int) -> int:
    stmt = (
        select(FindingModel)
        .where(FindingModel.tenant_id == tenant_id, FindingModel.status == "open")
    )
    return len(db.execute(stmt).scalars().all())


def count_findings_by_severity(
    db: Session,
    tenant_id: int,
) -> dict[str, int]:
    counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for severity in counts:
        stmt = (
            select(FindingModel)
            .where(
                FindingModel.tenant_id == tenant_id,
                FindingModel.severity == severity,
            )
        )
        counts[severity] = len(db.execute(stmt).scalars().all())
    return counts


def get_recent_findings(
    db: Session,
    tenant_id: int,
    limit: int = 10,
) -> Sequence[FindingModel]:
    stmt = (
        select(FindingModel)
        .where(FindingModel.tenant_id == tenant_id)
        .order_by(FindingModel.id.desc())
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


# ── Remediation ─────────────────────────────────────────────────────────────

def list_remediations(
    db: Session,
    tenant_id: int,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[RemediationModel]:
    stmt = select(RemediationModel).where(RemediationModel.tenant_id == tenant_id)
    if status:
        stmt = stmt.where(RemediationModel.status == status)
    stmt = stmt.offset(skip).limit(limit).order_by(RemediationModel.id.desc())
    return db.execute(stmt).scalars().all()


def get_remediation(
    db: Session,
    tenant_id: int,
    remediation_id: int,
) -> RemediationModel | None:
    stmt = (
        select(RemediationModel)
        .where(
            RemediationModel.tenant_id == tenant_id,
            RemediationModel.id == remediation_id,
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def create_remediation(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    data: dict,
) -> RemediationModel:
    rem = RemediationModel(tenant_id=tenant_id, created_by=user_id, updated_by=user_id, **data)
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem


def update_remediation(
    db: Session,
    tenant_id: int,
    user_id: int | None,
    remediation_id: int,
    data: dict,
) -> RemediationModel | None:
    rem = get_remediation(db, tenant_id, remediation_id)
    if not rem:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(rem, key, value)
    if data.get("status") == "completed":
        rem.completed_at = datetime.utcnow()
    rem.updated_by = user_id
    db.commit()
    db.refresh(rem)
    return rem


# ── Rule ────────────────────────────────────────────────────────────────────

def list_rules(
    db: Session,
    tenant_id: int,
    rule_type: str | None = None,
) -> Sequence[RuleModel]:
    stmt = select(RuleModel).where(RuleModel.tenant_id == tenant_id)
    if rule_type:
        stmt = stmt.where(RuleModel.rule_type == rule_type)
    stmt = stmt.order_by(RuleModel.id)
    return db.execute(stmt).scalars().all()
