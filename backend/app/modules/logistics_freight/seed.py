"""Seed data for Logistics & Freight module — 250+ realistic records."""
import json
import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from .models import (
    Carrier, Vehicle, Route, FreightRateContract, FreightShipment,
    FreightInvoice, POD, FuelIndex, Claim, DetentionCharge,
    DashboardKPI, Finding, ActionTracker,
    Plant, Warehouse, Region, BusinessUnit,
    RiskControl, TestRule, DataSource, SamplingRecord,
    ExceptionItem, WorkingPaper,
)

TRANSPORTERS = [
    ("Speed Logistics Ltd", "SPD001", "Truck", "Rajesh Kumar", "rajesh@speed.in", 85, 92, 2, 1.5, 8),
    ("Cargo Express Pvt", "CRG001", "Truck", "Anita Sharma", "anita@cargo.in", 72, 78, 5, 3, 22),
    ("Rail Freight Corp", "RFC001", "Rail", "Vikram Singh", "vikram@rail.in", 90, 95, 1, 0.5, 5),
    ("SeaLine Shipping", "SHP001", "Sea", "Priya Patel", "priya@sealine.in", 78, 82, 3, 2, 18),
    ("AirSpeed Couriers", "AIR001", "Air", "Arun Nair", "arun@airspeed.in", 95, 98, 0.5, 0.2, 2),
    ("TransGoods Movers", "TGM001", "Truck", "Suresh Reddy", "suresh@transgoods.in", 45, 55, 12, 8, 45),
    ("Blue Dart Logistics", "BLU001", "Truck", "Karan Mehta", "karan@bluedart.in", 88, 90, 2.5, 1.8, 10),
    ("Om Logistics", "OML001", "Truck", "Ravi Joshi", "ravi@omlogistics.in", 76, 80, 4, 2.5, 20),
    ("VRL Logistics", "VRL001", "Truck", "Sanjay Patil", "sanjay@vrl.in", 82, 86, 3, 2, 14),
    ("Container Corp India", "CCI001", "Rail", "Amit Saxena", "amit@concor.in", 91, 94, 1.5, 1, 6),
    ("DHL Express", "DHL001", "Air", "Maria Gomes", "maria@dhl.in", 96, 99, 0.3, 0.1, 1),
    ("Maersk Line", "MAE001", "Sea", "Vivek Kapoor", "vivek@maersk.in", 84, 88, 2, 1.2, 12),
    ("TCI Freight", "TCI001", "Truck", "Prakash Rao", "prakash@tci.in", 74, 76, 5.5, 4, 24),
    ("Porter Logistics", "POR001", "Truck", "Deepak Gupta", "deepak@porter.in", 79, 83, 3.5, 2.8, 17),
    ("Ekart Logistics", "EKA001", "Truck", "Rohit Sharma", "rohit@ekart.in", 87, 91, 2, 1.5, 9),
]

VEHICLES_DATA = [
    ("MH-01-AB-1234", "Truck", 16000, 40, "Tata", "Prima", 2022),
    ("MH-01-AB-5678", "Truck", 25000, 60, "Ashok Leyland", "Boss", 2023),
    ("GJ-05-CD-9012", "Truck", 12000, 30, "Eicher", "Pro 3015", 2021),
    ("GJ-05-CD-3456", "Trailer", 30000, 80, "Volvo", "FM420", 2023),
    ("DL-07-EF-7890", "Container", 8000, 20, "Boeing", "737F", 2022),
    ("MH-12-GH-1111", "Truck", 18000, 45, "Tata", "Signa", 2024),
    ("KA-03-IJ-2222", "Truck", 20000, 50, "Ashok Leyland", "Captain", 2023),
    ("TN-07-KL-3333", "Trailer", 35000, 90, "Volvo", "FM460", 2024),
    ("AP-09-MN-4444", "Truck", 14000, 35, "Eicher", "Pro 3015", 2022),
    ("WB-06-OP-5555", "Truck", 22000, 55, "Mahindra", "Blazo", 2023),
]

ROUTES_DATA = [
    ("Mumbai", "Delhi", "BOM", "DEL", 1400, 48, "Road"),
    ("Delhi", "Mumbai", "DEL", "BOM", 1400, 48, "Road"),
    ("Mumbai", "Chennai", "BOM", "MAA", 1300, 44, "Road"),
    ("Mumbai", "Kolkata", "BOM", "CCU", 2000, 72, "Road"),
    ("Delhi", "Bangalore", "DEL", "BLR", 2100, 72, "Road"),
    ("Mumbai", "Delhi", "BOM", "DEL", 1400, 36, "Rail"),
    ("Mumbai", "Chennai", "BOM", "MAA", 1200, 48, "Sea"),
    ("Delhi", "Kolkata", "DEL", "CCU", 1500, 54, "Road"),
    ("Chennai", "Bangalore", "MAA", "BLR", 350, 12, "Road"),
    ("Mumbai", "Ahmedabad", "BOM", "AMD", 550, 18, "Road"),
    ("Delhi", "Hyderabad", "DEL", "HYD", 1550, 56, "Road"),
    ("Mumbai", "Bangalore", "BOM", "BLR", 980, 36, "Air"),
    ("Chennai", "Delhi", "MAA", "DEL", 2200, 72, "Sea"),
    ("Kolkata", "Mumbai", "CCU", "BOM", 2000, 72, "Rail"),
    ("Bangalore", "Delhi", "BLR", "DEL", 2100, 48, "Air"),
]

