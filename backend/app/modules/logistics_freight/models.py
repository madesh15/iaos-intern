from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


class Carrier(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_carriers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(50), unique=True)
    carrier_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="Active")
    contact_person: Mapped[str] = mapped_column(String(255), default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(50), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    registration_number: Mapped[str] = mapped_column(String(100), default="")
    tax_id: Mapped[str] = mapped_column(String(100), default="")
    insurance_details: Mapped[str] = mapped_column(Text, default="")
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    on_time_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    damage_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    claim_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    delay_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicles = relationship("Vehicle", back_populates="carrier", lazy="selectin")
    contracts = relationship("FreightRateContract", back_populates="carrier", lazy="selectin")
    shipments = relationship("FreightShipment", back_populates="carrier", lazy="selectin")
    invoices = relationship("FreightInvoice", back_populates="carrier", lazy="selectin")
    claims = relationship("Claim", back_populates="carrier", lazy="selectin")


class Vehicle(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    registration_number: Mapped[str] = mapped_column(String(100))
    vehicle_type: Mapped[str] = mapped_column(String(50))
    capacity_kg: Mapped[float] = mapped_column(Float, default=0)
    capacity_cbm: Mapped[float] = mapped_column(Float, default=0)
    make: Mapped[str] = mapped_column(String(100), default="")
    model: Mapped[str] = mapped_column(String(100), default="")
    year: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="Available")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    carrier = relationship("Carrier", back_populates="vehicles", lazy="selectin")


class Route(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_routes"

    id: Mapped[int] = mapped_column(primary_key=True)
    origin: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    origin_code: Mapped[str] = mapped_column(String(50), default="")
    destination_code: Mapped[str] = mapped_column(String(50), default="")
    distance_km: Mapped[float] = mapped_column(Float, default=0)
    standard_transit_hours: Mapped[float] = mapped_column(Float, default=0)
    mode: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipments = relationship("FreightShipment", back_populates="route", lazy="selectin")
    contracts = relationship("FreightRateContract", back_populates="route", lazy="selectin")


class FreightRateContract(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_rate_contracts"

    id: Mapped[int] = mapped_column(primary_key=True)
    contract_number: Mapped[str] = mapped_column(String(100), unique=True)
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    route_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_routes.id"), nullable=True)
    effective_date: Mapped[date] = mapped_column(Date)
    expiry_date: Mapped[date] = mapped_column(Date)
    rate_per_kg: Mapped[float] = mapped_column(Float, default=0)
    rate_per_km: Mapped[float] = mapped_column(Float, default=0)
    rate_per_shipment: Mapped[float] = mapped_column(Float, default=0)
    fuel_surcharge_pct: Mapped[float] = mapped_column(Float, default=0)
    minimum_charge: Mapped[float] = mapped_column(Float, default=0)
    volume_discount_pct: Mapped[float] = mapped_column(Float, default=0)
    detention_rate_per_hour: Mapped[float] = mapped_column(Float, default=0)
    free_detention_hours: Mapped[int] = mapped_column(Integer, default=0)
    terms: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    carrier = relationship("Carrier", back_populates="contracts", lazy="selectin")
    route = relationship("Route", back_populates="contracts", lazy="selectin")
    shipments = relationship("FreightShipment", back_populates="contract", lazy="selectin")


class FreightShipment(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_number: Mapped[str] = mapped_column(String(100), unique=True)
    lr_number: Mapped[str] = mapped_column(String(100), default="")
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    route_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_routes.id"), nullable=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_vehicles.id"), nullable=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_rate_contracts.id"), nullable=True)
    shipment_date: Mapped[date] = mapped_column(Date)
    expected_delivery_date: Mapped[date] = mapped_column(Date)
    actual_delivery_date: Mapped[date] = mapped_column(Date, nullable=True)
    indent_date: Mapped[date] = mapped_column(Date, nullable=True)
    vehicle_placement_date: Mapped[date] = mapped_column(Date, nullable=True)
    origin: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    mode: Mapped[str] = mapped_column(String(50))
    commodity: Mapped[str] = mapped_column(String(255), default="")
    actual_weight_kg: Mapped[float] = mapped_column(Float, default=0)
    charged_weight_kg: Mapped[float] = mapped_column(Float, default=0)
    volume_cbm: Mapped[float] = mapped_column(Float, default=0)
    expected_distance_km: Mapped[float] = mapped_column(Float, default=0)
    actual_distance_km: Mapped[float] = mapped_column(Float, default=0)
    contract_rate: Mapped[float] = mapped_column(Float, default=0)
    billed_rate: Mapped[float] = mapped_column(Float, default=0)
    freight_amount: Mapped[float] = mapped_column(Float, default=0)
    fuel_surcharge: Mapped[float] = mapped_column(Float, default=0)
    detention_charges: Mapped[float] = mapped_column(Float, default=0)
    other_charges: Mapped[float] = mapped_column(Float, default=0)
    total_amount: Mapped[float] = mapped_column(Float, default=0)
    accrued_freight: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="In Transit")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    carrier = relationship("Carrier", back_populates="shipments", lazy="selectin")
    route = relationship("Route", back_populates="shipments", lazy="selectin")
    contract = relationship("FreightRateContract", back_populates="shipments", lazy="selectin")
    pod = relationship("POD", back_populates="shipment", uselist=False, lazy="selectin")
    invoices = relationship("FreightInvoice", back_populates="shipment", lazy="selectin")
    claims = relationship("Claim", back_populates="shipment", lazy="selectin")
    detention_charges_rel = relationship("DetentionCharge", back_populates="shipment", lazy="selectin")


class FreightInvoice(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_number: Mapped[str] = mapped_column(String(100))
    shipment_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_shipments.id"), nullable=True)
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    invoice_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date] = mapped_column(Date)
    billed_amount: Mapped[float] = mapped_column(Float, default=0)
    approved_amount: Mapped[float] = mapped_column(Float, default=0)
    difference_amount: Mapped[float] = mapped_column(Float, default=0)
    fuel_surcharge_billed: Mapped[float] = mapped_column(Float, default=0)
    detention_billed: Mapped[float] = mapped_column(Float, default=0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0)
    total_amount: Mapped[float] = mapped_column(Float, default=0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    payment_status: Mapped[str] = mapped_column(String(50), default="Unpaid")
    payment_date: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipment = relationship("FreightShipment", back_populates="invoices", lazy="selectin")
    carrier = relationship("Carrier", back_populates="invoices", lazy="selectin")


class POD(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_pods"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_shipments.id"), unique=True)
    pod_number: Mapped[str] = mapped_column(String(100))
    received_date: Mapped[date] = mapped_column(Date, nullable=True)
    received_by: Mapped[str] = mapped_column(String(255), default="")
    condition: Mapped[str] = mapped_column(String(50), default="Good")
    remarks: Mapped[str] = mapped_column(Text, default="")
    document_url: Mapped[str] = mapped_column(String(500), default="")
    is_delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipment = relationship("FreightShipment", back_populates="pod", lazy="selectin")


class FuelIndex(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_fuel_indices"

    id: Mapped[int] = mapped_column(primary_key=True)
    fuel_type: Mapped[str] = mapped_column(String(50))
    index_date: Mapped[date] = mapped_column(Date)
    base_price: Mapped[float] = mapped_column(Float, default=0)
    current_price: Mapped[float] = mapped_column(Float, default=0)
    surcharge_formula: Mapped[str] = mapped_column(String(500), default="")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Claim(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_claims"

    id: Mapped[int] = mapped_column(primary_key=True)
    claim_number: Mapped[str] = mapped_column(String(100), unique=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_shipments.id"))
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    claim_type: Mapped[str] = mapped_column(String(50))
    claim_date: Mapped[date] = mapped_column(Date)
    claim_value: Mapped[float] = mapped_column(Float, default=0)
    recovered_amount: Mapped[float] = mapped_column(Float, default=0)
    pending_amount: Mapped[float] = mapped_column(Float, default=0)
    rejected_amount: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(50), default="Open")
    resolution_date: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipment = relationship("FreightShipment", back_populates="claims", lazy="selectin")
    carrier = relationship("Carrier", back_populates="claims", lazy="selectin")


class DetentionCharge(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_detention_charges"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_shipments.id"))
    carrier_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_carriers.id"))
    detention_type: Mapped[str] = mapped_column(String(50))
    free_hours: Mapped[int] = mapped_column(Integer, default=0)
    actual_hours: Mapped[int] = mapped_column(Integer, default=0)
    chargeable_hours: Mapped[int] = mapped_column(Integer, default=0)
    rate_per_hour: Mapped[float] = mapped_column(Float, default=0)
    total_amount: Mapped[float] = mapped_column(Float, default=0)
    is_avoidable: Mapped[bool] = mapped_column(Boolean, default=True)
    reason: Mapped[str] = mapped_column(Text, default="")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipment = relationship("FreightShipment", back_populates="detention_charges_rel", lazy="selectin")


class DashboardKPI(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_dashboard_kpis"

    id: Mapped[int] = mapped_column(primary_key=True)
    kpi_name: Mapped[str] = mapped_column(String(100))
    kpi_value: Mapped[float] = mapped_column(Float, default=0)
    kpi_category: Mapped[str] = mapped_column(String(100))
    period: Mapped[str] = mapped_column(String(50))
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Finding(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_number: Mapped[str] = mapped_column(String(100), unique=True)
    title: Mapped[str] = mapped_column(String(500))
    category: Mapped[str] = mapped_column(String(100))
    severity: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    impact: Mapped[str] = mapped_column(Text, default="")
    recommendation: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Open")
    source_reference: Mapped[str] = mapped_column(String(255), default="")
    financial_impact: Mapped[float] = mapped_column(Float, default=0)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    actions = relationship("ActionTracker", back_populates="finding", lazy="selectin")


class ActionTracker(Base, TenantMixin):
    __tablename__ = "mod_logistics_freight_action_tracker"

    id: Mapped[int] = mapped_column(primary_key=True)
    action_number: Mapped[str] = mapped_column(String(100), unique=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("mod_logistics_freight_findings.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(500))
    assigned_to: Mapped[str] = mapped_column(String(255))
    target_date: Mapped[date] = mapped_column(Date)
    completion_date: Mapped[date] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Open")
    priority: Mapped[str] = mapped_column(String(50), default="Medium")
    notes: Mapped[str] = mapped_column(Text, default="")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    finding = relationship(Finding, back_populates="actions", lazy="selectin")
