"""Seed data for the Record-to-Report module."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
import random

from sqlalchemy.orm import Session

from .models import R2RRule, JournalEntry, R2RException, R2RReconciliation, R2RCloseTask


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
    existing = db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id).count()
    if existing > 0:
        return {"message": "Sample data already exists"}

    now = datetime.now(timezone.utc)
    accounts = [
        ("1001", "Cash in Bank", "asset"), ("2001", "Accounts Payable", "liability"),
        ("3001", "Revenue - Domestic", "revenue"), ("4001", "COGS", "expense"),
        ("5001", "Salary Expense", "expense"), ("6001", "Depreciation", "expense"),
        ("7001", "Suspense Account", "suspense"), ("8001", "Intercompany Receivable", "asset"),
        ("9001", "Provision for Warranties", "liability"), ("10010", "Inventory Adjustment", "expense"),
    ]
    users = [("U001", "Rajesh Kumar"), ("U002", "Priya Sharma"), ("U003", "Amit Patel"),
             ("U004", "Sneha Reddy"), ("U005", "Vikram Singh")]
    narrations = [
        "Monthly salary provision", "Vendor payment - Apollo", "Revenue recognition Q4",
        "Depreciation entry", "Intercompany elimination", "Suspense clearing",
        "Inventory write-off", "Provision adjustment", "Manual correction",
        "Tax provision", "Bonus accrual", "Audit fee accrual",
    ]

    journals = []
    for i in range(200):
        days_ago = random.randint(0, 180)
        je_date = now - timedelta(days=days_ago)
        acct = random.choice(accounts)
        user = random.choice(users)
        amount = round(random.uniform(500, 500000), 2)
        narration = random.choice(narrations + ["", "", "test", "misc"])

        je = JournalEntry(
            tenant_id=tenant_id,
            je_number=f"JE-{2025}{i + 1:05d}",
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
            source_file=f"upload_{random.choice(['jan', 'feb', 'mar', 'apr', 'may', 'jun'])}.csv",
        )
        journals.append(je)

    db.add_all(journals)
    db.commit()

    created_journals = db.query(JournalEntry).filter(JournalEntry.tenant_id == tenant_id).all()
    exceptions = []
    for je in created_journals[:30]:
        exceptions.append(R2RException(
            tenant_id=tenant_id,
            journal_entry_id=je.id,
            category=random.choice(["manual_entry", "timing", "narration", "amount"]),
            severity=random.choice(["low", "medium", "high", "critical"]),
            description=f"Exception detected for JE {je.je_number}",
            status=random.choice(["open", "open", "in_review", "resolved"]),
            owner=random.choice(["U001", "U002", "U003"]),
        ))
    db.add_all(exceptions)

    recons = []
    for acct in random.sample(accounts, 5):
        gl = round(random.uniform(10000, 1000000), 2)
        diff = round(random.uniform(-5000, 5000), 2)
        recons.append(R2RReconciliation(
            tenant_id=tenant_id, account_code=acct[0], account_name=acct[1],
            gl_balance=gl, subledger_balance=gl - diff, difference=diff,
            status=random.choice(["open", "open", "in_progress", "approved"]),
            owner=random.choice(["U001", "U002"]),
        ))
    db.add_all(recons)

    tasks = []
    for m in range(6):
        d = now - timedelta(days=30 * m)
        period = d.strftime("%Y-%m")
        for task_name in ["GL Close", "Subledger Reconciliation", "Intercompany Elimination", "Revenue Recognition"]:
            tasks.append(R2RCloseTask(
                tenant_id=tenant_id, period=period, task_name=task_name,
                owner=random.choice(["U001", "U002"]),
                status=random.choice(["completed", "completed", "pending", "delayed"]),
                due_date=d + timedelta(days=5),
                priority=random.choice(["high", "medium", "low"]),
                is_delayed=random.random() > 0.8,
            ))
    db.add_all(tasks)
    db.commit()

    return {"message": f"Seeded {len(journals)} journals, {len(exceptions)} exceptions, {len(recons)} reconciliations, {len(tasks)} close tasks"}
