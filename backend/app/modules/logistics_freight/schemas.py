from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class CarrierCreate(BaseModel):
    name: str
    code: str
    carrier_type: str = "Truck"
    status: str = "Active"
    contact_person: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    registration_number: str = ""
    tax_id: str = ""
    insurance_details: str = ""


class CarrierUpdate(BaseModel):
    name: Optional[str] = None
    carrier_type: Optional[str] = None
    status: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    insurance_details: Optional[str] = None


class CarrierOut(BaseModel):
    id: int
    name: str
    code: str
    carrier_type: str
    status: str
    contact_person: str
    email: str
    phone: str
    address: str
    registration_number: str
    tax_id: str
    insurance_details: str
    performance_score: float
    on_time_percentage: float
    damage_percentage: float
    claim_percentage: float
    delay_percentage: float
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VehicleCreate(BaseModel):
    carrier_id: int
    registration_number: str
    vehicle_type: str = "Truck"
    capacity_kg: float = 0
    capacity_cbm: float = 0
    make: str = ""
    model: str = ""
    year: int = 0
    status: str = "Available"


class VehicleUpdate(BaseModel):
    carrier_id: Optional[int] = None
    registration_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    capacity_kg: Optional[float] = None
    capacity_cbm: Optional[float] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = None


class VehicleOut(BaseModel):
    id: int
    carrier_id: int
    registration_number: str
    vehicle_type: str
    capacity_kg: float
    capacity_cbm: float
    make: str
    model: str
    year: int
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RouteCreate(BaseModel):
    origin: str
    destination: str
    origin_code: str = ""
    destination_code: str = ""
    distance_km: float = 0
    standard_transit_hours: float = 0
    mode: str = "Road"
    is_active: bool = True


class RouteUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    origin_code: Optional[str] = None
    destination_code: Optional[str] = None
    distance_km: Optional[float] = None
    standard_transit_hours: Optional[float] = None
    mode: Optional[str] = None
    is_active: Optional[bool] = None


class RouteOut(BaseModel):
    id: int
    origin: str
    destination: str
    origin_code: str
    destination_code: str
    distance_km: float
    standard_transit_hours: float
    mode: str
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FreightRateContractCreate(BaseModel):
    contract_number: str
    carrier_id: int
    route_id: Optional[int] = None
    effective_date: date
    expiry_date: date
    rate_per_kg: float = 0
    rate_per_km: float = 0
    rate_per_shipment: float = 0
    fuel_surcharge_pct: float = 0
    minimum_charge: float = 0
    volume_discount_pct: float = 0
    detention_rate_per_hour: float = 0
    free_detention_hours: int = 0
    terms: str = ""
    status: str = "Active"


class FreightRateContractUpdate(BaseModel):
    contract_number: Optional[str] = None
    carrier_id: Optional[int] = None
    route_id: Optional[int] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    rate_per_kg: Optional[float] = None
    rate_per_km: Optional[float] = None
    rate_per_shipment: Optional[float] = None
    fuel_surcharge_pct: Optional[float] = None
    minimum_charge: Optional[float] = None
    volume_discount_pct: Optional[float] = None
    detention_rate_per_hour: Optional[float] = None
    free_detention_hours: Optional[int] = None
    terms: Optional[str] = None
    status: Optional[str] = None


class FreightRateContractOut(BaseModel):
    id: int
    contract_number: str
    carrier_id: int
    route_id: Optional[int] = None
    effective_date: date
    expiry_date: date
    rate_per_kg: float
    rate_per_km: float
    rate_per_shipment: float
    fuel_surcharge_pct: float
    minimum_charge: float
    volume_discount_pct: float
    detention_rate_per_hour: float
    free_detention_hours: int
    terms: str
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FreightShipmentCreate(BaseModel):
    shipment_number: str
    lr_number: str = ""
    carrier_id: int
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    contract_id: Optional[int] = None
    shipment_date: date
    expected_delivery_date: date
    actual_delivery_date: Optional[date] = None
    indent_date: Optional[date] = None
    vehicle_placement_date: Optional[date] = None
    origin: str
    destination: str
    mode: str = "Road"
    commodity: str = ""
    actual_weight_kg: float = 0
    charged_weight_kg: float = 0
    volume_cbm: float = 0
    expected_distance_km: float = 0
    actual_distance_km: float = 0
    contract_rate: float = 0
    billed_rate: float = 0
    freight_amount: float = 0
    fuel_surcharge: float = 0
    detention_charges: float = 0
    other_charges: float = 0
    total_amount: float = 0
    accrued_freight: float = 0
    notes: str = ""
    status: str = "In Transit"


