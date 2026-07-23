"""Record-to-Report service — dashboard computation and risk-scoring engine."""

from __future__ import annotations

from collections import defaultdict
from datetime import timedelta, datetime
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import (
    JournalEntry,
    R2RException,
    R2RAction,
    R2RFinding,
    R2RReconciliation,
)
from .utils import (
    utcnow,
    is_weekend,
    is_odd_hours,
    is_round_number,
    narration_risk,
    compute_je_risk_score,
    classify_risk,
)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

def compute_dashboard(db: Session, tenant_id: int) -> dict[str, Any]:
    """Aggregate all dashboard sections in a single pass where possible."""
    now = utcnow()
    twelve_months_ago = now - timedelta(days=365)

    # ------------------------------------------------------------------
    # 1. Core stats (single pass over journals)
    # ------------------------------------------------------------------
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )

    total_journals = len(journals)
    high_risk = 0
    medium_risk = 0
    low_risk = 0
    suspense_balance = 0.0
    amount_buckets: dict[str, int] = {
        "0-1K": 0,
        "1K-10K": 0,
        "10K-100K": 0,
        "100K-1M": 0,
        "1M+": 0,
    }
    monthly_je: dict[str, int] = defaultdict(int)
    user_counts: dict[str, int] = defaultdict(int)
    account_counts: dict[str, int] = defaultdict(int)
    hourly_dow: dict[tuple[int, int], int] = defaultdict(int)

    for je in journals:
        # Risk distribution
        if je.risk_level == "high":
            high_risk += 1
        elif je.risk_level == "medium":
            medium_risk += 1
        else:
            low_risk += 1

        # Suspense balance
        if je.is_suspense:
            suspense_balance += je.debit_amount - je.credit_amount

        # Amount histogram
        amt = max(je.debit_amount, je.credit_amount)
        if amt >= 1_000_000:
            amount_buckets["1M+"] += 1
        elif amt >= 100_000:
            amount_buckets["100K-1M"] += 1
        elif amt >= 10_000:
            amount_buckets["10K-100K"] += 1
        elif amt >= 1_000:
            amount_buckets["1K-10K"] += 1
        else:
            amount_buckets["0-1K"] += 1

        # Monthly trend
        if je.je_date and je.je_date >= twelve_months_ago:
            month_key = je.je_date.strftime("%Y-%m")
            monthly_je[month_key] += 1

        # Top users / accounts
        if je.user_id:
            user_counts[je.user_id] += 1
        if je.account_code:
            account_counts[je.account_code] += 1

        # Posting heatmap (hour-of-day x day-of-week)
        dt = je.posting_time or je.je_date
        if dt:
            hourly_dow[(dt.hour, dt.weekday())] += 1

    top_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    top_accounts = sorted(account_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    posting_heatmap: list[dict[str, Any]] = [
        {"hour": h, "day_of_week": d, "count": c}
        for (h, d), c in sorted(hourly_dow.items())
    ]

    # ------------------------------------------------------------------
    # 2. Open findings / CAPA / reconciliation (lightweight queries)
    # ------------------------------------------------------------------
    open_findings = (
        db.query(func.count(R2RFinding.id))
        .filter(R2RFinding.tenant_id == tenant_id, R2RFinding.status != "closed")
        .scalar()
        or 0
    )
    open_capa = (
        db.query(func.count(R2RAction.id))
        .filter(R2RAction.tenant_id == tenant_id, R2RAction.status != "completed")
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

    # ------------------------------------------------------------------
    # 3. Risk trend — monthly risk counts (high + medium) over 12 months
    # ------------------------------------------------------------------
    risk_trend: dict[str, int] = defaultdict(int)
    for je in journals:
        if je.risk_level in ("high", "medium") and je.je_date and je.je_date >= twelve_months_ago:
            risk_trend[je.je_date.strftime("%Y-%m")] += 1

    # ------------------------------------------------------------------
    # 4. Exception trend
    # ------------------------------------------------------------------
    exceptions = (
        db.query(R2RException)
        .filter(
            R2RException.tenant_id == tenant_id,
            R2RException.detected_date >= twelve_months_ago,
        )
        .all()
    )
    exception_trend: dict[str, int] = defaultdict(int)
    for exc in exceptions:
        if exc.detected_date:
            exception_trend[exc.detected_date.strftime("%Y-%m")] += 1

    # ------------------------------------------------------------------
    # 5. Monthly JE counts (fill gaps for last 12 months)
    # ------------------------------------------------------------------
    monthly_counts_complete: dict[str, int] = {}
    for i in range(12):
        key = (now - timedelta(days=30 * i)).strftime("%Y-%m")
        monthly_counts_complete[key] = monthly_je.get(key, 0)

    risk_trend_complete: dict[str, int] = {}
    for i in range(12):
        key = (now - timedelta(days=30 * i)).strftime("%Y-%m")
        risk_trend_complete[key] = risk_trend.get(key, 0)

    exception_trend_complete: dict[str, int] = {}
    for i in range(12):
        key = (now - timedelta(days=30 * i)).strftime("%Y-%m")
        exception_trend_complete[key] = exception_trend.get(key, 0)

    # ------------------------------------------------------------------
    # Assemble response — list-of-objects matching Pydantic schemas
    # ------------------------------------------------------------------
    risk_trend_list = [{"month": m, "count": c} for m, c in sorted(risk_trend_complete.items())]
    risk_distribution_list = [
        {"level": "high", "count": high_risk},
        {"level": "medium", "count": medium_risk},
        {"level": "low", "count": low_risk},
    ]
    amount_histogram_list = [{"bucket": b, "count": c} for b, c in amount_buckets.items()]
    monthly_trend_list = [{"month": m, "count": c} for m, c in sorted(monthly_counts_complete.items())]
    top_users_list = [{"user_name": uid, "count": c} for uid, c in top_users]
    top_accounts_list = [{"account_code": ac, "account_name": ac, "count": c} for ac, c in top_accounts]
    posting_heatmap_list = [{"hour": h, "day": str(d), "count": c} for h, d, c in
                            ((h, d, c) for (h, d), c in sorted(hourly_dow.items()))]
    exception_trend_list = [{"month": m, "count": c} for m, c in sorted(exception_trend_complete.items())]

    return {
        "stats": {
            "total_journals": total_journals,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk,
            "open_findings": open_findings,
            "open_capa": open_capa,
            "open_reconciliation": open_reconciliation,
            "suspense_balance": suspense_balance,
        },
        "risk_trend": risk_trend_list,
        "risk_distribution": risk_distribution_list,
        "amount_histogram": amount_histogram_list,
        "monthly_trend": monthly_trend_list,
        "top_users": top_users_list,
        "top_accounts": top_accounts_list,
        "posting_heatmap": posting_heatmap_list,
        "exception_trend": exception_trend_list,
    }


# ---------------------------------------------------------------------------
# Batch risk scoring
# ---------------------------------------------------------------------------

def run_risk_scoring(db: Session, tenant_id: int) -> dict[str, Any]:
    """Recompute risk_score and risk_level for every journal entry in the tenant.

    Returns summary counts of updated records.
    """
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.tenant_id == tenant_id)
        .all()
    )

    if not journals:
        return {"updated": 0, "high": 0, "medium": 0, "low": 0}

    # Build recurring-key lookup
    freq: dict[tuple[str | None, float], int] = defaultdict(int)
    for j in journals:
        key = (j.narration, max(j.debit_amount, j.credit_amount))
        freq[key] += 1
    recurring_keys = {k for k, v in freq.items() if v > 1}

    sensitive_ids = {
        j.id
        for j in journals
        if j.account_name
        and any(kw in j.account_name.lower() for kw in ("revenue", "suspense", "provision", "cash", "inventory", "adjustment"))
    }

    counts = {"high": 0, "medium": 0, "low": 0}

    for je in journals:
        posting_dt = je.posting_time or je.je_date
        amount = max(je.debit_amount, je.credit_amount)
        key = (je.narration, amount)

        score = compute_je_risk_score(
            is_manual=je.posting_type == "manual",
            is_odd_hour=is_odd_hours(posting_dt) if posting_dt else False,
            is_weekend_flag=is_weekend(posting_dt) if posting_dt else False,
            amount=amount,
            narration_status=narration_risk(je.narration),
            is_round=is_round_number(amount),
            is_recurring=key in recurring_keys,
            is_reversal=bool(je.reversal_of),
            is_sensitive=je.id in sensitive_ids,
        )
        level = classify_risk(score)

        je.risk_score = score
        je.risk_level = level
        counts[level] += 1

    db.commit()

    return {
        "updated": len(journals),
        **counts,
    }
