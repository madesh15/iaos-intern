"""Seed data for Item Material Master Governance.

Run once to populate realistic item master records with deliberate exceptions
for testing audit rules and the dashboard.
"""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from . import crud
from . import repository as repo
from . import rules as rule_engine
from .constants import ExceptionType, Severity
from .models import (
    ItemMaterialMasterGovernanceItem as ItemModel,
    ItemMaterialMasterGovernanceException as ExceptionModel,
    ItemMaterialMasterGovernanceFinding as FindingModel,
    ItemMaterialMasterGovernanceRemediation as RemediationModel,
    ItemMaterialMasterGovernanceRule as RuleModel,
)

logger = logging.getLogger(__name__)

TENANT_ID = 1
USER_ID = 1

SEED_ITEMS = [
    # (code, name, category, subcat, group, hsn, gst, tax, val_class, gl, p_uom, s_uom, i_uom, conv,
    #  weight, mrp, spec, cost, reorder, max, min, blocked, deleted, active, discontinued,
    #  batch, serial, parent, bom, prefix, plant, storage, wh, maker, checker, approval_date, approved_by, last_movement)
    
    # RM (Raw Materials)
    {"item_code": "RM-000001", "item_name": "High-Grade Steel Coil", "item_category": "Raw Material", "item_subcategory": "Metal", "material_group": "Steel",
     "hsn_code": "7208", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": "3000", "gl_mapping": "140001",
     "purchase_uom": "KG", "sales_uom": "KG", "inventory_uom": "KG", "uom_conversion_factor": 1.0,
     "weight": 500.0, "mrp": 150.0, "specification": "IS 2062 Grade A", "standard_cost": 120.0,
     "reorder_level": 1000.0, "max_stock": 10000.0, "min_stock": 500.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": False, "naming_prefix": "RM",
     "plant": "Plant-A", "storage_location": "SL-01", "warehouse": "WH-Main",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2025, 1, 15, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2026, 6, 1, 8, 0, 0)},

    {"item_code": "RM-000002", "item_name": "Aluminum Ingot", "item_category": "Raw Material", "item_subcategory": "Metal", "material_group": "Aluminum",
     "hsn_code": "7601", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": "3000", "gl_mapping": "140002",
     "purchase_uom": "KG", "sales_uom": "KG", "inventory_uom": "KG", "uom_conversion_factor": 1.0,
     "weight": 200.0, "mrp": 250.0, "specification": "AL 99.7%", "standard_cost": 200.0,
     "reorder_level": 500.0, "max_stock": 5000.0, "min_stock": 200.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": False, "naming_prefix": "RM",
     "plant": "Plant-A", "storage_location": "SL-02", "warehouse": "WH-Main",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2025, 2, 10, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2026, 5, 15, 8, 0, 0)},

    # FG (Finished Goods)
    {"item_code": "FG-000001", "item_name": "Automotive Component A", "item_category": "Finished Good", "item_subcategory": "Auto Parts", "material_group": "Engine Parts",
     "hsn_code": "8708", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": "7900", "gl_mapping": "150001",
     "purchase_uom": "NOS", "sales_uom": "NOS", "inventory_uom": "NOS", "uom_conversion_factor": 1.0,
     "weight": 5.0, "mrp": 1500.0, "specification": "ISO 9001:2015", "standard_cost": 1100.0,
     "reorder_level": 200.0, "max_stock": 2000.0, "min_stock": 100.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": True, "parent_material_id": 1, "bom_active": True, "naming_prefix": "FG",
     "plant": "Plant-A", "storage_location": "SL-10", "warehouse": "WH-FG",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2025, 3, 1, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2026, 7, 10, 8, 0, 0)},

    # Items with deliberate exceptions
    {"item_code": "RM-000003", "item_name": "High-Grade Steel Coil",  # Duplicate name of RM-000001
     "item_category": "Raw Material", "item_subcategory": "Metal", "material_group": "Steel",
     "hsn_code": "7208", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": "3000", "gl_mapping": "140001",
     "purchase_uom": "KG", "sales_uom": "KG", "inventory_uom": "KG", "uom_conversion_factor": 1.0,
     "weight": 500.0, "mrp": 155.0, "specification": "IS 2062 Grade A", "standard_cost": 125.0,
     "reorder_level": 1000.0, "max_stock": 10000.0, "min_stock": 500.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": False, "naming_prefix": "RM",
     "plant": "Plant-A", "storage_location": "SL-01", "warehouse": "WH-Main",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2025, 1, 20, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2026, 6, 15, 8, 0, 0)},

    {"item_code": "RM-000004", "item_name": "Copper Wiring",  # Missing HSN
     "item_category": "Raw Material", "item_subcategory": "Electrical", "material_group": "Copper",
     "hsn_code": None, "gst_rate": None, "tax_code": None, "valuation_class": "3000", "gl_mapping": "140003",
     "purchase_uom": "MTR", "sales_uom": "MTR", "inventory_uom": "MTR", "uom_conversion_factor": 1.0,
     "weight": 50.0, "mrp": 500.0, "specification": "IS 694", "standard_cost": 400.0,
     "reorder_level": 300.0, "max_stock": 3000.0, "min_stock": 100.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": False, "naming_prefix": "RM",
     "plant": "Plant-B", "storage_location": "SL-05", "warehouse": "WH-Main",
     "maker": "John Smith", "checker": None, "approval_date": None, "approved_by": None,
     "last_movement_date": datetime(2026, 7, 5, 8, 0, 0)},

    {"item_code": "FG-000002", "item_name": "Blocked Assembly Unit",
     "item_category": "Finished Good", "item_subcategory": "Assembly", "material_group": "Mechanical",
     "hsn_code": "8479", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": "7900", "gl_mapping": "150002",
     "purchase_uom": "NOS", "sales_uom": "NOS", "inventory_uom": "NOS", "uom_conversion_factor": 1.0,
     "weight": 25.0, "mrp": 8000.0, "specification": "ASME B31.3", "standard_cost": 6500.0,
     "reorder_level": 50.0, "max_stock": 500.0, "min_stock": 10.0,
     "is_blocked": True, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": True, "bom_active": True, "naming_prefix": "FG",
     "plant": "Plant-A", "storage_location": "SL-11", "warehouse": "WH-FG",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2024, 6, 1, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2025, 1, 1, 8, 0, 0)},

    {"item_code": "FG-000003", "item_name": "Discontinued Product X",  # Discontinued + dead stock
     "item_category": "Finished Good", "item_subcategory": "Legacy", "material_group": "Phased Out",
     "hsn_code": "8471", "gst_rate": 12.0, "tax_code": "GST12", "valuation_class": "7900", "gl_mapping": "150003",
     "purchase_uom": "NOS", "sales_uom": "NOS", "inventory_uom": "NOS", "uom_conversion_factor": 1.0,
     "weight": 10.0, "mrp": 12000.0, "specification": None, "standard_cost": 9500.0,
     "reorder_level": 0.0, "max_stock": 100.0, "min_stock": 0.0,
     "is_blocked": False, "is_deleted": False, "is_active": False, "is_discontinued": True,
     "batch_managed": True, "serial_tracked": True, "bom_active": False, "naming_prefix": "FG",
     "plant": "Plant-B", "storage_location": "SL-12", "warehouse": "WH-FG",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2023, 1, 15, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2023, 6, 1, 8, 0, 0)},

    {"item_code": "PK-000001", "item_name": "Corrugated Box Large",  # Bad naming (missing prefix 'PK'?)
     "item_category": "Packaging", "item_subcategory": "Corrugated", "material_group": "Boxes",
     "hsn_code": "4819", "gst_rate": 12.0, "tax_code": "GST12", "valuation_class": "5000", "gl_mapping": "160001",
     "purchase_uom": "NOS", "sales_uom": "NOS", "inventory_uom": "NOS", "uom_conversion_factor": 1.0,
     "weight": 0.5, "mrp": 45.0, "specification": "3-ply corrugated", "standard_cost": 35.0,
     "reorder_level": 1000.0, "max_stock": 50000.0, "min_stock": 500.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": False, "serial_tracked": False, "naming_prefix": "PK",
     "plant": "Plant-A", "storage_location": "SL-20", "warehouse": "WH-PK",
     "maker": "John Smith", "checker": "Jane Doe", "approval_date": datetime(2025, 5, 1, 10, 0, 0), "approved_by": "Jane Doe",
     "last_movement_date": datetime(2026, 7, 18, 8, 0, 0)},

    {"item_code": "FG-000004", "item_name": "Sub-Assembly Y",  # No valuation class
     "item_category": "Finished Good", "item_subcategory": "Assembly", "material_group": "Mechanical",
     "hsn_code": "8483", "gst_rate": 18.0, "tax_code": "GST18", "valuation_class": None, "gl_mapping": None,
     "purchase_uom": "NOS", "sales_uom": "NOS", "inventory_uom": "NOS", "uom_conversion_factor": 1.0,
     "weight": 3.0, "mrp": 2500.0, "specification": "IS 12345", "standard_cost": 1800.0,
     "reorder_level": 100.0, "max_stock": 1000.0, "min_stock": 50.0,
     "is_blocked": False, "is_deleted": False, "is_active": True, "is_discontinued": False,
     "batch_managed": True, "serial_tracked": True, "bom_active": False, "naming_prefix": "FG",
     "plant": None, "storage_location": None, "warehouse": None,
     "maker": None, "checker": None, "approval_date": None, "approved_by": None,
     "last_movement_date": None},
]


