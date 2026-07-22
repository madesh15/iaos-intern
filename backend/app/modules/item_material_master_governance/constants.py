"""Constants and enumerations for the Item Material Master Governance module."""

from enum import StrEnum


class ExceptionType(StrEnum):
    DUPLICATE = "duplicate"
    HSN = "hsn"
    VALUATION = "valuation"
    UOM = "uom"
    OBSOLETE = "obsolete"
    COMPLETENESS = "completeness"
    COST = "cost"
    REORDER = "reorder"
    BOM = "bom"
    BATCH = "batch"
    CATEGORY = "category"
    WORKFLOW = "workflow"
    CROSS_PLANT = "cross_plant"
    NAMING = "naming"
    DEAD_STOCK = "dead_stock"


class Severity(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class FindingStatus(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class ExceptionStatus(StrEnum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class RemediationStatus(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class AuditChangeType(StrEnum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


ITEM_NAMING_PATTERNS: dict[str, str] = {
    "RM": r"^RM-\d{6}$",
    "FG": r"^FG-\d{6}$",
    "PK": r"^PK-\d{6}$",
    "SFG": r"^SFG-\d{6}$",
    "TR": r"^TR-\d{6}$",
    "WR": r"^WR-\d{6}$",
    "CON": r"^CON-\d{6}$",
}

DEFAULT_DEAD_STOCK_DAYS: int = 180

VALID_GST_RATES: set[float] = {0.0, 5.0, 12.0, 18.0, 28.0}

REQUIRED_MASTER_FIELDS: list[str] = [
    "weight",
    "mrp",
    "specification",
    "category",
    "tax_code",
    "valuation_class",
    "uom",
]

CATEGORY_HIERARCHY_LEVELS: list[str] = [
    "item_category",
    "item_subcategory",
    "material_group",
]
