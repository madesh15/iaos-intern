from datetime import date

from pydantic import BaseModel, Field


# ── Scope & Audit Universe ────────────────────────────────────────────
class ScopeUnitCreate(BaseModel):
    name: str
    unit_type: str = "Location"
    headcount: int = 0
    risk_rating: str = "Medium"
    in_scope: bool = True
    notes: str = ""


class ScopeUnitOut(ScopeUnitCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Risk & Control Matrix ─────────────────────────────────────────────
class RcmEntryCreate(BaseModel):
    risk: str
    control: str = ""
    assertion: str = "Accuracy"
    control_owner: str = ""
    risk_rating: str = "Medium"


class RcmEntryOut(RcmEntryCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Test & Analytics Rule Library ─────────────────────────────────────
class RuleCreate(BaseModel):
    code: str = ""
    name: str
    category: str = "Custom"
    description: str = ""
    threshold: str = ""
    enabled: bool = True


class RuleUpdate(BaseModel):
    threshold: str | None = None
    enabled: bool | None = None


class RuleOut(RuleCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Data Source & Connector Setup ─────────────────────────────────────
class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "File upload"
    status: str = "Not connected"
    notes: str = ""


class DataSourceOut(DataSourceCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Sampling & Population Builder ─────────────────────────────────────
class SampleCreate(BaseModel):
    name: str
    population_size: int = 0
    sample_size: int = 0
    method: str = "Random"
    criteria: str = ""


class SampleOut(SampleCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Exception & Red-Flag Queue ────────────────────────────────────────
class ExceptionCreate(BaseModel):
    rule_id: int | None = None
    reference: str = ""
    detail: str = ""
    severity: str = "Medium"
    status: str = "Open"
    disposition: str = ""


class ExceptionUpdate(BaseModel):
    status: str | None = None
    disposition: str | None = None
    severity: str | None = None


class ExceptionOut(BaseModel):
    id: int
    rule_id: int | None
    rule_name: str
    reference: str
    detail: str
    severity: str
    status: str
    disposition: str
    model_config = {"from_attributes": True}


# ── Working Papers & Evidence ─────────────────────────────────────────
class EvidenceCreate(BaseModel):
    title: str
    reference: str = ""
    exception_id: int | None = None
    reviewer: str = ""
    signed_off: bool = False
    notes: str = ""


class EvidenceOut(EvidenceCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Observation & Finding Log ─────────────────────────────────────────
class FindingCreate(BaseModel):
    title: str
    rule_id: int | None = None
    severity: str = "Medium"
    status: str = "Open"
    owner: str = ""
    description: str = ""


class FindingUpdate(BaseModel):
    status: str | None = None
    owner: str | None = None
    severity: str | None = None


class FindingOut(FindingCreate):
    id: int
    model_config = {"from_attributes": True}


# ── Remediation / Action Tracker ──────────────────────────────────────
class ActionCreate(BaseModel):
    finding_id: int | None = None
    owner: str = ""
    due_date: date | None = None
    status: str = "Pending"
    notes: str = ""


class ActionUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


class ActionOut(BaseModel):
    id: int
    finding_id: int | None
    finding_title: str
    owner: str
    due_date: date | None
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Module Dashboard & KPIs ────────────────────────────────────────────
class DashboardOut(BaseModel):
    scope_units: int
    scope_in_scope: int
    coverage_pct: float
    rules_enabled: int
    rules_total: int
    open_exceptions: int
    exceptions_by_severity: dict[str, int]
    open_findings: int
    findings_by_status: dict[str, int]
    actions_open: int
    actions_overdue: int
    risk_score: int = Field(description="0-100 composite risk score for this module")
