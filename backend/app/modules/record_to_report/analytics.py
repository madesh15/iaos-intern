"""Record-to-Report analytics — 25 standalone analytical functions."""

from __future__ import annotations

import random
from collections import defaultdict
from datetime import timedelta
from typing import Any

from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from .models import (
    JournalEntry,
    R2RException,
    R2RReconciliation,
    R2RCloseTask,
    R2RFinding,
    R2RAction,
    R2RRule,
    R2RAuditScope,
    R2RWorkpaper,
)
from .utils import (
    utcnow,
    is_weekend,
    is_odd_hours,
    is_round_number,
    round_number_level,
    narration_risk,
    compute_je_risk_score,
    classify_risk,
    format_currency,
)


SENSITIVE_KEYWORDS = (
    "revenue",
    "suspense",
    "provision",
    "cash",
    "inventory",
    "adjustment",
)


def _je_amount_max(je: JournalEntry) -> float:
    return max(je.debit_amount, je.credit_amount)


def _je_dict(je: JournalEntry) -> dict[str, Any]:
    return {
        "id": je.id,
        "je_number": je.je_number,
        "je_date": je.je_date.isoformat() if je.je_date else None,
        "period": je.period,
        "fiscal_year": je.fiscal_year,
        "company_code": je.company_code,
        "business_unit": je.business_unit,
        "plant": je.plant,
        "account_code": je.account_code,
        "account_name": je.account_name,
        "debit_amount": je.debit_amount,
        "credit_amount": je.credit_amount,
        "currency": je.currency,
        "narration": je.narration,
        "user_id": je.user_id,
        "user_name": je.user_name,
        "posting_time": je.posting_time.isoformat() if je.posting_time else None,
        "posting_type": je.posting_type,
        "status": je.status,
        "risk_score": je.risk_score,
        "risk_level": je.risk_level,
        "is_suspense": je.is_suspense,
        "is_post_close": je.is_post_close,
        "reversal_of": je.reversal_of,
        "source_file": je.source_file,
    }


# ---------------------------------------------------------------------------
# 1. Manual JE Risk Scoring
# ---------------------------------------------------------------------------

def manual_je_risk_scoring(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    """Score risk for every journal entry and return the results."""
    now = utcnow()
    journals: list[JournalEntry] = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )

    # Build recurring-set lookup (narration + amount appearing >1 time)
    recurring_keys: set[tuple[str | None, float]] = set()
    freq: dict[tuple[str | None, float], int] = defaultdict(int)
    for j in journals:
        key = (j.narration, _je_amount_max(j))
        freq[key] += 1
    for k, v in freq.items():
        if v > 1:
            recurring_keys.add(k)

    sensitive_set: set[int] = {
        je.id
        for je in journals
        if je.account_name
        and any(kw in je.account_name.lower() for kw in SENSITIVE_KEYWORDS)
    }

    results: list[dict[str, Any]] = []
    for je in journals:
        posting_dt = je.posting_time or je.je_date
        weekend_flag = is_weekend(posting_dt) if posting_dt else False
        odd_flag = is_odd_hours(posting_dt) if posting_dt else False
        amount = _je_amount_max(je)
        n_status = narration_risk(je.narration)
        rnd = is_round_number(amount)
        recurring = (je.narration, amount) in recurring_keys
        reversal = bool(je.reversal_of)
        sensitive = je.id in sensitive_set

        score = compute_je_risk_score(
            is_manual=je.posting_type == "manual",
            is_odd_hour=odd_flag,
            is_weekend_flag=weekend_flag,
            amount=amount,
            narration_status=n_status,
            is_round=rnd,
            is_recurring=recurring,
            is_reversal=reversal,
            is_sensitive=sensitive,
        )
        level = classify_risk(score)

        results.append({
            **_je_dict(je),
            "computed_score": score,
            "computed_level": level,
            "narration_risk": n_status,
            "is_round": rnd,
            "is_recurring": recurring,
            "is_sensitive": sensitive,
        })
    return results


