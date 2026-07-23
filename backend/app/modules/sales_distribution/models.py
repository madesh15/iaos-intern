from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class SalesDistributionItem(Base, TenantMixin):
    __tablename__ = "mod_sales_distribution_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")


class SalesSchemeLeakage(Base, TenantMixin):
    __tablename__ = "mod_sales_scheme_leakage"

    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(100))
    scheme_name: Mapped[str] = mapped_column(String(255))
    distributor_id: Mapped[str] = mapped_column(String(100))
    distributor_name: Mapped[str] = mapped_column(String(255))
    claimed_discount: Mapped[float] = mapped_column(Float, default=0.0)
    eligible_discount: Mapped[float] = mapped_column(Float, default=0.0)
    leakage_amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="Flagged")  # Flagged, Approved, Recovered, Ignored
    notes: Mapped[str] = mapped_column(Text, default="")


class PrimarySecondaryReconciliation(Base, TenantMixin):
    __tablename__ = "mod_sales_primary_secondary"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(50))  # e.g., 2026-Q1
    distributor_id: Mapped[str] = mapped_column(String(100))
    distributor_name: Mapped[str] = mapped_column(String(255))
    primary_sales_qty: Mapped[int] = mapped_column(Integer, default=0)
    secondary_sales_qty: Mapped[int] = mapped_column(Integer, default=0)
    stock_in_hand: Mapped[int] = mapped_column(Integer, default=0)
    variance_qty: Mapped[int] = mapped_column(Integer, default=0)
    variance_value: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(50), default="Medium")  # Low, Medium, High


class DistributorClaim(Base, TenantMixin):
    __tablename__ = "mod_sales_distributor_claims"

    id: Mapped[int] = mapped_column(primary_key=True)
    claim_no: Mapped[str] = mapped_column(String(100))
    claim_date: Mapped[date] = mapped_column(Date, default=date.today)
    distributor_name: Mapped[str] = mapped_column(String(255))
    claim_type: Mapped[str] = mapped_column(String(100))  # Damage, Scheme, Rate Diff, Freight
    claimed_amount: Mapped[float] = mapped_column(Float, default=0.0)
    approved_amount: Mapped[float] = mapped_column(Float, default=0.0)
    leakage_identified: Mapped[float] = mapped_column(Float, default=0.0)
    audit_status: Mapped[str] = mapped_column(String(50), default="Pending Review")


class PriceRealisationRecord(Base, TenantMixin):
    __tablename__ = "mod_sales_price_realisation"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku_code: Mapped[str] = mapped_column(String(100))
    sku_name: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(100))
    list_price: Mapped[float] = mapped_column(Float, default=0.0)
    net_realised_price: Mapped[float] = mapped_column(Float, default=0.0)
    target_margin_pct: Mapped[float] = mapped_column(Float, default=0.0)
    actual_margin_pct: Mapped[float] = mapped_column(Float, default=0.0)
    margin_leakage_val: Mapped[float] = mapped_column(Float, default=0.0)


class SalesReturnDamage(Base, TenantMixin):
    __tablename__ = "mod_sales_return_damage"

    id: Mapped[int] = mapped_column(primary_key=True)
    return_no: Mapped[str] = mapped_column(String(100))
    distributor_name: Mapped[str] = mapped_column(String(255))
    return_type: Mapped[str] = mapped_column(String(100))  # Expired, Transit Damage, Quality Defect
    return_value: Mapped[float] = mapped_column(Float, default=0.0)
    physical_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    credit_note_issued: Mapped[bool] = mapped_column(Boolean, default=False)


class TerritoryBeatCoverage(Base, TenantMixin):
    __tablename__ = "mod_sales_territory_beat"

    id: Mapped[int] = mapped_column(primary_key=True)
    territory_code: Mapped[str] = mapped_column(String(100))
    salesperson_name: Mapped[str] = mapped_column(String(255))
    planned_outlets: Mapped[int] = mapped_column(Integer, default=0)
    visited_outlets: Mapped[int] = mapped_column(Integer, default=0)
    adherence_pct: Mapped[float] = mapped_column(Float, default=0.0)
    ghost_visit_flag: Mapped[bool] = mapped_column(Boolean, default=False)


