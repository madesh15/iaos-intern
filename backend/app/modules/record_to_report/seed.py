"""Seed data for the Record-to-Report module — populates ALL 9 tables."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
import random

from sqlalchemy.orm import Session

from .models import (
    R2RRule,
    JournalEntry,
    R2RException,
    R2RReconciliation,
    R2RCloseTask,
    R2RFinding,
    R2RWorkpaper,
    R2RAction,
    R2RAuditScope,
)


DEFAULT_RULES = [
    {"rule_code": "R2R-001", "rule_name": "Manual JE Risk", "category": "manual_entry", "severity": "high", "description": "High-risk manual journal entries"},
    {"rule_code": "R2R-002", "rule_name": "Odd Hour Posting", "category": "timing", "severity": "medium", "description": "JEs posted outside business hours"},
    {"rule_code": "R2R-003", "rule_name": "Blank Narration", "category": "narration", "severity": "medium", "description": "JEs with missing narration"},
    {"rule_code": "R2R-004", "rule_name": "Sensitive Account", "category": "account", "severity": "high", "description": "Postings to sensitive accounts"},
    {"rule_code": "R2R-005", "rule_name": "Round Number", "category": "amount", "severity": "low", "description": "Round number journal entries"},
    {"rule_code": "R2R-006", "rule_name": "SOP Violation", "category": "sod", "severity": "critical", "description": "Segregation of duties violation"},
    {"rule_code": "R2R-007", "rule_name": "Recurring JE", "category": "pattern", "severity": "low", "description": "Recurring journal entries"},
    {"rule_code": "R2R-008", "rule_name": "Reversal Pattern", "category": "pattern", "severity": "medium", "description": "Same-day reversal pattern"},
    {"rule_code": "R2R-009", "rule_name": "Post Close Entry", "category": "timing", "severity": "critical", "description": "Entries posted after period close"},
    {"rule_code": "R2R-010", "rule_name": "Suspense Ageing", "category": "account", "severity": "high", "description": "Suspense accounts open > 30 days"},
    {"rule_code": "R2R-011", "rule_name": "GL Subledger Diff", "category": "reconciliation", "severity": "high", "description": "GL vs subledger differences"},
    {"rule_code": "R2R-012", "rule_name": "Intercompany Mismatch", "category": "elimination", "severity": "medium", "description": "Unmatched intercompany entries"},
]


def seed_rules(db: Session, tenant_id: int) -> int:
    existing = db.query(R2RRule).filter(R2RRule.tenant_id == tenant_id).count()
    if existing > 0:
        return 0
    count = 0
    for rule in DEFAULT_RULES:
        db.add(R2RRule(tenant_id=tenant_id, **rule, is_active=True))
        count += 1
    db.commit()
    return count


def seed_sample_data(db: Session, tenant_id: int) -> dict:
    now = datetime.now(timezone.utc)

    accounts = [
        ("1001", "Cash in Bank", "asset"),
        ("2001", "Accounts Payable", "liability"),
        ("3001", "Revenue - Domestic", "revenue"),
        ("4001", "COGS", "expense"),
        ("5001", "Salary Expense", "expense"),
        ("6001", "Depreciation", "expense"),
        ("7001", "Suspense Account", "suspense"),
        ("8001", "Intercompany Receivable", "asset"),
        ("9001", "Provision for Warranties", "liability"),
        ("10010", "Inventory Adjustment", "expense"),
    ]
    users = [
        ("U001", "Rajesh Kumar"),
        ("U002", "Priya Sharma"),
        ("U003", "Amit Patel"),
        ("U004", "Sneha Reddy"),
        ("U005", "Vikram Singh"),
    ]
    narrations = [
        "Monthly salary provision", "Vendor payment - Apollo",
        "Revenue recognition Q4", "Depreciation entry",
        "Intercompany elimination", "Suspense clearing",
        "Inventory write-off", "Provision adjustment",
        "Manual correction", "Tax provision",
        "Bonus accrual", "Audit fee accrual",
        "", "", "test", "misc",
    ]

    created_journals = db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id).all()
    journals_exist = len(created_journals) > 0

    # ---- 1. Journal Entries (200) ----
    if not journals_exist:
        journals = []
        for i in range(200):
            days_ago = random.randint(0, 180)
            je_date = now - timedelta(days=days_ago)
            acct = random.choice(accounts)
            user = random.choice(users)
            amount = round(random.uniform(500, 500000), 2)
            narration = random.choice(narrations)
            je = JournalEntry(
                tenant_id=tenant_id,
                je_number=f"JE-2025{i + 1:05d}",
                je_date=je_date,
                period=je_date.strftime("%Y-%m"),
                fiscal_year=je_date.year,
                company_code="1000",
                business_unit="Finance",
                account_code=acct[0],
                account_name=acct[1],
                account_type=random.choice(["debit", "credit"]),
                debit_amount=amount if random.random() > 0.5 else 0,
                credit_amount=amount if random.random() <= 0.5 else 0,
                currency="INR",
                narration=narration,
                user_id=user[0],
                user_name=user[1],
                posting_time=je_date,
                posting_type="manual" if random.random() > 0.6 else "system",
                status="posted" if random.random() > 0.05 else "reversed",
                is_post_close=random.random() > 0.95,
                is_suspense=acct[2] == "suspense",
                source_file=f"upload_{random.choice(['jan','feb','mar','apr','may','jun'])}.csv",
            )
            journals.append(je)
        db.add_all(journals)
        db.commit()
        created_journals = db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id).all()

    # ---- 2. Exceptions (40) ----
    if db.query(R2RException).filter(R2RException.tenant_id == tenant_id).count() == 0:
        exceptions = []
        for je in created_journals[:40]:
            exceptions.append(R2RException(
                tenant_id=tenant_id,
                journal_entry_id=je.id,
                category=random.choice(["manual_entry", "timing", "narration", "amount", "sod", "reconciliation"]),
                severity=random.choice(["low", "medium", "high", "critical"]),
                description=f"Exception detected for JE {je.je_number}",
                status=random.choice(["open", "open", "open", "in_review", "resolved"]),
                owner=random.choice(["U001", "U002", "U003"]),
            ))
        db.add_all(exceptions)
        db.commit()

    # ---- 3. Reconciliations (10) ----
    if db.query(R2RReconciliation).filter(R2RReconciliation.tenant_id == tenant_id).count() == 0:
        recons = []
        for acct in random.sample(accounts, 10):
            gl = round(random.uniform(10000, 1000000), 2)
            diff = round(random.uniform(-5000, 5000), 2)
            recons.append(R2RReconciliation(
                tenant_id=tenant_id, account_code=acct[0], account_name=acct[1],
                gl_balance=gl, subledger_balance=gl - diff, difference=diff,
                status=random.choice(["open", "open", "in_progress", "approved", "approved"]),
                owner=random.choice(["U001", "U002"]),
                notes=random.choice([None, "Reviewed by finance team", "Pending management approval"]),
            ))
        db.add_all(recons)
        db.commit()

    # ---- 4. Close Tasks (24) ----
    if db.query(R2RCloseTask).filter(R2RCloseTask.tenant_id == tenant_id).count() == 0:
        tasks = []
        task_names = ["GL Close", "Subledger Reconciliation", "Intercompany Elimination",
                      "Revenue Recognition", "Depreciation Run", "Payroll Accrual"]
        for m in range(4):
            d = now - timedelta(days=30 * m)
            period = d.strftime("%Y-%m")
            for tn in task_names:
                is_done = random.random() > 0.3
                tasks.append(R2RCloseTask(
                    tenant_id=tenant_id, period=period, task_name=tn,
                    description=f"Period-end {tn.lower()} for {period}",
                    owner=random.choice(["U001", "U002", "U003"]),
                    status="completed" if is_done else random.choice(["pending", "in_progress", "delayed"]),
                    due_date=d + timedelta(days=5),
                    completed_date=d + timedelta(days=4) if is_done else None,
                    priority=random.choice(["high", "medium", "low"]),
                    category="period_end",
                    is_delayed=random.random() > 0.85,
                    remarks=random.choice([None, "Reviewed", "Approved by controller"]),
                ))
        db.add_all(tasks)
        db.commit()

    # ---- 5. Findings (15) ----
    if db.query(R2RFinding).filter(R2RFinding.tenant_id == tenant_id).count() == 0:
        finding_titles = [
            "Unmatched intercompany balances", "Late posting of salary provision",
            "Suspense account not cleared", "Manual journal entries without approval",
            "Duplicate vendor payments detected", "Revenue recognition timing issue",
            "Depreciation not run for asset additions", "Foreign exchange revaluation gap",
            "Payroll accrual discrepancy", "Inventory valuation inconsistency",
            "Tax provision understated", "Provision for warranties excessive",
            "Round number entries pattern", "Odd-hour posting by senior management",
            "Segregation of duties violation in AP",
        ]
        categories = ["reconciliation", "compliance", "accuracy", "timing", "authorization"]
        findings = []
        for i, title in enumerate(finding_titles):
            is_closed = random.random() > 0.6
            findings.append(R2RFinding(
                tenant_id=tenant_id, title=title,
                description=f"Observation: {title}. Requires management remediation.",
                category=random.choice(categories),
                risk_rating=random.choice(["high", "medium", "low"]),
                status="closed" if is_closed else random.choice(["open", "in_progress"]),
                owner=random.choice(["U001", "U002", "U003", "U004"]),
                recommendation=f"Implement controls to prevent recurrence of {title.lower()}",
                audit_period="2025-Q4",
                related_je_id=created_journals[i % len(created_journals)].id if created_journals else None,
                created_date=now - timedelta(days=random.randint(10, 90)),
                closed_date=(now - timedelta(days=random.randint(1, 10))) if is_closed else None,
            ))
        db.add_all(findings)
        db.commit()

    # ---- 6. Workpapers (12) ----
    if db.query(R2RWorkpaper).filter(R2RWorkpaper.tenant_id == tenant_id).count() == 0:
        wp_data = [
            ("JE Risk Scoring Worksheet", "Select all JEs with posting_type = manual and risk_score > 70."),
            ("Odd Hour Posting Analysis", "Filter JEs posted outside 08:00-18:00. Obtain management explanation."),
            ("Blank Narration Exceptions", "Extract JEs with narration = blank or < 5 characters."),
            ("Sensitive Account Review", "Cross-reference account names against sensitive keyword list."),
            ("Top Value JE Sample", "Rank all JEs by max(debit, credit) descending. Select top 20."),
            ("Suspense Account Ageing", "List all suspense account balances > 30 days old."),
            ("Post Close Entry Review", "Identify all JEs with is_post_close = true."),
            ("Round Number Detection", "Flag all JEs where amount is divisible by 1000, 5000, 10000."),
            ("SOD Violation Analysis", "Map users to posting types. Flag users with prepare + approve."),
            ("Recurring JE Pattern Review", "Group JEs by (narration, amount). Flag groups with count > 1."),
            ("Reversal Pattern Investigation", "Match posted JEs with same-amount reversals within 2 days."),
            ("Intercompany Elimination Check", "Compare intercompany account balances across entities."),
        ]
        workpapers = []
        for title, proc in wp_data:
            is_final = random.random() > 0.4
            workpapers.append(R2RWorkpaper(
                tenant_id=tenant_id, title=title,
                description=f"Audit workpaper for {title.lower()}",
                procedure=proc,
                status="final" if is_final else random.choice(["draft", "in_review"]),
                prepared_by=random.choice(["U001", "U002", "U003"]),
                reviewed_by=random.choice(["U004", "U005", None]),
                conclusion=random.choice([
                    "No material exceptions found",
                    "Exceptions noted - management response pending",
                    "Remediation completed",
                    "Follow-up required next quarter",
                ]),
                audit_period="2025-Q4",
                created_date=now - timedelta(days=random.randint(5, 60)),
                modified_date=now - timedelta(days=random.randint(0, 5)),
            ))
        db.add_all(workpapers)
        db.commit()

    # ---- 7. Actions / CAPA (10) ----
    if db.query(R2RAction).filter(R2RAction.tenant_id == tenant_id).count() == 0:
        action_titles = [
            "Implement automated JE approval workflow",
            "Enforce narration minimum length validation",
            "Restrict post-close posting to authorized users only",
            "Deploy real-time SOD monitoring",
            "Automate suspense account daily clearing",
            "Implement round-number threshold alerts",
            "Restrict odd-hour posting to admin roles",
            "Deploy intercompany matching engine",
            "Automate GL-subledger reconciliation",
            "Implement JE pattern anomaly detection",
        ]
        actions = []
        for title in action_titles:
            is_done = random.random() > 0.5
            due = now + timedelta(days=random.randint(-30, 60))
            actions.append(R2RAction(
                tenant_id=tenant_id, title=title,
                description=f"Corrective action: {title}",
                action_type=random.choice(["corrective", "preventive", "detective"]),
                priority=random.choice(["high", "medium", "low"]),
                status="completed" if is_done else random.choice(["open", "in_progress", "overdue"]),
                owner=random.choice(["U001", "U002", "U003", "U004"]),
                due_date=due,
                completed_date=(due - timedelta(days=random.randint(1, 10))) if is_done else None,
                evidence="Implemented and verified" if is_done else None,
                is_overdue=(not is_done and due < now),
                created_date=now - timedelta(days=random.randint(10, 60)),
            ))
        db.add_all(actions)
        db.commit()

    # ---- 8. Audit Scopes (5) ----
    if db.query(R2RAuditScope).filter(R2RAuditScope.tenant_id == tenant_id).count() == 0:
        scopes = [
            ("Q4 2025 Financial Close", "Acme Corp", "Finance", "All plants", "Mumbai", "2025-10-01", "2025-12-31", "active"),
            ("FY2025 Revenue Recognition", "Acme Corp", "Revenue", "HQ Office", "Delhi", "2025-01-01", "2025-12-31", "active"),
            ("Intercompany Elimination Review", "Acme Corp", "Group Finance", "All units", "Bangalore", "2025-07-01", "2025-12-31", "active"),
            ("Suspense Account Clearance", "Acme Corp", "Treasury", "Main plant", "Chennai", "2025-10-01", "2025-12-31", "draft"),
            ("Payroll Compliance Audit", "Acme Corp", "HR & Payroll", "All plants", "Pune", "2025-07-01", "2025-09-30", "completed"),
        ]
        for name, entity, bu, plant, loc, pf, pt, st in scopes:
            db.add(R2RAuditScope(
                tenant_id=tenant_id, scope_name=name, entity=entity,
                business_unit=bu, plant=plant, location=loc,
                period_from=pf, period_to=pt, status=st,
                description=f"Audit scope for {name.lower()}",
            ))
        db.commit()

    return {
        "rules": seed_rules(db, tenant_id),
        "journals": len(created_journals),
        "exceptions": db.query(R2RException).filter(R2RException.tenant_id == tenant_id).count(),
        "reconciliations": db.query(R2RReconciliation).filter(R2RReconciliation.tenant_id == tenant_id).count(),
        "close_tasks": db.query(R2RCloseTask).filter(R2RCloseTask.tenant_id == tenant_id).count(),
        "findings": db.query(R2RFinding).filter(R2RFinding.tenant_id == tenant_id).count(),
        "workpapers": db.query(R2RWorkpaper).filter(R2RWorkpaper.tenant_id == tenant_id).count(),
        "actions": db.query(R2RAction).filter(R2RAction.tenant_id == tenant_id).count(),
        "scopes": db.query(R2RAuditScope).filter(R2RAuditScope.tenant_id == tenant_id).count(),
    }
