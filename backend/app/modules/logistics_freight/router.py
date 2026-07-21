"""Logistics & Freight — Internal Audit module.
Mounted at /api/modules/logistics_freight.
"""
import csv
import io
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response
from sqlalchemy import or_

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import analytics as an
from . import service as svc
from .models import (
    Carrier, Vehicle, Route, FreightRateContract, FreightShipment,
    FreightInvoice, POD, FuelIndex, Claim, DetentionCharge,
    DashboardKPI, Finding, ActionTracker,
)
from .schemas import (
    CarrierCreate, CarrierUpdate, CarrierOut,
    VehicleCreate, VehicleUpdate, VehicleOut,
    RouteCreate, RouteUpdate, RouteOut,
    FreightRateContractCreate, FreightRateContractUpdate, FreightRateContractOut,
    FreightShipmentCreate, FreightShipmentUpdate, FreightShipmentOut,
    FreightInvoiceCreate, FreightInvoiceUpdate, FreightInvoiceOut,
    PODCreate, PODUpdate, PODOut,
    FuelIndexCreate, FuelIndexUpdate, FuelIndexOut,
    ClaimCreate, ClaimUpdate, ClaimOut,
    DetentionChargeCreate, DetentionChargeUpdate, DetentionChargeOut,
    DashboardKPICreate, DashboardKPIOut,
    FindingCreate, FindingUpdate, FindingOut,
    ActionTrackerCreate, ActionTrackerUpdate, ActionTrackerOut,
)

MANIFEST = {
    "name": "logistics_freight",
    "title": "Logistics & Freight",
    "description": "Internal audit module for Logistics & Freight — freight cost leakages, contract violations, SLA failures, duplicate billing & transportation risk.",
    "icon": "truck",
    "group": "Supply Chain & Operations",
    "industry": "",
    "version": "1.0.0",
    "owner": "audit",
}

router = APIRouter()


def _q(db, model, current_user):
    """Tenant-scoped, non-deleted query helper."""
    return tenant_scoped(
        db.query(model).filter(model.is_deleted == False), current_user
    )


def _paginate(query, page: int, page_size: int):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


# ──────────────────────────────────────────────
# CARRIER CRUD
# ──────────────────────────────────────────────

