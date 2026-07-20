"""Pydantic request/response schemas for Item Material Master Governance."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ── Item ────────────────────────────────────────────────────────────────────

class ItemCreate(BaseModel):
    item_code: str
    item_name: str
    item_category: str | None = None
    item_subcategory: str | None = None
    material_group: str | None = None
    hsn_code: str | None = None
    gst_rate: float | None = None
    tax_code: str | None = None
    valuation_class: str | None = None
    gl_mapping: str | None = None
    purchase_uom: str | None = None
    sales_uom: str | None = None
    inventory_uom: str | None = None
    uom_conversion_factor: float | None = None
    weight: float | None = None
    mrp: float | None = None
    specification: str | None = None
    standard_cost: float | None = None
    reorder_level: float | None = None
    max_stock: float | None = None
    min_stock: float | None = None
    is_blocked: bool = False
    is_deleted: bool = False
    is_active: bool = True
    is_discontinued: bool = False
    batch_managed: bool = False
    serial_tracked: bool = False
    parent_material_id: int | None = None
    bom_active: bool = False
    naming_prefix: str | None = None
    plant: str | None = None
    storage_location: str | None = None
    warehouse: str | None = None
    maker: str | None = None
    checker: str | None = None
    approval_date: datetime | None = None
    approved_by: str | None = None
    last_movement_date: datetime | None = None


class ItemUpdate(BaseModel):
    item_name: str | None = None
    item_category: str | None = None
    item_subcategory: str | None = None
    material_group: str | None = None
    hsn_code: str | None = None
    gst_rate: float | None = None
    tax_code: str | None = None
    valuation_class: str | None = None
    gl_mapping: str | None = None
    purchase_uom: str | None = None
    sales_uom: str | None = None
    inventory_uom: str | None = None
    uom_conversion_factor: float | None = None
    weight: float | None = None
    mrp: float | None = None
    specification: str | None = None
    standard_cost: float | None = None
    reorder_level: float | None = None
    max_stock: float | None = None
    min_stock: float | None = None
    is_blocked: bool | None = None
    is_deleted: bool | None = None
    is_active: bool | None = None
    is_discontinued: bool | None = None
    batch_managed: bool | None = None
    serial_tracked: bool | None = None
    parent_material_id: int | None = None
    bom_active: bool | None = None
    naming_prefix: str | None = None
    plant: str | None = None
    storage_location: str | None = None
    warehouse: str | None = None
    maker: str | None = None
    checker: str | None = None
    approval_date: datetime | None = None
    approved_by: str | None = None
    last_movement_date: datetime | None = None


class ItemOut(BaseModel):
    id: int
    item_code: str
    item_name: str
    item_category: str | None
    item_subcategory: str | None
    material_group: str | None
    hsn_code: str | None
    gst_rate: float | None
    tax_code: str | None
    valuation_class: str | None
    gl_mapping: str | None
    purchase_uom: str | None
    sales_uom: str | None
    inventory_uom: str | None
    uom_conversion_factor: float | None
    weight: float | None
    mrp: float | None
    specification: str | None
    standard_cost: float | None
    reorder_level: float | None
    max_stock: float | None
    min_stock: float | None
    is_blocked: bool
    is_deleted: bool
    is_active: bool
    is_discontinued: bool
    batch_managed: bool
    serial_tracked: bool
    parent_material_id: int | None
    bom_active: bool
    naming_prefix: str | None
    plant: str | None
    storage_location: str | None
    warehouse: str | None
    maker: str | None
    checker: str | None
    approval_date: datetime | None
    approved_by: str | None
    last_movement_date: datetime | None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int | None
    updated_by: int | None

    model_config = ConfigDict(from_attributes=True)


# ── Exception ──────────────────────────────────────────────────────────────

class ExceptionCreate(BaseModel):
    item_id: int
    exception_type: str
    severity: str
    description: str
    status: str = "open"


class ExceptionUpdate(BaseModel):
    severity: str | None = None
    description: str | None = None
    status: str | None = None
    resolved_by: str | None = None


class ExceptionOut(BaseModel):
    id: int
    item_id: int
    exception_type: str
    severity: str
    description: str
    status: str
    resolved_at: datetime | None
    resolved_by: str | None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int | None
    updated_by: int | None

    model_config = ConfigDict(from_attributes=True)


# ── Finding ────────────────────────────────────────────────────────────────

class FindingCreate(BaseModel):
    item_id: int
    finding_type: str
    description: str
    severity: str
    status: str = "open"
    assigned_to: str | None = None


class FindingUpdate(BaseModel):
    description: str | None = None
    severity: str | None = None
    status: str | None = None
    assigned_to: str | None = None


class FindingOut(BaseModel):
    id: int
    item_id: int
    finding_type: str
    description: str
    severity: str
    status: str
    assigned_to: str | None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int | None
    updated_by: int | None

    model_config = ConfigDict(from_attributes=True)


# ── Remediation ────────────────────────────────────────────────────────────

class RemediationCreate(BaseModel):
    finding_id: int
    action: str
    status: str = "pending"


class RemediationUpdate(BaseModel):
    action: str | None = None
    status: str | None = None
    completed_by: str | None = None


class RemediationOut(BaseModel):
    id: int
    finding_id: int
    action: str
    status: str
    completed_at: datetime | None
    completed_by: str | None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int | None
    updated_by: int | None

    model_config = ConfigDict(from_attributes=True)


# ── Rule ────────────────────────────────────────────────────────────────────

class RuleCreate(BaseModel):
    rule_name: str
    rule_type: str
    is_enabled: bool = True
    parameters: dict | None = None
    severity: str = "medium"
    description: str | None = None


class RuleUpdate(BaseModel):
    rule_name: str | None = None
    is_enabled: bool | None = None
    parameters: dict | None = None
    severity: str | None = None
    description: str | None = None


class RuleOut(BaseModel):
    id: int
    rule_name: str
    rule_type: str
    is_enabled: bool
    parameters: dict | None
    severity: str
    description: str | None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int | None
    updated_by: int | None

    model_config = ConfigDict(from_attributes=True)


# ── Analytics ──────────────────────────────────────────────────────────────

class DuplicateResult(BaseModel):
    item_id_1: int
    item_code_1: str
    item_name_1: str
    item_id_2: int
    item_code_2: str
    item_name_2: str
    confidence: float
    reason: str


class MasterCompletenessResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    missing_fields: list[str]


class HsnResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    hsn_code: str | None
    gst_rate: float | None
    tax_code: str | None
    issue: str
    severity: str


class UomResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    purchase_uom: str | None
    sales_uom: str | None
    inventory_uom: str | None
    uom_conversion_factor: float | None
    issue: str
    severity: str


class ValuationResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    valuation_class: str | None
    gl_mapping: str | None
    issue: str
    severity: str


class DeadStockResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    last_movement_date: datetime | None
    days_since_movement: int | None
    threshold_days: int


class BomResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    parent_material_id: int | None
    bom_active: bool
    issue: str
    severity: str


class WorkflowResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    maker: str | None
    checker: str | None
    approval_date: datetime | None
    approved_by: str | None
    issue: str
    severity: str


class NamingResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    naming_prefix: str | None
    expected_pattern: str | None
    issue: str
    severity: str


class CrossPlantResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    plant: str | None
    storage_location: str | None
    warehouse: str | None
    issue: str
    severity: str


class ReorderResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    reorder_level: float | None
    max_stock: float | None
    min_stock: float | None
    issue: str
    severity: str


class CategoryResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    item_category: str | None
    item_subcategory: str | None
    material_group: str | None
    issue: str
    severity: str


class ObsoleteResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    is_blocked: bool
    is_deleted: bool
    is_active: bool
    is_discontinued: bool
    issue: str
    severity: str


class BatchSerialResult(BaseModel):
    item_id: int
    item_code: str
    item_name: str
    batch_managed: bool
    serial_tracked: bool
    issue: str
    severity: str


class AnalyticsResponse(BaseModel):
    rule_type: str
    total_checked: int
    issues_found: int
    results: list


class AnalyticsRequest(BaseModel):
    threshold_days: int | None = None


# ── Dashboard ──────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_items: int
    active_items: int
    blocked_items: int
    total_exceptions: int
    open_exceptions: int
    total_findings: int
    open_findings: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    low_findings: int
    recent_exceptions: list[ExceptionOut]
    recent_findings: list[FindingOut]
