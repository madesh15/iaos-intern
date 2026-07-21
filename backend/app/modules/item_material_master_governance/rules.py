"""Audit rule implementations for Item Material Master Governance.

Each rule is a stateless function that takes a list of items (or other inputs)
and returns a list of finding dictionaries. The service layer orchestrates
these rules and persists results.
"""

import logging
import re
from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Any, Sequence

from .constants import (
    DEFAULT_DEAD_STOCK_DAYS,
    ITEM_NAMING_PATTERNS,
    REQUIRED_MASTER_FIELDS,
    VALID_GST_RATES,
    CATEGORY_HIERARCHY_LEVELS,
    Severity,
)
from .models import ItemMaterialMasterGovernanceItem as ItemModel

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. Duplicate Item Detection ─────────────────────────────────────────────

def check_duplicates(
    items: Sequence[ItemModel],
) -> list[dict[str, Any]]:
    """Detect duplicate items — exact code match and similar-name heuristic."""
    results: list[dict[str, Any]] = []
    seen_by_name: dict[str, list[ItemModel]] = {}

    for item in items:
        key = item.item_name.strip().lower()
        seen_by_name.setdefault(key, []).append(item)

    # Exact name duplicates
    for name, group in seen_by_name.items():
        if len(group) > 1:
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    if group[i].item_code != group[j].item_code:
                        results.append({
                            "item_id_1": group[i].id,
                            "item_code_1": group[i].item_code,
                            "item_name_1": group[i].item_name,
                            "item_id_2": group[j].id,
                            "item_code_2": group[j].item_code,
                            "item_name_2": group[j].item_name,
                            "confidence": 100.0,
                            "reason": f"Exact name match: '{group[i].item_name}'",
                        })

    # Similar name heuristic (fuzzy)
    items_list = list(items)
    for i in range(len(items_list)):
        for j in range(i + 1, len(items_list)):
            if items_list[i].item_code == items_list[j].item_code:
                continue
            ratio = SequenceMatcher(
                None,
                items_list[i].item_name.lower(),
                items_list[j].item_name.lower(),
            ).ratio()
            if 0.75 <= ratio < 1.0:
                already = any(
                    r["item_id_1"] == items_list[j].id
                    and r["item_id_2"] == items_list[i].id
                    for r in results
                )
                if not already:
                    results.append({
                        "item_id_1": items_list[i].id,
                        "item_code_1": items_list[i].item_code,
                        "item_name_1": items_list[i].item_name,
                        "item_id_2": items_list[j].id,
                        "item_code_2": items_list[j].item_code,
                        "item_name_2": items_list[j].item_name,
                        "confidence": round(ratio * 100, 2),
                        "reason": (
                            f"Similar name ({ratio:.0%}): "
                            f"'{items_list[i].item_name}' vs '{items_list[j].item_name}'"
                        ),
                    })

    return results


# ── 2. HSN / Tax Code Mapping ───────────────────────────────────────────────

def check_hsn_tax(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate HSN codes, GST rates, and tax codes."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.hsn_code or not item.hsn_code.strip():
            issues.append("Missing HSN code")

        if item.gst_rate is None:
            issues.append("Missing GST rate")
        elif item.gst_rate not in VALID_GST_RATES:
            issues.append(
                f"Invalid GST rate {item.gst_rate}; "
                f"valid rates: {sorted(VALID_GST_RATES)}"
            )

        if not item.tax_code or not item.tax_code.strip():
            issues.append("Missing tax code")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "hsn_code": item.hsn_code,
                "gst_rate": item.gst_rate,
                "tax_code": item.tax_code,
                "issue": "; ".join(issues),
                "severity": Severity.HIGH,
            })

    return results


# ── 3. Valuation Class Integrity ────────────────────────────────────────────

def check_valuation(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Check valuation class and GL mapping completeness."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.valuation_class or not item.valuation_class.strip():
            issues.append("Missing valuation class")

        if not item.gl_mapping or not item.gl_mapping.strip():
            issues.append("Missing GL mapping")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "valuation_class": item.valuation_class,
                "gl_mapping": item.gl_mapping,
                "issue": "; ".join(issues),
                "severity": Severity.HIGH,
            })

    return results


# ── 4. UOM Consistency ──────────────────────────────────────────────────────

