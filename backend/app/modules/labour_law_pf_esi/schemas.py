from datetime import date, datetime
from pydantic import BaseModel


# Contract Worker schemas
class ContractWorkerCreate(BaseModel):
    contractor_name: str
    worker_name: str
    uan: str | None = None
    esic_ip: str | None = None
    wage_rate: float = 0.0
    category: str
    doj: date
    status: str = "Active"


class ContractWorkerUpdate(BaseModel):
    contractor_name: str | None = None
    worker_name: str | None = None
    uan: str | None = None
    esic_ip: str | None = None
    wage_rate: float | None = None
    category: str | None = None
    doj: date | None = None
    status: str | None = None


class ContractWorkerOut(BaseModel):
    id: int
    contractor_name: str
    worker_name: str
    uan: str | None
    esic_ip: str | None
    wage_rate: float
    category: str
    doj: date
    status: str
    tenant_id: int

    model_config = {"from_attributes": True}


# Compliance Exception schemas
class ComplianceExceptionCreate(BaseModel):
    exception_type: str
    severity: str = "MEDIUM"
    description: str
    contractor_name: str
    worker_uan: str | None = None
    status: str = "OPEN"
    capa_plan: str | None = None


class ComplianceExceptionUpdate(BaseModel):
    status: str | None = None
    capa_plan: str | None = None


class ComplianceExceptionOut(BaseModel):
    id: int
    exception_type: str
    severity: str
    description: str
    contractor_name: str
    worker_uan: str | None
    audit_date: datetime
    status: str
    capa_plan: str | None
    tenant_id: int

    model_config = {"from_attributes": True}


# Labour Compliance Registry schemas
class RegistryItemCreate(BaseModel):
    registry_type: str
    compliance_name: str
    reference_law: str
    frequency: str
    due_date: date | None = None
    status: str = "COMPLIANT"
    assigned_owner: str
    notes: str = ""


class RegistryItemUpdate(BaseModel):
    compliance_name: str | None = None
    reference_law: str | None = None
    frequency: str | None = None
    due_date: date | None = None
    status: str | None = None
    assigned_owner: str | None = None
    notes: str | None = None


class RegistryItemOut(BaseModel):
    id: int
    registry_type: str
    compliance_name: str
    reference_law: str
    frequency: str
    due_date: date | None
    status: str
    last_reviewed: datetime
    assigned_owner: str
    notes: str
    tenant_id: int

    model_config = {"from_attributes": True}


# Dashboard Summary schemas
class DashboardSummaryOut(BaseModel):
    live_risk_index: float
    coverage_pct: float
    open_exception_count: int
    pending_capa_count: int
