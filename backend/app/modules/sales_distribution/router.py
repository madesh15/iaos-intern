"""Module 43: Sales & Distribution — Core Assurance & Operations Audit.

Provides assurance over the sales and distribution network, scheme leakage,
primary-vs-secondary sales reconciliation, distributor claims, and pricing integrity.
"""
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import SalesDistributionItem
from .schemas import ItemCreate, ItemOut, SalesDistributionKpis, SubPageDataResponse

MANIFEST = {
    "name": "sales_distribution",
    "title": "Sales & Distribution",
    "description": "Assurance over sales & distribution network, scheme leakage, primary-vs-secondary sales, claims, and pricing integrity.",
    "icon": "trending-up",
    "group": "Supply Chain & Operations",
    "industry": "Manufacturing, FMCG, Retail",
    "version": "1.0.0",
    "owner": "Operations Audit Team",
}

router = APIRouter()


@router.get("/kpis", response_model=SalesDistributionKpis)
def get_kpis(current_user: CurrentUser, db: DbSession):
    """Return top-level executive KPIs for Sales & Distribution module."""
    return SalesDistributionKpis(
        total_sales_audited=1485000000.0,
        scheme_leakage_identified=24500000.0,
        primary_secondary_mismatch_val=18200000.0,
        high_risk_red_flags=14,
        open_remediation_actions=8,
        active_distributors=482,
        claim_leakage_recovery_rate=87.5,
        audit_coverage_pct=94.2,
    )


@router.get("/items", response_model=list[ItemOut])
def list_items(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(SalesDistributionItem), current_user)
    return [ItemOut.model_validate(i) for i in q.order_by(SalesDistributionItem.id.desc()).all()]