class OrderFulfilmentSla(Base, TenantMixin):
    __tablename__ = "mod_sales_order_sla"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_no: Mapped[str] = mapped_column(String(100))
    customer_name: Mapped[str] = mapped_column(String(255))
    order_date: Mapped[date] = mapped_column(Date, default=date.today)
    expected_delivery: Mapped[date] = mapped_column(Date, default=date.today)
    actual_delivery: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sla_hours_delay: Mapped[float] = mapped_column(Float, default=0.0)
    penalty_applicable: Mapped[float] = mapped_column(Float, default=0.0)


class CreditExposure(Base, TenantMixin):
    __tablename__ = "mod_sales_credit_exposure"

    id: Mapped[int] = mapped_column(primary_key=True)
    distributor_name: Mapped[str] = mapped_column(String(255))
    approved_limit: Mapped[float] = mapped_column(Float, default=0.0)
    current_outstanding: Mapped[float] = mapped_column(Float, default=0.0)
    overdue_30_plus: Mapped[float] = mapped_column(Float, default=0.0)
    limit_breached: Mapped[bool] = mapped_column(Boolean, default=False)
    hold_status: Mapped[str] = mapped_column(String(50), default="Active")


class FreeGoodsSampling(Base, TenantMixin):
    __tablename__ = "mod_sales_free_goods"

    id: Mapped[int] = mapped_column(primary_key=True)
    batch_no: Mapped[str] = mapped_column(String(100))
    sku_name: Mapped[str] = mapped_column(String(255))
    allocated_qty: Mapped[int] = mapped_column(Integer, default=0)
    distributed_qty: Mapped[int] = mapped_column(Integer, default=0)
    unaccounted_qty: Mapped[int] = mapped_column(Integer, default=0)
    diversion_risk: Mapped[str] = mapped_column(String(50), default="Low")


class RebateIncentivePayout(Base, TenantMixin):
    __tablename__ = "mod_sales_rebate_payout"

    id: Mapped[int] = mapped_column(primary_key=True)
    distributor_name: Mapped[str] = mapped_column(String(255))
    target_volume: Mapped[float] = mapped_column(Float, default=0.0)
    achieved_volume: Mapped[float] = mapped_column(Float, default=0.0)
    calculated_rebate: Mapped[float] = mapped_column(Float, default=0.0)
    paid_rebate: Mapped[float] = mapped_column(Float, default=0.0)
    excess_payout: Mapped[float] = mapped_column(Float, default=0.0)


class IdleDistributor(Base, TenantMixin):
    __tablename__ = "mod_sales_idle_distributor"

    id: Mapped[int] = mapped_column(primary_key=True)
    distributor_name: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(100))
    last_order_date: Mapped[date] = mapped_column(Date, default=date.today)
    idle_days: Mapped[int] = mapped_column(Integer, default=0)
    security_deposit: Mapped[float] = mapped_column(Float, default=0.0)
    action_required: Mapped[str] = mapped_column(String(100), default="Deactivate & Refund")


class CannibalisationDiversion(Base, TenantMixin):
    __tablename__ = "mod_sales_cannibalisation"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_region: Mapped[str] = mapped_column(String(100))
    target_region: Mapped[str] = mapped_column(String(100))
    sku_name: Mapped[str] = mapped_column(String(255))
    diverted_qty: Mapped[int] = mapped_column(Integer, default=0)
    estimated_revenue_loss: Mapped[float] = mapped_column(Float, default=0.0)
    risk_score: Mapped[int] = mapped_column(Integer, default=50)


class SalesReturnCutoff(Base, TenantMixin):
    __tablename__ = "mod_sales_return_cutoff"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_no: Mapped[str] = mapped_column(String(100))
    invoice_date: Mapped[date] = mapped_column(Date, default=date.today)
    return_date: Mapped[date] = mapped_column(Date, default=date.today)
    credit_note_val: Mapped[float] = mapped_column(Float, default=0.0)
    period_end_breach: Mapped[bool] = mapped_column(Boolean, default=False)


class SalespersonPerformance(Base, TenantMixin):
    __tablename__ = "mod_salesperson_perf"

    id: Mapped[int] = mapped_column(primary_key=True)
    salesperson_name: Mapped[str] = mapped_column(String(255))
    target_amount: Mapped[float] = mapped_column(Float, default=0.0)
    actual_sales: Mapped[float] = mapped_column(Float, default=0.0)
    cancellation_rate_pct: Mapped[float] = mapped_column(Float, default=0.0)
    phantom_booking_risk: Mapped[str] = mapped_column(String(50), default="Low")


