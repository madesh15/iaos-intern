"""Seed data for Logistics & Freight module."""
import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from .models import (
    Carrier, Vehicle, Route, FreightRateContract, FreightShipment,
    FreightInvoice, POD, FuelIndex, Claim, DetentionCharge,
    DashboardKPI, Finding, ActionTracker,
)


def seed_data(db: Session, tenant_id: int):
    if db.query(Carrier).filter(Carrier.tenant_id == tenant_id).first():
        return

    carriers = [
        Carrier(name="Speed Logistics Ltd", code="SPD001", carrier_type="Truck", status="Active",
                contact_person="Rajesh Kumar", email="rajesh@speedlogistics.in", phone="+91-9876543210",
                performance_score=85.0, on_time_percentage=92.0, damage_percentage=2.0,
                claim_percentage=1.5, delay_percentage=8.0, tenant_id=tenant_id),
        Carrier(name="Cargo Express Pvt", code="CRG001", carrier_type="Truck", status="Active",
                contact_person="Anita Sharma", email="anita@cargoexpress.in", phone="+91-9876543211",
                performance_score=72.0, on_time_percentage=78.0, damage_percentage=5.0,
                claim_percentage=3.0, delay_percentage=22.0, tenant_id=tenant_id),
        Carrier(name="Rail Freight Corp", code="RFC001", carrier_type="Rail", status="Active",
                contact_person="Vikram Singh", email="vikram@railfreight.in", phone="+91-9876543212",
                performance_score=90.0, on_time_percentage=95.0, damage_percentage=1.0,
                claim_percentage=0.5, delay_percentage=5.0, tenant_id=tenant_id),
        Carrier(name="SeaLine Shipping", code="SHP001", carrier_type="Sea", status="Active",
                contact_person="Priya Patel", email="priya@sealine.in", phone="+91-9876543213",
                performance_score=78.0, on_time_percentage=82.0, damage_percentage=3.0,
                claim_percentage=2.0, delay_percentage=18.0, tenant_id=tenant_id),
        Carrier(name="AirSpeed Couriers", code="AIR001", carrier_type="Air", status="Active",
                contact_person="Arun Nair", email="arun@airspeed.in", phone="+91-9876543214",
                performance_score=95.0, on_time_percentage=98.0, damage_percentage=0.5,
                claim_percentage=0.2, delay_percentage=2.0, tenant_id=tenant_id),
        Carrier(name="TransGoods Movers", code="TGM001", carrier_type="Truck", status="Inactive",
                contact_person="Suresh Reddy", email="suresh@transgoods.in", phone="+91-9876543215",
                performance_score=45.0, on_time_percentage=55.0, damage_percentage=12.0,
                claim_percentage=8.0, delay_percentage=45.0, tenant_id=tenant_id),
    ]
    db.add_all(carriers)
    db.flush()

    vehicles = [
        Vehicle(carrier_id=carriers[0].id, registration_number="MH-01-AB-1234", vehicle_type="Truck",
                capacity_kg=16000, capacity_cbm=40, make="Tata", model="Prima", year=2022, tenant_id=tenant_id),
        Vehicle(carrier_id=carriers[0].id, registration_number="MH-01-AB-5678", vehicle_type="Truck",
                capacity_kg=25000, capacity_cbm=60, make="Ashok Leyland", model="Boss", year=2023, tenant_id=tenant_id),
        Vehicle(carrier_id=carriers[1].id, registration_number="GJ-05-CD-9012", vehicle_type="Truck",
                capacity_kg=12000, capacity_cbm=30, make="Eicher", model="Pro 3015", year=2021, tenant_id=tenant_id),
        Vehicle(carrier_id=carriers[1].id, registration_number="GJ-05-CD-3456", vehicle_type="Trailer",
                capacity_kg=30000, capacity_cbm=80, make="Volvo", model="FM420", year=2023, tenant_id=tenant_id),
        Vehicle(carrier_id=carriers[4].id, registration_number="DL-07-EF-7890", vehicle_type="Container",
                capacity_kg=8000, capacity_cbm=20, make="Boeing", model="737F", year=2022, tenant_id=tenant_id),
    ]
    db.add_all(vehicles)
    db.flush()

    routes = [
        Route(origin="Mumbai", destination="Delhi", origin_code="BOM", destination_code="DEL",
              distance_km=1400, standard_transit_hours=48, mode="Road", tenant_id=tenant_id),
        Route(origin="Delhi", destination="Mumbai", origin_code="DEL", destination_code="BOM",
              distance_km=1400, standard_transit_hours=48, mode="Road", tenant_id=tenant_id),
        Route(origin="Mumbai", destination="Chennai", origin_code="BOM", destination_code="MAA",
              distance_km=1300, standard_transit_hours=44, mode="Road", tenant_id=tenant_id),
        Route(origin="Mumbai", destination="Kolkata", origin_code="BOM", destination_code="CCU",
              distance_km=2000, standard_transit_hours=72, mode="Road", tenant_id=tenant_id),
        Route(origin="Delhi", destination="Bangalore", origin_code="DEL", destination_code="BLR",
              distance_km=2100, standard_transit_hours=72, mode="Road", tenant_id=tenant_id),
        Route(origin="Mumbai", destination="Delhi", origin_code="BOM", destination_code="DEL",
              distance_km=1400, standard_transit_hours=36, mode="Rail", tenant_id=tenant_id),
        Route(origin="Mumbai", destination="Chennai", origin_code="BOM", destination_code="MAA",
              distance_km=1200, standard_transit_hours=48, mode="Sea", tenant_id=tenant_id),
    ]
    db.add_all(routes)
    db.flush()

    contracts = [
        FreightRateContract(contract_number="CTR-2025-001", carrier_id=carriers[0].id, route_id=routes[0].id,
                            effective_date=date(2025, 1, 1), expiry_date=date(2025, 12, 31),
                            rate_per_kg=3.50, rate_per_km=12.00, rate_per_shipment=15000,
                            fuel_surcharge_pct=8.0, minimum_charge=5000, volume_discount_pct=3.0,
                            detention_rate_per_hour=500, free_detention_hours=4, tenant_id=tenant_id),
        FreightRateContract(contract_number="CTR-2025-002", carrier_id=carriers[1].id, route_id=routes[2].id,
                            effective_date=date(2025, 2, 1), expiry_date=date(2025, 11, 30),
                            rate_per_kg=4.00, rate_per_km=14.00, rate_per_shipment=18000,
                            fuel_surcharge_pct=10.0, minimum_charge=6000, volume_discount_pct=2.0,
                            detention_rate_per_hour=600, free_detention_hours=3, tenant_id=tenant_id),
        FreightRateContract(contract_number="CTR-2025-003", carrier_id=carriers[2].id, route_id=routes[5].id,
                            effective_date=date(2025, 1, 1), expiry_date=date(2025, 12, 31),
                            rate_per_kg=2.00, rate_per_km=8.00, rate_per_shipment=25000,
                            fuel_surcharge_pct=5.0, minimum_charge=10000, volume_discount_pct=5.0,
                            detention_rate_per_hour=300, free_detention_hours=8, tenant_id=tenant_id),
        FreightRateContract(contract_number="CTR-2025-004", carrier_id=carriers[3].id, route_id=routes[6].id,
                            effective_date=date(2025, 3, 1), expiry_date=date(2025, 10, 31),
                            rate_per_kg=1.50, rate_per_km=6.00, rate_per_shipment=35000,
                            fuel_surcharge_pct=6.0, minimum_charge=15000, volume_discount_pct=4.0,
                            detention_rate_per_hour=400, free_detention_hours=12, tenant_id=tenant_id),
        FreightRateContract(contract_number="CTR-2025-005", carrier_id=carriers[4].id, route_id=routes[4].id,
                            effective_date=date(2025, 1, 1), expiry_date=date(2025, 12, 31),
                            rate_per_kg=25.00, rate_per_km=85.00, rate_per_shipment=75000,
                            fuel_surcharge_pct=12.0, minimum_charge=25000, volume_discount_pct=2.0,
                            detention_rate_per_hour=2000, free_detention_hours=2, tenant_id=tenant_id),
    ]
    db.add_all(contracts)
    db.flush()

    shipment_data = [
        ("SHP-001", "LR-1001", carriers[0].id, routes[0].id, vehicles[0].id, contracts[0].id,
         date(2025, 6, 1), date(2025, 6, 3), date(2025, 6, 3), date(2025, 5, 30), date(2025, 5, 31),
         "Mumbai", "Delhi", "Road", "Electronics", 12000, 13000, 30, 1400, 1420, 3.50, 4.20, 42000, 3360, 2000, 500, 47860, 42000, "Delivered"),
        ("SHP-002", "LR-1002", carriers[1].id, routes[2].id, vehicles[2].id, contracts[1].id,
         date(2025, 6, 2), date(2025, 6, 5), date(2025, 6, 7), date(2025, 5, 31), date(2025, 6, 3),
         "Mumbai", "Chennai", "Road", "Textiles", 8000, 8500, 20, 1300, 1350, 4.00, 4.50, 32000, 3200, 1800, 300, 37300, 31000, "Delayed"),
        ("SHP-003", "LR-1003", carriers[2].id, routes[5].id, None, contracts[2].id,
         date(2025, 6, 3), date(2025, 6, 5), date(2025, 6, 5), date(2025, 6, 1), date(2025, 6, 2),
         "Mumbai", "Delhi", "Rail", "Automotive", 50000, 50000, 100, 1400, 1400, 2.00, 2.00, 100000, 5000, 0, 1000, 106000, 100000, "Delivered"),
        ("SHP-004", "LR-1004", carriers[0].id, routes[1].id, vehicles[1].id, contracts[0].id,
         date(2025, 6, 5), date(2025, 6, 7), date(2025, 6, 6), date(2025, 6, 3), date(2025, 6, 4),
         "Delhi", "Mumbai", "Road", "FMCG", 20000, 22000, 50, 1400, 1450, 3.50, 3.80, 69600, 5568, 1500, 800, 77468, 68000, "Delivered"),
        ("SHP-005", "LR-1005", carriers[3].id, routes[6].id, None, contracts[3].id,
         date(2025, 6, 6), date(2025, 6, 10), date(2025, 6, 12), date(2025, 6, 3), date(2025, 6, 8),
         "Mumbai", "Chennai", "Sea", "Machinery", 80000, 90000, 200, 1200, 1250, 1.50, 1.80, 120000, 7200, 2400, 5000, 134600, 115000, "Delayed"),
        ("SHP-006", "LR-1006", carriers[4].id, routes[4].id, vehicles[4].id, contracts[4].id,
         date(2025, 6, 7), date(2025, 6, 7), date(2025, 6, 7), date(2025, 6, 5), date(2025, 6, 6),
         "Delhi", "Bangalore", "Air", "Pharma", 3000, 3000, 8, 2100, 2100, 25.00, 25.00, 75000, 9000, 0, 2000, 86000, 75000, "Delivered"),
        ("SHP-007", "LR-1007", carriers[1].id, routes[3].id, vehicles[3].id, contracts[1].id,
         date(2025, 6, 8), date(2025, 6, 12), None, date(2025, 6, 5), date(2025, 6, 10),
         "Mumbai", "Kolkata", "Road", "Chemicals", 25000, 28000, 65, 2000, 2100, 4.00, 4.75, 110000, 11000, 3500, 1500, 126000, 105000, "In Transit"),
        ("SHP-008", "LR-1008", carriers[0].id, routes[0].id, vehicles[0].id, contracts[0].id,
         date(2025, 6, 10), date(2025, 6, 12), date(2025, 6, 11), date(2025, 6, 8), date(2025, 6, 9),
         "Mumbai", "Delhi", "Road", "Furniture", 15000, 16000, 38, 1400, 1410, 3.50, 3.50, 49000, 3920, 1000, 0, 53920, 49000, "Delivered"),
        ("SHP-009", "LR-1009", carriers[1].id, routes[2].id, vehicles[2].id, contracts[1].id,
         date(2025, 6, 12), date(2025, 6, 15), date(2025, 6, 16), date(2025, 6, 10), date(2025, 6, 13),
         "Mumbai", "Chennai", "Road", "Steel", 10000, 11000, 25, 1300, 1380, 4.00, 4.80, 44000, 4400, 2000, 400, 50800, 42000, "Delayed"),
        ("SHP-010", "LR-1010", carriers[2].id, routes[5].id, None, contracts[2].id,
         date(2025, 6, 13), date(2025, 6, 15), date(2025, 6, 15), date(2025, 6, 11), date(2025, 6, 12),
         "Mumbai", "Delhi", "Rail", "Cement", 60000, 60000, 120, 1400, 1400, 2.00, 2.20, 120000, 6000, 0, 2000, 128000, 120000, "Delivered"),
    ]

    shipments = []
    for sd in shipment_data:
        s = FreightShipment(
            shipment_number=sd[0], lr_number=sd[1], carrier_id=sd[2], route_id=sd[3],
            vehicle_id=sd[4], contract_id=sd[5], shipment_date=sd[6],
            expected_delivery_date=sd[7], actual_delivery_date=sd[8],
            indent_date=sd[9], vehicle_placement_date=sd[10],
            origin=sd[11], destination=sd[12], mode=sd[13], commodity=sd[14],
            actual_weight_kg=sd[15], charged_weight_kg=sd[16], volume_cbm=sd[17],
            expected_distance_km=sd[18], actual_distance_km=sd[19],
            contract_rate=sd[20], billed_rate=sd[21], freight_amount=sd[22],
            fuel_surcharge=sd[23], detention_charges=sd[24], other_charges=sd[25],
            total_amount=sd[26], accrued_freight=sd[27], status=sd[28],
            tenant_id=tenant_id,
        )
        shipments.append(s)
    db.add_all(shipments)
    db.flush()

    invoices = [
        FreightInvoice(invoice_number="INV-2025-001", shipment_id=shipments[0].id, carrier_id=carriers[0].id,
                       invoice_date=date(2025, 6, 5), due_date=date(2025, 6, 20),
                       billed_amount=47860, approved_amount=45000, difference_amount=2860,
                       fuel_surcharge_billed=3360, detention_billed=2000, tax_amount=4307,
                       total_amount=52167, status="Approved", payment_status="Paid",
                       payment_date=date(2025, 6, 18), tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-002", shipment_id=shipments[1].id, carrier_id=carriers[1].id,
                       invoice_date=date(2025, 6, 7), due_date=date(2025, 6, 22),
                       billed_amount=37300, approved_amount=35000, difference_amount=2300,
                       fuel_surcharge_billed=3200, detention_billed=1800, tax_amount=3357,
                       total_amount=40657, status="Approved", payment_status="Unpaid", tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-003", shipment_id=shipments[2].id, carrier_id=carriers[2].id,
                       invoice_date=date(2025, 6, 8), due_date=date(2025, 6, 23),
                       billed_amount=106000, approved_amount=106000, difference_amount=0,
                       fuel_surcharge_billed=5000, detention_billed=0, tax_amount=9540,
                       total_amount=115540, status="Approved", payment_status="Paid",
                       payment_date=date(2025, 6, 21), tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-004", shipment_id=shipments[3].id, carrier_id=carriers[0].id,
                       invoice_date=date(2025, 6, 9), due_date=date(2025, 6, 24),
                       billed_amount=77468, approved_amount=72000, difference_amount=5468,
                       fuel_surcharge_billed=5568, detention_billed=1500, tax_amount=6972,
                       total_amount=84440, status="Approved", payment_status="Paid",
                       payment_date=date(2025, 6, 22), tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-005", shipment_id=shipments[4].id, carrier_id=carriers[3].id,
                       invoice_date=date(2025, 6, 12), due_date=date(2025, 6, 27),
                       billed_amount=134600, approved_amount=125000, difference_amount=9600,
                       fuel_surcharge_billed=7200, detention_billed=2400, tax_amount=12114,
                       total_amount=146714, status="Pending", payment_status="Unpaid", tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-006", shipment_id=shipments[5].id, carrier_id=carriers[4].id,
                       invoice_date=date(2025, 6, 10), due_date=date(2025, 6, 25),
                       billed_amount=86000, approved_amount=86000, difference_amount=0,
                       fuel_surcharge_billed=9000, detention_billed=0, tax_amount=7740,
                       total_amount=93740, status="Approved", payment_status="Paid",
                       payment_date=date(2025, 6, 23), tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-007", shipment_id=shipments[6].id, carrier_id=carriers[1].id,
                       invoice_date=date(2025, 6, 14), due_date=date(2025, 6, 29),
                       billed_amount=126000, approved_amount=115000, difference_amount=11000,
                       fuel_surcharge_billed=11000, detention_billed=3500, tax_amount=11340,
                       total_amount=137340, status="Pending", payment_status="Unpaid", tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-008", shipment_id=shipments[7].id, carrier_id=carriers[0].id,
                       invoice_date=date(2025, 6, 14), due_date=date(2025, 6, 29),
                       billed_amount=53920, approved_amount=53920, difference_amount=0,
                       fuel_surcharge_billed=3920, detention_billed=1000, tax_amount=4853,
                       total_amount=58773, status="Approved", payment_status="Unpaid", tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-009", shipment_id=shipments[8].id, carrier_id=carriers[1].id,
                       invoice_date=date(2025, 6, 16), due_date=date(2025, 7, 1),
                       billed_amount=50800, approved_amount=47000, difference_amount=3800,
                       fuel_surcharge_billed=4400, detention_billed=2000, tax_amount=4572,
                       total_amount=55372, status="Pending", payment_status="Unpaid", tenant_id=tenant_id),
        FreightInvoice(invoice_number="INV-2025-010", shipment_id=shipments[9].id, carrier_id=carriers[2].id,
                       invoice_date=date(2025, 6, 18), due_date=date(2025, 7, 3),
                       billed_amount=128000, approved_amount=128000, difference_amount=0,
                       fuel_surcharge_billed=6000, detention_billed=0, tax_amount=11520,
                       total_amount=139520, status="Pending", payment_status="Unpaid", tenant_id=tenant_id),
    ]
    db.add_all(invoices)
    db.flush()

    pods = [
        POD(shipment_id=shipments[0].id, pod_number="POD-1001", received_date=date(2025, 6, 3),
            received_by="Rohit Verma", condition="Good", is_delivered=True, tenant_id=tenant_id),
        POD(shipment_id=shipments[1].id, pod_number="POD-1002", received_date=date(2025, 6, 7),
            received_by="Meena Iyer", condition="Damaged", remarks="Outer packaging damaged",
            is_delivered=True, tenant_id=tenant_id),
        POD(shipment_id=shipments[2].id, pod_number="POD-1003", received_date=date(2025, 6, 5),
            received_by="Suresh Pal", condition="Good", is_delivered=True, tenant_id=tenant_id),
        POD(shipment_id=shipments[3].id, pod_number="POD-1004", received_date=date(2025, 6, 6),
            received_by="Amit Joshi", condition="Good", is_delivered=True, tenant_id=tenant_id),
        POD(shipment_id=shipments[5].id, pod_number="POD-1005", received_date=date(2025, 6, 7),
            received_by="Neha Gupta", condition="Good", is_delivered=True, tenant_id=tenant_id),
        POD(shipment_id=shipments[6].id, pod_number="", received_date=None,
            received_by="", condition="Pending", is_delivered=False, tenant_id=tenant_id),
        POD(shipment_id=shipments[7].id, pod_number="POD-1006", received_date=date(2025, 6, 11),
            received_by="Vijay Singh", condition="Good", is_delivered=True, tenant_id=tenant_id),
    ]
    db.add_all(pods)
    db.flush()

    fuel_indices = [
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 1, 1), base_price=86.50,
                  current_price=89.25, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 4, 1), base_price=86.50,
                  current_price=92.00, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Diesel", index_date=date(2025, 7, 1), base_price=86.50,
                  current_price=88.75, surcharge_formula="((Current-Base)/Base)*100*0.08", tenant_id=tenant_id),
        FuelIndex(fuel_type="Aviation Fuel", index_date=date(2025, 1, 1), base_price=105.00,
                  current_price=118.50, surcharge_formula="((Current-Base)/Base)*100*0.12", tenant_id=tenant_id),
    ]
    db.add_all(fuel_indices)
    db.flush()

    claims = [
        Claim(claim_number="CLM-2025-001", shipment_id=shipments[1].id, carrier_id=carriers[1].id,
              claim_type="Damage", claim_date=date(2025, 6, 10), claim_value=15000,
              recovered_amount=10000, pending_amount=5000, rejected_amount=0,
              status="Partial", resolution_date=date(2025, 6, 25), tenant_id=tenant_id),
        Claim(claim_number="CLM-2025-002", shipment_id=shipments[4].id, carrier_id=carriers[3].id,
              claim_type="Delay", claim_date=date(2025, 6, 15), claim_value=25000,
              recovered_amount=0, pending_amount=25000, rejected_amount=0,
              status="Open", tenant_id=tenant_id),
        Claim(claim_number="CLM-2025-003", shipment_id=shipments[6].id, carrier_id=carriers[1].id,
              claim_type="Delay", claim_date=date(2025, 6, 18), claim_value=35000,
              recovered_amount=0, pending_amount=35000, rejected_amount=0,
              status="Open", tenant_id=tenant_id),
        Claim(claim_number="CLM-2025-004", shipment_id=shipments[0].id, carrier_id=carriers[0].id,
              claim_type="Shortage", claim_date=date(2025, 6, 8), claim_value=8000,
              recovered_amount=8000, pending_amount=0, rejected_amount=0,
              status="Approved", resolution_date=date(2025, 6, 20), tenant_id=tenant_id),
        Claim(claim_number="CLM-2025-005", shipment_id=shipments[8].id, carrier_id=carriers[1].id,
              claim_type="Damage", claim_date=date(2025, 6, 20), claim_value=12000,
              recovered_amount=0, pending_amount=0, rejected_amount=12000,
              status="Rejected", resolution_date=date(2025, 6, 28), tenant_id=tenant_id),
    ]
    db.add_all(claims)
    db.flush()

    detention_charges = [
        DetentionCharge(shipment_id=shipments[1].id, carrier_id=carriers[1].id,
                        detention_type="Loading", free_hours=3, actual_hours=8,
                        chargeable_hours=5, rate_per_hour=600, total_amount=3000,
                        is_avoidable=True, reason="Late arrival of cargo at warehouse", tenant_id=tenant_id),
        DetentionCharge(shipment_id=shipments[3].id, carrier_id=carriers[0].id,
                        detention_type="Unloading", free_hours=4, actual_hours=7,
                        chargeable_hours=3, rate_per_hour=500, total_amount=1500,
                        is_avoidable=False, reason="Warehouse congestion", tenant_id=tenant_id),
        DetentionCharge(shipment_id=shipments[4].id, carrier_id=carriers[3].id,
                        detention_type="Transit", free_hours=12, actual_hours=16,
                        chargeable_hours=4, rate_per_hour=400, total_amount=1600,
                        is_avoidable=True, reason="Documentation delay", tenant_id=tenant_id),
        DetentionCharge(shipment_id=shipments[6].id, carrier_id=carriers[1].id,
                        detention_type="Loading", free_hours=3, actual_hours=10,
                        chargeable_hours=7, rate_per_hour=600, total_amount=4200,
                        is_avoidable=True, reason="Awaiting customs clearance", tenant_id=tenant_id),
    ]
    db.add_all(detention_charges)
    db.flush()

    kpis = [
        DashboardKPI(kpi_name="Total Shipments", kpi_value=10, kpi_category="Volume",
                     period="MTD", period_start=date(2025, 6, 1), period_end=date(2025, 6, 30), tenant_id=tenant_id),
        DashboardKPI(kpi_name="On-Time Delivery %", kpi_value=70, kpi_category="Service",
                     period="MTD", period_start=date(2025, 6, 1), period_end=date(2025, 6, 30), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Avg Freight Cost", kpi_value=78200, kpi_category="Cost",
                     period="MTD", period_start=date(2025, 6, 1), period_end=date(2025, 6, 30), tenant_id=tenant_id),
        DashboardKPI(kpi_name="Open Claims", kpi_value=2, kpi_category="Risk",
                     period="MTD", period_start=date(2025, 6, 1), period_end=date(2025, 6, 30), tenant_id=tenant_id),
    ]
    db.add_all(kpis)
    db.flush()

    findings = [
        Finding(finding_number="FND-2025-001", title="Freight Overbilling Detected",
                category="Rate Compliance", severity="High",
                description="Multiple shipments show billed rates exceeding contract rates by over 15%. "
                            "SHP-001 and SHP-009 show overbilling of 20% and 18% respectively.",
                impact="Estimated financial impact of ₹45,000 across 5 shipments.",
                recommendation="Implement automated rate validation at invoice booking stage. "
                               "Recover overbilled amounts from carriers.",
                status="Open", source_reference="Analytics: Rate Compliance", financial_impact=45000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-002", title="Excessive Detention Charges",
                category="Operational Efficiency", severity="Medium",
                description="Avoidable detention charges of ₹8,800 identified. Primary causes: "
                            "late cargo readiness and customs clearance delays.",
                impact="₹8,800 in avoidable detention charges during June 2025.",
                recommendation="Coordinate with warehouse team for timely cargo readiness. "
                               "Pre-clear documentation for customs shipments.",
                status="Open", source_reference="Analytics: Detention Analysis", financial_impact=8800, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-003", title="Route Inflation on Mumbai-Chennai Route",
                category="Route Compliance", severity="Medium",
                description="SHP-009 shows actual distance of 1380 km vs expected 1300 km. "
                            "6.15% variance suggests potential route inflation.",
                impact="Additional freight cost of approximately ₹2,400 due to inflated distance.",
                recommendation="Install GPS tracking on all vehicles. Set geo-fence alerts for route deviations.",
                status="Open", source_reference="Analytics: Route Distance", financial_impact=2400, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-004", title="Duplicate Invoice Detection - Cargo Express",
                category="Duplicate Billing", severity="High",
                description="Carrier Cargo Express submitted two invoices (INV-2025-009, INV-2025-002) "
                            "with similar amounts for different shipments. Manual review needed.",
                impact="Potential duplicate billing of ₹95,000 under review.",
                recommendation="Strengthen 3-way match (PO/Invoice/POD) before payment processing.",
                status="Open", source_reference="Analytics: Duplicate Billing", financial_impact=95000, tenant_id=tenant_id),
        Finding(finding_number="FND-2025-005", title="SLA Breach - SeaLine Shipping",
                category="Service Level", severity="Medium",
                description="SeaLine Shipping (SHP-005) delivered 2 days late - 20% delay over SLA. "
                            "Transit time of 6 days vs standard 4 days.",
                impact="Production delay at Chennai plant. Estimated impact of ₹25,000.",
                recommendation="Enforce SLA penalty clauses in contract. Escalate to carrier management.",
                status="Open", source_reference="Analytics: Transit SLA", financial_impact=25000, tenant_id=tenant_id),
    ]
    db.add_all(findings)
    db.flush()

    actions = [
        ActionTracker(action_number="ACT-2025-001", finding_id=findings[0].id,
                      title="Implement automated rate validation system",
                      assigned_to="IT Team", target_date=date(2025, 8, 31),
                      status="Open", priority="High",
                      notes="Coordinate with ERP team to configure rate validation rules.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-002", finding_id=findings[0].id,
                      title="Recover overbilled amounts from carriers",
                      assigned_to="Finance Team", target_date=date(2025, 7, 31),
                      status="Open", priority="High",
                      notes="Send debit notes to Speed Logistics and Cargo Express.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-003", finding_id=findings[1].id,
                      title="Coordinate with warehouse for cargo readiness",
                      assigned_to="Operations Team", target_date=date(2025, 7, 15),
                      status="Open", priority="Medium", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-004", finding_id=findings[2].id,
                      title="Install GPS tracking on all fleet vehicles",
                      assigned_to="Fleet Manager", target_date=date(2025, 9, 30),
                      status="Open", priority="Low",
                      notes="Budget approval pending from management.", tenant_id=tenant_id),
        ActionTracker(action_number="ACT-2025-005", finding_id=findings[3].id,
                      title="Investigate duplicate invoices from Cargo Express",
                      assigned_to="Audit Team", target_date=date(2025, 7, 10),
                      status="In Progress", priority="High",
                      notes="Reviewing all invoices from Cargo Express for June 2025.", tenant_id=tenant_id),
    ]
    db.add_all(actions)
    db.commit()
