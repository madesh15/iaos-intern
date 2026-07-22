"""SQLAlchemy models for the Record-to-Report module."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
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
# 1. Journal Entry
# ---------------------------------------------------------------------------
class JournalEntry(Base, TenantMixin):
    __tablename__ = "mod_r2r_journal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    je_number: Mapped[str] = mapped_column(String(50), index=True)
    je_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    period: Mapped[str] = mapped_column(String(20), index=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    company_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    business_unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    plant: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_code: Mapped[str] = mapped_column(String(30), index=True)
    account_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    account_type: Mapped[str] = mapped_column(String(20), default="debit")
    cost_center: Mapped[str | None] = mapped_column(String(50), nullable=True)
    profit_center: Mapped[str | None] = mapped_column(String(50), nullable=True)
    debit_amount: Mapped[float] = mapped_column(Float, default=0.0)
    credit_amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    narration: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    user_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    posting_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    posting_type: Mapped[str] = mapped_column(String(20), default="manual")
    status: Mapped[str] = mapped_column(String(20), default="posted")
    reference_doc: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reversal_of: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_post_close: Mapped[bool] = mapped_column(Integer, default=0)
    is_suspense: Mapped[bool] = mapped_column(Integer, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), default="low")
    exception_count: Mapped[int] = mapped_column(Integer, default=0)
    source_file: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    modified_by: Mapped[str | None] = mapped_column(String(200), nullable=True)

    exceptions = relationship("R2RException", back_populates="journal_entry", cascade="all, delete-orphan")
    reconciliation = relationship("R2RReconciliation", back_populates="journal_entry", uselist=False)


# ---------------------------------------------------------------------------
# 2. Exception
# ---------------------------------------------------------------------------
class R2RException(Base, TenantMixin):
    __tablename__ = "mod_r2r_exception"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    journal_entry_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("mod_r2r_journal_entries.id", ondelete="CASCADE"), nullable=True, index=True)
    rule_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rule_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    owner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    resolved_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    journal_entry = relationship("JournalEntry", back_populates="exceptions")


# ---------------------------------------------------------------------------
# 3. Reconciliation
# ---------------------------------------------------------------------------
class R2RReconciliation(Base, TenantMixin):
    __tablename__ = "mod_r2r_reconciliation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    journal_entry_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("mod_r2r_journal_entries.id", ondelete="SET NULL"), nullable=True, index=True)
    account_code: Mapped[str] = mapped_column(String(30), index=True)
    account_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    gl_balance: Mapped[float] = mapped_column(Float, default=0.0)
    subledger_balance: Mapped[float] = mapped_column(Float, default=0.0)
    difference: Mapped[float] = mapped_column(Float, default=0.0)
    reconciliation_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    owner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    approved_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    journal_entry = relationship("JournalEntry", back_populates="reconciliation")


# ---------------------------------------------------------------------------
# 4. Close Task
# ---------------------------------------------------------------------------
class R2RCloseTask(Base, TenantMixin):
    __tablename__ = "mod_r2r_close_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    period: Mapped[str] = mapped_column(String(20), index=True)
    task_name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_delayed: Mapped[bool] = mapped_column(Integer, default=0)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)


# ---------------------------------------------------------------------------
# 5. Finding
# ---------------------------------------------------------------------------
class R2RFinding(Base, TenantMixin):
    __tablename__ = "mod_r2r_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    risk_rating: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    owner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    audit_period: Mapped[str | None] = mapped_column(String(20), nullable=True)
    related_je_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    closed_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# 6. Working Paper
# ---------------------------------------------------------------------------
class R2RWorkpaper(Base, TenantMixin):
    __tablename__ = "mod_r2r_workpapers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    procedure: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    prepared_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    attachments: Mapped[str | None] = mapped_column(Text, nullable=True)
    tick_marks: Mapped[str | None] = mapped_column(Text, nullable=True)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    audit_period: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    modified_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ---------------------------------------------------------------------------
# 7. Action / CAPA
# ---------------------------------------------------------------------------
class R2RAction(Base, TenantMixin):
    __tablename__ = "mod_r2r_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_type: Mapped[str] = mapped_column(String(50), default="corrective")
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    owner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    retest_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    finding_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_overdue: Mapped[bool] = mapped_column(Integer, default=0)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# 8. Rule Library
# ---------------------------------------------------------------------------
class R2RRule(Base, TenantMixin):
    __tablename__ = "mod_r2r_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rule_code: Mapped[str] = mapped_column(String(50), unique=True)
    rule_name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50))
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    threshold_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    threshold_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Integer, default=1)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# 9. Audit Scope
# ---------------------------------------------------------------------------
class R2RAuditScope(Base, TenantMixin):
    __tablename__ = "mod_r2r_scope"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scope_name: Mapped[str] = mapped_column(String(200))
    entity: Mapped[str | None] = mapped_column(String(100), nullable=True)
    business_unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    plant: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    period_from: Mapped[str | None] = mapped_column(String(20), nullable=True)
    period_to: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