class FreightShipmentUpdate(BaseModel):
    shipment_number: Optional[str] = None
    lr_number: Optional[str] = None
    carrier_id: Optional[int] = None
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    contract_id: Optional[int] = None
    shipment_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    actual_delivery_date: Optional[date] = None
    indent_date: Optional[date] = None
    vehicle_placement_date: Optional[date] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    mode: Optional[str] = None
    commodity: Optional[str] = None
    actual_weight_kg: Optional[float] = None
    charged_weight_kg: Optional[float] = None
    volume_cbm: Optional[float] = None
    expected_distance_km: Optional[float] = None
    actual_distance_km: Optional[float] = None
    contract_rate: Optional[float] = None
    billed_rate: Optional[float] = None
    freight_amount: Optional[float] = None
    fuel_surcharge: Optional[float] = None
    detention_charges: Optional[float] = None
    other_charges: Optional[float] = None
    total_amount: Optional[float] = None
    accrued_freight: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class FreightShipmentOut(BaseModel):
    id: int
    shipment_number: str
    lr_number: str
    carrier_id: int
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    contract_id: Optional[int] = None
    shipment_date: date
    expected_delivery_date: date
    actual_delivery_date: Optional[date] = None
    indent_date: Optional[date] = None
    vehicle_placement_date: Optional[date] = None
    origin: str
    destination: str
    mode: str
    commodity: str
    actual_weight_kg: float
    charged_weight_kg: float
    volume_cbm: float
    expected_distance_km: float
    actual_distance_km: float
    contract_rate: float
    billed_rate: float
    freight_amount: float
    fuel_surcharge: float
    detention_charges: float
    other_charges: float
    total_amount: float
    accrued_freight: float
    notes: str
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FreightInvoiceCreate(BaseModel):
    invoice_number: str
    shipment_id: Optional[int] = None
    carrier_id: int
    invoice_date: date
    due_date: date
    billed_amount: float = 0
    approved_amount: float = 0
    difference_amount: float = 0
    fuel_surcharge_billed: float = 0
    detention_billed: float = 0
    tax_amount: float = 0
    total_amount: float = 0
    currency: str = "INR"
    status: str = "Pending"
    payment_status: str = "Unpaid"
    payment_date: Optional[date] = None
    notes: str = ""


class FreightInvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    shipment_id: Optional[int] = None
    carrier_id: Optional[int] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    billed_amount: Optional[float] = None
    approved_amount: Optional[float] = None
    difference_amount: Optional[float] = None
    fuel_surcharge_billed: Optional[float] = None
    detention_billed: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_date: Optional[date] = None
    notes: Optional[str] = None


class FreightInvoiceOut(BaseModel):
    id: int
    invoice_number: str
    shipment_id: Optional[int] = None
    carrier_id: int
    invoice_date: date
    due_date: date
    billed_amount: float
    approved_amount: float
    difference_amount: float
    fuel_surcharge_billed: float
    detention_billed: float
    tax_amount: float
    total_amount: float
    currency: str
    status: str
    payment_status: str
    payment_date: Optional[date] = None
    notes: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PODCreate(BaseModel):
    shipment_id: int
    pod_number: str
    received_date: Optional[date] = None
    received_by: str = ""
    condition: str = "Good"
    remarks: str = ""
    document_url: str = ""
    is_delivered: bool = False


class PODUpdate(BaseModel):
    pod_number: Optional[str] = None
    received_date: Optional[date] = None
    received_by: Optional[str] = None
    condition: Optional[str] = None
    remarks: Optional[str] = None
    document_url: Optional[str] = None
    is_delivered: Optional[bool] = None


class PODOut(BaseModel):
    id: int
    shipment_id: int
    pod_number: str
    received_date: Optional[date] = None
    received_by: str
    condition: str
    remarks: str
    document_url: str
    is_delivered: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FuelIndexCreate(BaseModel):
    fuel_type: str
    index_date: date
    base_price: float = 0
    current_price: float = 0
    surcharge_formula: str = ""


