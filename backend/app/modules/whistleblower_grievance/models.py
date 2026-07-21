from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Sub#1  Anonymous Intake Channel ──────────────────────────────────
# ── Sub#2  Case Triage & Categorisation ──────────────────────────────
# ── Sub#3  Conflict-Free Assignment ──────────────────────────────────
# ── Sub#4  Investigation Tracking ────────────────────────────────────
# ── Sub#5  Whistleblower Protection ──────────────────────────────────
# ── Sub#6  SLA & Ageing Monitor ──────────────────────────────────────
# ── Sub#7  Substantiation Outcome ────────────────────────────────────
# ── Sub#8  Disciplinary Action Linkage ───────────────────────────────
# ── Sub#11 Confidentiality Controls ──────────────────────────────────
# ── Sub#12 Feedback to Complainant ───────────────────────────────────
# ── Sub#13 Repeat-Complaint Linkage ──────────────────────────────────
# ── Sub#14 POSH/HR Grievance Split ──────────────────────────────────
# ── Sub#15 Ethics-Culture Survey ────────────────────────────────────
# All housed in the central Case entity below.


class WhistleblowerCase(Base, TenantMixin):
    """Central case entity covering Sub-pages 1‑14."""

    __tablename__ = "mod_whistleblower_grievance_cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_number: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)

    # Sub#2 — Triage & Categorisation
    category: Mapped[str] = mapped_column(String(50))          # fraud|harassment|discrimination|ethics|POSH|safety|other
    sub_category: Mapped[str] = mapped_column(String(100), default="")
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high|critical
    status: Mapped[str] = mapped_column(String(30), default="open")      # open|triaging|assigned|investigating|substantiated|unsubstantiated|closed

    # Sub#1 — Anonymous Intake
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    complainant_name: Mapped[str] = mapped_column(String(255), default="")
    complainant_email: Mapped[str] = mapped_column(String(255), default="")
    complainant_phone: Mapped[str] = mapped_column(String(50), default="")
    intake_mode: Mapped[str] = mapped_column(String(30), default="web")  # web|email|phone|walk-in|hotline

    # Sub#3 — Conflict-Free Assignment
    assigned_to_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    conflict_check_done: Mapped[bool] = mapped_column(Boolean, default=False)

    # Sub#4 — Investigation Tracking / timeline
    date_received: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    date_triaged: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    date_assigned: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    date_investigation_started: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    date_closed: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Sub#7 — Substantiation Outcome
    substantiation: Mapped[str] = mapped_column(String(20), default="pending")  # pending|founded|unfounded|inconclusive
    resolution_notes: Mapped[str] = mapped_column(Text, default="")

    # Sub#14 — POSH/HR Grievance Split
    routing: Mapped[str] = mapped_column(String(50), default="ethics")  # ethics|POSH|HR

    # Sub#6 — SLA
    sla_target_days: Mapped[int] = mapped_column(Integer, default=30)

    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class CaseComment(Base, TenantMixin):
    """Investigation / triage notes — Sub#4."""

    __tablename__ = "mod_whistleblower_grievance_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    comment: Mapped[str] = mapped_column(Text)
    comment_type: Mapped[str] = mapped_column(String(30), default="general")  # general|triage|investigation|note
    is_confidential: Mapped[bool] = mapped_column(Boolean, default=False)


class CaseAssignment(Base, TenantMixin):
    """Assignment history — Sub#3."""

    __tablename__ = "mod_whistleblower_grievance_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    assigned_to_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    assigned_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    reason: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CaseProtection(Base, TenantMixin):
    """Anti-retaliation safeguards — Sub#5."""

    __tablename__ = "mod_whistleblower_grievance_protections"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    protection_type: Mapped[str] = mapped_column(String(50))   # anonymity|non_retaliation|legal_counsel|relocation|other
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active|completed|revoked
    implemented_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class CaseOutcome(Base, TenantMixin):
    """Substantiation disposition — Sub#7."""

    __tablename__ = "mod_whistleblower_grievance_outcomes"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    outcome: Mapped[str] = mapped_column(String(20))           # founded|unfounded|inconclusive
    reasoning: Mapped[str] = mapped_column(Text)
    decided_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class CaseDisciplinary(Base, TenantMixin):
    """Consequence management — Sub#8."""

    __tablename__ = "mod_whistleblower_grievance_disciplinary"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    action_type: Mapped[str] = mapped_column(String(50))       # warning|suspension|termination|demotion|counseling|other
    description: Mapped[str] = mapped_column(Text)
    recipient: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|executed|appealed
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class CaseFeedback(Base, TenantMixin):
    """Complainant communication — Sub#12."""

    __tablename__ = "mod_whistleblower_grievance_feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    message: Mapped[str] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(String(30), default="email")  # email|phone|portal|other
    sent_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class CaseLink(Base, TenantMixin):
    """Repeat-complaint linkage — Sub#13."""

    __tablename__ = "mod_whistleblower_grievance_links"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id_1: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    case_id_2: Mapped[int] = mapped_column(Integer, ForeignKey("mod_whistleblower_grievance_cases.id"))
    relationship_type: Mapped[str] = mapped_column(String(50))  # related|duplicate|sequential|same_subject
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))


class EthicsSurvey(Base, TenantMixin):
    """Speak-up climate measurement — Sub#15."""

    __tablename__ = "mod_whistleblower_grievance_surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_name: Mapped[str] = mapped_column(String(255))
    respondent_count: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[int] = mapped_column(Integer, default=0)     # 0-100
    dimension: Mapped[str] = mapped_column(String(100))        # trust|awareness|willingness|satisfaction
    date_conducted: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    notes: Mapped[str] = mapped_column(Text, default="")
