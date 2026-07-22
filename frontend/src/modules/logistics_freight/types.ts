export interface DashboardData {
  total_shipments: number;
  total_freight_spend: number;
  duplicate_bills: number;
  open_claims: number;
  delayed_deliveries: number;
  avg_carrier_score: number;
  avg_freight_cost: number;
  risk_score: number;
  total_contracts: number;
  active_carriers: number;
  pending_invoices: number;
  total_findings: number;
}

export interface TrendData {
  period: string;
  shipment_count: number;
  total_cost: number;
  cost_per_shipment: number;
  cost_per_ton: number;
  cost_per_km: number;
}

export interface CarrierData {
  id: number;
  name: string;
  code: string;
  carrier_type: string;
  status: string;
  performance_score: number;
  on_time_percentage: number;
  damage_percentage: number;
  claim_percentage: number;
  delay_percentage: number;
}

export interface ShipmentData {
  id: number;
  shipment_number: string;
  lr_number: string;
  carrier_id: number;
  route_id: number | null;
  vehicle_id: number | null;
  contract_id: number | null;
  shipment_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  origin: string;
  destination: string;
  mode: string;
  commodity: string;
  actual_weight_kg: number;
  charged_weight_kg: number;
  volume_cbm: number;
  total_amount: number;
  status: string;
}

export interface InvoiceData {
  id: number;
  invoice_number: string;
  shipment_id: number | null;
  carrier_id: number;
  invoice_date: string;
  due_date: string;
  billed_amount: number;
  approved_amount: number;
  difference_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
}

export interface ContractData {
  id: number;
  contract_number: string;
  carrier_id: number;
  effective_date: string;
  expiry_date: string;
  rate_per_kg: number;
  rate_per_km: number;
  fuel_surcharge_pct: number;
  status: string;
}

export interface ClaimData {
  id: number;
  claim_number: string;
  shipment_id: number;
  carrier_id: number;
  claim_type: string;
  claim_date: string;
  claim_value: number;
  recovered_amount: number;
  pending_amount: number;
  rejected_amount: number;
  status: string;
}

export interface PODData {
  id: number;
  shipment_id: number;
  pod_number: string;
  received_date: string | null;
  condition: string;
  is_delivered: boolean;
}

export interface FindingData {
  id: number;
  finding_number: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  recommendation: string;
  status: string;
  financial_impact: number;
}

export interface ActionData {
  id: number;
  action_number: string;
  finding_id: number | null;
  title: string;
  assigned_to: string;
  target_date: string;
  completion_date: string | null;
  status: string;
  priority: string;
}

export interface PlantData {
  id: number;
  code: string;
  name: string;
  location: string;
  city: string;
  state: string;
  is_active: boolean;
}

export interface WarehouseData {
  id: number;
  code: string;
  name: string;
  location: string;
  city: string;
  capacity_sqft: number;
  capacity_pallets: number;
  is_active: boolean;
}

export interface RegionData {
  id: number;
  code: string;
  name: string;
  zone: string;
  is_active: boolean;
}

export interface BusinessUnitData {
  id: number;
  code: string;
  name: string;
  head: string;
  cost_center: string;
  budget_allocated: number;
}

export interface RiskControlData {
  id: number;
  risk_code: string;
  risk_description: string;
  control_description: string;
  assertion: string;
  risk_category: string;
  inherent_risk: string;
  residual_risk: string;
  control_owner: string;
}

export interface TestRuleData {
  id: number;
  rule_code: string;
  rule_name: string;
  category: string;
  expression: string;
  threshold_value: number;
  threshold_operator: string;
  severity: string;
  is_active: boolean;
}

export interface DataSourceData {
  id: number;
  source_code: string;
  source_name: string;
  source_type: string;
  is_active: boolean;
  last_sync_date: string | null;
}

export interface SamplingData {
  id: number;
  sample_code: string;
  population_table: string;
  population_count: number;
  sample_size: number;
  sampling_method: string;
  confidence_level: number;
  margin_of_error: number;
  status: string;
}

export interface ExceptionData {
  id: number;
  exception_code: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  financial_impact: number;
  assigned_to: string;
  status: string;
}

export interface WorkingPaperData {
  id: number;
  wp_code: string;
  title: string;
  category: string;
  file_type: string;
  status: string;
  reviewed_by: string;
  reviewer_signoff: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