class FuelIndexUpdate(BaseModel):
    fuel_type: Optional[str] = None
    index_date: Optional[date] = None
    base_price: Optional[float] = None
    current_price: Optional[float] = None
    surcharge_formula: Optional[str] = None


class FuelIndexOut(BaseModel):
    id: int
    fuel_type: str
    index_date: date
    base_price: float
    current_price: float
    surcharge_formula: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClaimCreate(BaseModel):
    claim_number: str
    shipment_id: int
    carrier_id: int
    claim_type: str
    claim_date: date
    claim_value: float = 0
    recovered_amount: float = 0
    pending_amount: float = 0
    rejected_amount: float = 0
    status: str = "Open"
    resolution_date: Optional[date] = None
    notes: str = ""


class ClaimUpdate(BaseModel):
    claim_number: Optional[str] = None
    shipment_id: Optional[int] = None
    carrier_id: Optional[int] = None
    claim_type: Optional[str] = None
    claim_date: Optional[date] = None
    claim_value: Optional[float] = None
    recovered_amount: Optional[float] = None
    pending_amount: Optional[float] = None
    rejected_amount: Optional[float] = None
    status: Optional[str] = None
    resolution_date: Optional[date] = None
    notes: Optional[str] = None


class ClaimOut(BaseModel):
    id: int
    claim_number: str
    shipment_id: int
    carrier_id: int
    claim_type: str
    claim_date: date
    claim_value: float
    recovered_amount: float
    pending_amount: float
    rejected_amount: float
    status: str
    resolution_date: Optional[date] = None
    notes: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DetentionChargeCreate(BaseModel):
    shipment_id: int
    carrier_id: int
    detention_type: str
    free_hours: int = 0
    actual_hours: int = 0
    chargeable_hours: int = 0
    rate_per_hour: float = 0
    total_amount: float = 0
    is_avoidable: bool = True
    reason: str = ""


class DetentionChargeUpdate(BaseModel):
    shipment_id: Optional[int] = None
    carrier_id: Optional[int] = None
    detention_type: Optional[str] = None
    free_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    chargeable_hours: Optional[int] = None
    rate_per_hour: Optional[float] = None
    total_amount: Optional[float] = None
    is_avoidable: Optional[bool] = None
    reason: Optional[str] = None


class DetentionChargeOut(BaseModel):
    id: int
    shipment_id: int
    carrier_id: int
    detention_type: str
    free_hours: int
    actual_hours: int
    chargeable_hours: int
    rate_per_hour: float
    total_amount: float
    is_avoidable: bool
    reason: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardKPICreate(BaseModel):
    kpi_name: str
    kpi_value: float = 0
    kpi_category: str
    period: str
    period_start: date
    period_end: date


class DashboardKPIOut(BaseModel):
    id: int
    kpi_name: str
    kpi_value: float
    kpi_category: str
    period: str
    period_start: date
    period_end: date
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FindingCreate(BaseModel):
    finding_number: str
    title: str
    category: str
    severity: str
    description: str
    impact: str = ""
    recommendation: str = ""
    status: str = "Open"
    source_reference: str = ""
    financial_impact: float = 0


class FindingUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    impact: Optional[str] = None
    recommendation: Optional[str] = None
    status: Optional[str] = None
    source_reference: Optional[str] = None
    financial_impact: Optional[float] = None


class FindingOut(BaseModel):
    id: int
    finding_number: str
    title: str
    category: str
    severity: str
    description: str
    impact: str
    recommendation: str
    status: str
    source_reference: str
    financial_impact: float
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ActionTrackerCreate(BaseModel):
    action_number: str
    finding_id: Optional[int] = None
    title: str
    assigned_to: str
    target_date: date
    completion_date: Optional[date] = None
    status: str = "Open"
    priority: str = "Medium"
    notes: str = ""


class ActionTrackerUpdate(BaseModel):
    title: Optional[str] = None
    assigned_to: Optional[str] = None
    target_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class ActionTrackerOut(BaseModel):
    id: int
    action_number: str
    finding_id: Optional[int] = None
    title: str
    assigned_to: str
    target_date: date
    completion_date: Optional[date] = None
    status: str
    priority: str
    notes: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


class AnalyticsOverbilling(BaseModel):
    shipment_id: int
    shipment_number: str
    contract_rate: float
    billed_rate: float
    difference: float
    overbilling_pct: float


class AnalyticsWeightVariance(BaseModel):
    shipment_id: int
    shipment_number: str
    actual_weight: float
    charged_weight: float
    variance_pct: float


