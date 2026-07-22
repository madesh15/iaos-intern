from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped
from .models import ContractWorker, ComplianceException, LabourComplianceRegistry
from .schemas import (
    ContractWorkerCreate, ContractWorkerUpdate, ContractWorkerOut,
    ComplianceExceptionCreate, ComplianceExceptionUpdate, ComplianceExceptionOut,
    RegistryItemCreate, RegistryItemUpdate, RegistryItemOut,
    DashboardSummaryOut
)

MANIFEST = {
    "name": "labour_law_pf_esi",
    "title": "Labour Law & PF/ESI",
    "description": "Labour Law & PF/ESI compliance and contractor auditing.",
    "icon": "scale",
    "group": "Tax, Legal & Compliance",
    "industry": "",
    "version": "0.1.0",
    "owner": "fullstack-architect",
}

router = APIRouter()


def seed_default_registry_items(db: Session, tenant_id: int):
    # Check if we already have items for this tenant
    existing_count = db.query(LabourComplianceRegistry).filter(LabourComplianceRegistry.tenant_id == tenant_id).count()
    if existing_count > 0:
        return

    defaults = [
        # APPLICABILITY
        ("APPLICABILITY", "Contract Labour (Regulation & Abolition) Act - Applicability Verification", "CLRA Act, 1970", "Annual", "COMPLIANT", "HR Compliance Head", "Applicable if 20 or more contract workers are employed"),
        ("APPLICABILITY", "PF & ESI Establishment Applicability Audit", "EPF Act 1952 & ESI Act 1948", "Annual", "COMPLIANT", "Finance Director", "Applicable if 10/20 or more employees are employed"),
        ("APPLICABILITY", "Shops & Commercial Establishments Act Applicability Mapping", "State Shops & Establishments Act", "One-time", "COMPLIANT", "Legal Advisor", "Ensures compliance with local state rules"),

        # LICENCE
        ("LICENCE", "Contractor Operating License (Form VI) Registration", "CLRA Act, 1970 - Section 12", "Annual", "PENDING_RENEWAL", "Security/Admins", "Requires active verification of contractor's sub-licenses"),
        ("LICENCE", "Principal Employer Registration Certificate (Form I)", "CLRA Act, 1970 - Section 7", "One-time", "COMPLIANT", "Operations VP", "Certificate of registration as Principal Employer"),

        # REGISTERS
        ("REGISTERS", "Form A - Register of Wages", "Code on Wages, 2019 / Minimum Wages Act", "Monthly", "COMPLIANT", "Payroll Manager", "Ensures wages paid match national/state minimum wage limits"),
        ("REGISTERS", "Form D - Muster Roll Register", "Factories Act, 1948", "Monthly", "COMPLIANT", "Plant Manager", "Attendance tracker for daily workers"),
        ("REGISTERS", "Form C - Register of Bonus", "Payment of Bonus Act, 1965", "Annual", "COMPLIANT", "HR Manager", "Bonus calculations and payment register"),
        ("REGISTERS", "Form I & Form II - Register of Fines & Deductions", "Payment of Wages Act, 1936", "Monthly", "COMPLIANT", "HR Admin", "Maintained for any payroll fines/deductions applied"),
        ("REGISTERS", "Form L/M - Maternity Benefit Register", "Maternity Benefit Act, 1961", "Monthly", "COMPLIANT", "Medical Officer", "Records maternity leaves and benefit payments"),
        ("REGISTERS", "Form D - Equal Remuneration Register", "Equal Remuneration Act, 1976", "Monthly", "COMPLIANT", "HR Specialist", "Ensures gender wage equality across worker cadres"),

        # NOTICES
        ("NOTICES", "Form V - Notice of Commencement of Work", "CLRA Act, 1970 - Rule 25", "Monthly", "NON_COMPLIANT", "Contract Owner", "Submission to Labour Commissioner"),
        ("NOTICES", "Notice of Abstract of Acts (PF/ESI/Min Wages) on Board", "Various Labour Laws", "One-time", "COMPLIANT", "Facilities Manager", "Physical displays at prominent entry points"),
        ("NOTICES", "Form U - Notice of Opening of Establishment", "Payment of Gratuity Act, 1972", "One-time", "COMPLIANT", "General Counsel", "Required to be sent to the controlling authority")
    ]

    for reg_type, name, law, freq, status, owner, notes in defaults:
        item = LabourComplianceRegistry(
            registry_type=reg_type,
            compliance_name=name,
            reference_law=law,
            frequency=freq,
            status=status,
            assigned_owner=owner,
            notes=notes,
            tenant_id=tenant_id
        )
        db.add(item)
    db.commit()


