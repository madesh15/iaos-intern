"""Utility helpers for the Record-to-Report module."""

from __future__ import annotations

import re
from datetime import datetime, timezone, date, time
from typing import Optional


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def is_weekend(d: datetime | date) -> bool:
    return d.weekday() >= 5


def is_odd_hours(dt: datetime, start_hour: int = 8, end_hour: int = 18) -> bool:
    return dt.hour < start_hour or dt.hour >= end_hour


def is_round_number(amount: float) -> bool:
    if amount == 0:
        return False
    abs_amt = abs(amount)
    thresholds = [1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]
    for t in thresholds:
        if abs_amt % t == 0:
            return True
    return False


def round_number_level(amount: float) -> str:
    abs_amt = abs(amount)
    if abs_amt >= 1000000:
        return "1M+"
    if abs_amt >= 100000:
        return "100K+"
    if abs_amt >= 50000:
        return "50K+"
    if abs_amt >= 10000:
        return "10K+"
    if abs_amt >= 1000:
        return "1K+"
    return "sub-1K"


def narration_risk(narration: Optional[str]) -> str:
    if not narration or not narration.strip():
        return "blank"
    if len(narration.strip()) < 5:
        return "short"
    generic = ["test", "misc", "adjustment", "suspense", "pending", "check", "temp"]
    if narration.strip().lower() in generic:
        return "generic"
    return "ok"


def compute_je_risk_score(
    is_manual: bool,
    is_odd_hour: bool,
    is_weekend_flag: bool,
    amount: float,
    narration_status: str,
    is_round: bool,
    is_recurring: bool,
    is_reversal: bool,
    is_sensitive: bool,
) -> float:
    score = 0.0
    if is_manual:
        score += 20
    if is_odd_hour:
        score += 15
    if is_weekend_flag:
        score += 15
    if amount > 1000000:
        score += 20
    elif amount > 100000:
        score += 10
    elif amount > 10000:
        score += 5
    if narration_status == "blank":
        score += 15
    elif narration_status == "short":
        score += 8
    elif narration_status == "generic":
        score += 10
    if is_round:
        score += 5
    if is_recurring:
        score += 5
    if is_reversal:
        score += 10
    if is_sensitive:
        score += 10
    return min(score, 100.0)


def classify_risk(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def normalise_account(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"\s+", "", raw).upper()


def format_currency(amount: float) -> str:
    if amount < 0:
        return f"-₹{abs(amount):,.2f}"
    return f"₹{amount:,.2f}"
