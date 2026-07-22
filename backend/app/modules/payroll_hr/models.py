"""Payroll & HR Audit — data model.

Covers the module's full working surface:
  - Scope & Audit Universe          (mod_payroll_hr_scope)
  - Risk & Control Matrix           (mod_payroll_hr_rcm)
  - Test & Analytics Rule Library   (mod_payroll_hr_rules)      — the 15 signature tests
  - Data Source & Connector Setup   (mod_payroll_hr_sources)
  - Sampling & Population Builder   (mod_payroll_hr_samples)
  - Exception & Red-Flag Queue      (mod_payroll_hr_exceptions)
  - Working Papers & Evidence       (mod_payroll_hr_evidence)
  - Observation & Finding Log       (mod_payroll_hr_findings)
  - Remediation / Action Tracker    (mod_payroll_hr_actions)

Module Dashboard & KPIs has no table of its own — it aggregates the tables
above (see router.py: GET /dashboard).
"""
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class ScopeUnit(Base, TenantMixin):
    """Auditable entity in scope — a legal entity, location, or BU."""

    __tablename__ = "mod_payroll_hr_scope"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    unit_type: Mapped[str] = mapped_column(String(120), default="Location")
    headcount: Mapped[int] = mapped_column(Integer, default=0)
    risk_rating: Mapped[str] = mapped_column(String(20), default="Medium")
    in_scope: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class RcmEntry(Base, TenantMixin):
    """Risk & Control Matrix row."""

    __tablename__ = "mod_payroll_hr_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk: Mapped[str] = mapped_column(String(255))
    control: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(120), default="Accuracy")
    control_owner: Mapped[str] = mapped_column(String(255), default="")
    risk_rating: Mapped[str] = mapped_column(String(20), default="Medium")


class Rule(Base, TenantMixin):
    """Test & analytics rule — the 15 signature tests + any custom ones."""

    __tablename__ = "mod_payroll_hr_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), default="")
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(20), default="Signature")  # Signature | Custom
    description: Mapped[str] = mapped_column(Text, default="")
    threshold: Mapped[str] = mapped_column(String(255), default="")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class DataSource(Base, TenantMixin):
    """Connector / upload feeding this module's analytics."""

    __tablename__ = "mod_payroll_hr_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(120), default="File upload")
    status: Mapped[str] = mapped_column(String(20), default="Not connected")
    notes: Mapped[str] = mapped_column(Text, default="")


class Sample(Base, TenantMixin):
    """A drawn sample from a population, for judgemental or statistical testing."""

    __tablename__ = "mod_payroll_hr_samples"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(120), default="Random")
    criteria: Mapped[str] = mapped_column(Text, default="")


class Exception_(Base, TenantMixin):
    """A red-flag raised manually or by running a rule."""

    __tablename__ = "mod_payroll_hr_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_payroll_hr_rules.id", ondelete="SET NULL"), nullable=True
    )
    rule_name: Mapped[str] = mapped_column(String(255), default="")  # denormalised for display
    reference: Mapped[str] = mapped_column(String(255), default="")  # emp id / name / dept
    detail: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    status: Mapped[str] = mapped_column(String(20), default="Open")
    disposition: Mapped[str] = mapped_column(Text, default="")


class Evidence(Base, TenantMixin):
    """Working paper / evidence attached to the audit, optionally to an exception."""

    __tablename__ = "mod_payroll_hr_evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    reference: Mapped[str] = mapped_column(String(120), default="")  # working paper ref, e.g. WP-01
    exception_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_payroll_hr_exceptions.id", ondelete="SET NULL"), nullable=True
    )
    reviewer: Mapped[str] = mapped_column(String(255), default="")
    signed_off: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="")


class PayrollFinding(Base, TenantMixin):
    """Graded observation raised for the domain, routed for remediation."""

    __tablename__ = "mod_payroll_hr_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    rule_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_payroll_hr_rules.id", ondelete="SET NULL"), nullable=True
    )
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    status: Mapped[str] = mapped_column(String(20), default="Open")
    owner: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")


class ActionItem(Base, TenantMixin):
    """CAPA / remediation action tracked against a finding."""

    __tablename__ = "mod_payroll_hr_actions"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_payroll_hr_findings.id", ondelete="SET NULL"), nullable=True
    )
    finding_title: Mapped[str] = mapped_column(String(255), default="")  # denormalised for display
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")