def seed_default_workers_and_exceptions(db: Session, tenant_id: int):
    # Workers
    worker_count = db.query(ContractWorker).filter(ContractWorker.tenant_id == tenant_id).count()
    if worker_count == 0:
        workers = [
            ContractWorker(contractor_name="Apex Logistics", worker_name="Ramesh Kumar", uan="100234561234", esic_ip="2012938475", wage_rate=450.0, category="Semi-Skilled", doj=date(2025, 3, 10), status="Active", tenant_id=tenant_id),
            ContractWorker(contractor_name="Apex Logistics", worker_name="Suresh Singh", uan="100234561235", esic_ip="2012938476", wage_rate=320.0, category="Unskilled", doj=date(2025, 4, 15), status="Active", tenant_id=tenant_id),
            ContractWorker(contractor_name="Vanguard Facilities", worker_name="Amit Patel", uan="100987654321", esic_ip="2019876543", wage_rate=650.0, category="Skilled", doj=date(2024, 11, 1), status="Active", tenant_id=tenant_id),
            ContractWorker(contractor_name="Vanguard Facilities", worker_name="Priya Sharma", uan="100987654322", esic_ip="2019876544", wage_rate=280.0, category="Unskilled", doj=date(2025, 5, 20), status="Active", tenant_id=tenant_id),
            ContractWorker(contractor_name="Delta Security Services", worker_name="Vijay Yadav", uan="100112233445", esic_ip="2011122334", wage_rate=520.0, category="Skilled", doj=date(2025, 1, 5), status="Active", tenant_id=tenant_id)
        ]
        db.add_all(workers)
        db.commit()

    # Exceptions
    exc_count = db.query(ComplianceException).filter(ComplianceException.tenant_id == tenant_id).count()
    if exc_count == 0:
        exceptions = [
            ComplianceException(
                exception_type="MIN_WAGE_VIOLATION",
                severity="HIGH",
                description="Worker Priya Sharma was paid Rs. 280/day, which is below the statutory minimum wage threshold of Rs. 350/day for Unskilled contract labor in Haryana.",
                contractor_name="Vanguard Facilities",
                worker_uan="100987654322",
                status="OPEN",
                tenant_id=tenant_id
            ),
            ComplianceException(
                exception_type="MISSING_PF_PROOF",
                severity="MEDIUM",
                description="EPF ECR filing proof or Challan payment confirmation was not uploaded by contractor Apex Logistics for Suresh Singh for the month of May 2026.",
                contractor_name="Apex Logistics",
                worker_uan="100234561235",
                status="OPEN",
                tenant_id=tenant_id
            )
        ]
        db.add_all(exceptions)
        db.commit()


