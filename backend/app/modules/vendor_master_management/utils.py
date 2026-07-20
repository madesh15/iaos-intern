"""Utility helpers for the Vendor Master & Management module."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def normalise_gst(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"\s+", "", raw).upper()


def normalise_pan(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"\s+", "", raw).upper()


def normalise_ifsc(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"\s+", "", raw).upper()


def normalise_account(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"\s+", "", raw)


def normalise_email(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return raw.strip().lower()


def normalise_phone(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return re.sub(r"[\s\-()]+", "", raw)


def similarity_score(a: str, b: str) -> float:
    """Simple Jaccard similarity on character 2-grams."""
    if not a or not b:
        return 0.0
    a_norm = a.lower().strip()
    b_norm = b.lower().strip()
    if a_norm == b_norm:
        return 1.0
    grams_a = set(a_norm[i : i + 2] for i in range(len(a_norm) - 1))
    grams_b = set(b_norm[i : i + 2] for i in range(len(b_norm) - 1))
    if not grams_a or not grams_b:
        return 0.0
    return len(grams_a & grams_b) / len(grams_a | grams_b)


def classify_risk_level(score: float) -> str:
    if score >= 0.8:
        return "critical"
    if score >= 0.6:
        return "high"
    if score >= 0.4:
        return "medium"
    return "low"


def days_between(a: datetime, b: datetime) -> int:
    return abs((b - a).days)