# ---------------------------------------------------------------------------
# 2. Odd-Hour Posting
# ---------------------------------------------------------------------------

def odd_hour_posting(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        posting_dt = je.posting_time or je.je_date
        if not posting_dt:
            continue
        weekend = is_weekend(posting_dt)
        odd = is_odd_hours(posting_dt)
        if weekend or odd:
            row = _je_dict(je)
            row["is_weekend"] = weekend
            row["is_odd_hour"] = odd
            results.append(row)
    return results


# ---------------------------------------------------------------------------
# 3. Blank Narration
# ---------------------------------------------------------------------------

def blank_narration(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        risk = narration_risk(je.narration)
        if risk in ("blank", "short", "generic"):
            row = _je_dict(je)
            row["narration_risk"] = risk
            results.append(row)
    return results


# ---------------------------------------------------------------------------
# 4. Sensitive Account Posting
# ---------------------------------------------------------------------------

def sensitive_account_posting(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        if je.account_name and any(
            kw in je.account_name.lower() for kw in SENSITIVE_KEYWORDS
        ):
            row = _je_dict(je)
            row["matched_keywords"] = [
                kw
                for kw in SENSITIVE_KEYWORDS
                if kw in je.account_name.lower()  # type: ignore[union-attr]
            ]
            results.append(row)
    return results


# ---------------------------------------------------------------------------
# 5. Top Value Entries
# ---------------------------------------------------------------------------

def top_value_entries(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    journals.sort(key=lambda j: _je_amount_max(j), reverse=True)
    top = journals[:20]
    return [_je_dict(j) for j in top]


# ---------------------------------------------------------------------------
# 6. Suspense Ageing
# ---------------------------------------------------------------------------

def suspense_ageing(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    now = utcnow()
    journals = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.is_suspense == True,  # noqa: E712
        )
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        age_days = (now - je.je_date).days if je.je_date else None
        row = _je_dict(je)
        row["age_days"] = age_days
        results.append(row)
    return results


# ---------------------------------------------------------------------------
# 7. Post-Close Entries
# ---------------------------------------------------------------------------

def post_close_entries(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.is_post_close == True,  # noqa: E712
        )
        .all()
    )
    return [_je_dict(j) for j in journals]


# ---------------------------------------------------------------------------
# 8. Round Number Detection
# ---------------------------------------------------------------------------

def round_number_detection(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        debit_round = is_round_number(je.debit_amount)
        credit_round = is_round_number(je.credit_amount)
        if debit_round or credit_round:
            row = _je_dict(je)
            row["debit_is_round"] = debit_round
            row["credit_is_round"] = credit_round
            row["round_level"] = round_number_level(_je_amount_max(je))
            results.append(row)
    return results


# ---------------------------------------------------------------------------
# 9. Segregation of Duties
# ---------------------------------------------------------------------------

def segregation_of_duties(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )

    # Map user -> set of posting_types
    user_posting_types: dict[str, set[str]] = defaultdict(set)
    user_journals: dict[str, list[JournalEntry]] = defaultdict(list)
    for je in journals:
        uid = je.user_id or ""
        if uid:
            user_posting_types[uid].add(je.posting_type)
            user_journals[uid].append(je)

    # Flag users with multiple posting types
    flagged: list[dict[str, Any]] = []
    for uid, types in user_posting_types.items():
        if len(types) > 1:
            flagged.append({
                "user_id": uid,
                "posting_types": sorted(types),
                "je_count": len(user_journals[uid]),
                "reason": "user appears in multiple posting types",
            })

    # Also check narrations for "prepare" + "approve" by same user
    prep_approve: dict[str, int] = defaultdict(int)
    for je in journals:
        uid = je.user_id or ""
        if uid and je.narration:
            nlow = je.narration.lower()
            if "prepare" in nlow or "create" in nlow:
                prep_approve[uid] |= 1
            if "approve" in nlow or "authorized" in nlow:
                prep_approve[uid] |= 2
    for uid, mask in prep_approve.items():
        if mask == 3:
            flagged.append({
                "user_id": uid,
                "posting_types": sorted(user_posting_types.get(uid, set())),
                "je_count": len(user_journals[uid]),
                "reason": "narration mentions both prepare and approve",
            })
    return flagged


# ---------------------------------------------------------------------------
# 10. Recurring Journal Detection
# ---------------------------------------------------------------------------

def recurring_journal_detection(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    groups: dict[tuple[str | None, float], list[JournalEntry]] = defaultdict(list)
    for je in journals:
        key = (je.narration, _je_amount_max(je))
        groups[key].append(je)

    results: list[dict[str, Any]] = []
    for (narr, amt), jes in groups.items():
        if len(jes) > 1:
            results.append({
                "narration": narr,
                "amount": amt,
                "count": len(jes),
                "je_ids": [j.id for j in jes],
                "je_numbers": [j.je_number for j in jes],
            })
    return results


# ---------------------------------------------------------------------------
# 11. Reversal Pattern
# ---------------------------------------------------------------------------

def reversal_pattern(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )

    # Explicit reversals
    explicit: list[dict[str, Any]] = []
    reversal_map: dict[str, list[JournalEntry]] = defaultdict(list)
    for je in journals:
        if je.reversal_of:
            reversal_map[je.reversal_of].append(je)

    for orig_num, revs in reversal_map.items():
        for r in revs:
            explicit.append({
                "je_number": r.je_number,
                "reversal_of": orig_num,
                "je_date": r.je_date.isoformat() if r.je_date else None,
                "amount": _je_amount_max(r),
                "type": "explicit",
            })

    # Implicit: same amount, posted and reversed within 2 days
    by_amount: dict[float, list[JournalEntry]] = defaultdict(list)
    for je in journals:
        by_amount[_je_amount_max(je)].append(je)

    seen_pairs: set[tuple[int, int]] = set()
    implicit: list[dict[str, Any]] = []
    for amt, jes in by_amount.items():
        if len(jes) < 2:
            continue
        for i, a in enumerate(jes):
            for b in jes[i + 1 :]:
                pair = tuple(sorted((a.id, b.id)))
                if pair in seen_pairs:
                    continue
                if a.je_date and b.je_date:
                    diff = abs((a.je_date - b.je_date).days)
                    if diff <= 2 and not a.reversal_of and not b.reversal_of:
                        seen_pairs.add(pair)
                        implicit.append({
                            "je_number_a": a.je_number,
                            "je_number_b": b.je_number,
                            "amount": amt,
                            "days_apart": diff,
                            "type": "implicit",
                        })
    return explicit + implicit


# ---------------------------------------------------------------------------
# 12. Intercompany Elimination
# ---------------------------------------------------------------------------

def intercompany_elimination(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for je in journals:
        diff = abs(je.debit_amount - je.credit_amount)
        if diff > 0.01:
            row = _je_dict(je)
            row["difference"] = round(diff, 2)
            results.append(row)
    return results


# ---------------------------------------------------------------------------
# 13. Close Calendar Status
# ---------------------------------------------------------------------------

def close_calendar_status(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    tasks = (
        db.query(R2RCloseTask)
        .filter(R2RCloseTask.tenant_id == tenant_id)
        .all()
    )
    by_period: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    task_list: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for t in tasks:
        by_period[t.period][t.status] += 1
        task_list[t.period].append({
            "id": t.id,
            "task_name": t.task_name,
            "owner": t.owner,
            "status": t.status,
            "priority": t.priority,
            "is_delayed": t.is_delayed,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "completed_date": t.completed_date.isoformat() if t.completed_date else None,
        })

    return [
        {
            "period": period,
            "status_counts": dict(counts),
            "total": sum(counts.values()),
            "tasks": task_list[period],
        }
        for period, counts in sorted(by_period.items())
    ]


# ---------------------------------------------------------------------------
# 14. Account Reconciliation Status
# ---------------------------------------------------------------------------

def account_reconciliation_status(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    recs = (
        db.query(R2RReconciliation)
        .filter(R2RReconciliation.tenant_id == tenant_id)
        .all()
    )
    by_status: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in recs:
        by_status[r.status].append({
            "id": r.id,
            "account_code": r.account_code,
            "account_name": r.account_name,
            "gl_balance": r.gl_balance,
            "subledger_balance": r.subledger_balance,
            "difference": r.difference,
            "owner": r.owner,
            "status": r.status,
        })
    return [
        {"status": s, "count": len(items), "items": items}
        for s, items in sorted(by_status.items())
    ]


# ---------------------------------------------------------------------------
# 15. GL vs Subledger
# ---------------------------------------------------------------------------

def gl_vs_subledger(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    recs = (
        db.query(R2RReconciliation)
        .filter(
            R2RReconciliation.tenant_id == tenant_id,
            R2RReconciliation.difference != 0,  # noqa: E712
        )
        .all()
    )
    return [
        {
            "id": r.id,
            "account_code": r.account_code,
            "account_name": r.account_name,
            "gl_balance": r.gl_balance,
            "subledger_balance": r.subledger_balance,
            "difference": r.difference,
            "reconciliation_date": r.reconciliation_date.isoformat() if r.reconciliation_date else None,
            "status": r.status,
            "owner": r.owner,
        }
        for r in recs
    ]


# ---------------------------------------------------------------------------
# 16. Dashboard KPIs
# ---------------------------------------------------------------------------

def dashboard_kpis(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    total = (
        db.query(func.count(JournalEntry.id))
        .filter(JournalEntry.tenant_id == tenant_id)
        .scalar()
        or 0
    )
    high_risk = (
        db.query(func.count(JournalEntry.id))
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.risk_level == "high",
        )
        .scalar()
        or 0
    )
    medium_risk = (
        db.query(func.count(JournalEntry.id))
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.risk_level == "medium",
        )
        .scalar()
        or 0
    )
    low_risk = (
        db.query(func.count(JournalEntry.id))
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.risk_level == "low",
        )
        .scalar()
        or 0
    )
    open_findings = (
        db.query(func.count(R2RFinding.id))
        .filter(
            R2RFinding.tenant_id == tenant_id,
            R2RFinding.status != "closed",
        )
        .scalar()
        or 0
    )
    open_capa = (
        db.query(func.count(R2RAction.id))
        .filter(
            R2RAction.tenant_id == tenant_id,
            R2RAction.status != "completed",
        )
        .scalar()
        or 0
    )
    open_reconciliation = (
        db.query(func.count(R2RReconciliation.id))
        .filter(
            R2RReconciliation.tenant_id == tenant_id,
            R2RReconciliation.status != "approved",
        )
        .scalar()
        or 0
    )
    suspense_balance = (
        db.query(
            func.coalesce(
                func.sum(
                    JournalEntry.debit_amount - JournalEntry.credit_amount
                ),
                0.0,
            )
        )
        .filter(
            JournalEntry.tenant_id == tenant_id,
            JournalEntry.is_suspense == True,  # noqa: E712
        )
        .scalar()
        or 0.0
    )
    return {
        "total_journals": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "open_findings": open_findings,
        "open_capa": open_capa,
        "open_reconciliation": open_reconciliation,
        "suspense_balance": suspense_balance,
        "suspense_balance_display": format_currency(suspense_balance),
    }


# ---------------------------------------------------------------------------
# 17. Scope Coverage
# ---------------------------------------------------------------------------

def scope_coverage(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    scopes = (
        db.query(R2RAuditScope)
        .filter(R2RAuditScope.tenant_id == tenant_id)
        .all()
    )
    results: list[dict[str, Any]] = []
    for s in scopes:
        je_count = (
            db.query(func.count(JournalEntry.id))
            .filter(
                JournalEntry.tenant_id == tenant_id,
                JournalEntry.business_unit == s.business_unit,
            )
            .scalar()
            or 0
        )
        results.append({
            "id": s.id,
            "scope_name": s.scope_name,
            "entity": s.entity,
            "business_unit": s.business_unit,
            "plant": s.plant,
            "period_from": s.period_from,
            "period_to": s.period_to,
            "status": s.status,
            "journal_count": je_count,
        })
    return results


# ---------------------------------------------------------------------------
# 18. Risk Control Matrix
# ---------------------------------------------------------------------------

def risk_control_matrix(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    rules = (
        db.query(R2RRule)
        .filter(R2RRule.tenant_id == tenant_id)
        .all()
    )
    by_cat: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in rules:
        by_cat[r.category].append({
            "id": r.id,
            "rule_code": r.rule_code,
            "rule_name": r.rule_name,
            "severity": r.severity,
            "threshold_value": r.threshold_value,
            "threshold_unit": r.threshold_unit,
            "is_active": r.is_active,
        })
    return [
        {"category": cat, "count": len(items), "rules": items}
        for cat, items in sorted(by_cat.items())
    ]


# ---------------------------------------------------------------------------
# 19. Rule Library Summary
# ---------------------------------------------------------------------------

def rule_library_summary(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    rules = (
        db.query(R2RRule)
        .filter(R2RRule.tenant_id == tenant_id)
        .all()
    )
    active = sum(1 for r in rules if r.is_active)
    inactive = len(rules) - active
    by_severity: dict[str, int] = defaultdict(int)
    for r in rules:
        by_severity[r.severity] += 1
    return {
        "total": len(rules),
        "active": active,
        "inactive": inactive,
        "by_severity": dict(by_severity),
        "rules": [
            {
                "id": r.id,
                "rule_code": r.rule_code,
                "rule_name": r.rule_name,
                "category": r.category,
                "severity": r.severity,
                "is_active": r.is_active,
                "created_date": r.created_date.isoformat() if r.created_date else None,
            }
            for r in rules
        ],
    }


# ---------------------------------------------------------------------------
# 20. Data Source Summary
# ---------------------------------------------------------------------------

def data_source_summary(
    db: Session, tenant_id: int
) -> list[dict[str, Any]]:
    rows = (
        db.query(
            JournalEntry.source_file,
            func.count(JournalEntry.id).label("count"),
            func.sum(JournalEntry.debit_amount).label("total_debit"),
            func.sum(JournalEntry.credit_amount).label("total_credit"),
        )
        .filter(JournalEntry.tenant_id == tenant_id)
        .group_by(JournalEntry.source_file)
        .all()
    )
    return [
        {
            "source_file": row.source_file or "(unknown)",
            "count": row.count,
            "total_debit": float(row.total_debit or 0),
            "total_credit": float(row.total_credit or 0),
        }
        for row in rows
    ]


# ---------------------------------------------------------------------------
# 21. Sampling Analysis
# ---------------------------------------------------------------------------

def sampling_analysis(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )
    if not journals:
        return {"random_sample": [], "monetary_sample": [], "stratified": {}}

    # Random sample (max 20)
    random.seed(42)
    sample_size = min(20, len(journals))
    random_sample = [_je_dict(j) for j in random.sample(journals, sample_size)]

    # Monetary unit sample — select every Nth based on cumulative amount
    total_amount = sum(_je_amount_max(j) for j in journals) or 1.0
    step = total_amount / sample_size if sample_size else total_amount
    cumulative = 0.0
    monetary_sample: list[dict[str, Any]] = []
    threshold = step
    for je in sorted(journals, key=lambda j: _je_amount_max(j)):
        cumulative += _je_amount_max(je)
        if cumulative >= threshold:
            monetary_sample.append(_je_dict(je))
            threshold += step

    # Stratified breakdown by account_type
    stratified: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for je in journals:
        stratified[je.account_code[:4]].append(_je_dict(je))

    return {
        "random_sample": random_sample,
        "monetary_sample": monetary_sample[:sample_size],
        "stratified": dict(stratified),
        "total_journals": len(journals),
        "sample_size": sample_size,
    }


# ---------------------------------------------------------------------------
# 22. Exception Summary
# ---------------------------------------------------------------------------

def exception_summary(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    excs = (
        db.query(R2RException)
        .filter(R2RException.tenant_id == tenant_id)
        .all()
    )
    by_status: dict[str, int] = defaultdict(int)
    by_severity: dict[str, int] = defaultdict(int)
    items: list[dict[str, Any]] = []
    for e in excs:
        by_status[e.status] += 1
        by_severity[e.severity] += 1
        items.append({
            "id": e.id,
            "journal_entry_id": e.journal_entry_id,
            "rule_id": e.rule_id,
            "rule_name": e.rule_name,
            "category": e.category,
            "severity": e.severity,
            "status": e.status,
            "owner": e.owner,
            "detected_date": e.detected_date.isoformat() if e.detected_date else None,
            "resolved_date": e.resolved_date.isoformat() if e.resolved_date else None,
        })
    return {
        "total": len(excs),
        "by_status": dict(by_status),
        "by_severity": dict(by_severity),
        "items": items,
    }


# ---------------------------------------------------------------------------
# 23. Workpaper Summary
# ---------------------------------------------------------------------------

def workpaper_summary(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    wps = (
        db.query(R2RWorkpaper)
        .filter(R2RWorkpaper.tenant_id == tenant_id)
        .all()
    )
    by_status: dict[str, int] = defaultdict(int)
    items: list[dict[str, Any]] = []
    for w in wps:
        by_status[w.status] += 1
        items.append({
            "id": w.id,
            "title": w.title,
            "status": w.status,
            "prepared_by": w.prepared_by,
            "reviewed_by": w.reviewed_by,
            "audit_period": w.audit_period,
            "created_date": w.created_date.isoformat() if w.created_date else None,
        })
    return {
        "total": len(wps),
        "by_status": dict(by_status),
        "items": items,
    }


# ---------------------------------------------------------------------------
# 24. Observation Summary
# ---------------------------------------------------------------------------

def observation_summary(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    findings = (
        db.query(R2RFinding)
        .filter(R2RFinding.tenant_id == tenant_id)
        .all()
    )
    by_rating: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    items: list[dict[str, Any]] = []
    for f in findings:
        by_rating[f.risk_rating][f.status] += 1
        items.append({
            "id": f.id,
            "title": f.title,
            "category": f.category,
            "risk_rating": f.risk_rating,
            "status": f.status,
            "owner": f.owner,
            "audit_period": f.audit_period,
            "created_date": f.created_date.isoformat() if f.created_date else None,
            "closed_date": f.closed_date.isoformat() if f.closed_date else None,
        })
    return {
        "total": len(findings),
        "by_risk_rating": {k: dict(v) for k, v in by_rating.items()},
        "items": items,
    }


# ---------------------------------------------------------------------------
# 25. CAPA Tracker
# ---------------------------------------------------------------------------

def capa_tracker(
    db: Session, tenant_id: int
) -> dict[str, Any]:
    now = utcnow()
    actions = (
        db.query(R2RAction)
        .filter(R2RAction.tenant_id == tenant_id)
        .all()
    )
    items: list[dict[str, Any]] = []
    overdue_count = 0
    for a in actions:
        overdue = (
            a.due_date is not None
            and a.due_date < now
            and a.status != "completed"
        )
        if overdue:
            overdue_count += 1
        items.append({
            "id": a.id,
            "title": a.title,
            "action_type": a.action_type,
            "priority": a.priority,
            "status": a.status,
            "owner": a.owner,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "completed_date": a.completed_date.isoformat() if a.completed_date else None,
            "is_overdue": overdue,
            "finding_id": a.finding_id,
            "created_date": a.created_date.isoformat() if a.created_date else None,
        })
    return {
        "total": len(actions),
        "overdue_count": overdue_count,
        "items": items,
    }
