"""Module entry point — MANIFEST + router aggregation.

The auto-loader imports `router` and `MANIFEST` from this file. Routes are
defined in `api.py` and included here.
"""

from .api import api_router
from fastapi import APIRouter

MANIFEST = {
    "name": "item_material_master_governance",
    "title": "Item Material Master Governance",
    "description": "Audit & governance for item master data — duplicates, HSN, valuation, UOM, BOM, naming, dead stock, and more.",
    "icon": "clipboard-check",
    "group": "Supply Chain & Operations",
    "industry": "",
    "version": "1.0.0",
    "owner": "governance-team",
}

router = APIRouter()
router.include_router(api_router)
