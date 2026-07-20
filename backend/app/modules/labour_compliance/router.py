"""
Labour Law & PF/ESI Compliance — API Router
=============================================
Auto-discovered by app.module_loader, mounted at /api/modules/labour_compliance.
CRUD + 10 audit shell endpoints for all 25 features.
"""

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    LabourComplianceItem,
    ApplicabilityMapping,
    StatutoryRegisterCheck,
    LicenceRegistration,
    ContractLabourCompliance,
    MinimumWagesCompliance,
    PfEsiCoverage,
    BonusGratuity,
    WorkingHoursOvertime,
    ContractorPfEsiVerification,
    PoshCompliance,
    LabourWelfareFund,
    ReturnFilingTracker,
    InspectionNoticeLog,
    WageCodeReadiness,
    ContractWorkerMaster,
)

from .schemas import (
    ItemCreate, ItemOut,
    ApplicabilityMappingCreate, ApplicabilityMappingUpdate, ApplicabilityMappingOut,
    StatutoryRegisterCheckCreate, StatutoryRegisterCheckUpdate, StatutoryRegisterCheckOut,
    LicenceRegistrationCreate, LicenceRegistrationUpdate, LicenceRegistrationOut,
    ContractLabourComplianceCreate, ContractLabourComplianceUpdate, ContractLabourComplianceOut,
    MinimumWagesComplianceCreate, MinimumWagesComplianceUpdate, MinimumWagesComplianceOut,
    PfEsiCoverageCreate, PfEsiCoverageUpdate, PfEsiCoverageOut,
    BonusGratuityCreate, BonusGratuityUpdate, BonusGratuityOut,
    WorkingHoursOvertimeCreate, WorkingHoursOvertimeUpdate, WorkingHoursOvertimeOut,
    ContractorPfEsiVerificationCreate, ContractorPfEsiVerificationUpdate, ContractorPfEsiVerificationOut,
    PoshComplianceCreate, PoshComplianceUpdate, PoshComplianceOut,
    LabourWelfareFundCreate, LabourWelfareFundUpdate, LabourWelfareFundOut,
    ReturnFilingTrackerCreate, ReturnFilingTrackerUpdate, ReturnFilingTrackerOut,
    InspectionNoticeLogCreate, InspectionNoticeLogUpdate, InspectionNoticeLogOut,
    WageCodeReadinessCreate, WageCodeReadinessUpdate, WageCodeReadinessOut,
    ContractWorkerMasterCreate, ContractWorkerMasterUpdate, ContractWorkerMasterOut,
)

MANIFEST = {
    "name": "labour_compliance",
    "title": "Labour Law & PF/ESI Compliance",
    "description": (
        "Assurance over labour law obligations including Labour Acts, PF, ESI, "
        "Minimum Wages, POSH, Bonus, Gratuity, Contract Labour, Working Hours, "
        "Labour Welfare Fund, Wage Code, and Statutory Returns."
    ),
    "icon": "scale",
    "group": "Tax, Legal & Compliance",
    "industry": "",
    "version": "1.0.0",
    "owner": "Module — Labour Compliance",
    "features": 25,
}

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════
# GENERIC CRUD HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _list_all(db, model, user):
    q = tenant_scoped(db.query(model), user)
    return q.order_by(model.id.desc()).all()


def _get_or_404(db, model, item_id, user):
    item = tenant_scoped(
        db.query(model).filter(model.id == item_id), user
    ).first()
    if not item:
        raise HTTPException(404, "Record not found")
    return item