class AnalyticsRouteInflation(BaseModel):
    shipment_id: int
    shipment_number: str
    expected_distance: float
    actual_distance: float
    variance_pct: float


class AnalyticsDetention(BaseModel):
    total_detention_amount: float
    avoidable_amount: float
    avoidable_pct: float
    total_hours: int
    chargeable_hours: int


class AnalyticsCarrierScore(BaseModel):
    carrier_id: int
    carrier_name: str
    on_time_pct: float
    damage_pct: float
    claim_pct: float
    delay_pct: float
    overall_score: float


class AnalyticsDuplicateBilling(BaseModel):
    id: int
    invoice_number: str
    shipment_number: str
    lr_number: str
    amount: float
    match_reason: str


class AnalyticsFuelSurcharge(BaseModel):
    shipment_id: int
    shipment_number: str
    expected_surcharge: float
    billed_surcharge: float
    variance: float


class AnalyticsLRPODMatch(BaseModel):
    shipment_id: int
    shipment_number: str
    lr_number: str
    pod_number: str
    invoice_number: str
    is_matched: bool
    mismatch_details: str


class AnalyticsTransitSLA(BaseModel):
    shipment_id: int
    shipment_number: str
    expected_delivery: date
    actual_delivery: Optional[date]
    delay_days: int
    sla_breached: bool


class DashboardSummary(BaseModel):
    total_shipments: int
    total_freight_spend: float
    duplicate_bills: int
    open_claims: int
    delayed_deliveries: int
    avg_carrier_score: float
    avg_freight_cost: float
    risk_score: float
    total_contracts: int
    active_carriers: int
    pending_invoices: int
    total_findings: int


# === Scope & Audit Universe ===

class PlantCreate(BaseModel):
    code: str
    name: str
    location: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    contact_person: str = ""
    contact_phone: str = ""
    is_active: bool = True

class PlantUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None

class PlantOut(BaseModel):
    id: int
    code: str
    name: str
    location: str
    address: str
    city: str
    state: str
    pincode: str
    contact_person: str
    contact_phone: str
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class WarehouseCreate(BaseModel):
    code: str
    name: str
    location: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    capacity_sqft: float = 0
    capacity_pallets: int = 0
    contact_person: str = ""
    contact_phone: str = ""
    is_active: bool = True

class WarehouseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    capacity_sqft: Optional[float] = None
    capacity_pallets: Optional[int] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None

class WarehouseOut(BaseModel):
    id: int
    code: str
    name: str
    location: str
    address: str
    city: str
    state: str
    pincode: str
    capacity_sqft: float
    capacity_pallets: int
    contact_person: str
    contact_phone: str
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class RegionCreate(BaseModel):
    code: str
    name: str
    zone: str = ""
    countries: str = ""
    is_active: bool = True

class RegionUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    zone: Optional[str] = None
    countries: Optional[str] = None
    is_active: Optional[bool] = None

class RegionOut(BaseModel):
    id: int
    code: str
    name: str
    zone: str
    countries: str
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class BusinessUnitCreate(BaseModel):
    code: str
    name: str
    head: str = ""
    cost_center: str = ""
    budget_allocated: float = 0
    is_active: bool = True

class BusinessUnitUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    head: Optional[str] = None
    cost_center: Optional[str] = None
    budget_allocated: Optional[float] = None
    is_active: Optional[bool] = None

class BusinessUnitOut(BaseModel):
    id: int
    code: str
    name: str
    head: str
    cost_center: str
    budget_allocated: float
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Risk & Control Matrix ===

class RiskControlCreate(BaseModel):
    risk_code: str
    risk_description: str
    control_description: str = ""
    assertion: str = ""
    risk_category: str = ""
    likelihood: str = "Medium"
    impact: str = "Medium"
    inherent_risk: str = "Medium"
    control_frequency: str = "Monthly"
    control_owner: str = ""
    residual_risk: str = "Medium"

class RiskControlUpdate(BaseModel):
    risk_code: Optional[str] = None
    risk_description: Optional[str] = None
    control_description: Optional[str] = None
    assertion: Optional[str] = None
    risk_category: Optional[str] = None
    likelihood: Optional[str] = None
    impact: Optional[str] = None
    inherent_risk: Optional[str] = None
    control_frequency: Optional[str] = None
    control_owner: Optional[str] = None
    residual_risk: Optional[str] = None

