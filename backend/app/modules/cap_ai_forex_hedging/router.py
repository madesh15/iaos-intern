from datetime import datetime, timedelta
import random
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import ForexExposure, HedgeContract, AuditException, AuditFinding, RemediationAction, HedgeDocument
from .schemas import (
    ExposureCreate, ExposureOut,
    HedgeCreate, HedgeOut,
    ExceptionCreate, ExceptionUpdate, ExceptionOut,
    FindingCreate, FindingOut,
    RemediationCreate, RemediationUpdate, RemediationOut,
    DocumentCreate, DocumentOut,
    DashboardKpisOut, AISummaryOut
)

MANIFEST = {
    "name": "cap_ai_forex_hedging",
    "title": "CAP-AI Forex & Hedging",
    "description": "Enterprise AI-powered Forex Exposure & Hedging Management System.",
    "icon": "trending-up",
    "group": "Finance Cycles",
    "industry": "",
    "version": "1.0.0",
    "owner": "auditor",
}

router = APIRouter()

# Mock Spot Rates
SPOT_RATES = {
    "USD/INR": 83.50,
    "EUR/USD": 1.09,
    "GBP/USD": 1.28,
    "EUR/INR": 91.01,
    "USD/JPY": 156.40,
}

# Dynamic Mock Spot Rate Volatility Deviation
def check_anomaly(currency_pair: str, amount: float) -> bool:
    if currency_pair not in SPOT_RATES:
        return True
    if amount > 5000000: # > 5M is flagged for audit review
        return True
    return False