def check_uom(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate UOM fields and conversion factors."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.purchase_uom or not item.purchase_uom.strip():
            issues.append("Missing purchase UOM")

        if not item.sales_uom or not item.sales_uom.strip():
            issues.append("Missing sales UOM")

        if not item.inventory_uom or not item.inventory_uom.strip():
            issues.append("Missing inventory UOM")

        if (
            item.purchase_uom
            and item.sales_uom
            and item.purchase_uom != item.sales_uom
            and (item.uom_conversion_factor is None or item.uom_conversion_factor <= 0)
        ):
            issues.append(
                f"Purchase UOM '{item.purchase_uom}' differs from sales UOM "
                f"'{item.sales_uom}' but conversion factor is missing or invalid"
            )

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "purchase_uom": item.purchase_uom,
                "sales_uom": item.sales_uom,
                "inventory_uom": item.inventory_uom,
                "uom_conversion_factor": item.uom_conversion_factor,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 5. Obsolete / Blocked Items ─────────────────────────────────────────────

def check_obsolete(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Flag items that are blocked, deleted, inactive, or discontinued."""
    results: list[dict[str, Any]] = []

    for item in items:
        flags: list[str] = []

        if item.is_blocked:
            flags.append("Blocked")
        if item.is_deleted:
            flags.append("Deleted")
        if not item.is_active:
            flags.append("Inactive")
        if item.is_discontinued:
            flags.append("Discontinued")

        if flags:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "is_blocked": item.is_blocked,
                "is_deleted": item.is_deleted,
                "is_active": item.is_active,
                "is_discontinued": item.is_discontinued,
                "issue": f"Item status flags: {', '.join(flags)}",
                "severity": Severity.HIGH,
            })

    return results


# ── 6. Master Completeness ──────────────────────────────────────────────────

def check_master_completeness(
    items: Sequence[ItemModel],
) -> list[dict[str, Any]]:
    """Detect missing required master data fields."""
    results: list[dict[str, Any]] = []

    field_map: dict[str, str] = {
        "weight": "weight",
        "mrp": "mrp",
        "specification": "specification",
        "category": "item_category",
        "tax_code": "tax_code",
        "valuation_class": "valuation_class",
        "uom": "purchase_uom",
    }

    for item in items:
        missing: list[str] = []

        for display_name, attr_name in field_map.items():
            value = getattr(item, attr_name, None)
            if value is None or (isinstance(value, str) and not value.strip()):
                missing.append(display_name)

        if missing:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "missing_fields": missing,
                "issue": f"Missing fields: {', '.join(missing)}",
                "severity": Severity.MEDIUM,
            })

    return results


# ── 7. Price / Cost Master Changes ──────────────────────────────────────────
# (This check relies on audit history, not direct item fields — handled in service)

# ── 8. Reorder Level Governance ─────────────────────────────────────────────

def check_reorder(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate reorder level, maximum stock, and minimum stock."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if item.reorder_level is None:
            issues.append("Missing reorder level")
        if item.max_stock is None:
            issues.append("Missing maximum stock level")
        if item.min_stock is None:
            issues.append("Missing minimum stock level")

        if item.reorder_level is not None and item.min_stock is not None:
            if item.reorder_level <= item.min_stock:
                issues.append(
                    f"Reorder level ({item.reorder_level}) should be "
                    f"greater than minimum stock ({item.min_stock})"
                )

        if item.reorder_level is not None and item.max_stock is not None:
            if item.reorder_level >= item.max_stock:
                issues.append(
                    f"Reorder level ({item.reorder_level}) should be "
                    f"less than maximum stock ({item.max_stock})"
                )

        if item.min_stock is not None and item.max_stock is not None:
            if item.min_stock >= item.max_stock:
                issues.append(
                    f"Minimum stock ({item.min_stock}) should be "
                    f"less than maximum stock ({item.max_stock})"
                )

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "reorder_level": item.reorder_level,
                "max_stock": item.max_stock,
                "min_stock": item.min_stock,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 9. BOM Linkage Integrity ────────────────────────────────────────────────

def check_bom(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Verify BOM linkages: parent/child references and active flags."""
    results: list[dict[str, Any]] = []
    item_ids = {i.id for i in items}

    for item in items:
        issues: list[str] = []

        if item.parent_material_id is not None:
            if item.parent_material_id not in item_ids:
                issues.append(
                    f"Parent material id {item.parent_material_id} not found"
                )

            if not item.bom_active:
                issues.append("Parent material linked but BOM is not active")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "parent_material_id": item.parent_material_id,
                "bom_active": item.bom_active,
                "issue": "; ".join(issues),
                "severity": Severity.HIGH,
            })

    return results


# ── 10. Batch / Serial Control Flags ────────────────────────────────────────