@router.post("/items", response_model=ItemOut, status_code=201)
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    item = SalesDistributionItem(title=body.title, notes=body.notes, tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemOut.model_validate(item)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(SalesDistributionItem).filter(SalesDistributionItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()


@router.get("/subpages/{page_key}", response_model=SubPageDataResponse)
def get_subpage_data(page_key: str, current_user: CurrentUser, db: DbSession):
    """Returns domain-rich dataset and metrics for any of the 25 subpages in Module 43."""
    data_generators: Dict[str, Any] = {
        "scheme-leakage": {
            "title": "Scheme & Discount Leakage",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"total_leakage": "₹24.5M", "flagged_claims": 142, "unauthorized_discounts": "₹8.2M"},
            "items": [
                {"id": 1, "scheme_code": "SCH-2026-Q1", "scheme_name": "Volume Booster Q1", "distributor": "Apex Trading Corp", "claimed": 450000, "eligible": 320000, "leakage": 130000, "status": "Flagged"},
                {"id": 2, "scheme_code": "SCH-SUMMER-02", "scheme_name": "Summer Refresh Scheme", "distributor": "Metro Retailers", "claimed": 280000, "eligible": 210000, "leakage": 70000, "status": "Under Review"},
                {"id": 3, "scheme_code": "SCH-DEALER-09", "scheme_name": "Dealer Loyalty Slab", "distributor": "Sunrise Agencies", "claimed": 600000, "eligible": 450000, "leakage": 150000, "status": "Recovered"},
            ]
        },
        "primary-vs-secondary": {
            "title": "Primary vs Secondary Sales Reconciliation",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"primary_sales": "₹1.48B", "secondary_sales": "₹1.29B", "unexplained_gap": "₹18.2M"},
            "items": [
                {"id": 1, "distributor": "Apex Trading Corp", "primary_qty": 50000, "secondary_qty": 38000, "stock_in_hand": 8000, "variance_qty": -4000, "variance_val": 4800000, "risk": "High"},
                {"id": 2, "distributor": "Metro Retailers", "primary_qty": 32000, "secondary_qty": 31000, "stock_in_hand": 1500, "variance_qty": -500, "variance_val": 600000, "risk": "Medium"},
                {"id": 3, "distributor": "Sunrise Agencies", "primary_qty": 75000, "secondary_qty": 62000, "stock_in_hand": 5000, "variance_qty": -8000, "variance_val": 9600000, "risk": "High"},
            ]
        },
        "distributor-claims": {
            "title": "Distributor Claim Validation",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"claims_processed": 340, "total_claimed": "₹42.8M", "leakage_rejected": "₹5.4M"},
            "items": [
                {"id": 1, "claim_no": "CLM-8842", "distributor": "Apex Trading", "type": "Damage Reimbursement", "claimed": 180000, "approved": 120000, "leakage": 60000, "status": "Rejected Gap"},
                {"id": 2, "claim_no": "CLM-8843", "distributor": "National Supply", "type": "Freight Subsidy", "claimed": 95000, "approved": 95000, "leakage": 0, "status": "Verified"},
                {"id": 3, "claim_no": "CLM-8844", "distributor": "Vanguard Logistics", "type": "Rate Difference", "claimed": 310000, "approved": 240000, "leakage": 70000, "status": "Pending Audit"},
            ]
        },
        "price-realisation": {
            "title": "Price Realisation Analysis",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"avg_realisation": "92.4%", "margin_leakage": "₹12.6M", "skus_below_target": 18},
            "items": [
                {"id": 1, "sku_code": "SKU-FMCG-01", "name": "Premium Detergent 1kg", "region": "North", "list_price": 220, "net_realised": 188, "target_margin": "25%", "actual_margin": "18.2%", "leakage": "₹3.2M"},
                {"id": 2, "sku_code": "SKU-FMCG-05", "name": "Refined Oil 5L", "region": "West", "list_price": 750, "net_realised": 680, "target_margin": "15%", "actual_margin": "11.5%", "leakage": "₹4.8M"},
            ]
        },
        "sales-return-damage": {
            "title": "Sales-Return & Damage Audit",
            "category": "Commercial & Channel Audit",
            "metrics": {"total_returns": "₹15.2M", "unverified_destruction": "₹3.1M", "credit_notes_issued": 184},
            "items": [
                {"id": 1, "return_no": "RET-1092", "distributor": "Zenith Distributors", "reason": "Transit Damage", "value": 240000, "physical_verified": False, "credit_note": True},
                {"id": 2, "return_no": "RET-1093", "distributor": "Apex Trading", "reason": "Expired Stock", "value": 510000, "physical_verified": True, "credit_note": True},
            ]
        },
        "territory-beat-coverage": {
            "title": "Territory / Beat Coverage Audit",
            "category": "Field Ops & SLA Tracking",
            "metrics": {"beat_adherence": "84.2%", "ghost_visits_flagged": 29, "unserviced_outlets": 410},
            "items": [
                {"id": 1, "territory": "TERR-DELHI-01", "rep": "Rahul Sharma", "planned": 120, "visited": 94, "adherence": "78.3%", "ghost_flag": True},
                {"id": 2, "territory": "TERR-MUMBAI-04", "rep": "Priya Patel", "planned": 150, "visited": 142, "adherence": "94.6%", "ghost_flag": False},
            ]
        },
        "order-to-fulfilment-sla": {
            "title": "Order-to-Fulfilment SLA",
            "category": "Field Ops & SLA Tracking",
            "metrics": {"on_time_delivery": "88.5%", "avg_delay": "14.2 hrs", "sla_penalties": "₹1.8M"},
            "items": [
                {"id": 1, "order_no": "ORD-99301", "customer": "Reliance Retail", "booking": "2026-03-10", "expected": "2026-03-12", "actual": "2026-03-14", "delay_hrs": 48.0, "penalty": 45000},
                {"id": 2, "order_no": "ORD-99305", "customer": "DMart Central", "booking": "2026-03-11", "expected": "2026-03-13", "actual": "2026-03-13", "delay_hrs": 0.0, "penalty": 0},
            ]
        },
        "credit-exposure-by-distributor": {
            "title": "Credit Exposure by Distributor",
            "category": "Commercial & Channel Audit",
            "metrics": {"total_exposure": "₹310M", "overdue_90plus": "₹42.5M", "limit_breached_count": 23},
            "items": [
                {"id": 1, "distributor": "Apex Trading Corp", "limit": 10000000, "outstanding": 14500000, "overdue_30": 4500000, "breached": True, "hold_status": "Credit Hold"},
                {"id": 2, "distributor": "Sunrise Agencies", "limit": 20000000, "outstanding": 18900000, "overdue_30": 1200000, "breached": False, "hold_status": "Active"},
            ]
        },
        "free-goods-sampling": {
            "title": "Free-Goods & Sampling Controls",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"sample_allocation": "50,000 units", "unaccounted_qty": "4,200 units", "diversion_risk_value": "₹2.1M"},
            "items": [
                {"id": 1, "batch": "SMP-2026-A", "sku": "Sample Sachets 10ml", "allocated": 20000, "distributed": 16500, "unaccounted": 3500, "risk": "High Diversion"},
                {"id": 2, "batch": "SMP-2026-B", "sku": "Trial Packs 50g", "allocated": 15000, "distributed": 14300, "unaccounted": 700, "risk": "Low"},
            ]
        },
        "rebate-incentive-payout": {
            "title": "Rebate & Incentive Payout Audit",
            "category": "Sales & Scheme Leakage Assurance",
            "metrics": {"total_payout": "₹68.4M", "excess_payout_identified": "₹3.8M", "audited_payouts": 96},
            "items": [
                {"id": 1, "distributor": "Apex Trading", "target": 50000000, "achieved": 48500000, "calculated_rebate": 0, "paid_rebate": 1200000, "excess": 1200000},
                {"id": 2, "distributor": "Metro Retailers", "target": 30000000, "achieved": 31200000, "calculated_rebate": 936000, "paid_rebate": 936000, "excess": 0},
            ]
        },
        "stale-idle-distributors": {
            "title": "Stale / Idle Distributors Audit",
            "category": "Commercial & Channel Audit",
            "metrics": {"dormant_accounts": 37, "idle_security_deposits": "₹14.5M", "uncollected_dues": "₹8.9M"},
            "items": [
                {"id": 1, "distributor": "Universal Logistics", "region": "South", "last_order": "2025-08-14", "idle_days": 221, "security_deposit": 500000, "action": "Deactivate & Recover"},
                {"id": 2, "distributor": "Coastal Trade Links", "region": "East", "last_order": "2025-10-01", "idle_days": 173, "security_deposit": 750000, "action": "Re-engage"},
            ]
        },
        "cannibalisation-diversion": {
            "title": "Cannibalisation & Stock Diversion",
            "category": "Commercial & Channel Audit",
            "metrics": {"cross_territory_leakage": "₹11.4M", "high_risk_routes": 6, "grey_market_alerts": 19},
            "items": [
                {"id": 1, "source": "North Region (Hub A)", "target": "West Region (Hub B)", "sku": "Premium Oil 1L", "qty": 8500, "revenue_loss": 3400000, "risk_score": 88},
                {"id": 2, "source": "Central Depot", "target": "South Region", "sku": "Soap Pack 4in1", "qty": 14000, "revenue_loss": 1960000, "risk_score": 72},
            ]
        },
        "sales-return-cut-off": {
            "title": "Sales-Return Cut-off Testing",
            "category": "Commercial & Channel Audit",
            "metrics": {"period_end_returns": "₹9.8M", "post_period_reversals": "₹4.2M", "cut_off_exceptions": 8},
            "items": [
                {"id": 1, "invoice": "INV-7731", "inv_date": "2026-03-29", "return_date": "2026-04-02", "credit_note": 1400000, "cut_off_breach": True},
                {"id": 2, "invoice": "INV-7740", "inv_date": "2026-03-30", "return_date": "2026-04-01", "credit_note": 850000, "cut_off_breach": True},
            ]
        },
        "salesperson-performance": {
            "title": "Salesperson Performance & Phantom Booking",
            "category": "Field Ops & SLA Tracking",
            "metrics": {"phantom_booking_alerts": 12, "high_cancellation_reps": 7, "incentive_at_risk": "₹1.4M"},
            "items": [
                {"id": 1, "rep": "Vikram Singh", "target": 12000000, "actual": 13500000, "cancellation_rate": "24.5%", "phantom_risk": "High Risk"},
                {"id": 2, "rep": "Ananya Roy", "target": 10000000, "actual": 10200000, "cancellation_rate": "3.1%", "phantom_risk": "Low"},
            ]
        },
        "channel-reconciliation": {
            "title": "Channel Reconciliation",
            "category": "Commercial & Channel Audit",
            "metrics": {"reconciled_channels": "3 / 4", "total_gap": "₹16.8M", "unreconciled_gateway_val": "₹5.2M"},
            "items": [
                {"id": 1, "channel": "Modern Trade (Hypermarkets)", "erp_sales": 450000000, "portal_sales": 442000000, "gap": 8000000, "status": "Under Investigation"},
                {"id": 2, "channel": "E-Commerce Marketplaces", "erp_sales": 280000000, "portal_sales": 274800000, "gap": 5200000, "status": "Gateway Variance"},
            ]
        },
        "module-dashboard-kpis": {
            "title": "Module Dashboard & KPIs",
            "category": "Governance & Dashboard",
            "metrics": {"total_audited": "₹1.485B", "total_leakage": "₹24.5M", "health_score": "88/100"},
            "items": [
                {"metric": "Scheme Leakage", "value": "₹24.5M", "trend": "+4.2%", "status": "Attention Required"},
                {"metric": "Primary vs Secondary Gap", "value": "₹18.2M", "trend": "-1.8%", "status": "Improving"},
                {"metric": "Credit Limit Breaches", "value": "23 Distributors", "trend": "+3", "status": "High Exposure"},
            ]
        },
        "scope-audit-universe": {
            "title": "Scope & Audit Universe",
            "category": "Governance & Dashboard",
            "metrics": {"plants": 12, "depots": 48, "distributors": 482, "audit_frequency": "Quarterly"},
            "items": [
                {"id": 1, "entity_type": "Manufacturing Plant", "name": "Bhiwadi Plant #1", "location": "Rajasthan", "turnover": 420000000, "risk": "High", "last_audit": "2025-12-15"},
                {"id": 2, "entity_type": "Central Depot", "name": "Bhiwandi Hub", "location": "Maharashtra", "turnover": 680000000, "risk": "High", "last_audit": "2026-01-20"},
            ]
        },
        "risk-control-matrix-rcm": {
            "title": "Risk & Control Matrix (RCM)",
            "category": "Governance & Dashboard",
            "metrics": {"total_controls": 42, "automated_controls": 28, "control_deficiencies": 3},
            "items": [
                {"id": 1, "risk_id": "RCM-SD-01", "step": "Scheme Setup", "risk": "Unauthorized scheme discounts created in ERP", "control": "Dual authorization requirement for scheme master data update", "type": "Automated", "freq": "Real-time", "status": "Effective"},
                {"id": 2, "risk_id": "RCM-SD-05", "step": "Claim Approval", "risk": "Duplicate damage claim settlement", "control": "Systemic barcode and batch validation against invoice history", "type": "Semi-Automated", "freq": "Monthly", "status": "Deficiency Noted"},
            ]
        },
        "test-analytics-rule-library": {
            "title": "Test & Analytics Rule Library",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"active_rules": 24, "red_flags_generated": 142, "query_execution_time": "1.2s"},
            "items": [
                {"id": 1, "code": "RULE-SD-101", "name": "Secondary Sales > Primary + Stock", "target": "Primary vs Secondary", "query": "SELECT * FROM secondary_sales WHERE qty > (primary_qty + opening_stock)", "exceptions": 28, "exposure": 18200000},
                {"id": 2, "code": "RULE-SD-104", "name": "Post-Period End Credit Notes > 10% Sales", "target": "Sales Return Cutoff", "query": "SELECT * FROM credit_notes WHERE CN_date > period_end AND value > 0.10 * inv_val", "exceptions": 8, "exposure": 4200000},
            ]
        },
        "data-source-connector-setup": {
            "title": "Data Source & Connector Setup",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"connectors": 4, "last_ingestion": "10 mins ago", "ingestion_health": "100%"},
            "items": [
                {"id": 1, "system": "SAP SD (ERP)", "type": "Database Connector", "status": "Connected", "last_sync": "2026-07-23 12:30", "records": 482000},
                {"id": 2, "system": "Bizom DMS", "type": "API Connector", "status": "Connected", "last_sync": "2026-07-23 12:35", "records": 1250000},
            ]
        },
        "sampling-population-builder": {
            "title": "Sampling & Population Builder",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"population_count": 84200, "samples_extracted": 450, "confidence_level": "95%"},
            "items": [
                {"id": 1, "sample_name": "Q1 Scheme Claims Stratified Sample", "population": 4200, "method": "Monetary Unit Sampling (MUS)", "sample_size": 120, "confidence": "95%"},
                {"id": 2, "sample_name": "High Value Sales Returns Sample", "population": 680, "method": "Stratified Random", "sample_size": 85, "confidence": "99%"},
            ]
        },
        "exception-red-flag-queue": {
            "title": "Exception & Red-Flag Queue",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"open_flags": 14, "total_impact": "₹24.5M", "high_severity": 6},
            "items": [
                {"id": 1, "code": "FLAG-901", "category": "Scheme Leakage", "desc": "Distributor claim exceeded scheme slab limit by 30%", "impact": 130000, "severity": "High", "status": "Open"},
                {"id": 2, "code": "FLAG-904", "category": "Credit Limit", "desc": "Billing processed despite credit hold block", "impact": 4500000, "severity": "Critical", "status": "Under Investigation"},
            ]
        },
        "working-papers-evidence": {
            "title": "Working Papers & Evidence Repository",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"workpapers": 34, "reviewed": 28, "evidence_files": 89},
            "items": [
                {"id": 1, "ref": "WP-SD-01", "title": "Primary vs Secondary Reconciliation Working Sheet Q1", "author": "Rohan Verma (Senior Auditor)", "status": "Reviewed", "attachments": 4},
                {"id": 2, "ref": "WP-SD-04", "title": "Physical Verification of Damaged Stock - Bhiwandi Depot", "author": "Neha Sharma (Auditor)", "status": "Draft", "attachments": 2},
            ]
        },
        "observation-finding-log": {
            "title": "Observation & Finding Log",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"findings": 9, "financial_impact": "₹42.7M", "high_risk_findings": 4},
            "items": [
                {"id": 1, "no": "OBS-SD-01", "title": "Uncontrolled Trade Scheme Over-claiming at Region West", "category": "Scheme Leakage", "severity": "High", "impact": 14500000, "recommendation": "Enforce automated system validation in SAP SD for scheme caps."},
                {"id": 2, "no": "OBS-SD-02", "title": "Ghost Visits & Beat Non-adherence in Territory North-2", "category": "Field Ops", "severity": "Medium", "impact": 2100000, "recommendation": "Implement geo-fenced GPS verification in SFA application."},
            ]
        },
        "remediation-action-tracker": {
            "title": "Remediation / Action Tracker",
            "category": "Audit Execution & Analytics Engine",
            "metrics": {"open_capas": 8, "closed_capas": 12, "overdue_actions": 2},
            "items": [
                {"id": 1, "action_id": "CAPA-SD-101", "finding_ref": "OBS-SD-01", "owner": "Head of Sales Ops", "target": "2026-08-30", "status": "In Progress", "response": "SAP SD enhancement spec submitted to IT for automated scheme validation."},
                {"id": 2, "action_id": "CAPA-SD-102", "finding_ref": "OBS-SD-02", "owner": "VP Commercial", "target": "2026-07-15", "status": "Overdue", "response": "Vendor evaluation ongoing for GPS tracking plugin."},
            ]
        }
    }

    if page_key not in data_generators:
        # Fallback generator for dynamically matched subpages
        return SubPageDataResponse(
            page_key=page_key,
            title=page_key.replace("-", " ").title(),
            category="Sales & Distribution Audit",
            total_records=5,
            summary_metrics={"status": "Active", "total_value": "₹10.0M", "risk_level": "Medium"},
            items=[
                {"id": i, "title": f"Sample Record {i} for {page_key}", "notes": "Audited transaction item", "status": "Verified"}
                for i in range(1, 6)
            ]
        )

    data = data_generators[page_key]
    return SubPageDataResponse(
        page_key=page_key,
        title=data["title"],
        category=data["category"],
        total_records=len(data["items"]),
        summary_metrics=data["metrics"],
        items=data["items"]
    )
