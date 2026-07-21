"""Module API for Project Cost & RERA Compliance.

Mounted automatically at /api/modules/project_cost_rera.
All routes are tenant-isolated via tenant_scoped() + CurrentUser.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    ReraEscrowRecord, ProjectCostBudget, WithdrawalCertificate,
    FundDiversionRecord, BuyerCollection, RevenueRecognition,
    CostToComplete, ContractorBill, ApprovalSanction, UnsoldInventory,
    CustomerAdvance, RegistrationPossession, InterestPenalty,
    LandCostTitle, ProjectCashflow,
)
from .schemas import (
    ReraEscrowCreate, ReraEscrowOut,
    ProjectCostBudgetCreate, ProjectCostBudgetOut,
    WithdrawalCertificateCreate, WithdrawalCertificateOut,
    FundDiversionCreate, FundDiversionOut,
    BuyerCollectionCreate, BuyerCollectionOut,
    RevenueRecognitionCreate, RevenueRecognitionOut,
    CostToCompleteCreate, CostToCompleteOut,
    ContractorBillCreate, ContractorBillOut,
    ApprovalSanctionCreate, ApprovalSanctionOut,
    UnsoldInventoryCreate, UnsoldInventoryOut,
    CustomerAdvanceCreate, CustomerAdvanceOut,
    RegistrationPossessionCreate, RegistrationPossessionOut,
    InterestPenaltyCreate, InterestPenaltyOut,
    LandCostTitleCreate, LandCostTitleOut,
    ProjectCashflowCreate, ProjectCashflowOut,
)

MANIFEST = {
    "name": "project_cost_rera",
    "title": "Project Cost & RERA Compliance",
    "description": "RERA escrow discipline, project-cost control, revenue recognition and buyer-fund governance for real-estate projects.",
    "icon": "building",
    "group": "Industry Packs",
    "industry": "Real Estate",
    "version": "1.0.0",
    "owner": "intern-77",
}

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper: generic CRUD factory
# ---------------------------------------------------------------------------
def _crud(model, create_schema, out_schema, label: str):
    """Return a (list_fn, create_fn, delete_fn) tuple for a single resource."""

    def _list(current_user: CurrentUser, db: DbSession):
        q = tenant_scoped(db.query(model), current_user).order_by(model.id.desc())
        return [out_schema.model_validate(r) for r in q.all()]

    def _create(body: create_schema, current_user: CurrentUser, db: DbSession):
        obj = model(**body.model_dump(), tenant_id=current_user.tenant_id)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return out_schema.model_validate(obj)

    def _delete(item_id: int, current_user: CurrentUser, db: DbSession):
        obj = tenant_scoped(
            db.query(model).filter(model.id == item_id), current_user
        ).first()
        if not obj:
            raise HTTPException(404, f"{label} not found")
        db.delete(obj)
        db.commit()

    return _list, _create, _delete


# --- 1. RERA Escrow ---
_list, _create, _delete = _crud(ReraEscrowRecord, ReraEscrowCreate, ReraEscrowOut, "Escrow record")
router.get("/escrow", response_model=list[ReraEscrowOut])(_list)
router.post("/escrow", response_model=ReraEscrowOut, status_code=201)(_create)
router.delete("/escrow/{item_id}", status_code=204)(_delete)

# --- 2. Project Cost Budget ---
_list, _create, _delete = _crud(ProjectCostBudget, ProjectCostBudgetCreate, ProjectCostBudgetOut, "Budget")
router.get("/budgets", response_model=list[ProjectCostBudgetOut])(_list)
router.post("/budgets", response_model=ProjectCostBudgetOut, status_code=201)(_create)
router.delete("/budgets/{item_id}", status_code=204)(_delete)

# --- 3. Withdrawal Certificate ---
_list, _create, _delete = _crud(WithdrawalCertificate, WithdrawalCertificateCreate, WithdrawalCertificateOut, "Certificate")
router.get("/withdrawals", response_model=list[WithdrawalCertificateOut])(_list)
router.post("/withdrawals", response_model=WithdrawalCertificateOut, status_code=201)(_create)
router.delete("/withdrawals/{item_id}", status_code=204)(_delete)

# --- 4. Fund Diversion ---
_list, _create, _delete = _crud(FundDiversionRecord, FundDiversionCreate, FundDiversionOut, "Diversion")
router.get("/diversions", response_model=list[FundDiversionOut])(_list)
router.post("/diversions", response_model=FundDiversionOut, status_code=201)(_create)
router.delete("/diversions/{item_id}", status_code=204)(_delete)

# --- 5. Buyer Collection ---
_list, _create, _delete = _crud(BuyerCollection, BuyerCollectionCreate, BuyerCollectionOut, "Collection")
router.get("/collections", response_model=list[BuyerCollectionOut])(_list)
router.post("/collections", response_model=BuyerCollectionOut, status_code=201)(_create)
router.delete("/collections/{item_id}", status_code=204)(_delete)

# --- 6. Revenue Recognition ---
_list, _create, _delete = _crud(RevenueRecognition, RevenueRecognitionCreate, RevenueRecognitionOut, "Revenue entry")
router.get("/revenue", response_model=list[RevenueRecognitionOut])(_list)
router.post("/revenue", response_model=RevenueRecognitionOut, status_code=201)(_create)
router.delete("/revenue/{item_id}", status_code=204)(_delete)

# --- 7. Cost to Complete ---
_list, _create, _delete = _crud(CostToComplete, CostToCompleteCreate, CostToCompleteOut, "CTC entry")
router.get("/ctc", response_model=list[CostToCompleteOut])(_list)
router.post("/ctc", response_model=CostToCompleteOut, status_code=201)(_create)
router.delete("/ctc/{item_id}", status_code=204)(_delete)

# --- 8. Contractor Bill ---
_list, _create, _delete = _crud(ContractorBill, ContractorBillCreate, ContractorBillOut, "Bill")
router.get("/bills", response_model=list[ContractorBillOut])(_list)
router.post("/bills", response_model=ContractorBillOut, status_code=201)(_create)
router.delete("/bills/{item_id}", status_code=204)(_delete)

# --- 9. Approval & Sanction ---
_list, _create, _delete = _crud(ApprovalSanction, ApprovalSanctionCreate, ApprovalSanctionOut, "Approval")
router.get("/approvals", response_model=list[ApprovalSanctionOut])(_list)
router.post("/approvals", response_model=ApprovalSanctionOut, status_code=201)(_create)
router.delete("/approvals/{item_id}", status_code=204)(_delete)

# --- 10. Unsold Inventory ---
_list, _create, _delete = _crud(UnsoldInventory, UnsoldInventoryCreate, UnsoldInventoryOut, "Inventory unit")
router.get("/inventory", response_model=list[UnsoldInventoryOut])(_list)
router.post("/inventory", response_model=UnsoldInventoryOut, status_code=201)(_create)
router.delete("/inventory/{item_id}", status_code=204)(_delete)

# --- 11. Customer Advance ---
_list, _create, _delete = _crud(CustomerAdvance, CustomerAdvanceCreate, CustomerAdvanceOut, "Advance")
router.get("/advances", response_model=list[CustomerAdvanceOut])(_list)
router.post("/advances", response_model=CustomerAdvanceOut, status_code=201)(_create)
router.delete("/advances/{item_id}", status_code=204)(_delete)

# --- 12. Registration & Possession ---
_list, _create, _delete = _crud(RegistrationPossession, RegistrationPossessionCreate, RegistrationPossessionOut, "Registration")
router.get("/registrations", response_model=list[RegistrationPossessionOut])(_list)
router.post("/registrations", response_model=RegistrationPossessionOut, status_code=201)(_create)
router.delete("/registrations/{item_id}", status_code=204)(_delete)

# --- 13. Interest / Penalty ---
_list, _create, _delete = _crud(InterestPenalty, InterestPenaltyCreate, InterestPenaltyOut, "Penalty")
router.get("/penalties", response_model=list[InterestPenaltyOut])(_list)
router.post("/penalties", response_model=InterestPenaltyOut, status_code=201)(_create)
router.delete("/penalties/{item_id}", status_code=204)(_delete)

# --- 14. Land Cost & Title ---
_list, _create, _delete = _crud(LandCostTitle, LandCostTitleCreate, LandCostTitleOut, "Land record")
router.get("/land", response_model=list[LandCostTitleOut])(_list)
router.post("/land", response_model=LandCostTitleOut, status_code=201)(_create)
router.delete("/land/{item_id}", status_code=204)(_delete)

# --- 15. Project Cashflow ---
_list, _create, _delete = _crud(ProjectCashflow, ProjectCashflowCreate, ProjectCashflowOut, "Cashflow entry")
router.get("/cashflow", response_model=list[ProjectCashflowOut])(_list)
router.post("/cashflow", response_model=ProjectCashflowOut, status_code=201)(_create)
router.delete("/cashflow/{item_id}", status_code=204)(_delete)
