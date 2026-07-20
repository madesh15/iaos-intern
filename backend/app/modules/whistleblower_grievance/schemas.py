from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ── Cases ─────────────────────────────────────────────────────────────

class CaseCreate(BaseModel):
    title: str
    description: str
    category: str
    sub_category: str = ""
    priority: str = "medium"
    is_anonymous: bool = True
    complainant_name: str = ""
    complainant_email: str = ""
    complainant_phone: str = ""
    intake_mode: str = "web"
    routing: str = "ethics"
    sla_target_days: int = 30


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_anonymous: Optional[bool] = None
    complainant_name: Optional[str] = None
    complainant_email: Optional[str] = None
    complainant_phone: Optional[str] = None
    intake_mode: Optional[str] = None
    assigned_to_id: Optional[int] = None
    conflict_check_done: Optional[bool] = None
    substantiation: Optional[str] = None
    resolution_notes: Optional[str] = None
    routing: Optional[str] = None
    sla_target_days: Optional[int] = None
    date_triaged: Optional[datetime] = None
    date_assigned: Optional[datetime] = None
    date_investigation_started: Optional[datetime] = None
    date_closed: Optional[datetime] = None


class CaseOut(BaseModel):
    id: int
    case_number: str
    title: str
    description: str
    category: str
    sub_category: str
    priority: str
    status: str
    is_anonymous: bool
    complainant_name: str
    complainant_email: str
    complainant_phone: str
    intake_mode: str
    assigned_to_id: Optional[int]
    conflict_check_done: bool
    date_received: datetime
    date_triaged: Optional[datetime]
    date_assigned: Optional[datetime]
    date_investigation_started: Optional[datetime]
    date_closed: Optional[datetime]
    substantiation: str
    resolution_notes: str
    routing: str
    sla_target_days: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Comments ──────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    comment: str
    comment_type: str = "general"
    is_confidential: bool = False


class CommentOut(BaseModel):
    id: int
    case_id: int
    user_id: int
    comment: str
    comment_type: str
    is_confidential: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Assignments ───────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    assigned_to_id: int
    reason: str = ""


class AssignmentOut(BaseModel):
    id: int
    case_id: int
    assigned_to_id: int
    assigned_by_id: int
    reason: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Protections ───────────────────────────────────────────────────────

class ProtectionCreate(BaseModel):
    protection_type: str
    description: str
    status: str = "active"


class ProtectionOut(BaseModel):
    id: int
    case_id: int
    protection_type: str
    description: str
    status: str
    implemented_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Outcomes ──────────────────────────────────────────────────────────

class OutcomeCreate(BaseModel):
    outcome: str
    reasoning: str


class OutcomeOut(BaseModel):
    id: int
    case_id: int
    outcome: str
    reasoning: str
    decided_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Disciplinary ──────────────────────────────────────────────────────

class DisciplinaryCreate(BaseModel):
    action_type: str
    description: str
    recipient: str
    status: str = "pending"


class DisciplinaryOut(BaseModel):
    id: int
    case_id: int
    action_type: str
    description: str
    recipient: str
    status: str
    created_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Feedback ──────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    message: str
    channel: str = "email"


class FeedbackOut(BaseModel):
    id: int
    case_id: int
    message: str
    channel: str
    sent_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Links ─────────────────────────────────────────────────────────────

class LinkCreate(BaseModel):
    case_id_2: int
    relationship_type: str


class LinkOut(BaseModel):
    id: int
    case_id_1: int
    case_id_2: int
    relationship_type: str
    created_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Surveys ───────────────────────────────────────────────────────────

class SurveyCreate(BaseModel):
    survey_name: str
    respondent_count: int = 0
    score: int = 0
    dimension: str
    notes: str = ""


class SurveyOut(BaseModel):
    id: int
    survey_name: str
    respondent_count: int
    score: int
    dimension: str
    date_conducted: datetime
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}