class ChannelReconciliation(Base, TenantMixin):
    __tablename__ = "mod_sales_channel_recon"

    id: Mapped[int] = mapped_column(primary_key=True)
    channel_name: Mapped[str] = mapped_column(String(100))  # Modern Trade, General Trade, E-Commerce
    erp_gross_sales: Mapped[float] = mapped_column(Float, default=0.0)
    portal_reported_sales: Mapped[float] = mapped_column(Float, default=0.0)
    reconciliation_gap: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="Unreconciled")


class AuditUniverseScope(Base, TenantMixin):
    __tablename__ = "mod_sales_audit_universe"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(100))  # Depot, Plant, Distributor
    entity_name: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(100))
    annual_turnover: Mapped[float] = mapped_column(Float, default=0.0)
    risk_rating: Mapped[str] = mapped_column(String(50), default="High")
    last_audited: Mapped[Optional[date]] = mapped_column(Date, nullable=True)


class RiskControlMatrix(Base, TenantMixin):
    __tablename__ = "mod_sales_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_id: Mapped[str] = mapped_column(String(50))
    process_step: Mapped[str] = mapped_column(String(100))
    risk_description: Mapped[str] = mapped_column(Text)
    control_activity: Mapped[str] = mapped_column(Text)
    control_type: Mapped[str] = mapped_column(String(50), default="Automated")  # Manual, Automated, Semi-Automated
    testing_frequency: Mapped[str] = mapped_column(String(50), default="Quarterly")
    effectiveness: Mapped[str] = mapped_column(String(50), default="Effective")


class TestAnalyticsRule(Base, TenantMixin):
    __tablename__ = "mod_sales_analytics_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_code: Mapped[str] = mapped_column(String(50))
    rule_name: Mapped[str] = mapped_column(String(255))
    target_area: Mapped[str] = mapped_column(String(100))
    sql_logic_summary: Mapped[str] = mapped_column(Text)
    exception_count: Mapped[int] = mapped_column(Integer, default=0)
    total_exposure: Mapped[float] = mapped_column(Float, default=0.0)


class DataConnector(Base, TenantMixin):
    __tablename__ = "mod_sales_connectors"

    id: Mapped[int] = mapped_column(primary_key=True)
    system_name: Mapped[str] = mapped_column(String(100))  # SAP SD, Tally, DMS, Salesforce
    connector_type: Mapped[str] = mapped_column(String(50))
    sync_status: Mapped[str] = mapped_column(String(50), default="Connected")
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    records_ingested: Mapped[int] = mapped_column(Integer, default=0)


class SamplingPopulationBuilder(Base, TenantMixin):
    __tablename__ = "mod_sales_sampling"

    id: Mapped[int] = mapped_column(primary_key=True)
    sample_name: Mapped[str] = mapped_column(String(255))
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sampling_method: Mapped[str] = mapped_column(String(100))  # MUS, Stratified Random, Systematic
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    confidence_level_pct: Mapped[float] = mapped_column(Float, default=95.0)


class ExceptionRedFlag(Base, TenantMixin):
    __tablename__ = "mod_sales_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    flag_code: Mapped[str] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    financial_impact: Mapped[float] = mapped_column(Float, default=0.0)
    severity: Mapped[str] = mapped_column(String(50), default="High")
    status: Mapped[str] = mapped_column(String(50), default="Open")


class WorkingPaperEvidence(Base, TenantMixin):
    __tablename__ = "mod_sales_workpapers"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_ref: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    prepared_by: Mapped[str] = mapped_column(String(100))
    review_status: Mapped[str] = mapped_column(String(50), default="Draft")
    attachment_count: Mapped[int] = mapped_column(Integer, default=0)


class ObservationFindingLog(Base, TenantMixin):
    __tablename__ = "mod_sales_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_no: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    risk_category: Mapped[str] = mapped_column(String(100))
    severity: Mapped[str] = mapped_column(String(50), default="High")
    financial_impact: Mapped[float] = mapped_column(Float, default=0.0)
    recommendation: Mapped[str] = mapped_column(Text)


class RemediationActionTracker(Base, TenantMixin):
    __tablename__ = "mod_sales_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    action_id: Mapped[str] = mapped_column(String(50))
    finding_ref: Mapped[str] = mapped_column(String(50))
    action_owner: Mapped[str] = mapped_column(String(100))
    target_date: Mapped[date] = mapped_column(Date, default=date.today)
    status: Mapped[str] = mapped_column(String(50), default="In Progress")
    management_response: Mapped[str] = mapped_column(Text, default="")
