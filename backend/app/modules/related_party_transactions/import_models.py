"""
Bulk import models — separate file so it doesn't collide with any
concurrent edits to models.py. Import these into your existing
models.py namespace or just import this module directly in the router.
"""
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, Float, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class RPTImportBatch(Base, TenantMixin):
    __tablename__ = "mod_rpt_import_batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), default="")
    uploaded_by: Mapped[str] = mapped_column(String(150), default="")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    total_rows: Mapped[int] = mapped_column(Integer, default=0)
    valid_count: Mapped[int] = mapped_column(Integer, default=0)
    flagged_count: Mapped[int] = mapped_column(Integer, default=0)
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="completed")  # processing|completed|failed


class RPTImportTransaction(Base, TenantMixin):
    __tablename__ = "mod_rpt_import_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(Integer, index=True)
    row_num: Mapped[int] = mapped_column(Integer, default=0)

    related_party: Mapped[str] = mapped_column(String(200), default="")
    transaction_type: Mapped[str] = mapped_column(String(100), default="")
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    transaction_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    market_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    variance_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="valid")  # valid|flagged|error
    validation_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