# Dashboard Summary Route
@router.get("/dashboard-summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(current_user: CurrentUser, db: DbSession):
    # Ensure default data is seeded first
    seed_default_registry_items(db, current_user.tenant_id)
    seed_default_workers_and_exceptions(db, current_user.tenant_id)

    # Dynamic KPI Aggregation
    exceptions = tenant_scoped(db.query(ComplianceException), current_user).all()
    open_exceptions = [e for e in exceptions if e.status == "OPEN"]
    open_exception_count = len(open_exceptions)

    pending_capa_count = len([e for e in open_exceptions if not e.capa_plan or e.capa_plan.strip() == ""])

    # Calculate Live Risk Index: Base 100, deduct based on open exceptions severity
    # HIGH = -15, MEDIUM = -8, LOW = -3. Cap at 0.
    risk_index = 100.0
    for exc in open_exceptions:
        if exc.severity == "HIGH":
            risk_index -= 15.0
        elif exc.severity == "MEDIUM":
            risk_index -= 8.0
        else:
            risk_index -= 3.0
    risk_index = max(0.0, risk_index)

    # Calculate Coverage Percent
    registry_items = tenant_scoped(db.query(LabourComplianceRegistry), current_user).all()
    total_reg = len(registry_items)
    if total_reg == 0:
        coverage_pct = 100.0
    else:
        compliant_count = len([r for r in registry_items if r.status == "COMPLIANT"])
        coverage_pct = (compliant_count / total_reg) * 100.0

    return DashboardSummaryOut(
        live_risk_index=risk_index,
        coverage_pct=round(coverage_pct, 1),
        open_exception_count=open_exception_count,
        pending_capa_count=pending_capa_count
    )


# Parameterized CRUD: Labour Compliance Registry
@router.get("/registry/{registry_type}", response_model=List[RegistryItemOut])
def list_registry(registry_type: str, current_user: CurrentUser, db: DbSession):
    # Ensure default data is seeded
    seed_default_registry_items(db, current_user.tenant_id)

    q = tenant_scoped(db.query(LabourComplianceRegistry), current_user).filter(
        LabourComplianceRegistry.registry_type == registry_type.upper()
    )
    return [RegistryItemOut.model_validate(r) for r in q.all()]


@router.post("/registry/{registry_type}", response_model=RegistryItemOut, status_code=201)
def create_registry_item(registry_type: str, body: RegistryItemCreate, current_user: CurrentUser, db: DbSession):
    item = LabourComplianceRegistry(
        registry_type=registry_type.upper(),
        compliance_name=body.compliance_name,
        reference_law=body.reference_law,
        frequency=body.frequency,
        due_date=body.due_date,
        status=body.status,
        assigned_owner=body.assigned_owner,
        notes=body.notes,
        tenant_id=current_user.tenant_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return RegistryItemOut.model_validate(item)


@router.put("/registry/{registry_type}/{item_id}", response_model=RegistryItemOut)
def update_registry_item(registry_type: str, item_id: int, body: RegistryItemUpdate, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(LabourComplianceRegistry).filter(LabourComplianceRegistry.id == item_id), current_user
    ).first()
    if not item or item.registry_type != registry_type.upper():
        raise HTTPException(404, "Registry item not found")

    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(item, field, val)

    item.last_reviewed = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return RegistryItemOut.model_validate(item)


@router.delete("/registry/{registry_type}/{item_id}", status_code=204)
def delete_registry_item(registry_type: str, item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(LabourComplianceRegistry).filter(LabourComplianceRegistry.id == item_id), current_user
    ).first()
    if not item or item.registry_type != registry_type.upper():
        raise HTTPException(404, "Registry item not found")

    db.delete(item)
    db.commit()


# CRUD: Contract Workers
@router.get("/workers", response_model=List[ContractWorkerOut])
def list_workers(current_user: CurrentUser, db: DbSession):
    seed_default_workers_and_exceptions(db, current_user.tenant_id)
    q = tenant_scoped(db.query(ContractWorker), current_user)
    return [ContractWorkerOut.model_validate(w) for w in q.all()]


@router.post("/workers", response_model=ContractWorkerOut, status_code=201)
def create_worker(body: ContractWorkerCreate, current_user: CurrentUser, db: DbSession):
    worker = ContractWorker(
        contractor_name=body.contractor_name,
        worker_name=body.worker_name,
        uan=body.uan,
        esic_ip=body.esic_ip,
        wage_rate=body.wage_rate,
        category=body.category,
        doj=body.doj,
        status=body.status,
        tenant_id=current_user.tenant_id
    )
    db.add(worker)
    db.commit()
    db.refresh(worker)
    return ContractWorkerOut.model_validate(worker)


@router.put("/workers/{worker_id}", response_model=ContractWorkerOut)
def update_worker(worker_id: int, body: ContractWorkerUpdate, current_user: CurrentUser, db: DbSession):
    worker = tenant_scoped(
        db.query(ContractWorker).filter(ContractWorker.id == worker_id), current_user
    ).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(worker, field, val)

    db.commit()
    db.refresh(worker)
    return ContractWorkerOut.model_validate(worker)


@router.delete("/workers/{worker_id}", status_code=204)
def delete_worker(worker_id: int, current_user: CurrentUser, db: DbSession):
    worker = tenant_scoped(
        db.query(ContractWorker).filter(ContractWorker.id == worker_id), current_user
    ).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    db.delete(worker)
    db.commit()


# CRUD: Compliance Exceptions
@router.get("/exceptions", response_model=List[ComplianceExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    seed_default_workers_and_exceptions(db, current_user.tenant_id)
    q = tenant_scoped(db.query(ComplianceException), current_user)
    return [ComplianceExceptionOut.model_validate(e) for e in q.all()]


@router.post("/exceptions", response_model=ComplianceExceptionOut, status_code=201)
def create_exception(body: ComplianceExceptionCreate, current_user: CurrentUser, db: DbSession):
    exc = ComplianceException(
        exception_type=body.exception_type,
        severity=body.severity,
        description=body.description,
        contractor_name=body.contractor_name,
        worker_uan=body.worker_uan,
        status=body.status,
        capa_plan=body.capa_plan,
        tenant_id=current_user.tenant_id
    )
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return ComplianceExceptionOut.model_validate(exc)


@router.patch("/exceptions/{exception_id}", response_model=ComplianceExceptionOut)
def update_exception(exception_id: int, body: ComplianceExceptionUpdate, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(
        db.query(ComplianceException).filter(ComplianceException.id == exception_id), current_user
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")

    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(exc, field, val)

    db.commit()
    db.refresh(exc)
    return ComplianceExceptionOut.model_validate(exc)


@router.delete("/exceptions/{exception_id}", status_code=204)
def delete_exception(exception_id: int, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(
        db.query(ComplianceException).filter(ComplianceException.id == exception_id), current_user
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")

    db.delete(exc)
    db.commit()