COMMODITIES = [
    "Electronics", "Textiles", "Automotive", "FMCG", "Machinery",
    "Pharmaceuticals", "Chemicals", "Steel", "Furniture", "Cement",
    "Food Grains", "Plastics", "Paper", "Rubber", "Glass",
    "Leather", "Sports Goods", "Medical Equipment", "Spare Parts", "Packaging",
]

CITIES = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow"]

STATES = ["Maharashtra", "Delhi", "Tamil Nadu", "West Bengal", "Karnataka", "Telangana", "Gujarat", "Rajasthan", "Uttar Pradesh"]

PLANTS = [
    ("PLT-001", "Mumbai Auto Plant", "Mumbai East Industrial Zone"),
    ("PLT-002", "Delhi Manufacturing Hub", "Delhi NCR"),
    ("PLT-003", "Chennai Electronics Park", "Chennai SEZ"),
    ("PLT-004", "Kolkata Steel Works", "Kolkata Industrial Area"),
    ("PLT-005", "Bangalore Pharma City", "Bangalore Bio-Tech Park"),
    ("PLT-006", "Hyderabad Chemical Complex", "Hyderabad Pharma City"),
    ("PLT-007", "Ahmedabad Textile Mill", "Ahmedabad GIDC"),
    ("PLT-008", "Pune Auto Cluster", "Pune MIDC"),
    ("PLT-009", "Jaipur Engineering Works", "Jaipur Industrial Area"),
    ("PLT-010", "Lucknow FMCG Hub", "Lucknow Industrial Zone"),
]

WAREHOUSES = [
    ("WH-001", "Mumbai Central Warehouse", "Mumbai Port Area"),
    ("WH-002", "Delhi Logistics Park", "Delhi NCR"),
    ("WH-003", "Chennai Container Freight Station", "Chennai Port"),
    ("WH-004", "Kolkata Bonded Warehouse", "Kolkata Dock Area"),
    ("WH-005", "Bangalore Distribution Center", "Bangalore Electronics City"),
    ("WH-006", "Hyderabad Cold Storage", "Hyderabad Food Park"),
    ("WH-007", "Ahmedabad Godown Complex", "Ahmedabad Industrial Zone"),
    ("WH-008", "Pune Warehouse Hub", "Pune Hinjewadi"),
    ("WH-009", "Jaipur Bulk Storage", "Jaipur Sitapura"),
    ("WH-010", "Lucknow Consolidation Center", "Lucknow Transport Nagar"),
]

REGIONS = [
    ("RGN-W", "Western Region", "West", "India"),
    ("RGN-N", "Northern Region", "North", "India"),
    ("RGN-S", "Southern Region", "South", "India"),
    ("RGN-E", "Eastern Region", "East", "India"),
    ("RGN-C", "Central Region", "Central", "India"),
    ("RGN-NE", "North East Region", "North East", "India"),
    ("RGN-INTL", "International", "Global", "Middle East, Africa, SE Asia"),
]

BUSINESS_UNITS = [
    ("BU-AUTO", "Automotive Division", "Rajesh Mehta", "COST-AUTO-001", 50000000),
    ("BU-PHARMA", "Pharmaceutical Division", "Dr. Sneha Patel", "COST-PHA-002", 35000000),
    ("BU-FMCG", "FMCG Division", "Amit Shah", "COST-FMCG-003", 25000000),
    ("BU-ELEC", "Electronics Division", "Priya Singh", "COST-ELEC-004", 40000000),
    ("BU-CHEM", "Chemicals Division", "Vikram Reddy", "COST-CHEM-005", 20000000),
    ("BU-STEEL", "Steel & Metals", "Suresh Kumar", "COST-STL-006", 30000000),
    ("BU-TEXT", "Textiles Division", "Neha Gupta", "COST-TXT-007", 15000000),
]