def _create(db, model, schema, user):
    item = model(**schema.model_dump(), tenant_id=user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _patch(db, model, item_id, schema, user):
    item = _get_or_404(db, model, item_id, user)
    for k, v in schema.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


def _delete(db, model, item_id, user):
    item = _get_or_404(db, model, item_id, user)
    db.delete(item)
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# LEGACY STUB
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/items", response_model=list[ItemOut], tags=["legacy"])
def list_items(current_user: CurrentUser, db: DbSession):
    return [ItemOut.model_validate(i) for i in _list_all(db, LabourComplianceItem, current_user)]


@router.post("/items", response_model=ItemOut, status_code=201, tags=["legacy"])
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    return ItemOut.model_validate(_create(db, LabourComplianceItem, body, current_user))


@router.delete("/items/{item_id}", status_code=204, tags=["legacy"])
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, LabourComplianceItem, item_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 1. APPLICABILITY MAPPING
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/applicability", response_model=list[ApplicabilityMappingOut])
def list_applicability(current_user: CurrentUser, db: DbSession):
    return [ApplicabilityMappingOut.model_validate(r) for r in _list_all(db, ApplicabilityMapping, current_user)]

@router.post("/applicability", response_model=ApplicabilityMappingOut, status_code=201)
def create_applicability(body: ApplicabilityMappingCreate, current_user: CurrentUser, db: DbSession):
    return ApplicabilityMappingOut.model_validate(_create(db, ApplicabilityMapping, body, current_user))

@router.patch("/applicability/{record_id}", response_model=ApplicabilityMappingOut)
def update_applicability(record_id: int, body: ApplicabilityMappingUpdate, current_user: CurrentUser, db: DbSession):
    return ApplicabilityMappingOut.model_validate(_patch(db, ApplicabilityMapping, record_id, body, current_user))

@router.delete("/applicability/{record_id}", status_code=204)
def delete_applicability(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ApplicabilityMapping, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 2. STATUTORY REGISTER CHECK
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/registers", response_model=list[StatutoryRegisterCheckOut])
def list_registers(current_user: CurrentUser, db: DbSession):
    return [StatutoryRegisterCheckOut.model_validate(r) for r in _list_all(db, StatutoryRegisterCheck, current_user)]

@router.post("/registers", response_model=StatutoryRegisterCheckOut, status_code=201)
def create_register(body: StatutoryRegisterCheckCreate, current_user: CurrentUser, db: DbSession):
    return StatutoryRegisterCheckOut.model_validate(_create(db, StatutoryRegisterCheck, body, current_user))

@router.patch("/registers/{record_id}", response_model=StatutoryRegisterCheckOut)
def update_register(record_id: int, body: StatutoryRegisterCheckUpdate, current_user: CurrentUser, db: DbSession):
    return StatutoryRegisterCheckOut.model_validate(_patch(db, StatutoryRegisterCheck, record_id, body, current_user))

@router.delete("/registers/{record_id}", status_code=204)
def delete_register(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, StatutoryRegisterCheck, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 3. LICENCE & REGISTRATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/licenses", response_model=list[LicenceRegistrationOut])
def list_licenses(current_user: CurrentUser, db: DbSession):
    return [LicenceRegistrationOut.model_validate(r) for r in _list_all(db, LicenceRegistration, current_user)]

@router.post("/licenses", response_model=LicenceRegistrationOut, status_code=201)
def create_license(body: LicenceRegistrationCreate, current_user: CurrentUser, db: DbSession):
    return LicenceRegistrationOut.model_validate(_create(db, LicenceRegistration, body, current_user))

@router.patch("/licenses/{record_id}", response_model=LicenceRegistrationOut)
def update_license(record_id: int, body: LicenceRegistrationUpdate, current_user: CurrentUser, db: DbSession):
    return LicenceRegistrationOut.model_validate(_patch(db, LicenceRegistration, record_id, body, current_user))

@router.delete("/licenses/{record_id}", status_code=204)
def delete_license(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, LicenceRegistration, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 4. CONTRACT LABOUR COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/contract-labour", response_model=list[ContractLabourComplianceOut])
def list_contract_labour(current_user: CurrentUser, db: DbSession):
    return [ContractLabourComplianceOut.model_validate(r) for r in _list_all(db, ContractLabourCompliance, current_user)]

@router.post("/contract-labour", response_model=ContractLabourComplianceOut, status_code=201)
def create_contract_labour(body: ContractLabourComplianceCreate, current_user: CurrentUser, db: DbSession):
    return ContractLabourComplianceOut.model_validate(_create(db, ContractLabourCompliance, body, current_user))

@router.patch("/contract-labour/{record_id}", response_model=ContractLabourComplianceOut)
def update_contract_labour(record_id: int, body: ContractLabourComplianceUpdate, current_user: CurrentUser, db: DbSession):
    return ContractLabourComplianceOut.model_validate(_patch(db, ContractLabourCompliance, record_id, body, current_user))

@router.delete("/contract-labour/{record_id}", status_code=204)
def delete_contract_labour(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ContractLabourCompliance, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 5. MINIMUM WAGES COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/min-wages", response_model=list[MinimumWagesComplianceOut])
def list_min_wages(current_user: CurrentUser, db: DbSession):
    return [MinimumWagesComplianceOut.model_validate(r) for r in _list_all(db, MinimumWagesCompliance, current_user)]

@router.post("/min-wages", response_model=MinimumWagesComplianceOut, status_code=201)
def create_min_wages(body: MinimumWagesComplianceCreate, current_user: CurrentUser, db: DbSession):
    return MinimumWagesComplianceOut.model_validate(_create(db, MinimumWagesCompliance, body, current_user))

@router.patch("/min-wages/{record_id}", response_model=MinimumWagesComplianceOut)
def update_min_wages(record_id: int, body: MinimumWagesComplianceUpdate, current_user: CurrentUser, db: DbSession):
    return MinimumWagesComplianceOut.model_validate(_patch(db, MinimumWagesCompliance, record_id, body, current_user))

@router.delete("/min-wages/{record_id}", status_code=204)
def delete_min_wages(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, MinimumWagesCompliance, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 6. PF / ESI COVERAGE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/pf-esi", response_model=list[PfEsiCoverageOut])
def list_pf_esi(current_user: CurrentUser, db: DbSession):
    return [PfEsiCoverageOut.model_validate(r) for r in _list_all(db, PfEsiCoverage, current_user)]

@router.post("/pf-esi", response_model=PfEsiCoverageOut, status_code=201)
def create_pf_esi(body: PfEsiCoverageCreate, current_user: CurrentUser, db: DbSession):
    return PfEsiCoverageOut.model_validate(_create(db, PfEsiCoverage, body, current_user))

@router.patch("/pf-esi/{record_id}", response_model=PfEsiCoverageOut)
def update_pf_esi(record_id: int, body: PfEsiCoverageUpdate, current_user: CurrentUser, db: DbSession):
    return PfEsiCoverageOut.model_validate(_patch(db, PfEsiCoverage, record_id, body, current_user))

@router.delete("/pf-esi/{record_id}", status_code=204)
def delete_pf_esi(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, PfEsiCoverage, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 7. BONUS & GRATUITY
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/bonus-gratuity", response_model=list[BonusGratuityOut])
def list_bonus_gratuity(current_user: CurrentUser, db: DbSession):
    return [BonusGratuityOut.model_validate(r) for r in _list_all(db, BonusGratuity, current_user)]

@router.post("/bonus-gratuity", response_model=BonusGratuityOut, status_code=201)
def create_bonus_gratuity(body: BonusGratuityCreate, current_user: CurrentUser, db: DbSession):
    return BonusGratuityOut.model_validate(_create(db, BonusGratuity, body, current_user))

@router.patch("/bonus-gratuity/{record_id}", response_model=BonusGratuityOut)
def update_bonus_gratuity(record_id: int, body: BonusGratuityUpdate, current_user: CurrentUser, db: DbSession):
    return BonusGratuityOut.model_validate(_patch(db, BonusGratuity, record_id, body, current_user))

@router.delete("/bonus-gratuity/{record_id}", status_code=204)
def delete_bonus_gratuity(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, BonusGratuity, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 8. WORKING HOURS & OVERTIME
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/working-hours", response_model=list[WorkingHoursOvertimeOut])
def list_working_hours(current_user: CurrentUser, db: DbSession):
    return [WorkingHoursOvertimeOut.model_validate(r) for r in _list_all(db, WorkingHoursOvertime, current_user)]

@router.post("/working-hours", response_model=WorkingHoursOvertimeOut, status_code=201)
def create_working_hours(body: WorkingHoursOvertimeCreate, current_user: CurrentUser, db: DbSession):
    return WorkingHoursOvertimeOut.model_validate(_create(db, WorkingHoursOvertime, body, current_user))

@router.patch("/working-hours/{record_id}", response_model=WorkingHoursOvertimeOut)
def update_working_hours(record_id: int, body: WorkingHoursOvertimeUpdate, current_user: CurrentUser, db: DbSession):
    return WorkingHoursOvertimeOut.model_validate(_patch(db, WorkingHoursOvertime, record_id, body, current_user))

@router.delete("/working-hours/{record_id}", status_code=204)
def delete_working_hours(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, WorkingHoursOvertime, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 9. CONTRACTOR PF/ESI VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/contractor-pf-esi", response_model=list[ContractorPfEsiVerificationOut])
def list_contractor_pf_esi(current_user: CurrentUser, db: DbSession):
    return [ContractorPfEsiVerificationOut.model_validate(r) for r in _list_all(db, ContractorPfEsiVerification, current_user)]

@router.post("/contractor-pf-esi", response_model=ContractorPfEsiVerificationOut, status_code=201)
def create_contractor_pf_esi(body: ContractorPfEsiVerificationCreate, current_user: CurrentUser, db: DbSession):
    return ContractorPfEsiVerificationOut.model_validate(_create(db, ContractorPfEsiVerification, body, current_user))

@router.patch("/contractor-pf-esi/{record_id}", response_model=ContractorPfEsiVerificationOut)
def update_contractor_pf_esi(record_id: int, body: ContractorPfEsiVerificationUpdate, current_user: CurrentUser, db: DbSession):
    return ContractorPfEsiVerificationOut.model_validate(_patch(db, ContractorPfEsiVerification, record_id, body, current_user))

@router.delete("/contractor-pf-esi/{record_id}", status_code=204)
def delete_contractor_pf_esi(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ContractorPfEsiVerification, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 10. POSH COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/posh", response_model=list[PoshComplianceOut])
def list_posh(current_user: CurrentUser, db: DbSession):
    return [PoshComplianceOut.model_validate(r) for r in _list_all(db, PoshCompliance, current_user)]

@router.post("/posh", response_model=PoshComplianceOut, status_code=201)
def create_posh(body: PoshComplianceCreate, current_user: CurrentUser, db: DbSession):
    return PoshComplianceOut.model_validate(_create(db, PoshCompliance, body, current_user))

@router.patch("/posh/{record_id}", response_model=PoshComplianceOut)
def update_posh(record_id: int, body: PoshComplianceUpdate, current_user: CurrentUser, db: DbSession):
    return PoshComplianceOut.model_validate(_patch(db, PoshCompliance, record_id, body, current_user))

@router.delete("/posh/{record_id}", status_code=204)
def delete_posh(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, PoshCompliance, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 11. LABOUR WELFARE FUND
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/lwf", response_model=list[LabourWelfareFundOut])
def list_lwf(current_user: CurrentUser, db: DbSession):
    return [LabourWelfareFundOut.model_validate(r) for r in _list_all(db, LabourWelfareFund, current_user)]

@router.post("/lwf", response_model=LabourWelfareFundOut, status_code=201)
def create_lwf(body: LabourWelfareFundCreate, current_user: CurrentUser, db: DbSession):
    return LabourWelfareFundOut.model_validate(_create(db, LabourWelfareFund, body, current_user))

@router.patch("/lwf/{record_id}", response_model=LabourWelfareFundOut)
def update_lwf(record_id: int, body: LabourWelfareFundUpdate, current_user: CurrentUser, db: DbSession):
    return LabourWelfareFundOut.model_validate(_patch(db, LabourWelfareFund, record_id, body, current_user))

@router.delete("/lwf/{record_id}", status_code=204)
def delete_lwf(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, LabourWelfareFund, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 12. RETURN FILING TRACKER
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/returns", response_model=list[ReturnFilingTrackerOut])
def list_returns(current_user: CurrentUser, db: DbSession):
    return [ReturnFilingTrackerOut.model_validate(r) for r in _list_all(db, ReturnFilingTracker, current_user)]

@router.post("/returns", response_model=ReturnFilingTrackerOut, status_code=201)
def create_return(body: ReturnFilingTrackerCreate, current_user: CurrentUser, db: DbSession):
    return ReturnFilingTrackerOut.model_validate(_create(db, ReturnFilingTracker, body, current_user))

@router.patch("/returns/{record_id}", response_model=ReturnFilingTrackerOut)
def update_return(record_id: int, body: ReturnFilingTrackerUpdate, current_user: CurrentUser, db: DbSession):
    return ReturnFilingTrackerOut.model_validate(_patch(db, ReturnFilingTracker, record_id, body, current_user))

@router.delete("/returns/{record_id}", status_code=204)
def delete_return(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ReturnFilingTracker, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 13. INSPECTION NOTICE LOG
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/inspections", response_model=list[InspectionNoticeLogOut])
def list_inspections(current_user: CurrentUser, db: DbSession):
    return [InspectionNoticeLogOut.model_validate(r) for r in _list_all(db, InspectionNoticeLog, current_user)]

@router.post("/inspections", response_model=InspectionNoticeLogOut, status_code=201)
def create_inspection(body: InspectionNoticeLogCreate, current_user: CurrentUser, db: DbSession):
    return InspectionNoticeLogOut.model_validate(_create(db, InspectionNoticeLog, body, current_user))

@router.patch("/inspections/{record_id}", response_model=InspectionNoticeLogOut)
def update_inspection(record_id: int, body: InspectionNoticeLogUpdate, current_user: CurrentUser, db: DbSession):
    return InspectionNoticeLogOut.model_validate(_patch(db, InspectionNoticeLog, record_id, body, current_user))

@router.delete("/inspections/{record_id}", status_code=204)
def delete_inspection(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, InspectionNoticeLog, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 14. WAGE CODE READINESS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/wage-code", response_model=list[WageCodeReadinessOut])
def list_wage_code(current_user: CurrentUser, db: DbSession):
    return [WageCodeReadinessOut.model_validate(r) for r in _list_all(db, WageCodeReadiness, current_user)]

@router.post("/wage-code", response_model=WageCodeReadinessOut, status_code=201)
def create_wage_code(body: WageCodeReadinessCreate, current_user: CurrentUser, db: DbSession):
    return WageCodeReadinessOut.model_validate(_create(db, WageCodeReadiness, body, current_user))

@router.patch("/wage-code/{record_id}", response_model=WageCodeReadinessOut)
def update_wage_code(record_id: int, body: WageCodeReadinessUpdate, current_user: CurrentUser, db: DbSession):
    return WageCodeReadinessOut.model_validate(_patch(db, WageCodeReadiness, record_id, body, current_user))

@router.delete("/wage-code/{record_id}", status_code=204)
def delete_wage_code(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, WageCodeReadiness, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# 15. CONTRACT WORKER MASTER
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/contract-workers", response_model=list[ContractWorkerMasterOut])
def list_contract_workers(current_user: CurrentUser, db: DbSession):
    return [ContractWorkerMasterOut.model_validate(r) for r in _list_all(db, ContractWorkerMaster, current_user)]

@router.post("/contract-workers", response_model=ContractWorkerMasterOut, status_code=201)
def create_contract_worker(body: ContractWorkerMasterCreate, current_user: CurrentUser, db: DbSession):
    return ContractWorkerMasterOut.model_validate(_create(db, ContractWorkerMaster, body, current_user))

@router.patch("/contract-workers/{record_id}", response_model=ContractWorkerMasterOut)
def update_contract_worker(record_id: int, body: ContractWorkerMasterUpdate, current_user: CurrentUser, db: DbSession):
    return ContractWorkerMasterOut.model_validate(_patch(db, ContractWorkerMaster, record_id, body, current_user))

@router.delete("/contract-workers/{record_id}", status_code=204)
def delete_contract_worker(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ContractWorkerMaster, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURES 16-25: COMMON AUDIT SHELL ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/dashboard", summary="Feature 16: Module Dashboard & KPIs")
def module_dashboard(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "kpis": {
            "total_audits": 0,
            "open_findings": 0,
            "closed_findings": 0,
            "compliance_pct": 0.0,
            "pending_returns": 0,
            "pf_compliance_pct": 0.0,
            "esi_compliance_pct": 0.0,
            "contract_workers": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
        },
        "status": "placeholder — wire to real data",
    }


@router.get("/scope", summary="Feature 17: Scope & Audit Universe")
def audit_scope(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "auditable_units": [
            {"unit": "Factory Act Compliance", "entity": "All Sites", "in_scope": True},
            {"unit": "PF/ESI Compliance", "entity": "All Sites", "in_scope": True},
            {"unit": "Contract Labour", "entity": "All Sites", "in_scope": True},
            {"unit": "POSH Compliance", "entity": "All Sites", "in_scope": True},
            {"unit": "Minimum Wages", "entity": "State-wise", "in_scope": True},
            {"unit": "Working Hours & OT", "entity": "All Sites", "in_scope": True},
        ],
        "status": "placeholder — wire to platform audit_universe table",
    }


@router.get("/rcm", summary="Feature 18: Risk & Control Matrix")
def risk_control_matrix(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "rcm_entries": [
            {
                "risk_id": "LC-R01",
                "risk": "Non-compliance with PF/ESI deposit deadlines",
                "control": "Monthly reconciliation of challans",
                "assertion": "Completeness",
                "owner": "HR Manager",
                "frequency": "Monthly",
            },
            {
                "risk_id": "LC-R02",
                "risk": "Payment below minimum wages",
                "control": "Quarterly wage audit vs state notified rates",
                "assertion": "Accuracy",
                "owner": "Payroll Manager",
                "frequency": "Quarterly",
            },
            {
                "risk_id": "LC-R03",
                "risk": "Expired licences / registrations",
                "control": "Licence expiry tracker with 30-day reminders",
                "assertion": "Rights & Obligations",
                "owner": "Compliance Officer",
                "frequency": "Monthly",
            },
            {
                "risk_id": "LC-R04",
                "risk": "Contract labour without valid CLRA licence",
                "control": "Contractor licence verification register",
                "assertion": "Existence",
                "owner": "HR Manager",
                "frequency": "Quarterly",
            },
            {
                "risk_id": "LC-R05",
                "risk": "POSH non-compliance — no ICC or training",
                "control": "Annual POSH compliance checklist",
                "assertion": "Completeness",
                "owner": "POSH Committee Chair",
                "frequency": "Annual",
            },
        ],
        "status": "placeholder — wire to platform RCM table",
    }


@router.get("/test-rules", summary="Feature 19: Test & Analytics Rule Library")
def test_rules(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "rules": [
            {"rule_id": "LC-RULE-01", "name": "PF deposit delay > 15 days", "threshold": 15, "active": True},
            {"rule_id": "LC-RULE-02", "name": "ESI deposit delay > 15 days", "threshold": 15, "active": True},
            {"rule_id": "LC-RULE-03", "name": "Wage < minimum wage for state/category", "threshold": 0, "active": True},
            {"rule_id": "LC-RULE-04", "name": "Licence expiry within 30 days", "threshold": 30, "active": True},
            {"rule_id": "LC-RULE-05", "name": "OT hours > 60 hours/month", "threshold": 60, "active": True},
            {"rule_id": "LC-RULE-06", "name": "Contract worker without valid agreement", "threshold": None, "active": True},
        ],
        "status": "placeholder — wire to platform analytics_rules table",
    }


@router.get("/data-sources", summary="Feature 20: Data Source & Connector Setup")
def data_sources(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "sources": [
            {"name": "ERP Payroll Module", "type": "database", "status": "connected"},
            {"name": "PF ECR File Upload", "type": "file_upload", "status": "available"},
            {"name": "ESI Return File", "type": "file_upload", "status": "available"},
            {"name": "Attendance System API", "type": "api", "status": "pending"},
            {"name": "Contractor Master", "type": "database", "status": "connected"},
        ],
        "status": "placeholder — wire to platform data_connectors table",
    }


@router.get("/sampling", summary="Feature 21: Sampling & Population Builder")
def sampling(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "populations": [
            {"name": "All Employees — PF/ESI Check", "count": 0, "method": "statistical"},
            {"name": "Contract Workers — Compliance", "count": 0, "method": "100%_coverage"},
            {"name": "High-Wage Employees — Min Wage Check", "count": 0, "method": "judgemental"},
            {"name": "Monthly Returns — Timeliness", "count": 0, "method": "100%_coverage"},
        ],
        "status": "placeholder — wire to platform sampling table",
    }


@router.get("/exceptions", summary="Feature 22: Exception & Red-Flag Queue")
def exceptions_queue(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "exceptions": [],
        "summary": {
            "total": 0,
            "open": 0,
            "in_progress": 0,
            "resolved": 0,
            "false_positive": 0,
        },
        "status": "placeholder — wire to platform exception_queue table",
    }


@router.get("/working-papers", summary="Feature 23: Working Papers & Evidence")
def working_papers(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "papers": [],
        "summary": {
            "total_papers": 0,
            "reviewed": 0,
            "pending_review": 0,
        },
        "status": "placeholder — wire to platform working_papers table",
    }


@router.get("/findings", summary="Feature 24: Observation & Finding Log")
def findings_log(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "findings": [],
        "summary": {
            "total": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        },
        "status": "placeholder — wire to platform findings table",
    }


@router.get("/remediation", summary="Feature 25: Remediation / Action Tracker")
def remediation_tracker(current_user: CurrentUser, db: DbSession):
    return {
        "module": "labour_compliance",
        "actions": [],
        "summary": {
            "total": 0,
            "open": 0,
            "overdue": 0,
            "closed": 0,
            "re_testing": 0,
        },
        "status": "placeholder — wire to platform remediation table",
    }
