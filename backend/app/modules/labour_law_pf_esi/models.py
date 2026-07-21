from datetime import date, datetime
from sqlalchemy import String, Text, Date, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class ContractWorker(Base, TenantMixin):
    """High-volume contractor master records."""
    __tablename__ = "mod_contract_workers"

    id: Mapped[int] = mapped_column(primary_key=True)
    contractor_name: Mapped[str] = mapped_column(String(255), index=True)
    worker_name: Mapped[str] = mapped_column(String(255))
    uan: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    esic_ip: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    wage_rate: Mapped[float] = mapped_column(Float, default=0.0)
    category: Mapped[str] = mapped_column(String(50))  # e.g. 'Skilled', 'Semi-Skilled', 'Unskilled'
    doj: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="Active")  # e.g. 'Active', 'Inactive'


class ComplianceException(Base, TenantMixin):
    """Automated and manual audit red flags / exceptions."""
    __tablename__ = "mod_compliance_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    exception_type: Mapped[str] = mapped_column(String(100), index=True)  # e.g. 'MIN_WAGE_VIOLATION'
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM")  # 'HIGH', 'MEDIUM', 'LOW'
    description: Mapped[str] = mapped_column(Text)
    contractor_name: Mapped[str] = mapped_column(String(255))
    worker_uan: Mapped[str | None] = mapped_column(String(50), nullable=True)
    audit_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="OPEN")  # 'OPEN', 'RESOLVED'
    capa_plan: Mapped[str | None] = mapped_column(Text, nullable=True)


class LabourComplianceRegistry(Base, TenantMixin):
    """Consolidated checklist for applicability, licences, registers, notices."""
    __tablename__ = "mod_labour_compliance_registry"

    id: Mapped[int] = mapped_column(primary_key=True)
    registry_type: Mapped[str] = mapped_column(String(50), index=True)  # 'APPLICABILITY', 'LICENCE', 'REGISTERS', 'NOTICES'
    compliance_name: Mapped[str] = mapped_column(String(255))
    reference_law: Mapped[str] = mapped_column(String(255))
    frequency: Mapped[str] = mapped_column(String(50))  # e.g. 'Monthly', 'Annual', 'One-time'
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="COMPLIANT")  # 'COMPLIANT', 'NON_COMPLIANT', 'PENDING_RENEWAL'
    last_reviewed: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    assigned_owner: Mapped[str] = mapped_column(String(100))
    notes: Mapped[str] = mapped_column(Text, default="")