# Self-Seeding logic for demonstration
def ensure_seed_data(db: Session, tenant_id: int):
    # Check if exposures already exist for this tenant
    count = db.query(ForexExposure).filter(ForexExposure.tenant_id == tenant_id).count()
    if count > 0:
        return

    print(f"[seed] Seeding demonstration data for tenant: {tenant_id}")
    
    # 1. Add sample exposures
    today = datetime.utcnow()
    exposures_data = [
        ("USD/INR", 450000.0, "Export", (today + timedelta(days=30)).strftime("%Y-%m-%d"), "Hedged", "Verified", "Standard export invoice sales billing"),
        ("USD/INR", 1200000.0, "Export", (today + timedelta(days=60)).strftime("%Y-%m-%d"), "Unhedged", "Verified", "Q3 Projected Export Receipts"),
        ("USD/INR", 350000.0, "Import", (today + timedelta(days=15)).strftime("%Y-%m-%d"), "Unhedged", "Verified", "Component purchase vendor invoice"),
        ("EUR/USD", 180000.0, "Export", (today + timedelta(days=90)).strftime("%Y-%m-%d"), "Unhedged", "Missing Invoice", "Offsetting EUR trade receivable"),
        ("USD/INR", 800000.0, "Import", (today + timedelta(days=45)).strftime("%Y-%m-%d"), "Hedged", "Verified", "Raw materials import payment"),
        ("USD/INR", 6000000.0, "Export", (today + timedelta(days=120)).strftime("%Y-%m-%d"), "Unhedged", "Verified", "Mega-machinery sales project (Anomaly size)")
    ]
    
    db_exposures = []
    for pair, amt, direction, mat, status_str, compl, notes in exposures_data:
        is_anom = check_anomaly(pair, amt)
        exp = ForexExposure(
            currency_pair=pair,
            amount=amt,
            direction=direction,
            maturity_date=mat,
            status=status_str,
            completeness_status=compl,
            is_anomaly=is_anom,
            notes=notes,
            tenant_id=tenant_id
        )
        db.add(exp)
        db_exposures.append(exp)
    
    db.flush() # obtain ids for underlying references

    # 2. Add sample hedges
    hedges_data = [
        ("Forward", db_exposures[0].id, 450000.0, 83.10, (today + timedelta(days=30)).strftime("%Y-%m-%d"), "HSBC Bank", 0.0, False, "Active"),
        ("Option", db_exposures[4].id, 800000.0, 83.25, (today + timedelta(days=45)).strftime("%Y-%m-%d"), "Citibank", 1200.0, False, "Active"),
        ("Forward", None, 200000.0, 84.45, (today + timedelta(days=60)).strftime("%Y-%m-%d"), "Deutsche Bank", 0.0, True, "Active") # Speculative
    ]

    for c_type, exp_id, amt, strike, mat, counter, prem, is_spec, con_status in hedges_data:
        spot_rate = SPOT_RATES.get("USD/INR", 83.50)
        
        # MTM / GainLoss calculation
        gain_loss = 0.0
        if exp_id:
            # hedged trade
            diff = spot_rate - strike
            direction = "Export" if exp_id == db_exposures[0].id else "Import"
            if direction == "Export":
                gain_loss = -diff * amt
            else:
                gain_loss = diff * amt
        else:
            # speculative forward buy
            gain_loss = (spot_rate - strike) * amt

        eff_pct = 98.5 if exp_id else 0.0
        
        con = HedgeContract(
            contract_type=c_type,
            underlying_exposure_id=exp_id,
            amount=amt,
            strike_rate=strike,
            fair_value=round(gain_loss, 2),
            gain_loss=round(gain_loss, 2),
            effectiveness_pct=round(eff_pct, 2),
            maturity_date=mat,
            bank_confirmation="Confirmed",
            is_speculative=is_spec,
            status=con_status,
            counterparty=counter,
            premium_cost=prem,
            tenant_id=tenant_id
        )
        db.add(con)

    # 3. Add sample audit exception
    exceptions_data = [
        ("Policy Limit Breach: Unhedged Exposure", f"Export exposure of USD 1,200,000 maturing in 60 days remains fully unhedged, exceeding the corporate board limit of USD 1,000,000.", "High", "Open"),
        ("Speculative Deal Flagged", "Hedge contract #3 for USD 200,000 has no matching underlying transaction invoice and is flagged as speculative.", "Critical", "Open")
    ]

    for title, desc, sev, status_str in exceptions_data:
        exc = AuditException(
            title=title,
            description=desc,
            severity=sev,
            status=status_str,
            assigned_to="Unassigned",
            created_at=(today - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
            tenant_id=tenant_id
        )
        db.add(exc)

    # 4. Add sample findings
    finding = AuditFinding(
        title="Option contract execution lacked designation memo",
        description="The option hedge contract #2 (USD 800,000, counterparty Citibank) was executed on the treasury floor without compiling and signing a hedge designation memo on execution date.",
        severity="Medium",
        root_cause="Treasury staff omitted uploading the designation memo due to manual approval delays in the front office workflow.",
        recommendation="Mandate system blockages in treasury booking system if documentation isn't submitted in the Vault within 24 hours of deal execution.",
        created_at=(today - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S"),
        tenant_id=tenant_id
    )
    db.add(finding)
    db.flush()

    # 5. Add sample remediation CAPA action
    rem = RemediationAction(
        finding_id=finding.id,
        capa_action="Incorporate designation vault check in daily end-of-day treasury operations procedures, and run refresher compliance course for dealers.",
        owner="Marcus Vance (Head of Treasury Operations)",
        due_date=(today + timedelta(days=25)).strftime("%Y-%m-%d"),
        status="In Progress",
        retesting_status="Pending",
        tenant_id=tenant_id
    )
    db.add(rem)

    # 6. Add sample vault documents
    docs_data = [
        ("USD_INR_450K_Fwd_Memo.pdf", "Designation Memo"),
        ("HSBC_Fwd_Confirmation_4412.pdf", "Confirmation"),
        ("Board_Approved_FX_Hedging_Policy.pdf", "Policy Approval")
    ]
    for fn, dt in docs_data:
        doc = HedgeDocument(
            filename=fn,
            doc_type=dt,
            uploaded_at=(today - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"),
            tenant_id=tenant_id
        )
        db.add(doc)

    db.commit()


# Exception auto-generator helper
def evaluate_and_generate_exceptions(db: Session, tenant_id: int, current_user: CurrentUser):
    exposures = db.query(ForexExposure).filter(ForexExposure.tenant_id == tenant_id).all()
    contracts = db.query(HedgeContract).filter(HedgeContract.tenant_id == tenant_id).all()
    
    existing_exception_titles = [e.title for e in db.query(AuditException).filter(AuditException.tenant_id == tenant_id).all()]
    
    # 1. Unhedged limit breach: Exposure amount > 1M and status is Unhedged
    for exp in exposures:
        if exp.status == "Unhedged" and exp.amount > 1000000:
            title = f"Unhedged Limit Breach: {exp.currency_pair} {exp.amount:,.2f}"
            if title not in existing_exception_titles:
                exc = AuditException(
                    title=title,
                    description=f"Exposure of {exp.amount:,.2f} {exp.currency_pair} maturing on {exp.maturity_date} is unhedged. This exceeds the policy limit of 1,000,000.",
                    severity="High",
                    status="Open",
                    assigned_to="Unassigned",
                    created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    tenant_id=tenant_id
                )
                db.add(exc)
                
    # 2. Speculative Trade detection
    for con in contracts:
        if con.is_speculative:
            title = f"Speculative Trade Flagged: Deal #{con.id}"
            if title not in existing_exception_titles:
                exc = AuditException(
                    title=title,
                    description=f"Derivative contract #{con.id} for {con.amount:,.2f} {con.contract_type} has no matching underlying business exposure or exceeds the exposure threshold, indicating speculative trading.",
                    severity="Critical",
                    status="Open",
                    assigned_to="Unassigned",
                    created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    tenant_id=tenant_id
                )
                db.add(exc)
                
    # 3. Hedge Effectiveness low
    for con in contracts:
        if con.effectiveness_pct < 80.0 and con.status == "Active":
            title = f"Low Hedge Effectiveness: Deal #{con.id}"
            if title not in existing_exception_titles:
                exc = AuditException(
                    title=title,
                    description=f"Derivative contract #{con.id} has an Ind AS 109 effectiveness score of {con.effectiveness_pct:.1f}%, which falls below the compliance threshold of 80% to 125%.",
                    severity="Medium",
                    status="Open",
                    assigned_to="Unassigned",
                    created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    tenant_id=tenant_id
                )
                db.add(exc)

    db.commit()


# ─── Dashboard & KPIs ───
@router.get("/dashboard", response_model=DashboardKpisOut)
def get_dashboard_kpis(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    
    exposures = tenant_scoped(db.query(ForexExposure), current_user).all()
    contracts = tenant_scoped(db.query(HedgeContract), current_user).all()
    exceptions = tenant_scoped(db.query(AuditException), current_user).filter(AuditException.status == "Open").all()

    total_exp = sum(e.amount for e in exposures)
    
    # Calculate hedged vs unhedged amounts
    hedged_amount = 0.0
    for c in contracts:
        if c.status == "Active":
            hedged_amount += c.amount

    unhedged_amount = max(0.0, total_exp - hedged_amount)
    coverage_pct = (hedged_amount / total_exp * 100.0) if total_exp > 0 else 0.0
    
    # Open unhedged positions
    open_unhedged = sum(1 for e in exposures if e.status == "Unhedged")
    
    # Average effectiveness
    active_contracts = [c for c in contracts if c.status == "Active"]
    avg_effectiveness = sum(c.effectiveness_pct for c in active_contracts) / len(active_contracts) if active_contracts else 100.0

    # Counterparty risk based on concentration
    banks = [c.counterparty for c in active_contracts]
    unique_banks = set(banks)
    if not active_contracts:
        cp_risk = "Low"
    elif len(unique_banks) <= 1 and len(active_contracts) > 2:
        cp_risk = "High"
    elif len(unique_banks) <= 2:
        cp_risk = "Medium"
    else:
        cp_risk = "Low"

    # Natural hedging opportunities
    curr_map = {}
    for exp in exposures:
        key = (exp.currency_pair, exp.maturity_date[:7])
        if key not in curr_map:
            curr_map[key] = {"Export": 0.0, "Import": 0.0}
        curr_map[key][exp.direction] += exp.amount
        
    natural_opportunities = 0
    for key, val in curr_map.items():
        if val["Export"] > 0 and val["Import"] > 0:
            natural_opportunities += 1

    # Overall risk score based on unhedged exposure
    risk_score = 30.0
    if total_exp > 0:
        unhedged_ratio = unhedged_amount / total_exp
        risk_score += unhedged_ratio * 40.0
    if len(exceptions) > 0:
        risk_score += min(20.0, len(exceptions) * 5)
    if cp_risk == "High":
        risk_score += 10.0
    risk_score = min(100.0, risk_score)

    return DashboardKpisOut(
        overall_risk_score=round(risk_score, 1),
        total_exposure_amount=round(total_exp, 2),
        hedged_amount=round(hedged_amount, 2),
        unhedged_amount=round(unhedged_amount, 2),
        hedge_coverage_pct=round(coverage_pct, 1),
        open_unhedged_positions=open_unhedged,
        pending_exceptions=len(exceptions),
        counterparty_risk_level=cp_risk,
        hedge_effectiveness_pct=round(avg_effectiveness, 1),
        natural_hedged_opportunities=natural_opportunities
    )


# ─── Exposure Management ───
@router.get("/exposures", response_model=List[ExposureOut])
def list_exposures(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(ForexExposure), current_user)
    return q.order_by(ForexExposure.id.desc()).all()


@router.post("/exposures", response_model=ExposureOut, status_code=201)
def create_exposure(body: ExposureCreate, current_user: CurrentUser, db: DbSession):
    is_anom = check_anomaly(body.currency_pair, body.amount)
    
    exp = ForexExposure(
        currency_pair=body.currency_pair,
        amount=body.amount,
        direction=body.direction,
        maturity_date=body.maturity_date,
        status=body.status,
        completeness_status=body.completeness_status,
        is_anomaly=is_anom,
        notes=body.notes,
        tenant_id=current_user.tenant_id
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    
    evaluate_and_generate_exceptions(db, current_user.tenant_id, current_user)
    return exp


@router.delete("/exposures/{item_id}", status_code=204)
def delete_exposure(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(ForexExposure).filter(ForexExposure.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Exposure record not found")
    db.delete(item)
    db.commit()


# ─── Hedge Derivative Contracts ───
@router.get("/hedges", response_model=List[HedgeOut])
def list_hedges(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(HedgeContract), current_user)
    return q.order_by(HedgeContract.id.desc()).all()


@router.post("/hedges", response_model=HedgeOut, status_code=201)
def create_hedge(body: HedgeCreate, current_user: CurrentUser, db: DbSession):
    is_spec = True
    underlying_amount = 0.0
    if body.underlying_exposure_id:
        exp = tenant_scoped(db.query(ForexExposure).filter(ForexExposure.id == body.underlying_exposure_id), current_user).first()
        if exp:
            is_spec = False
            underlying_amount = exp.amount
            exp.status = "Hedged"
            db.add(exp)
            
    if not is_spec and body.amount > (underlying_amount * 1.10):
        is_spec = True

    spot_rate = 83.50
    if body.underlying_exposure_id and exp:
        for pair, rate in SPOT_RATES.items():
            if exp.currency_pair == pair:
                spot_rate = rate
                break
    
    gain_loss = 0.0
    if body.underlying_exposure_id and exp:
        diff = spot_rate - body.strike_rate
        if exp.direction == "Export":
            gain_loss = -diff * body.amount
        else:
            gain_loss = diff * body.amount
    else:
        gain_loss = (spot_rate - body.strike_rate) * body.amount

    mtm = gain_loss
    
    eff = 100.0 - abs((body.strike_rate - spot_rate) / spot_rate * 100.0)
    eff = max(10.0, min(100.0, eff))
    eff = round(eff - random.uniform(0.0, 5.0), 2)

    hedge = HedgeContract(
        contract_type=body.contract_type,
        underlying_exposure_id=body.underlying_exposure_id,
        amount=body.amount,
        strike_rate=body.strike_rate,
        fair_value=round(mtm, 2),
        gain_loss=round(gain_loss, 2),
        effectiveness_pct=round(eff, 2),
        maturity_date=body.maturity_date,
        bank_confirmation="Confirmed",
        is_speculative=is_spec,
        status="Active",
        counterparty=body.counterparty or "HSBC Bank",
        premium_cost=body.premium_cost or 0.0,
        tenant_id=current_user.tenant_id
    )
    
    db.add(hedge)
    db.commit()
    db.refresh(hedge)
    
    evaluate_and_generate_exceptions(db, current_user.tenant_id, current_user)
    return hedge


@router.post("/hedges/{hedge_id}/action", response_model=HedgeOut)
def trigger_hedge_action(hedge_id: int, action: str, current_user: CurrentUser, db: DbSession):
    hedge = tenant_scoped(db.query(HedgeContract).filter(HedgeContract.id == hedge_id), current_user).first()
    if not hedge:
        raise HTTPException(404, "Hedge contract not found")
        
    if action == "rollover":
        hedge.status = "Rolled Over"
        try:
            curr_date = datetime.strptime(hedge.maturity_date, "%Y-%m-%d")
            new_date = curr_date + timedelta(days=90)
            hedge.maturity_date = new_date.strftime("%Y-%m-%d")
        except:
            hedge.maturity_date = (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d")
            
        hedge.premium_cost += hedge.amount * 0.02
    elif action == "cancel":
        hedge.status = "Cancelled"
        hedge.gain_loss -= hedge.amount * 0.015
        hedge.fair_value = 0.0
    elif action == "settle":
        hedge.status = "Settled"
        
    db.add(hedge)
    db.commit()
    db.refresh(hedge)
    return hedge


# ─── Audit Exceptions ───
@router.get("/exceptions", response_model=List[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(AuditException), current_user)
    return q.order_by(AuditException.id.desc()).all()


@router.post("/exceptions", response_model=ExceptionOut, status_code=201)
def create_exception(body: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    exc = AuditException(
        title=body.title,
        description=body.description,
        severity=body.severity,
        status="Open",
        assigned_to=body.assigned_to or "Unassigned",
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        tenant_id=current_user.tenant_id
    )
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return exc


@router.patch("/exceptions/{exc_id}", response_model=ExceptionOut)
def update_exception(exc_id: int, body: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(db.query(AuditException).filter(AuditException.id == exc_id), current_user).first()
    if not exc:
        raise HTTPException(404, "Audit exception not found")
        
    exc.status = body.status
    if body.assigned_to is not None:
        exc.assigned_to = body.assigned_to
        
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return exc


# ─── Audit Findings ───
@router.get("/findings", response_model=List[FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(AuditFinding), current_user)
    return q.order_by(AuditFinding.id.desc()).all()


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(body: FindingCreate, current_user: CurrentUser, db: DbSession):
    fnd = AuditFinding(
        title=body.title,
        description=body.description,
        severity=body.severity,
        root_cause=body.root_cause,
        recommendation=body.recommendation,
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        tenant_id=current_user.tenant_id
    )
    db.add(fnd)
    db.commit()
    db.refresh(fnd)
    return fnd


# ─── Remediation Actions ───
@router.get("/remediations", response_model=List[RemediationOut])
def list_remediations(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(RemediationAction), current_user)
    return q.order_by(RemediationAction.id.desc()).all()


@router.post("/remediations", response_model=RemediationOut, status_code=201)
def create_remediation(body: RemediationCreate, current_user: CurrentUser, db: DbSession):
    rem = RemediationAction(
        finding_id=body.finding_id,
        capa_action=body.capa_action,
        owner=body.owner,
        due_date=body.due_date,
        status="Not Started",
        retesting_status="Pending",
        tenant_id=current_user.tenant_id
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem


@router.patch("/remediations/{rem_id}", response_model=RemediationOut)
def update_remediation(rem_id: int, body: RemediationUpdate, current_user: CurrentUser, db: DbSession):
    rem = tenant_scoped(db.query(RemediationAction).filter(RemediationAction.id == rem_id), current_user).first()
    if not rem:
        raise HTTPException(404, "Remediation plan not found")
        
    rem.status = body.status
    if body.retesting_status is not None:
        rem.retesting_status = body.retesting_status
        
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem


# ─── Document Vault ───
@router.get("/documents", response_model=List[DocumentOut])
def list_documents(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    q = tenant_scoped(db.query(HedgeDocument), current_user)
    return q.order_by(HedgeDocument.id.desc()).all()


@router.post("/documents", response_model=DocumentOut, status_code=201)
def upload_document(body: DocumentCreate, current_user: CurrentUser, db: DbSession):
    doc = HedgeDocument(
        filename=body.filename,
        doc_type=body.doc_type,
        uploaded_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        tenant_id=current_user.tenant_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


# ─── Sampling ───
@router.get("/sampling", response_model=List[ExposureOut])
def get_audit_samples(sampling_type: str, sample_size: int, current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    exposures = tenant_scoped(db.query(ForexExposure), current_user).all()
    if not exposures:
        return []
        
    size = min(sample_size, len(exposures))
    if sampling_type == "statistical":
        return random.sample(exposures, size)
    else:
        sorted_exp = sorted(exposures, key=lambda x: (x.is_anomaly, x.amount), reverse=True)
        return sorted_exp[:size]


# ─── Natural Hedging ───
@router.get("/natural-hedges")
def list_natural_hedges(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    exposures = tenant_scoped(db.query(ForexExposure), current_user).all()
    
    by_key = {}
    for e in exposures:
        month = e.maturity_date[:7]
        key = (e.currency_pair, month)
        if key not in by_key:
            by_key[key] = []
        by_key[key].append(e)
        
    results = []
    for (pair, month), items in by_key.items():
        exports = [i for i in items if i.direction == "Export"]
        imports = [i for i in items if i.direction == "Import"]
        
        tot_exp = sum(i.amount for i in exports)
        tot_imp = sum(i.amount for i in imports)
        
        if tot_exp > 0 and tot_imp > 0:
            offset = min(tot_exp, tot_imp)
            net = abs(tot_exp - tot_imp)
            net_dir = "Export" if tot_exp > tot_imp else "Import"
            
            results.append({
                "currency_pair": pair,
                "month": month,
                "export_amount": round(tot_exp, 2),
                "import_amount": round(tot_imp, 2),
                "natural_offset": round(offset, 2),
                "net_exposure": round(net, 2),
                "net_direction": net_dir,
                "matches": [
                    {"id": i.id, "direction": i.direction, "amount": i.amount} for i in items
                ]
            })
            
    return results


# ─── Speculative Analysis ───
@router.get("/speculative-deals")
def list_speculative_deals(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    contracts = tenant_scoped(db.query(HedgeContract), current_user).all()
    speculative = [c for c in contracts if c.is_speculative]
    
    results = []
    for c in speculative:
        reason = "No underlying exposure ID assigned to deal."
        if c.underlying_exposure_id:
            reason = "Contract amount exceeds underlying exposure by over 10% (policy breach)."
            
        results.append({
            "id": c.id,
            "contract_type": c.contract_type,
            "amount": c.amount,
            "strike_rate": c.strike_rate,
            "counterparty": c.counterparty,
            "maturity_date": c.maturity_date,
            "reason": reason
        })
    return results


# ─── MTM Valuation Gain/Loss ───
@router.get("/mtm-valuation")
def trigger_mtm_valuation(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    contracts = tenant_scoped(db.query(HedgeContract), current_user).filter(HedgeContract.status == "Active").all()
    exposures = tenant_scoped(db.query(ForexExposure), current_user).all()
    
    exp_map = {e.id: e for e in exposures}
    results = []
    total_gain_loss = 0.0
    
    for con in contracts:
        spot_rate = 83.50
        pair = "USD/INR"
        
        if con.underlying_exposure_id and con.underlying_exposure_id in exp_map:
            exp = exp_map[con.underlying_exposure_id]
            pair = exp.currency_pair
            spot_rate = SPOT_RATES.get(pair, 83.50)
            
            diff = spot_rate - con.strike_rate
            if exp.direction == "Export":
                gain_loss = -diff * con.amount
            else:
                gain_loss = diff * con.amount
        else:
            gain_loss = (spot_rate - con.strike_rate) * con.amount
            
        con.fair_value = round(gain_loss, 2)
        con.gain_loss = round(gain_loss, 2)
        db.add(con)
        
        total_gain_loss += gain_loss
        results.append({
            "id": con.id,
            "contract_type": con.contract_type,
            "amount": con.amount,
            "strike_rate": con.strike_rate,
            "spot_rate": spot_rate,
            "currency_pair": pair,
            "gain_loss": round(gain_loss, 2),
            "counterparty": con.counterparty
        })
        
    db.commit()
    evaluate_and_generate_exceptions(db, current_user.tenant_id, current_user)
    
    return {
        "status": "success",
        "total_mtm_gain_loss": round(total_gain_loss, 2),
        "contracts_evaluated": len(results),
        "valuations": results
    }


# ─── AI Assisted Capabilities ───
@router.post("/ai-analysis", response_model=AISummaryOut)
def run_ai_analysis(current_user: CurrentUser, db: DbSession):
    ensure_seed_data(db, current_user.tenant_id)
    exposures = tenant_scoped(db.query(ForexExposure), current_user).all()
    contracts = tenant_scoped(db.query(HedgeContract), current_user).filter(HedgeContract.status == "Active").all()
    exceptions = tenant_scoped(db.query(AuditException), current_user).filter(AuditException.status == "Open").all()

    total_exp = sum(e.amount for e in exposures)
    total_hedge = sum(c.amount for c in contracts)
    coverage = (total_hedge / total_exp * 100.0) if total_exp > 0 else 0.0

    summary_text = (
        f"CAP-AI risk engine has completed portfolio scans for your organization. "
        f"Found {len(exposures)} FX exposures totaling {total_exp:,.2f} USD equivalent, "
        f"and {len(contracts)} active hedging contracts totaling {total_hedge:,.2f} USD equivalent. "
        f"The current hedge coverage ratio is {coverage:.1f}%. "
        f"There are {len(exceptions)} unresolved audit exceptions in the queue."
    )

    insights = []
    recommendations = []

    if coverage < 50.0:
        insights.append(f"Low Hedge Coverage alert: Current hedge coverage is {coverage:.1f}%, which is below the safe compliance corridor of 70-90%.")
        recommendations.append("Execute additional USD/INR forward covers to bridge the unhedged exposure window.")
    else:
        insights.append(f"Optimal Coverage maintained: Currently at {coverage:.1f}% hedge ratio.")

    anom_count = sum(1 for e in exposures if e.is_anomaly)
    if anom_count > 0:
        insights.append(f"Exposure Anomaly: Identified {anom_count} exposure transactions that exceed typical historical transaction limits.")
        recommendations.append("Audit the exposure ledger mapping configurations to verify validity of high-amount invoices.")

    speculative_count = sum(1 for c in contracts if c.is_speculative)
    if speculative_count > 0:
        insights.append(f"Speculative Alert: Found {speculative_count} derivative contracts without valid underlying trade invoices.")
        recommendations.append("Halt speculative forward positions immediately to avoid compliance audit flags.")

    avg_effectiveness = sum(c.effectiveness_pct for c in contracts) / len(contracts) if contracts else 100.0
    if avg_effectiveness < 85.0:
        insights.append(f"Hedge Ineffectiveness: Statistical correlation (Ind AS 109) has dropped to {avg_effectiveness:.1f}%.")
        recommendations.append("Re-designate the hedging relationships to match the specific maturity dates of underlying invoice collections.")

    if not recommendations:
        recommendations.append("Continue monitoring the portfolio. All limits are within safe compliance guidelines.")

    return AISummaryOut(
        summary=summary_text,
        insights=insights,
        recommendations=recommendations
    )