def seed_items(db: Session) -> None:
    """Insert seed item master records if table is empty."""
    existing = crud.count_items(db, TENANT_ID)
    if existing > 0:
        logger.info("Seed skipped — %d items already exist", existing)
        return

    logger.info("Seeding %d item master records...", len(SEED_ITEMS))
    for data in SEED_ITEMS:
        crud.create_item(db, TENANT_ID, USER_ID, data)

    # Run all rules to generate exceptions and findings
    items = crud.get_all_items(db, TENANT_ID)

    rule_checks = [
        ("duplicate", rule_engine.check_duplicates),
        ("hsn", rule_engine.check_hsn_tax),
        ("valuation", rule_engine.check_valuation),
        ("uom", rule_engine.check_uom),
        ("obsolete", rule_engine.check_obsolete),
        ("completeness", rule_engine.check_master_completeness),
        ("reorder", rule_engine.check_reorder),
        ("bom", rule_engine.check_bom),
        ("batch", rule_engine.check_batch_serial),
        ("category", rule_engine.check_category_hierarchy),
        ("workflow", rule_engine.check_workflow),
        ("cross_plant", rule_engine.check_cross_plant),
        ("naming", rule_engine.check_naming_convention),
        ("dead_stock", rule_engine.check_dead_stock),
    ]

    for exc_type, check_fn in rule_checks:
        try:
            results = check_fn(items)
            for r in results:
                repo.create_exception(db, TENANT_ID, USER_ID, {
                    "item_id": r.get("item_id") or r.get("item_id_1", 1),
                    "exception_type": exc_type,
                    "severity": r.get("severity", "medium"),
                    "description": r["issue"],
                })
                repo.create_finding(db, TENANT_ID, USER_ID, {
                    "item_id": r.get("item_id") or r.get("item_id_1", 1),
                    "finding_type": exc_type,
                    "severity": r.get("severity", "medium"),
                    "description": r["issue"],
                })
        except Exception as e:
            logger.warning("Rule '%s' failed during seed: %s", exc_type, e)

    # Seed remediation entries
    findings = repo.list_findings(db, TENANT_ID, limit=5)
    for f in findings:
        repo.create_remediation(db, TENANT_ID, USER_ID, {
            "finding_id": f.id,
            "action": f"Auto-generated remediation for finding #{f.id}",
            "status": "pending",
        })

    # Seed rule library
    from .models import ItemMaterialMasterGovernanceRule as RuleModel
    rule_types = ["duplicate", "hsn", "valuation", "uom", "obsolete", "completeness",
                  "reorder", "bom", "batch", "category", "workflow", "cross_plant", "naming", "dead_stock"]
    for rt in rule_types:
        rule = RuleModel(
            tenant_id=TENANT_ID,
            created_by=USER_ID,
            updated_by=USER_ID,
            rule_name=f"{rt.replace('_', ' ').title()} Check",
            rule_type=rt,
            is_enabled=True,
            parameters={"threshold_days": 180} if rt == "dead_stock" else {},
            severity="critical" if rt in ("duplicate", "hsn", "valuation") else "medium",
            description=f"Automated governance rule for {rt.replace('_', ' ')}",
        )
        db.add(rule)
    db.commit()

    logger.info("Seed complete — items, exceptions, findings, remediation, and rules created.")


def seed_all(db: Session) -> None:
    """Run all seed data generators."""
    seed_items(db)