@router.get("/carriers", response_model=dict)
def list_carriers(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
):
    q = _q(db, Carrier, current_user)
    if search:
        q = q.filter(Carrier.name.ilike(f"%{search}%") | Carrier.code.ilike(f"%{search}%"))
    if status:
        q = q.filter(Carrier.status == status)
    q = q.order_by(Carrier.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [CarrierOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/carriers/{carrier_id}", response_model=CarrierOut)
def get_carrier(carrier_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, Carrier, current_user).filter(Carrier.id == carrier_id).first()
    if not c:
        raise HTTPException(404, "Carrier not found")
    return CarrierOut.model_validate(c)


@router.post("/carriers", response_model=CarrierOut, status_code=201)
def create_carrier(body: CarrierCreate, db: DbSession, current_user: CurrentUser):
    existing = _q(db, Carrier, current_user).filter(Carrier.code == body.code).first()
    if existing:
        raise HTTPException(409, "Carrier code already exists")
    c = Carrier(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return CarrierOut.model_validate(c)


@router.put("/carriers/{carrier_id}", response_model=CarrierOut)
def update_carrier(carrier_id: int, body: CarrierUpdate, db: DbSession, current_user: CurrentUser):
    c = _q(db, Carrier, current_user).filter(Carrier.id == carrier_id).first()
    if not c:
        raise HTTPException(404, "Carrier not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return CarrierOut.model_validate(c)


@router.delete("/carriers/{carrier_id}", status_code=204)
def delete_carrier(carrier_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, Carrier, current_user).filter(Carrier.id == carrier_id).first()
    if not c:
        raise HTTPException(404, "Carrier not found")
    c.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# VEHICLE CRUD
# ──────────────────────────────────────────────

@router.get("/vehicles", response_model=dict)
def list_vehicles(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    carrier_id: int = 0,
):
    q = _q(db, Vehicle, current_user)
    if search:
        q = q.filter(Vehicle.registration_number.ilike(f"%{search}%"))
    if carrier_id:
        q = q.filter(Vehicle.carrier_id == carrier_id)
    q = q.order_by(Vehicle.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [VehicleOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/vehicles/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: DbSession, current_user: CurrentUser):
    v = _q(db, Vehicle, current_user).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(404, "Vehicle not found")
    return VehicleOut.model_validate(v)


@router.post("/vehicles", response_model=VehicleOut, status_code=201)
def create_vehicle(body: VehicleCreate, db: DbSession, current_user: CurrentUser):
    carrier = _q(db, Carrier, current_user).filter(Carrier.id == body.carrier_id).first()
    if not carrier:
        raise HTTPException(404, "Carrier not found")
    v = Vehicle(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(v)
    db.commit()
    db.refresh(v)
    return VehicleOut.model_validate(v)


@router.put("/vehicles/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, body: VehicleUpdate, db: DbSession, current_user: CurrentUser):
    v = _q(db, Vehicle, current_user).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(404, "Vehicle not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return VehicleOut.model_validate(v)


@router.delete("/vehicles/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: DbSession, current_user: CurrentUser):
    v = _q(db, Vehicle, current_user).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(404, "Vehicle not found")
    v.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# ROUTE CRUD
# ──────────────────────────────────────────────

@router.get("/routes", response_model=dict)
def list_routes(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    mode: str = "",
):
    q = _q(db, Route, current_user)
    if search:
        q = q.filter(Route.origin.ilike(f"%{search}%") | Route.destination.ilike(f"%{search}%"))
    if mode:
        q = q.filter(Route.mode == mode)
    q = q.order_by(Route.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [RouteOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/routes/{route_id}", response_model=RouteOut)
def get_route(route_id: int, db: DbSession, current_user: CurrentUser):
    r = _q(db, Route, current_user).filter(Route.id == route_id).first()
    if not r:
        raise HTTPException(404, "Route not found")
    return RouteOut.model_validate(r)


@router.post("/routes", response_model=RouteOut, status_code=201)
def create_route(body: RouteCreate, db: DbSession, current_user: CurrentUser):
    r = Route(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(r)
    db.commit()
    db.refresh(r)
    return RouteOut.model_validate(r)


@router.put("/routes/{route_id}", response_model=RouteOut)
def update_route(route_id: int, body: RouteUpdate, db: DbSession, current_user: CurrentUser):
    r = _q(db, Route, current_user).filter(Route.id == route_id).first()
    if not r:
        raise HTTPException(404, "Route not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.commit()
    db.refresh(r)
    return RouteOut.model_validate(r)


@router.delete("/routes/{route_id}", status_code=204)
def delete_route(route_id: int, db: DbSession, current_user: CurrentUser):
    r = _q(db, Route, current_user).filter(Route.id == route_id).first()
    if not r:
        raise HTTPException(404, "Route not found")
    r.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# FREIGHT RATE CONTRACT CRUD
# ──────────────────────────────────────────────

@router.get("/contracts", response_model=dict)
def list_contracts(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
):
    q = _q(db, FreightRateContract, current_user)
    if search:
        q = q.filter(FreightRateContract.contract_number.ilike(f"%{search}%"))
    if status:
        q = q.filter(FreightRateContract.status == status)
    q = q.order_by(FreightRateContract.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [FreightRateContractOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/contracts/{contract_id}", response_model=FreightRateContractOut)
def get_contract(contract_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, FreightRateContract, current_user).filter(FreightRateContract.id == contract_id).first()
    if not c:
        raise HTTPException(404, "Contract not found")
    return FreightRateContractOut.model_validate(c)


@router.post("/contracts", response_model=FreightRateContractOut, status_code=201)
def create_contract(body: FreightRateContractCreate, db: DbSession, current_user: CurrentUser):
    carrier = _q(db, Carrier, current_user).filter(Carrier.id == body.carrier_id).first()
    if not carrier:
        raise HTTPException(404, "Carrier not found")
    c = FreightRateContract(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return FreightRateContractOut.model_validate(c)


@router.put("/contracts/{contract_id}", response_model=FreightRateContractOut)
def update_contract(contract_id: int, body: FreightRateContractUpdate, db: DbSession, current_user: CurrentUser):
    c = _q(db, FreightRateContract, current_user).filter(FreightRateContract.id == contract_id).first()
    if not c:
        raise HTTPException(404, "Contract not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(c, k, val)
    db.commit()
    db.refresh(c)
    return FreightRateContractOut.model_validate(c)


@router.delete("/contracts/{contract_id}", status_code=204)
def delete_contract(contract_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, FreightRateContract, current_user).filter(FreightRateContract.id == contract_id).first()
    if not c:
        raise HTTPException(404, "Contract not found")
    c.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# FREIGHT SHIPMENT CRUD
# ──────────────────────────────────────────────

@router.get("/shipments", response_model=dict)
def list_shipments(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
    carrier_id: int = 0,
    mode: str = "",
    date_from: str = "",
    date_to: str = "",
):
    q = _q(db, FreightShipment, current_user)
    if search:
        q = q.filter(
            FreightShipment.shipment_number.ilike(f"%{search}%")
            | FreightShipment.lr_number.ilike(f"%{search}%")
            | FreightShipment.origin.ilike(f"%{search}%")
            | FreightShipment.destination.ilike(f"%{search}%")
        )
    if status:
        q = q.filter(FreightShipment.status == status)
    if carrier_id:
        q = q.filter(FreightShipment.carrier_id == carrier_id)
    if mode:
        q = q.filter(FreightShipment.mode == mode)
    if date_from:
        q = q.filter(FreightShipment.shipment_date >= date.fromisoformat(date_from))
    if date_to:
        q = q.filter(FreightShipment.shipment_date <= date.fromisoformat(date_to))
    q = q.order_by(FreightShipment.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [FreightShipmentOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/shipments/{shipment_id}", response_model=FreightShipmentOut)
def get_shipment(shipment_id: int, db: DbSession, current_user: CurrentUser):
    s = _q(db, FreightShipment, current_user).filter(FreightShipment.id == shipment_id).first()
    if not s:
        raise HTTPException(404, "Shipment not found")
    return FreightShipmentOut.model_validate(s)


@router.post("/shipments", response_model=FreightShipmentOut, status_code=201)
def create_shipment(body: FreightShipmentCreate, db: DbSession, current_user: CurrentUser):
    carrier = _q(db, Carrier, current_user).filter(Carrier.id == body.carrier_id).first()
    if not carrier:
        raise HTTPException(404, "Carrier not found")
    s = FreightShipment(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(s)
    db.commit()
    db.refresh(s)
    return FreightShipmentOut.model_validate(s)


@router.put("/shipments/{shipment_id}", response_model=FreightShipmentOut)
def update_shipment(shipment_id: int, body: FreightShipmentUpdate, db: DbSession, current_user: CurrentUser):
    s = _q(db, FreightShipment, current_user).filter(FreightShipment.id == shipment_id).first()
    if not s:
        raise HTTPException(404, "Shipment not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(s, k, val)
    db.commit()
    db.refresh(s)
    return FreightShipmentOut.model_validate(s)


@router.delete("/shipments/{shipment_id}", status_code=204)
def delete_shipment(shipment_id: int, db: DbSession, current_user: CurrentUser):
    s = _q(db, FreightShipment, current_user).filter(FreightShipment.id == shipment_id).first()
    if not s:
        raise HTTPException(404, "Shipment not found")
    s.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# FREIGHT INVOICE CRUD
# ──────────────────────────────────────────────

@router.get("/invoices", response_model=dict)
def list_invoices(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
    payment_status: str = "",
):
    q = _q(db, FreightInvoice, current_user)
    if search:
        q = q.filter(FreightInvoice.invoice_number.ilike(f"%{search}%"))
    if status:
        q = q.filter(FreightInvoice.status == status)
    if payment_status:
        q = q.filter(FreightInvoice.payment_status == payment_status)
    q = q.order_by(FreightInvoice.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [FreightInvoiceOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/invoices/{invoice_id}", response_model=FreightInvoiceOut)
def get_invoice(invoice_id: int, db: DbSession, current_user: CurrentUser):
    i = _q(db, FreightInvoice, current_user).filter(FreightInvoice.id == invoice_id).first()
    if not i:
        raise HTTPException(404, "Invoice not found")
    return FreightInvoiceOut.model_validate(i)


@router.post("/invoices", response_model=FreightInvoiceOut, status_code=201)
def create_invoice(body: FreightInvoiceCreate, db: DbSession, current_user: CurrentUser):
    carrier = _q(db, Carrier, current_user).filter(Carrier.id == body.carrier_id).first()
    if not carrier:
        raise HTTPException(404, "Carrier not found")
    i = FreightInvoice(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(i)
    db.commit()
    db.refresh(i)
    return FreightInvoiceOut.model_validate(i)


@router.put("/invoices/{invoice_id}", response_model=FreightInvoiceOut)
def update_invoice(invoice_id: int, body: FreightInvoiceUpdate, db: DbSession, current_user: CurrentUser):
    i = _q(db, FreightInvoice, current_user).filter(FreightInvoice.id == invoice_id).first()
    if not i:
        raise HTTPException(404, "Invoice not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(i, k, val)
    db.commit()
    db.refresh(i)
    return FreightInvoiceOut.model_validate(i)


@router.delete("/invoices/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: DbSession, current_user: CurrentUser):
    i = _q(db, FreightInvoice, current_user).filter(FreightInvoice.id == invoice_id).first()
    if not i:
        raise HTTPException(404, "Invoice not found")
    i.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# POD CRUD
# ──────────────────────────────────────────────

@router.get("/pods", response_model=dict)
def list_pods(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
):
    q = _q(db, POD, current_user)
    if search:
        q = q.filter(POD.pod_number.ilike(f"%{search}%"))
    q = q.order_by(POD.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [PODOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/pods/{pod_id}", response_model=PODOut)
def get_pod(pod_id: int, db: DbSession, current_user: CurrentUser):
    p = _q(db, POD, current_user).filter(POD.id == pod_id).first()
    if not p:
        raise HTTPException(404, "POD not found")
    return PODOut.model_validate(p)


@router.post("/pods", response_model=PODOut, status_code=201)
def create_pod(body: PODCreate, db: DbSession, current_user: CurrentUser):
    shipment = _q(db, FreightShipment, current_user).filter(FreightShipment.id == body.shipment_id).first()
    if not shipment:
        raise HTTPException(404, "Shipment not found")
    existing_pod = _q(db, POD, current_user).filter(POD.shipment_id == body.shipment_id).first()
    if existing_pod:
        raise HTTPException(409, "POD already exists for this shipment")
    p = POD(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return PODOut.model_validate(p)


@router.put("/pods/{pod_id}", response_model=PODOut)
def update_pod(pod_id: int, body: PODUpdate, db: DbSession, current_user: CurrentUser):
    p = _q(db, POD, current_user).filter(POD.id == pod_id).first()
    if not p:
        raise HTTPException(404, "POD not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(p, k, val)
    db.commit()
    db.refresh(p)
    return PODOut.model_validate(p)


@router.delete("/pods/{pod_id}", status_code=204)
def delete_pod(pod_id: int, db: DbSession, current_user: CurrentUser):
    p = _q(db, POD, current_user).filter(POD.id == pod_id).first()
    if not p:
        raise HTTPException(404, "POD not found")
    p.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# FUEL INDEX CRUD
# ──────────────────────────────────────────────

@router.get("/fuel-indices", response_model=dict)
def list_fuel_indices(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    q = _q(db, FuelIndex, current_user).order_by(FuelIndex.index_date.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [FuelIndexOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/fuel-indices/{fuel_id}", response_model=FuelIndexOut)
def get_fuel_index(fuel_id: int, db: DbSession, current_user: CurrentUser):
    f = _q(db, FuelIndex, current_user).filter(FuelIndex.id == fuel_id).first()
    if not f:
        raise HTTPException(404, "Fuel index not found")
    return FuelIndexOut.model_validate(f)


@router.post("/fuel-indices", response_model=FuelIndexOut, status_code=201)
def create_fuel_index(body: FuelIndexCreate, db: DbSession, current_user: CurrentUser):
    f = FuelIndex(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(f)
    db.commit()
    db.refresh(f)
    return FuelIndexOut.model_validate(f)


@router.put("/fuel-indices/{fuel_id}", response_model=FuelIndexOut)
def update_fuel_index(fuel_id: int, body: FuelIndexUpdate, db: DbSession, current_user: CurrentUser):
    f = _q(db, FuelIndex, current_user).filter(FuelIndex.id == fuel_id).first()
    if not f:
        raise HTTPException(404, "Fuel index not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(f, k, val)
    db.commit()
    db.refresh(f)
    return FuelIndexOut.model_validate(f)


@router.delete("/fuel-indices/{fuel_id}", status_code=204)
def delete_fuel_index(fuel_id: int, db: DbSession, current_user: CurrentUser):
    f = _q(db, FuelIndex, current_user).filter(FuelIndex.id == fuel_id).first()
    if not f:
        raise HTTPException(404, "Fuel index not found")
    f.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# CLAIM CRUD
# ──────────────────────────────────────────────

@router.get("/claims", response_model=dict)
def list_claims(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
    claim_type: str = "",
):
    q = _q(db, Claim, current_user)
    if search:
        q = q.filter(Claim.claim_number.ilike(f"%{search}%"))
    if status:
        q = q.filter(Claim.status == status)
    if claim_type:
        q = q.filter(Claim.claim_type == claim_type)
    q = q.order_by(Claim.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [ClaimOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/claims/{claim_id}", response_model=ClaimOut)
def get_claim(claim_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, Claim, current_user).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(404, "Claim not found")
    return ClaimOut.model_validate(c)


@router.post("/claims", response_model=ClaimOut, status_code=201)
def create_claim(body: ClaimCreate, db: DbSession, current_user: CurrentUser):
    shipment = _q(db, FreightShipment, current_user).filter(FreightShipment.id == body.shipment_id).first()
    if not shipment:
        raise HTTPException(404, "Shipment not found")
    c = Claim(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return ClaimOut.model_validate(c)


@router.put("/claims/{claim_id}", response_model=ClaimOut)
def update_claim(claim_id: int, body: ClaimUpdate, db: DbSession, current_user: CurrentUser):
    c = _q(db, Claim, current_user).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(404, "Claim not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(c, k, val)
    db.commit()
    db.refresh(c)
    return ClaimOut.model_validate(c)


@router.delete("/claims/{claim_id}", status_code=204)
def delete_claim(claim_id: int, db: DbSession, current_user: CurrentUser):
    c = _q(db, Claim, current_user).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(404, "Claim not found")
    c.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# DETENTION CHARGE CRUD
# ──────────────────────────────────────────────

@router.get("/detention-charges", response_model=dict)
def list_detention_charges(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    shipment_id: int = 0,
):
    q = _q(db, DetentionCharge, current_user)
    if shipment_id:
        q = q.filter(DetentionCharge.shipment_id == shipment_id)
    q = q.order_by(DetentionCharge.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [DetentionChargeOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/detention-charges/{charge_id}", response_model=DetentionChargeOut)
def get_detention_charge(charge_id: int, db: DbSession, current_user: CurrentUser):
    d = _q(db, DetentionCharge, current_user).filter(DetentionCharge.id == charge_id).first()
    if not d:
        raise HTTPException(404, "Detention charge not found")
    return DetentionChargeOut.model_validate(d)


@router.post("/detention-charges", response_model=DetentionChargeOut, status_code=201)
def create_detention_charge(body: DetentionChargeCreate, db: DbSession, current_user: CurrentUser):
    shipment = _q(db, FreightShipment, current_user).filter(FreightShipment.id == body.shipment_id).first()
    if not shipment:
        raise HTTPException(404, "Shipment not found")
    d = DetentionCharge(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(d)
    db.commit()
    db.refresh(d)
    return DetentionChargeOut.model_validate(d)


@router.put("/detention-charges/{charge_id}", response_model=DetentionChargeOut)
def update_detention_charge(charge_id: int, body: DetentionChargeUpdate, db: DbSession, current_user: CurrentUser):
    d = _q(db, DetentionCharge, current_user).filter(DetentionCharge.id == charge_id).first()
    if not d:
        raise HTTPException(404, "Detention charge not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(d, k, val)
    db.commit()
    db.refresh(d)
    return DetentionChargeOut.model_validate(d)


@router.delete("/detention-charges/{charge_id}", status_code=204)
def delete_detention_charge(charge_id: int, db: DbSession, current_user: CurrentUser):
    d = _q(db, DetentionCharge, current_user).filter(DetentionCharge.id == charge_id).first()
    if not d:
        raise HTTPException(404, "Detention charge not found")
    d.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# DASHBOARD KPI CRUD
# ──────────────────────────────────────────────

@router.get("/kpis", response_model=dict)
def list_kpis(
    db: DbSession, current_user: CurrentUser,
    category: str = "",
    period: str = "",
):
    q = _q(db, DashboardKPI, current_user)
    if category:
        q = q.filter(DashboardKPI.kpi_category == category)
    if period:
        q = q.filter(DashboardKPI.period == period)
    q = q.order_by(DashboardKPI.period_start.desc())
    items = q.all()
    return {"items": [DashboardKPIOut.model_validate(i) for i in items], "total": len(items)}


@router.post("/kpis", response_model=DashboardKPIOut, status_code=201)
def create_kpi(body: DashboardKPICreate, db: DbSession, current_user: CurrentUser):
    k = DashboardKPI(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(k)
    db.commit()
    db.refresh(k)
    return DashboardKPIOut.model_validate(k)


# ──────────────────────────────────────────────
# FINDING CRUD
# ──────────────────────────────────────────────

@router.get("/findings", response_model=dict)
def list_findings(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    severity: str = "",
    status: str = "",
    category: str = "",
):
    q = _q(db, Finding, current_user)
    if search:
        q = q.filter(
            Finding.finding_number.ilike(f"%{search}%")
            | Finding.title.ilike(f"%{search}%")
        )
    if severity:
        q = q.filter(Finding.severity == severity)
    if status:
        q = q.filter(Finding.status == status)
    if category:
        q = q.filter(Finding.category == category)
    q = q.order_by(Finding.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [FindingOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/findings/{finding_id}", response_model=FindingOut)
def get_finding(finding_id: int, db: DbSession, current_user: CurrentUser):
    f = _q(db, Finding, current_user).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(404, "Finding not found")
    return FindingOut.model_validate(f)


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(body: FindingCreate, db: DbSession, current_user: CurrentUser):
    f = Finding(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(f)
    db.commit()
    db.refresh(f)
    return FindingOut.model_validate(f)


@router.put("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: int, body: FindingUpdate, db: DbSession, current_user: CurrentUser):
    f = _q(db, Finding, current_user).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(404, "Finding not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(f, k, val)
    db.commit()
    db.refresh(f)
    return FindingOut.model_validate(f)


@router.delete("/findings/{finding_id}", status_code=204)
def delete_finding(finding_id: int, db: DbSession, current_user: CurrentUser):
    f = _q(db, Finding, current_user).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(404, "Finding not found")
    f.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# ACTION TRACKER CRUD
# ──────────────────────────────────────────────

@router.get("/actions", response_model=dict)
def list_actions(
    db: DbSession, current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: str = "",
    status: str = "",
    priority: str = "",
):
    q = _q(db, ActionTracker, current_user)
    if search:
        q = q.filter(
            ActionTracker.action_number.ilike(f"%{search}%")
            | ActionTracker.title.ilike(f"%{search}%")
            | ActionTracker.assigned_to.ilike(f"%{search}%")
        )
    if status:
        q = q.filter(ActionTracker.status == status)
    if priority:
        q = q.filter(ActionTracker.priority == priority)
    q = q.order_by(ActionTracker.id.desc())
    result = _paginate(q, page, page_size)
    result["items"] = [ActionTrackerOut.model_validate(i) for i in result["items"]]
    return result


@router.get("/actions/{action_id}", response_model=ActionTrackerOut)
def get_action(action_id: int, db: DbSession, current_user: CurrentUser):
    a = _q(db, ActionTracker, current_user).filter(ActionTracker.id == action_id).first()
    if not a:
        raise HTTPException(404, "Action not found")
    return ActionTrackerOut.model_validate(a)


@router.post("/actions", response_model=ActionTrackerOut, status_code=201)
def create_action(body: ActionTrackerCreate, db: DbSession, current_user: CurrentUser):
    a = ActionTracker(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return ActionTrackerOut.model_validate(a)


@router.put("/actions/{action_id}", response_model=ActionTrackerOut)
def update_action(action_id: int, body: ActionTrackerUpdate, db: DbSession, current_user: CurrentUser):
    a = _q(db, ActionTracker, current_user).filter(ActionTracker.id == action_id).first()
    if not a:
        raise HTTPException(404, "Action not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(a, k, val)
    db.commit()
    db.refresh(a)
    return ActionTrackerOut.model_validate(a)


@router.delete("/actions/{action_id}", status_code=204)
def delete_action(action_id: int, db: DbSession, current_user: CurrentUser):
    a = _q(db, ActionTracker, current_user).filter(ActionTracker.id == action_id).first()
    if not a:
        raise HTTPException(404, "Action not found")
    a.is_deleted = True
    db.commit()


# ──────────────────────────────────────────────
# DASHBOARD
# ──────────────────────────────────────────────

@router.get("/dashboard")
def dashboard_summary(db: DbSession, current_user: CurrentUser):
    return svc.get_dashboard_summary(db, current_user)


@router.get("/dashboard/trends")
def dashboard_trends(db: DbSession, current_user: CurrentUser):
    return an.freight_cost_per_unit_trend(db, current_user)


# ──────────────────────────────────────────────
# ANALYTICS ENDPOINTS
# ──────────────────────────────────────────────

@router.get("/analytics/rate-compliance")
def analytics_rate_compliance(db: DbSession, current_user: CurrentUser):
    return an.rate_compliance_analysis(db, current_user)


@router.get("/analytics/weight-variance")
def analytics_weight_variance(db: DbSession, current_user: CurrentUser):
    return an.weight_variance_analysis(db, current_user)


@router.get("/analytics/route-distance")
def analytics_route_distance(db: DbSession, current_user: CurrentUser):
    return an.route_distance_analytics(db, current_user)


@router.get("/analytics/detention")
def analytics_detention(db: DbSession, current_user: CurrentUser):
    return an.detention_demurrage_analysis(db, current_user)


@router.get("/analytics/carrier-performance")
def analytics_carrier_performance(db: DbSession, current_user: CurrentUser):
    return an.carrier_performance_analysis(db, current_user)


@router.get("/analytics/duplicate-billing")
def analytics_duplicate_billing(db: DbSession, current_user: CurrentUser):
    return an.duplicate_billing_analysis(db, current_user)


@router.get("/analytics/multimodal-cost")
def analytics_multimodal_cost(db: DbSession, current_user: CurrentUser, shipment_id: int = 0):
    return an.multimodal_cost_comparison(db, current_user, shipment_id or None)


@router.get("/analytics/fuel-surcharge")
def analytics_fuel_surcharge(db: DbSession, current_user: CurrentUser):
    return an.fuel_surcharge_validation(db, current_user)


@router.get("/analytics/empty-return")
def analytics_empty_return(db: DbSession, current_user: CurrentUser):
    return an.empty_return_analysis(db, current_user)


@router.get("/analytics/lr-pod-match")
def analytics_lr_pod_match(db: DbSession, current_user: CurrentUser):
    return an.lr_pod_match_analysis(db, current_user)


@router.get("/analytics/provision-accuracy")
def analytics_provision_accuracy(db: DbSession, current_user: CurrentUser):
    return an.freight_provision_accuracy(db, current_user)


@router.get("/analytics/transit-sla")
def analytics_transit_sla(db: DbSession, current_user: CurrentUser):
    return an.transit_time_sla_analysis(db, current_user)


@router.get("/analytics/damage-claims")
def analytics_damage_claims(db: DbSession, current_user: CurrentUser):
    return an.damage_shortage_claims(db, current_user)


@router.get("/analytics/vehicle-placement")
def analytics_vehicle_placement(db: DbSession, current_user: CurrentUser):
    return an.vehicle_placement_efficiency(db, current_user)


@router.get("/analytics/cost-trends")
def analytics_cost_trends(db: DbSession, current_user: CurrentUser):
    return an.freight_cost_per_unit_trend(db, current_user)


@router.get("/analytics/risk-score")
def analytics_risk_score(db: DbSession, current_user: CurrentUser):
    summary = svc.get_dashboard_summary(db, current_user)
    return {"risk_score": summary["risk_score"], "factors": summary}


# ──────────────────────────────────────────────
# EXPORT ENDPOINTS
# ──────────────────────────────────────────────

@router.get("/export/shipments/csv")
def export_shipments_csv(db: DbSession, current_user: CurrentUser):
    shipments = _q(db, FreightShipment, current_user).order_by(FreightShipment.shipment_date.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Shipment#", "LR#", "Date", "Origin", "Destination",
        "Mode", "Actual Wt", "Charged Wt", "Contract Rate", "Billed Rate",
        "Freight", "Fuel Surcharge", "Total", "Status"
    ])
    for s in shipments:
        writer.writerow([
            s.id, s.shipment_number, s.lr_number, s.shipment_date,
            s.origin, s.destination, s.mode, s.actual_weight_kg,
            s.charged_weight_kg, s.contract_rate, s.billed_rate,
            s.freight_amount, s.fuel_surcharge, s.total_amount, s.status,
        ])
    return Response(content=output.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=shipments.csv"})


@router.get("/export/invoices/csv")
def export_invoices_csv(db: DbSession, current_user: CurrentUser):
    invoices = _q(db, FreightInvoice, current_user).order_by(FreightInvoice.invoice_date.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Invoice#", "Date", "Due Date", "Billed", "Approved",
        "Difference", "Fuel Surcharge", "Total", "Status", "Payment Status",
    ])
    for i in invoices:
        writer.writerow([
            i.id, i.invoice_number, i.invoice_date, i.due_date,
            i.billed_amount, i.approved_amount, i.difference_amount,
            i.fuel_surcharge_billed, i.total_amount, i.status, i.payment_status,
        ])
    return Response(content=output.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=invoices.csv"})


@router.get("/export/findings/csv")
def export_findings_csv(db: DbSession, current_user: CurrentUser):
    findings = _q(db, Finding, current_user).order_by(Finding.id.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Finding#", "Title", "Category", "Severity", "Status", "Financial Impact"])
    for f in findings:
        writer.writerow([f.id, f.finding_number, f.title, f.category, f.severity, f.status, f.financial_impact])
    return Response(content=output.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=findings.csv"})


@router.get("/export/carriers/csv")
def export_carriers_csv(db: DbSession, current_user: CurrentUser):
    carriers = _q(db, Carrier, current_user).order_by(Carrier.name).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Code", "Name", "Type", "Status", "Score", "On-Time%", "Damage%", "Claim%", "Delay%"])
    for c in carriers:
        writer.writerow([
            c.id, c.code, c.name, c.carrier_type, c.status,
            c.performance_score, c.on_time_percentage, c.damage_percentage,
            c.claim_percentage, c.delay_percentage,
        ])
    return Response(content=output.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=carriers.csv"})


@router.get("/export/claims/csv")
def export_claims_csv(db: DbSession, current_user: CurrentUser):
    claims = _q(db, Claim, current_user).order_by(Claim.claim_date.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Claim#", "Type", "Date", "Value", "Recovered", "Pending", "Rejected", "Status"])
    for c in claims:
        writer.writerow([
            c.id, c.claim_number, c.claim_type, c.claim_date,
            c.claim_value, c.recovered_amount, c.pending_amount,
            c.rejected_amount, c.status,
        ])
    return Response(content=output.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=claims.csv"})