def seed_data(db: Session, tenant_id: int):
    if db.query(Carrier).filter(Carrier.tenant_id == tenant_id).first():
        return

    carriers = []
    for t in TRANSPORTERS:
        c = Carrier(
            name=t[0], code=t[1], carrier_type=t[2], status="Active",
            contact_person=t[3], email=t[4], phone=f"+91-{random.randint(7000000000, 9999999999)}",
            address=f"{random.choice(CITIES)}, India",
            performance_score=t[5], on_time_percentage=t[6], damage_percentage=t[7],
            claim_percentage=t[8], delay_percentage=t[9], tenant_id=tenant_id,
        )
        carriers.append(c)
    db.add_all(carriers)
    db.flush()

    vehicles = []
    for vd in VEHICLES_DATA:
        cid = random.choice([c.id for c in carriers[:8]])
        v = Vehicle(
            carrier_id=cid, registration_number=vd[0], vehicle_type=vd[1],
            capacity_kg=vd[2], capacity_cbm=vd[3], make=vd[4], model=vd[5],
            year=vd[6], status="Available", tenant_id=tenant_id,
        )
        vehicles.append(v)
    db.add_all(vehicles)
    db.flush()

    routes = []
    for rd in ROUTES_DATA:
        r = Route(
            origin=rd[0], destination=rd[1], origin_code=rd[2], destination_code=rd[3],
            distance_km=rd[4], standard_transit_hours=rd[5], mode=rd[6],
            is_active=True, tenant_id=tenant_id,
        )
        routes.append(r)
    db.add_all(routes)
    db.flush()

    contracts = []
    ct_start = date(2025, 1, 1)
    for i in range(25):
        cid = random.choice([c.id for c in carriers])
        rid = random.choice([r.id for r in routes])
        eff = ct_start + timedelta(days=random.randint(0, 120))
        exp = eff + timedelta(days=random.randint(180, 365))
        rate_kg = round(random.uniform(1.5, 30), 2)
        rate_km = round(random.uniform(6, 90), 2)
        fs_pct = round(random.uniform(4, 15), 1)
        det_rate = random.choice([300, 400, 500, 600, 800, 1000, 2000])
        det_free = random.choice([2, 3, 4, 6, 8, 12])
        ct = FreightRateContract(
            contract_number=f"CTR-2025-{i+1:03d}",
            carrier_id=cid, route_id=rid, effective_date=eff, expiry_date=exp,
            rate_per_kg=rate_kg, rate_per_km=rate_km, rate_per_shipment=round(random.uniform(5000, 80000)),
            fuel_surcharge_pct=fs_pct, minimum_charge=round(random.uniform(3000, 25000)),
            volume_discount_pct=round(random.uniform(1, 8), 1),
            detention_rate_per_hour=det_rate, free_detention_hours=det_free,
            terms="Standard terms apply", status=random.choice(["Active", "Active", "Active", "Expired"]),
            tenant_id=tenant_id,
        )
        contracts.append(ct)
    db.add_all(contracts)
    db.flush()

    shipments = []
    statuses = ["Delivered", "Delivered", "Delivered", "Delivered", "In Transit", "Delayed", "Cancelled"]
    for i in range(250):
        cid = random.choice([c.id for c in carriers])
        rid = random.choice([r.id for r in routes])
        vid = random.choice([v.id for v in vehicles] + [None])
        ctid = random.choice([c.id for c in contracts])
        sd = date(2025, 1, 1) + timedelta(days=random.randint(0, 200))
        edd = sd + timedelta(days=random.randint(1, 7))
        add = edd + timedelta(days=random.randint(-1, 4)) if random.random() > 0.2 else None
        wt_actual = round(random.uniform(1000, 80000), 2)
        wt_charged = round(wt_actual * random.uniform(1.0, 1.2), 2)
        dist_exp = random.choice([r.distance_km for r in routes])
        dist_act = round(dist_exp * random.uniform(0.95, 1.15), 2)
        mode = random.choice(["Road", "Road", "Road", "Rail", "Sea", "Air"])
        route_obj = random.choice(routes)
        fr_amount = round(8000 + (wt_charged * random.uniform(2, 20)), 2)
        fs = round(fr_amount * random.uniform(0.04, 0.12), 2)
        det = round(random.uniform(0, 5000), 2)
        other = round(random.uniform(0, 3000), 2)
        total = round(fr_amount + fs + det + other, 2)
        accrued = round(total * random.uniform(0.85, 1.05), 2)
        status = random.choice(statuses)
        s = FreightShipment(
            shipment_number=f"SHP-{i+1:04d}",
            lr_number=f"LR-{random.randint(1001, 9999)}" if random.random() > 0.1 else "",
            carrier_id=cid, route_id=rid, vehicle_id=vid, contract_id=ctid,
            shipment_date=sd, expected_delivery_date=edd, actual_delivery_date=add,
            indent_date=sd - timedelta(days=random.randint(1, 5)),
            vehicle_placement_date=sd - timedelta(days=random.randint(0, 3)),
            origin=route_obj.origin, destination=route_obj.destination,
            mode=mode, commodity=random.choice(COMMODITIES),
            actual_weight_kg=wt_actual, charged_weight_kg=wt_charged, volume_cbm=round(wt_actual / 400, 2),
            expected_distance_km=dist_exp, actual_distance_km=dist_act,
            contract_rate=round(random.uniform(1.5, 25), 2),
            billed_rate=round(random.uniform(1.5, 30), 2),
            freight_amount=fr_amount, fuel_surcharge=fs, detention_charges=det,
            other_charges=other, total_amount=total, accrued_freight=accrued,
            notes=f"Shipment of {random.choice(COMMODITIES)}", status=status,
            tenant_id=tenant_id,
        )
        shipments.append(s)
    db.add_all(shipments)
    db.flush()

    invoices = []
    for i, s in enumerate(shipments[:200]):
        billed = s.total_amount
        approved = round(billed * random.uniform(0.85, 1.0), 2)
        diff = round(billed - approved, 2)
        inv = FreightInvoice(
            invoice_number=f"INV-2025-{i+1:04d}",
            shipment_id=s.id, carrier_id=s.carrier_id,
            invoice_date=s.shipment_date + timedelta(days=random.randint(1, 10)),
            due_date=s.shipment_date + timedelta(days=random.randint(15, 45)),
            billed_amount=billed, approved_amount=approved, difference_amount=diff,
            fuel_surcharge_billed=s.fuel_surcharge, detention_billed=s.detention_charges,
            tax_amount=round(billed * 0.09, 2), total_amount=round(billed * 1.09, 2),
            currency="INR", status=random.choice(["Approved", "Pending", "Pending", "Rejected"]),
            payment_status=random.choice(["Paid", "Unpaid", "Unpaid"]),
            payment_date=s.shipment_date + timedelta(days=random.randint(20, 50)) if random.random() > 0.4 else None,
            notes="", tenant_id=tenant_id,
        )
        invoices.append(inv)
    db.add_all(invoices)
    db.flush()

    pods = []
    for s in shipments:
        if random.random() > 0.35:
            p = POD(
                shipment_id=s.id,
                pod_number=f"POD-{random.randint(1000, 9999)}",
                received_date=s.actual_delivery_date or s.expected_delivery_date + timedelta(days=random.randint(0, 3)),
                received_by=random.choice(["Rohit Verma", "Meena Iyer", "Suresh Pal", "Amit Joshi", "Neha Gupta", "Vijay Singh"]),
                condition=random.choice(["Good", "Good", "Good", "Damaged", "Partial"]),
                remarks="Delivered in good condition" if random.random() > 0.2 else "Outer packaging damaged",
                document_url=f"/docs/pods/{s.shipment_number}.pdf",
                is_delivered=s.status == "Delivered",
                tenant_id=tenant_id,
            )
            pods.append(p)
    db.add_all(pods)
    db.flush()

    fuel_indices = [
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 1, 1), base_price=86.50, current_price=89.25, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 4, 1), base_price=86.50, current_price=92.00, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 7, 1), base_price=86.50, current_price=88.75, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Aviation Fuel", index_date=date(2025, 1, 1), base_price=105.00, current_price=118.50, surcharge_formula="((Current-Base)/Base)*100*0.12", tenant_id=tenant_id),
        FuelIndex(fuel_type="Aviation Fuel", index_date=date(2025, 4, 1), base_price=105.00, current_price=122.00, surcharge_formula="((Current-Base)/Base)*100*0.12", tenant_id=tenant_id),
        FuelIndex(fuel_type="CNG", index_date=date(2025, 1, 1), base_price=55.00, current_price=58.50, surcharge_formula="((Current-Base)/Base)*100*0.06", tenant_id=tenant_id),
    ]
    db.add_all(fuel_indices)
    db.flush()

    claims = []
    claim_types = ["Damage", "Shortage", "Delay", "Theft", "Other"]
    for i in range(30):
        s = random.choice(shipments)
        cm = random.choice(claim_types)
        val = round(random.uniform(5000, 80000), 2)
        rec = round(val * random.uniform(0, 0.8), 2)
        pend = round(val - rec - round(val * random.uniform(0, 0.2), 2), 2)
        rej = round(val - rec - pend, 2)
        st = random.choice(["Open", "Open", "Partial", "Approved", "Rejected", "Closed"])
        cl = Claim(
            claim_number=f"CLM-2025-{i+1:04d}",
            shipment_id=s.id, carrier_id=s.carrier_id, claim_type=cm,
            claim_date=s.shipment_date + timedelta(days=random.randint(2, 20)),
            claim_value=val, recovered_amount=rec, pending_amount=pend,
            rejected_amount=rej, status=st,
            resolution_date=s.shipment_date + timedelta(days=random.randint(20, 60)) if st in ("Approved", "Closed", "Rejected") else None,
            notes=f"{cm} claim for {s.commodity} shipment", tenant_id=tenant_id,
        )
        claims.append(cl)
    db.add_all(claims)
    db.flush()

    detention_charges = []
    for i in range(40):
        s = random.choice(shipments)
        det_type = random.choice(["Loading", "Unloading", "Transit", "Port", "Customs"])
        free = random.choice([2, 3, 4, 6, 8, 12])
        actual = free + random.randint(0, 12)
        rate = random.choice([300, 400, 500, 600, 800])
        d = DetentionCharge(
            shipment_id=s.id, carrier_id=s.carrier_id, detention_type=det_type,
            free_hours=free, actual_hours=actual, chargeable_hours=max(0, actual - free),
            rate_per_hour=rate, total_amount=round(max(0, actual - free) * rate, 2),
            is_avoidable=random.random() > 0.3, reason=random.choice([
                "Late cargo readiness", "Warehouse congestion", "Documentation delay",
                "Awaiting customs clearance", "Vehicle breakdown", "Traffic delay",
            ]), tenant_id=tenant_id,
        )
        detention_charges.append(d)
    db.add_all(detention_charges)
    db.flush()

    plants = []
    for p in PLANTS:
        city = p[2].split()[0]
        plants.append(Plant(
            code=p[0], name=p[1], location=p[2], address=f"{p[2]}, {city}",
            city=city, state=random.choice(STATES),
            pincode=str(random.randint(100000, 999999)),
            contact_person=random.choice(["Rajesh Kumar", "Anita Sharma", "Vikram Singh", "Priya Patel"]),
            contact_phone=f"+91-{random.randint(7000000000, 9999999999)}",
            is_active=True, tenant_id=tenant_id,
        ))
    db.add_all(plants)
    db.flush()

    warehouses = []
    for w in WAREHOUSES:
        city = w[2].split()[0]
        warehouses.append(Warehouse(
            code=w[0], name=w[1], location=w[2], address=f"{w[2]}, {city}",
            city=city, state=random.choice(STATES),
            pincode=str(random.randint(100000, 999999)),
            capacity_sqft=round(random.uniform(10000, 100000), 2),
            capacity_pallets=random.randint(500, 5000),
            contact_person=random.choice(["Rohit Verma", "Meena Iyer", "Suresh Pal", "Amit Joshi"]),
            contact_phone=f"+91-{random.randint(7000000000, 9999999999)}",
            is_active=True, tenant_id=tenant_id,
        ))
    db.add_all(warehouses)
    db.flush()

    regions = []
    for r in REGIONS:
        regions.append(Region(
            code=r[0], name=r[1], zone=r[2], countries=r[3],
            is_active=True, tenant_id=tenant_id,
        ))
    db.add_all(regions)
    db.flush()

    business_units = []
    for b in BUSINESS_UNITS:
        business_units.append(BusinessUnit(
            code=b[0], name=b[1], head=b[2], cost_center=b[3],
            budget_allocated=b[4], is_active=True, tenant_id=tenant_id,
        ))
    db.add_all(business_units)
    db.flush()

    risk_controls = []
    risk_data = [
        ("RC-FRT-001", "Freight overbilling beyond contracted rates", "Auto-validation of rates at invoice booking", "Accuracy", 5, 4, "Weekly"),
        ("RC-FRT-002", "Duplicate invoice payment", "3-way match before payment release", "Completeness", 4, 5, "Daily"),
        ("RC-FRT-003", "Unauthorized carrier engagement", "Approved carrier master list maintenance", "Validity", 3, 4, "Monthly"),
        ("RC-FRT-004", "Fuel surcharge overcalculation", "Fuel index-based auto calculation", "Accuracy", 4, 3, "Weekly"),
        ("RC-FRT-005", "Route distance inflation", "GPS tracking and geo-fencing", "Accuracy", 4, 4, "Daily"),
        ("RC-FRT-006", "Excessive detention charges", "Automated detention tracking system", "Efficiency", 3, 3, "Weekly"),
        ("RC-FRT-007", "Missing PODs", "POD tracking dashboard", "Completeness", 4, 4, "Daily"),
        ("RC-FRT-008", "Weight/volume manipulation", "Weighbor bridge integration", "Accuracy", 5, 3, "Monthly"),
        ("RC-FRT-009", "SLA non-compliance", "Automated SLA monitoring", "Efficiency", 3, 4, "Weekly"),
        ("RC-FRT-010", "Fraudulent claims", "Claims verification process", "Validity", 4, 5, "Monthly"),
        ("RC-FRT-011", "Transit delays causing production loss", "Real-time tracking and alerts", "Efficiency", 4, 3, "Daily"),
        ("RC-FRT-012", "Wrong mode selection inflating costs", "Mode optimization algorithm", "Efficiency", 3, 3, "Monthly"),
        ("RC-FRT-013", "Backhaul empty runs", "Return load optimization system", "Efficiency", 3, 2, "Monthly"),
        ("RC-FRT-014", "Invoice data entry errors", "Automated data extraction from invoices", "Accuracy", 3, 4, "Daily"),
        ("RC-FRT-015", "Carrier insurance lapses", "Insurance certificate tracking", "Validity", 2, 3, "Quarterly"),
    ]
    for rc in risk_data:
        likelihood = rc[4]
        impact = rc[5]
        inherent = "High" if likelihood * impact >= 16 else "Medium" if likelihood * impact >= 9 else "Low"
        freq_map = {1: "Quarterly", 2: "Monthly", 3: "Monthly", 4: "Weekly", 5: "Daily"}
        residual = "Medium" if inherent == "High" else "Low"
        risk_controls.append(RiskControl(
            risk_code=rc[0], risk_description=rc[1], control_description=rc[2],
            assertion=rc[3], risk_category="Freight Audit",
            likelihood=freq_map[likelihood], impact=freq_map[impact],
            inherent_risk=inherent, control_frequency=rc[6],
            control_owner=random.choice(["Finance Controller", "Logistics Manager", "Audit Team", "Operations Head"]),
            residual_risk=residual, tenant_id=tenant_id,
        ))
    db.add_all(risk_controls)
    db.flush()

    test_rules = []
    rules_data = [
        ("CAAT-001", "Rate Overbilling Check", "Rate Compliance", "billed_rate > contract_rate * 1.05", 5, ">", "High"),
        ("CAAT-002", "Weight Variance Check", "Weight Validation", "ABS(charged_weight - actual_weight) / actual_weight > 0.10", 10, ">", "High"),
        ("CAAT-003", "Fuel Surcharge Overbilling", "Fuel Audit", "fuel_surcharge > freight_amount * 0.12", 12, ">", "Medium"),
        ("CAAT-004", "Duplicate Invoice Detection", "Billing", "COUNT(invoice_number) > 1", 1, ">", "High"),
        ("CAAT-005", "Route Distance Inflation", "Route Audit", "actual_distance > expected_distance * 1.10", 10, ">", "Medium"),
        ("CAAT-006", "Detention Charge Validation", "Detention", "chargeable_hours > free_hours", 0, ">", "Medium"),
        ("CAAT-007", "SLA Breach Detection", "Service Level", "actual_delivery > expected_delivery", 0, ">", "Medium"),
        ("CAAT-008", "Missing POD Check", "Documentation", "pod_number IS NULL", 0, "=", "High"),
        ("CAAT-009", "Negative Freight Check", "Validation", "total_amount < 0", 0, "<", "Critical"),
        ("CAAT-010", "Provision Accuracy Check", "Financial", "ABS(total_amount - accrued_freight) / accrued_freight > 0.10", 10, ">", "Medium"),
        ("CAAT-011", "Duplicate LR Check", "Documentation", "COUNT(lr_number) > 1", 1, ">", "High"),
        ("CAAT-012", "Transit Time Exception", "Service Level", "actual_delivery_date - expected_delivery_date > 2", 2, ">", "Medium"),
        ("CAAT-013", "Carrier Performance Below Threshold", "Vendor", "performance_score < 60", 60, "<", "High"),
        ("CAAT-014", "Empty Return Analysis", "Efficiency", "total_amount < freight_amount * 0.3", 30, "<", "Low"),
        ("CAAT-015", "Invoice Amount Discrepancy", "Financial", "ABS(billed_amount - approved_amount) / billed_amount > 0.05", 5, ">", "Medium"),
    ]
    for r in rules_data:
        test_rules.append(TestRule(
            rule_code=r[0], rule_name=r[1], description=f"Automated CAAT rule: {r[1]}",
            category=r[2], expression=r[3], threshold_value=r[4],
            threshold_operator=r[5], severity=r[6], is_active=True, tenant_id=tenant_id,
        ))
    db.add_all(test_rules)
    db.flush()

    data_sources = [
        DataSource(source_code="DS-ERP-001", source_name="SAP ERP", source_type="API", connection_string="https://erp.company.com/api", table_name="ZFREIGHT_INVOICES", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-ERP-002", source_name="Oracle EBS", source_type="API", connection_string="https://ebs.company.com/api", table_name="PO_SHIPMENTS", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-CSV-001", source_name="Transporter CSV Upload", source_type="CSV", file_format="CSV", table_name="transporter_rates", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-XLS-001", source_name="Freight Invoice Excel", source_type="Excel", file_format="XLSX", table_name="freight_invoices", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-GPS-001", source_name="GPS Tracking API", source_type="API", connection_string="https://gps.tracking.com/api", table_name="vehicle_tracks", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-FUEL-001", source_name="Fuel Index API", source_type="API", connection_string="https://fuelindex.gov.in/api", table_name="fuel_prices", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-API-001", source_name="Carrier Performance API", source_type="API", connection_string="https://carrier.rating.com/api", table_name="carrier_scores", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-WEB-001", source_name="Web Scraper - IRFC", source_type="API", connection_string="https://irfc.gov.in/rail-freight", table_name="rail_rates", is_active=False, tenant_id=tenant_id),
        DataSource(source_code="DS-CSV-002", source_name="Manual POD Upload", source_type="CSV", file_format="CSV", table_name="pod_records", is_active=True, tenant_id=tenant_id),
        DataSource(source_code="DS-API-002", source_name="Weather API", source_type="API", connection_string="https://weather.api.com/data", table_name="weather_data", is_active=False, tenant_id=tenant_id),
    ]
    db.add_all(data_sources)
    db.flush()

    sampling_records = []
    for i in range(15):
        pop_count = random.randint(500, 5000)
        samp_size = random.randint(20, 100)
        method = random.choice(["Random", "Random", "Systematic", "Stratified", "Judgement"])
        confidence = random.choice([90, 95, 95, 99])
        margin = random.choice([3, 5, 5, 10])
        pop = list(range(1, pop_count + 1))
        selected = random.sample(pop, min(samp_size, pop_count))
        table = random.choice(["FreightShipment", "FreightInvoice", "Claim", "Carrier", "Route", "POD"])
        sr = SamplingRecord(
            sample_code=f"SMP-{i+1:04d}", population_table=table,
            population_count=pop_count, sample_size=len(selected),
            sampling_method=method, confidence_level=confidence,
            margin_of_error=margin, sample_data=json.dumps(selected[:20]),
            status=random.choice(["Draft", "Generated", "Reviewed", "Approved"]),
            created_by=random.choice(["Audit Team", "Internal Auditor", "Senior Auditor", "Audit Manager"]),
            tenant_id=tenant_id,
        )
        sampling_records.append(sr)
    db.add_all(sampling_records)
    db.flush()

    exceptions = []
    for i in range(25):
        sev = random.choice(["High", "High", "Medium", "Medium", "Low"])
        st = random.choice(["Open", "Open", "In Progress", "Resolved", "Closed"])
        exceptions.append(ExceptionItem(
            exception_code=f"EXC-{i+1:04d}",
            title=random.choice([
                "Freight overbilling on Mumbai route",
                "Duplicate invoice detected",
                "Missing POD for high-value shipment",
                "SLA breach - delayed delivery",
                "Weight discrepancy > 15%",
                "Fuel surcharge overcalculation",
                "Unauthorized carrier used",
                "Route distance inflation detected",
                "Detention charge without approval",
                "Claim settlement delayed beyond 30 days",
            ]),
            category=random.choice(["Rate Compliance", "Documentation", "Service Level", "Billing", "Claims"]),
            severity=sev, description="Flagged by automated CAAT rule analysis",
            source_reference=f"Analytics: {random.choice(['Rate Compliance', 'Weight Variance', 'LR POD Match', 'Transit SLA'])}",
            financial_impact=round(random.uniform(5000, 500000), 2),
            assigned_to=random.choice(["", "Rajesh Kumar", "Anita Sharma", "Audit Team"]),
            comments="Under review" if st == "Open" else "Resolved after verification",
            status=st, resolved_date=date.today() - timedelta(days=random.randint(1, 30)) if st in ("Resolved", "Closed") else None,
            tenant_id=tenant_id,
        ))
    db.add_all(exceptions)
    db.flush()

    working_papers = []
    for i in range(20):
        st = random.choice(["Draft", "Draft", "Under Review", "Reviewed", "Approved"])
        reviewer = "" if st == "Draft" else random.choice(["Senior Auditor", "Audit Manager", "Partner"])
        reviewed = date.today() - timedelta(days=random.randint(1, 15)) if st in ("Reviewed", "Approved") else None
        file_type = random.choice(["PDF", "PDF", "Excel", "Excel", "Image", "Word"])
        working_papers.append(WorkingPaper(
            wp_code=f"WP-{i+1:04d}",
            title=random.choice([
                "Freight Rate Analysis", "Transporter Evaluation", "Route Optimization Study",
                "Invoice Verification Report", "POD Reconciliation", "Claim Analysis Summary",
                "Fuel Surcharge Review", "SLA Compliance Report", "Detention Charge Analysis",
                "Weight Verification Log", "Sampling Methodology Document", "Audit Program",
                "Risk Assessment Matrix", "Control Testing Results", "Management Representation Letter",
            ]),
            category=random.choice(["Audit Program", "Evidence", "Analysis", "Report", "Correspondence"]),
            description="Working paper for logistics audit evidence",
            file_type=file_type, file_url=f"/docs/wp/wp_{i+1:04d}.{file_type.lower()}",
            file_size=random.randint(50000, 5000000),
            reviewed_by=reviewer, reviewed_date=reviewed,
            reviewer_signoff=st in ("Reviewed", "Approved"),
            status=st, tenant_id=tenant_id,
        ))
    db.add_all(working_papers)
    db.flush()

    kpis = [
        DashboardKPI(kpi_name="Total Shipments", kpi_value=250, kpi_category="Volume", period="MTD",
                     period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="On-Time Delivery %", kpi_value=round(random.uniform(70, 95), 1), kpi_category="Service",
                     period="MTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Avg Freight Cost", kpi_value=round(random.uniform(50000, 150000), 2), kpi_category="Cost",
                     period="MTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Open Claims", kpi_value=random.randint(2, 15), kpi_category="Risk",
                     period="MTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Duplicate Bills Detected", kpi_value=random.randint(1, 8), kpi_category="Risk",
                     period="MTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Freight Spend (₹ Lakhs)", kpi_value=round(random.uniform(50, 500), 2), kpi_category="Cost",
                     period="YTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="SLA Compliance %", kpi_value=round(random.uniform(75, 98), 1), kpi_category="Service",
                     period="MTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Recovery Rate %", kpi_value=round(random.uniform(40, 90), 1), kpi_category="Risk",
                     period="YTD", period_start=date(2025, 1, 1), period_end=date(2025, 12, 31), tenant_id=tenant_id),
    ]
    db.add_all(kpis)
    db.flush()

    findings = [
        Finding(finding_number="FND-2025-001", title="Freight Overbilling Detected - Multiple Routes",
                category="Rate Compliance", severity="High",
                description="Multiple shipments show billed rates exceeding contract rates by over 15%. "
                            "Estimated overbilling of ₹4.5L across 25 shipments identified through CAAT analysis.",
                impact="Financial impact of ₹4,50,000 across 25 shipments. Primary carriers: Speed Logistics and Cargo Express.",
                recommendation="Implement automated rate validation at invoice booking stage. Recover overbilled amounts from carriers. "
                               "Review contract compliance clauses.",
                status="Open", source_reference="Analytics: Rate Compliance", financial_impact=450000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-002", title="Excessive Detention Charges - Operational Inefficiency",
                category="Operational Efficiency", severity="Medium",
                description="Avoidable detention charges of ₹1,85,000 identified. Primary causes: late cargo readiness (45%), "
                            "customs clearance delays (30%), and warehouse congestion (25%).",
                impact="₹1,85,000 in avoidable detention charges during FY 2025.",
                recommendation="Coordinate with warehouse team for timely cargo readiness. Pre-clear documentation. "
                               "Implement SLAs with warehouse operators.",
                status="Open", source_reference="Analytics: Detention Analysis", financial_impact=185000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-003", title="Route Distance Inflation - GPS Deviation Detected",
                category="Route Compliance", severity="Medium",
                description="Analysis of 250 shipments shows 18% have actual distance > expected distance by more than 10%. "
                            "Average inflation of 45 km per shipment on Mumbai-Delhi route.",
                impact="Additional freight cost of approximately ₹2,80,000 due to inflated distance billing.",
                recommendation="Install GPS tracking on all vehicles. Set geo-fence alerts for route deviations. "
                               "Review and update standard route distances quarterly.",
                status="Open", source_reference="Analytics: Route Distance", financial_impact=280000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-004", title="Duplicate Invoice Detection - Control Weakness",
                category="Duplicate Billing", severity="High",
                description="Three instances of duplicate invoices identified from Cargo Express and TCI Freight. "
                            "Total duplicate billing of ₹2,85,000 detected. Root cause: lack of 3-way match.",
                impact="Potential duplicate billing of ₹2,85,000. Two invoices already paid.",
                recommendation="Strengthen 3-way match (PO/Invoice/POD) before payment processing. "
                               "Implement automated duplicate invoice detection system.",
                status="Open", source_reference="Analytics: Duplicate Billing", financial_impact=285000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-005", title="SLA Breach - SeaLine Shipping Performance Issue",
                category="Service Level", severity="Medium",
                description="SeaLine Shipping consistently shows 20%+ delay over SLA. Average transit time of 6 days vs "
                            "standard 4 days. 12 shipments affected in Q2 2025.",
                impact="Production delays at Chennai plant. Estimated impact of ₹1,50,000.",
                recommendation="Enforce SLA penalty clauses in contract. Escalate to carrier management. "
                               "Consider alternative sea freight carriers.",
                status="Open", source_reference="Analytics: Transit SLA", financial_impact=150000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-006", title="Missing PODs - Documentation Gap",
                category="Documentation", severity="High",
                description="35% of shipments lack complete POD documentation. 87 high-value shipments without verified POD. "
                            "Risk of undelivered goods claims.",
                impact="₹12,00,000 worth of shipments at risk due to missing POD verification.",
                recommendation="Mandate POD upload within 48 hours of delivery. Block invoice processing without POD. "
                               "Implement digital POD capture system.",
                status="Open", source_reference="Analytics: LR POD Match", financial_impact=1200000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-007", title="Fuel Surcharge Overcalculation",
                category="Fuel Audit", severity="Medium",
                description="Fuel surcharge calculated incorrectly for 15% of shipments. Average overcharge of 2.5% above "
                            "contractual rate. Total overbilling of ₹95,000.",
                impact="₹95,000 in excess fuel surcharge billed by carriers.",
                recommendation="Automate fuel surcharge calculation using fuel index. Implement validation check before approval.",
                status="Open", source_reference="Analytics: Fuel Surcharge", financial_impact=95000, tenant_id=tenant_id),
    ]
    db.add_all(findings)
    db.flush()

    actions = [
        ActionTracker(action_number="ACT-2025-001", finding_id=findings[0].id,
                      title="Implement automated rate validation system",
                      assigned_to="IT Team", target_date=date(2025, 8, 31),
                      status="Open", priority="High",
                      notes="Coordinate with ERP team to configure rate validation rules in SAP.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-002", finding_id=findings[0].id,
                      title="Recover overbilled amounts from carriers",
                      assigned_to="Finance Team", target_date=date(2025, 7, 31),
                      status="In Progress", priority="High",
                      notes="Send debit notes to Speed Logistics (₹2.8L) and Cargo Express (₹1.7L).", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-003", finding_id=findings[1].id,
                      title="Coordinate with warehouse for cargo readiness SLA",
                      assigned_to="Operations Team", target_date=date(2025, 7, 15),
                      status="Open", priority="Medium",
                      notes="Implement cargo readiness SLA of 4 hours for all warehouses.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-004", finding_id=findings[2].id,
                      title="Install GPS tracking on all fleet vehicles",
                      assigned_to="Fleet Manager", target_date=date(2025, 9, 30),
                      status="Open", priority="Low",
                      notes="Budget approval pending from management. ROI analysis attached.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-005", finding_id=findings[3].id,
                      title="Investigate duplicate invoices from Cargo Express",
                      assigned_to="Audit Team", target_date=date(2025, 7, 10),
                      status="In Progress", priority="High",
                      notes="Reviewing all invoices from Cargo Express for Q1-Q2 2025.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-006", finding_id=findings[3].id,
                      title="Implement 3-way match automation",
                      assigned_to="IT Team", target_date=date(2025, 10, 31),
                      status="Open", priority="High",
                      notes="PO/Invoice/POD matching workflow in ERP system.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-007", finding_id=findings[4].id,
                      title="Enforce SLA penalty clauses with SeaLine",
                      assigned_to="Legal Team", target_date=date(2025, 7, 31),
                      status="Open", priority="Medium",
                      notes="Issue notice for SLA breach penalties. Renegotiate contract terms.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-008", finding_id=findings[5].id,
                      title="Deploy digital POD capture app",
                      assigned_to="IT Team", target_date=date(2025, 12, 31),
                      status="Open", priority="Medium",
                      notes="Mobile app for drivers to capture and upload POD in real-time.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-009", finding_id=findings[6].id,
                      title="Configure fuel index-based surcharge calculator",
                      assigned_to="IT Team", target_date=date(2025, 8, 31),
                      status="Open", priority="Medium",
                      notes="Integrate government fuel index API for automated calculation.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-010", finding_id=findings[0].id,
                      title="Conduct rate compliance training for finance team",
                      assigned_to="Training Dept", target_date=date(2025, 7, 30),
                      status="Open", priority="Low",
                      notes="Quarterly training on contract rate validation procedures.", tenant_id=tenant_id),
    ]
    db.add_all(actions)
    db.commit()