class RiskControlOut(BaseModel):
    id: int
    risk_code: str
    risk_description: str
    control_description: str
    assertion: str
    risk_category: str
    likelihood: str
    impact: str
    inherent_risk: str
    control_frequency: str
    control_owner: str
    residual_risk: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Test & Analytics Rule Library ===

class TestRuleCreate(BaseModel):
    rule_code: str
    rule_name: str
    description: str = ""
    category: str = ""
    expression: str = ""
    threshold_value: float = 0
    threshold_operator: str = ">"
    severity: str = "Medium"
    is_active: bool = True

class TestRuleUpdate(BaseModel):
    rule_code: Optional[str] = None
    rule_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    expression: Optional[str] = None
    threshold_value: Optional[float] = None
    threshold_operator: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None

class TestRuleOut(BaseModel):
    id: int
    rule_code: str
    rule_name: str
    description: str
    category: str
    expression: str
    threshold_value: float
    threshold_operator: str
    severity: str
    is_active: bool
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Data Source & Connector Setup ===

class DataSourceCreate(BaseModel):
    source_code: str
    source_name: str
    source_type: str = "API"
    connection_string: str = ""
    table_name: str = ""
    file_format: str = ""
    is_active: bool = True

class DataSourceUpdate(BaseModel):
    source_code: Optional[str] = None
    source_name: Optional[str] = None
    source_type: Optional[str] = None
    connection_string: Optional[str] = None
    table_name: Optional[str] = None
    file_format: Optional[str] = None
    is_active: Optional[bool] = None

class DataSourceOut(BaseModel):
    id: int
    source_code: str
    source_name: str
    source_type: str
    connection_string: str
    table_name: str
    file_format: str
    is_active: bool
    last_sync_date: Optional[date] = None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Sampling & Population Builder ===

class SamplingRecordCreate(BaseModel):
    sample_code: str
    population_table: str
    population_count: int = 0
    sample_size: int = 0
    sampling_method: str = "Random"
    confidence_level: float = 95
    margin_of_error: float = 5
    sample_data: str = "[]"
    status: str = "Draft"
    created_by: str = ""

class SamplingRecordUpdate(BaseModel):
    population_table: Optional[str] = None
    population_count: Optional[int] = None
    sample_size: Optional[int] = None
    sampling_method: Optional[str] = None
    confidence_level: Optional[float] = None
    margin_of_error: Optional[float] = None
    sample_data: Optional[str] = None
    status: Optional[str] = None
    created_by: Optional[str] = None

class SamplingRecordOut(BaseModel):
    id: int
    sample_code: str
    population_table: str
    population_count: int
    sample_size: int
    sampling_method: str
    confidence_level: float
    margin_of_error: float
    sample_data: str
    status: str
    created_by: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Exception Queue ===

class ExceptionItemCreate(BaseModel):
    exception_code: str
    title: str
    category: str = ""
    severity: str = "Medium"
    description: str = ""
    source_reference: str = ""
    financial_impact: float = 0
    assigned_to: str = ""
    comments: str = ""
    status: str = "Open"

class ExceptionItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    source_reference: Optional[str] = None
    financial_impact: Optional[float] = None
    assigned_to: Optional[str] = None
    comments: Optional[str] = None
    status: Optional[str] = None

class ExceptionItemOut(BaseModel):
    id: int
    exception_code: str
    title: str
    category: str
    severity: str
    description: str
    source_reference: str
    financial_impact: float
    assigned_to: str
    comments: str
    status: str
    resolved_date: Optional[date] = None
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

# === Working Papers ===

class WorkingPaperCreate(BaseModel):
    wp_code: str
    title: str
    category: str = ""
    description: str = ""
    file_type: str = "PDF"
    file_url: str = ""
    file_size: int = 0
    reviewed_by: str = ""
    status: str = "Draft"

class WorkingPaperUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    file_type: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    reviewed_by: Optional[str] = None
    reviewed_date: Optional[date] = None
    reviewer_signoff: Optional[bool] = None
    status: Optional[str] = None

class WorkingPaperOut(BaseModel):
    id: int
    wp_code: str
    title: str
    category: str
    description: str
    file_type: str
    file_url: str
    file_size: int
    reviewed_by: str
    reviewed_date: Optional[date] = None
    reviewer_signoff: bool
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