def check_batch_serial(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate batch management and serial number tracking configurations."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if item.batch_managed and not item.serial_tracked:
            issues.append("Batch managed but serial tracking not configured")

        if item.serial_tracked and not item.batch_managed:
            issues.append("Serial tracked but batch management not configured")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "batch_managed": item.batch_managed,
                "serial_tracked": item.serial_tracked,
                "issue": "; ".join(issues),
                "severity": Severity.LOW,
            })

    return results


# ── 11. Item Categorisation ─────────────────────────────────────────────────

def check_category_hierarchy(
    items: Sequence[ItemModel],
) -> list[dict[str, Any]]:
    """Validate category hierarchy: category → subcategory → material group."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.item_category or not item.item_category.strip():
            issues.append("Missing item category")

        if not item.item_subcategory or not item.item_subcategory.strip():
            issues.append("Missing item subcategory")

        if not item.material_group or not item.material_group.strip():
            issues.append("Missing material group")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "item_category": item.item_category,
                "item_subcategory": item.item_subcategory,
                "material_group": item.material_group,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 12. Approval Workflow Audit ─────────────────────────────────────────────

def check_workflow(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate maker/checker workflow completeness."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.maker or not item.maker.strip():
            issues.append("Missing maker information")

        if not item.checker or not item.checker.strip():
            issues.append("Missing checker information")

        if item.maker and item.checker and item.maker == item.checker:
            issues.append("Maker and checker cannot be the same person")

        if not item.approval_date:
            issues.append("Missing approval date")

        if not item.approved_by or not item.approved_by.strip():
            issues.append("Missing approved-by information")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "maker": item.maker,
                "checker": item.checker,
                "approval_date": item.approval_date,
                "approved_by": item.approved_by,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 13. Cross Plant Extension ───────────────────────────────────────────────

def check_cross_plant(items: Sequence[ItemModel]) -> list[dict[str, Any]]:
    """Validate plant, storage location, and warehouse assignments."""
    results: list[dict[str, Any]] = []

    for item in items:
        issues: list[str] = []

        if not item.plant or not item.plant.strip():
            issues.append("Missing plant assignment")

        if not item.storage_location or not item.storage_location.strip():
            issues.append("Missing storage location")

        if not item.warehouse or not item.warehouse.strip():
            issues.append("Missing warehouse mapping")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "plant": item.plant,
                "storage_location": item.storage_location,
                "warehouse": item.warehouse,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 14. Naming Convention ───────────────────────────────────────────────────

def check_naming_convention(
    items: Sequence[ItemModel],
) -> list[dict[str, Any]]:
    """Validate item codes against expected naming patterns (RM-, FG-, PK-)."""
    results: list[dict[str, Any]] = []

    for item in items:
        prefix = item.naming_prefix
        pattern = ITEM_NAMING_PATTERNS.get(prefix) if prefix else None

        issues: list[str] = []

        if not prefix:
            issues.append("Missing naming prefix")
        elif pattern and not re.match(pattern, item.item_code):
            issues.append(
                f"Item code '{item.item_code}' does not match expected "
                f"pattern '{pattern}' for prefix '{prefix}'"
            )
        elif prefix and not pattern:
            issues.append(f"Unknown naming prefix '{prefix}'")

        if issues:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "naming_prefix": prefix,
                "expected_pattern": pattern,
                "issue": "; ".join(issues),
                "severity": Severity.MEDIUM,
            })

    return results


# ── 15. Dead Stock ──────────────────────────────────────────────────────────

def check_dead_stock(
    items: Sequence[ItemModel],
    threshold_days: int = DEFAULT_DEAD_STOCK_DAYS,
) -> list[dict[str, Any]]:
    """Identify items with no inventory movement for threshold days."""
    results: list[dict[str, Any]] = []
    now = _now()

    for item in items:
        if item.last_movement_date is None:
            results.append({
                "item_id": item.id,
                "item_code": item.item_code,
                "item_name": item.item_name,
                "last_movement_date": None,
                "days_since_movement": None,
                "threshold_days": threshold_days,
                "issue": "No last movement date recorded",
                "severity": Severity.MEDIUM,
            })
        else:
            delta = (now - item.last_movement_date).days
            if delta >= threshold_days:
                results.append({
                    "item_id": item.id,
                    "item_code": item.item_code,
                    "item_name": item.item_name,
                    "last_movement_date": item.last_movement_date,
                    "days_since_movement": delta,
                    "threshold_days": threshold_days,
                    "issue": (
                        f"No movement for {delta} days "
                        f"(threshold: {threshold_days} days)"
                    ),
                    "severity": Severity.MEDIUM,
                })

    return results
