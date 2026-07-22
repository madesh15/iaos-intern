"""ITGC module — 15 Signature test procedures for IT General Controls.

Each row in ``mod_itgc_tests`` represents one executed (or pending) test
against a specific ITGC procedure.  The ``procedure_code`` column (1-15)
maps to the catalogue below; a tenant may have multiple test records per
procedure across different audit periods.
"""
from enum import Enum as PyEnum

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ── procedure catalogue (kept in sync with the frontend) ──────────────
PROCEDURES: list[dict] = [
    {"code": 1,  "name": "Change-Management Testing",        "description": "Authorised, tested, approved changes"},
    {"code": 2,  "name": "Logical-Access Provisioning",      "description": "Grant/revoke access controls"},
    {"code": 3,  "name": "Privileged-Access Review",         "description": "Admin/superuser governance"},
    {"code": 4,  "name": "Segregation in IT Roles",          "description": "Dev vs prod separation"},
    {"code": 5,  "name": "Backup & Recovery Testing",        "description": "Backup success and restore tests"},
    {"code": 6,  "name": "Job Scheduling & Batch",           "description": "Batch-failure monitoring"},
    {"code": 7,  "name": "Program-Change Migration",         "description": "Code-to-production controls"},
    {"code": 8,  "name": "Password & Authentication Policy", "description": "Complexity, MFA, expiry"},
    {"code": 9,  "name": "Audit-Log Configuration",          "description": "Logging enabled and retained"},
    {"code": 10, "name": "Patch & Vulnerability Mgmt",       "description": "Timely patching evidence"},
    {"code": 11, "name": "Environment Segregation",          "description": "Dev/test/prod boundaries"},
    {"code": 12, "name": "Interface & Data-Transfer Controls","description": "System-to-system integrity"},
    {"code": 13, "name": "New-System Implementation",        "description": "Go-live control readiness"},
    {"code": 14, "name": "IT Vendor / Support Access",       "description": "Third-party access governance"},
    {"code": 15, "name": "ITGC Deficiency Roll-up",          "description": "Impact on application controls"},
]


class TestStatus(str, PyEnum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED   = "completed"
    NEEDS_RETEST = "needs_retest"
    EXCEPTION   = "exception"


class RiskRating(str, PyEnum):
    NONE   = "none"
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"
    CRITICAL = "critical"


class ItgcTest(Base, TenantMixin):
    """One test execution against an ITGC procedure."""

    __tablename__ = "mod_itgc_tests"

    id: Mapped[int] = mapped_column(primary_key=True)
    procedure_code: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(20), default=TestStatus.NOT_STARTED.value
    )
    tester: Mapped[str] = mapped_column(String(255), default="")
    period: Mapped[str] = mapped_column(String(50), default="")
    risk_rating: Mapped[str] = mapped_column(
        String(20), default=RiskRating.NONE.value
    )
    observations: Mapped[str] = mapped_column(Text, default="")
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    tested_on: Mapped[str] = mapped_column(String(30), default="")
    conclusion: Mapped[str] = mapped_column(Text, default="")
