"""Business logic layer for Item Material Master Governance.

Orchestrates calls to the repository layer and the rules layer, creates
exceptions and findings from rule results, and manages audit trails.
"""

import logging
from typing import Any, Sequence

from sqlalchemy.orm import Session

from app.models.user import User

from . import repository as repo
from . import rules
from .constants import ExceptionType, Severity
from .models import (
    ItemMaterialMasterGovernanceItem as ItemModel,
    ItemMaterialMasterGovernanceException as ExceptionModel,
    ItemMaterialMasterGovernanceFinding as FindingModel,
    ItemMaterialMasterGovernanceRemediation as RemediationModel,
)
from .schemas import (
    DashboardStats,
    ExceptionOut,
    FindingOut,
)

logger = logging.getLogger(__name__)


class ItemGovernanceService:
    """Aggregate service for item master governance operations.

    Every method requires a DB session and the current user for tenant/isolation
    and audit tracking.
    """

    def __init__(self, db: Session, current_user: User) -> None:
        self.db = db
        self.current_user = current_user
        self.tenant_id = current_user.tenant_id
        self.user_id = current_user.id

    # ── Helpers ─────────────────────────────────────────────────────────────

    def _audit_cost_change(
        self,
        item_id: int,
        old_cost: float | None,
        new_cost: float | None,
    ) -> None:
        """Record a standard_cost change in the audit log."""
        repo.create_audit_entry(
            db=self.db,
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            item_id=item_id,
            field_changed="standard_cost",
            old_value=str(old_cost) if old_cost is not None else None,
            new_value=str(new_cost) if new_cost is not None else None,
            change_type="update",
        )

    def _create_exceptions(
        self,
        exception_type: str,
        results: list[dict[str, Any]],
    ) -> None:
        """Persist a batch of rule results as exceptions."""
        for r in results:
            repo.create_exception(
                db=self.db,
                tenant_id=self.tenant_id,
                user_id=self.user_id,
                data={
                    "item_id": r.get("item_id") or r.get("item_id_1", 0),
                    "exception_type": exception_type,
                    "severity": r.get("severity", Severity.MEDIUM),
                    "description": r["issue"],
                },
            )

    def _create_findings(
        self,
        finding_type: str,
        results: list[dict[str, Any]],
    ) -> None:
        """Persist a batch of rule results as findings."""
        for r in results:
            repo.create_finding(
                db=self.db,
                tenant_id=self.tenant_id,
                user_id=self.user_id,
                data={
                    "item_id": r.get("item_id") or r.get("item_id_1", 0),
                    "finding_type": finding_type,
                    "severity": r.get("severity", Severity.MEDIUM),
                    "description": r["issue"],
                },
            )

    # ── Dashboard ───────────────────────────────────────────────────────────

    def get_dashboard_stats(self) -> DashboardStats:
        """Compute aggregate statistics for the dashboard."""
        recent_exceptions = repo.get_recent_exceptions(self.db, self.tenant_id)
        recent_findings = repo.get_recent_findings(self.db, self.tenant_id)
        severity_counts = repo.count_findings_by_severity(self.db, self.tenant_id)

        return DashboardStats(
            total_items=repo.count_items(self.db, self.tenant_id),
            active_items=repo.count_active_items(self.db, self.tenant_id),
            blocked_items=repo.count_blocked_items(self.db, self.tenant_id),
            total_exceptions=repo.count_exceptions(self.db, self.tenant_id),
            open_exceptions=repo.count_open_exceptions(self.db, self.tenant_id),
            total_findings=repo.count_findings(self.db, self.tenant_id),
            open_findings=repo.count_open_findings(self.db, self.tenant_id),
            critical_findings=severity_counts.get("critical", 0),
            high_findings=severity_counts.get("high", 0),
            medium_findings=severity_counts.get("medium", 0),
            low_findings=severity_counts.get("low", 0),
            recent_exceptions=[ExceptionOut.model_validate(e) for e in recent_exceptions],
            recent_findings=[FindingOut.model_validate(f) for f in recent_findings],
        )

    # ── Items ───────────────────────────────────────────────────────────────

    def list_items(self, skip: int = 0, limit: int = 100) -> Sequence[ItemModel]:
        return repo.list_items(self.db, self.tenant_id, skip, limit)

    def get_item(self, item_id: int) -> ItemModel | None:
        return repo.get_item(self.db, self.tenant_id, item_id)

    def create_item(self, data: dict) -> ItemModel:
        item = repo.create_item(self.db, self.tenant_id, self.user_id, data)
        self._audit_cost_change(item.id, None, data.get("standard_cost"))
        return item

    def update_item(self, item_id: int, data: dict) -> ItemModel | None:
        old = repo.get_item(self.db, self.tenant_id, item_id)
        if not old:
            return None
        old_cost = old.standard_cost
        item = repo.update_item(self.db, self.tenant_id, self.user_id, item_id, data)
        if item and "standard_cost" in data and data["standard_cost"] != old_cost:
            self._audit_cost_change(item_id, old_cost, data["standard_cost"])
        return item

    def delete_item(self, item_id: int) -> bool:
        return repo.delete_item(self.db, self.tenant_id, item_id)

    # ── Exceptions ──────────────────────────────────────────────────────────

    def list_exceptions(
        self,
        exception_type: str | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[ExceptionModel]:
        return repo.list_exceptions(
            self.db, self.tenant_id, exception_type, status, skip, limit
        )

    def get_exception(self, exception_id: int) -> ExceptionModel | None:
        return repo.get_exception(self.db, self.tenant_id, exception_id)

    def update_exception(
        self,
        exception_id: int,
        data: dict,
    ) -> ExceptionModel | None:
        return repo.update_exception(
            self.db, self.tenant_id, self.user_id, exception_id, data
        )

    # ── Findings ────────────────────────────────────────────────────────────

    def list_findings(
        self,
        finding_type: str | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[FindingModel]:
        return repo.list_findings(
            self.db, self.tenant_id, finding_type, status, skip, limit
        )

    def get_finding(self, finding_id: int) -> FindingModel | None:
        return repo.get_finding(self.db, self.tenant_id, finding_id)

    def create_finding(self, data: dict) -> FindingModel:
        return repo.create_finding(self.db, self.tenant_id, self.user_id, data)

    def update_finding(self, finding_id: int, data: dict) -> FindingModel | None:
        return repo.update_finding(
            self.db, self.tenant_id, self.user_id, finding_id, data
        )

    # ── Remediation ─────────────────────────────────────────────────────────

    def list_remediations(
        self,
        status: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[RemediationModel]:
        return repo.list_remediations(self.db, self.tenant_id, status, skip, limit)

    def get_remediation(self, remediation_id: int) -> RemediationModel | None:
        return repo.get_remediation(self.db, self.tenant_id, remediation_id)

    def create_remediation(self, data: dict) -> RemediationModel:
        return repo.create_remediation(self.db, self.tenant_id, self.user_id, data)

    def update_remediation(
        self,
        remediation_id: int,
        data: dict,
    ) -> RemediationModel | None:
        return repo.update_remediation(
            self.db, self.tenant_id, self.user_id, remediation_id, data
        )

    # ── Analytics ───────────────────────────────────────────────────────────

    @staticmethod
    def _fmt(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
        return [{"item_id": i.id, "item_code": i.item_code, "item_name": i.item_name}]

    def run_duplicate_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_duplicates(items)
        self._create_exceptions(ExceptionType.DUPLICATE, results)
        self._create_findings(ExceptionType.DUPLICATE, results)
        return results

    def run_hsn_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_hsn_tax(items)
        self._create_exceptions(ExceptionType.HSN, results)
        self._create_findings(ExceptionType.HSN, results)
        return results

    def run_valuation_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_valuation(items)
        self._create_exceptions(ExceptionType.VALUATION, results)
        self._create_findings(ExceptionType.VALUATION, results)
        return results

    def run_uom_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_uom(items)
        self._create_exceptions(ExceptionType.UOM, results)
        self._create_findings(ExceptionType.UOM, results)
        return results

    def run_obsolete_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_obsolete(items)
        self._create_exceptions(ExceptionType.OBSOLETE, results)
        self._create_findings(ExceptionType.OBSOLETE, results)
        return results

    def run_completeness_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_master_completeness(items)
        self._create_exceptions(ExceptionType.COMPLETENESS, results)
        self._create_findings(ExceptionType.COMPLETENESS, results)
        return results

    def run_reorder_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_reorder(items)
        self._create_exceptions(ExceptionType.REORDER, results)
        self._create_findings(ExceptionType.REORDER, results)
        return results

    def run_bom_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_bom(items)
        self._create_exceptions(ExceptionType.BOM, results)
        self._create_findings(ExceptionType.BOM, results)
        return results

    def run_batch_serial_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_batch_serial(items)
        self._create_exceptions(ExceptionType.BATCH, results)
        self._create_findings(ExceptionType.BATCH, results)
        return results

    def run_category_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_category_hierarchy(items)
        self._create_exceptions(ExceptionType.CATEGORY, results)
        self._create_findings(ExceptionType.CATEGORY, results)
        return results

    def run_workflow_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_workflow(items)
        self._create_exceptions(ExceptionType.WORKFLOW, results)
        self._create_findings(ExceptionType.WORKFLOW, results)
        return results

    def run_cross_plant_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_cross_plant(items)
        self._create_exceptions(ExceptionType.CROSS_PLANT, results)
        self._create_findings(ExceptionType.CROSS_PLANT, results)
        return results

    def run_naming_check(self) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_naming_convention(items)
        self._create_exceptions(ExceptionType.NAMING, results)
        self._create_findings(ExceptionType.NAMING, results)
        return results

    def run_dead_stock_check(
        self,
        threshold_days: int = 180,
    ) -> list[dict[str, Any]]:
        items = repo.get_all_items(self.db, self.tenant_id)
        results = rules.check_dead_stock(items, threshold_days)
        self._create_exceptions(ExceptionType.DEAD_STOCK, results)
        self._create_findings(ExceptionType.DEAD_STOCK, results)
        return results

    def get_cost_audit_history(
        self,
        item_id: int | None = None,
    ) -> list[dict[str, Any]]:
        """Return audit trail for standard_cost changes."""
        entries = repo.get_cost_audit_history(
            self.db, self.tenant_id, item_id=item_id
        )
        return [
            {
                "id": e.id,
                "item_id": e.item_id,
                "field_changed": e.field_changed,
                "old_value": e.old_value,
                "new_value": e.new_value,
                "change_type": e.change_type,
                "created_at": e.created_at.isoformat() if e.created_at else None,
                "created_by": e.created_by,
            }
            for e in entries
        ]
