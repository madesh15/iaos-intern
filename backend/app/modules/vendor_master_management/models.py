"""SQLAlchemy models for the Vendor Master & Management module."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# 1. Vendor Master
# ---------------------------------------------------------------------------
class Vendor(Base, TenantMixin):
    __tablename__ = "mod_vendor_master_vendor"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    vendor_name: Mapped[str] = mapped_column(String(255), index=True)
    vendor_type: Mapped[str] = mapped_column(String(50), default="domestic")
    gst_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    pan_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    msme_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    msme_reg_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    msme_expiry: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True, default="India")
    bank_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    ifsc: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    spend_amount: Mapped[float] = mapped_column(Float, default=0.0)
    last_purchase_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    last_payment_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    open_po_count: Mapped[int] = mapped_column(Integer, default=0)
    open_invoice_count: Mapped[int] = mapped_column(Integer, default=0)
    change_count: Mapped[int] = mapped_column(Integer, default=0)
    created_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    modified_by: Mapped[str | None] = mapped_column(String(200), nullable=True)

    bank_history = relationship("VendorBankHistory", back_populates="vendor", cascade="all, delete-orphan")
    kyc = relationship("VendorKYC", back_populates="vendor", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("VendorAuditLog", back_populates="vendor", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# 2. Bank Detail Change History
# ---------------------------------------------------------------------------
class VendorBankHistory(Base, TenantMixin):
    __tablename__ = "mod_vendor_bank_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="CASCADE"), index=True)
    old_account_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    new_account_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    old_ifsc: Mapped[str | None] = mapped_column(String(20), nullable=True)
    new_ifsc: Mapped[str | None] = mapped_column(String(20), nullable=True)
    old_bank_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    new_bank_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    changed_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    changed_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    approval_status: Mapped[str] = mapped_column(String(20), default="pending")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    vendor = relationship("Vendor", back_populates="bank_history")


# ---------------------------------------------------------------------------
# 3. KYC Verification
# ---------------------------------------------------------------------------
class VendorKYC(Base, TenantMixin):
    __tablename__ = "mod_vendor_kyc"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="CASCADE"), unique=True, index=True)
    gst_verified: Mapped[bool] = mapped_column(Integer, default=0)
    pan_verified: Mapped[bool] = mapped_column(Integer, default=0)
    msme_verified: Mapped[bool] = mapped_column(Integer, default=0)
    kyc_status: Mapped[str] = mapped_column(String(20), default="pending")
    verification_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verified_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    vendor = relationship("Vendor", back_populates="kyc")


# ---------------------------------------------------------------------------
# 4. Audit Log
# ---------------------------------------------------------------------------
class VendorAuditLog(Base, TenantMixin):
    __tablename__ = "mod_vendor_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="CASCADE"), index=True)
    action: Mapped[str] = mapped_column(String(50))
    field_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    old_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    performed_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)

    vendor = relationship("Vendor", back_populates="audit_logs")


# ---------------------------------------------------------------------------
# 5. Vendor Blacklist
# ---------------------------------------------------------------------------
class VendorBlacklist(Base, TenantMixin):
    __tablename__ = "mod_vendor_blacklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pan_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gst_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="internal")
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    listed_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# 6. Approval Workflow
# ---------------------------------------------------------------------------
class VendorApproval(Base, TenantMixin):
    __tablename__ = "mod_vendor_approval"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="CASCADE"), index=True)
    action_type: Mapped[str] = mapped_column(String(50))
    maker: Mapped[str | None] = mapped_column(String(200), nullable=True)
    maker_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    checker: Mapped[str | None] = mapped_column(String(200), nullable=True)
    checker_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)


# ---------------------------------------------------------------------------
# 7. Vendor Relationship (Related Party)
# ---------------------------------------------------------------------------
class VendorRelationship(Base, TenantMixin):
    __tablename__ = "mod_vendor_relationship"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="CASCADE"), index=True)
    related_vendor_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("mod_vendor_master_vendor.id", ondelete="SET NULL"), nullable=True)
    relationship_type: Mapped[str] = mapped_column(String(50))
    shared_field: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shared_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
