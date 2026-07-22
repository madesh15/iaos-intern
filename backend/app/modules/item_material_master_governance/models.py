"""SQLAlchemy models for Item Material Master Governance.

Each table is tenant-isolated via TenantMixin and includes created_by/updated_by
foreign keys to the users table.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class AuditMixin(TenantMixin):
    """Extends TenantMixin with user-audit columns."""

    created_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )


class ItemMaterialMasterGovernanceItem(Base, AuditMixin):
    __tablename__ = "mod_item_master"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_code: Mapped[str] = mapped_column(String(50), index=True)
    item_name: Mapped[str] = mapped_column(String(255))

    item_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    item_subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True)
    material_group: Mapped[str | None] = mapped_column(String(100), nullable=True)

    hsn_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gst_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    tax_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    valuation_class: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gl_mapping: Mapped[str | None] = mapped_column(String(100), nullable=True)

    purchase_uom: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sales_uom: Mapped[str | None] = mapped_column(String(20), nullable=True)
    inventory_uom: Mapped[str | None] = mapped_column(String(20), nullable=True)
    uom_conversion_factor: Mapped[float | None] = mapped_column(Float, nullable=True)

    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    mrp: Mapped[float | None] = mapped_column(Float, nullable=True)
    specification: Mapped[str | None] = mapped_column(Text, nullable=True)

    standard_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    reorder_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_stock: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_stock: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_discontinued: Mapped[bool] = mapped_column(Boolean, default=False)

    batch_managed: Mapped[bool] = mapped_column(Boolean, default=False)
    serial_tracked: Mapped[bool] = mapped_column(Boolean, default=False)

    parent_material_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("mod_item_master.id", ondelete="SET NULL"), nullable=True
    )
    bom_active: Mapped[bool] = mapped_column(Boolean, default=False)

    naming_prefix: Mapped[str | None] = mapped_column(String(10), nullable=True)

    plant: Mapped[str | None] = mapped_column(String(50), nullable=True)
    storage_location: Mapped[str | None] = mapped_column(String(50), nullable=True)
    warehouse: Mapped[str | None] = mapped_column(String(50), nullable=True)

    maker: Mapped[str | None] = mapped_column(String(255), nullable=True)
    checker: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    last_movement_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class ItemMaterialMasterGovernanceException(Base, AuditMixin):
    __tablename__ = "mod_item_master_exception"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mod_item_master.id", ondelete="CASCADE"), index=True
    )
    exception_type: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="open")
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ItemMaterialMasterGovernanceAudit(Base, AuditMixin):
    __tablename__ = "mod_item_master_audit"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("mod_item_master.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    field_changed: Mapped[str] = mapped_column(String(100))
    old_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    change_type: Mapped[str] = mapped_column(String(20))


class ItemMaterialMasterGovernanceFinding(Base, AuditMixin):
    __tablename__ = "mod_item_master_finding"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mod_item_master.id", ondelete="CASCADE"), index=True
    )
    finding_type: Mapped[str] = mapped_column(String(50), index=True)
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="open")
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ItemMaterialMasterGovernanceRemediation(Base, AuditMixin):
    __tablename__ = "mod_item_master_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mod_item_master_finding.id", ondelete="CASCADE"),
        index=True
    )
    action: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ItemMaterialMasterGovernanceRule(Base, AuditMixin):
    __tablename__ = "mod_item_master_rule"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(100))
    rule_type: Mapped[str] = mapped_column(String(50), index=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
