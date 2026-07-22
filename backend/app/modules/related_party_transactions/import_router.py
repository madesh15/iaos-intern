"""
Bulk import sub-router for Related-Party Transactions.

Accepts CSV or XLSX files of transaction data, parses each row,
validates it (missing fields, arm's-length price variance), stores
results, and — if RPTException exists in the sibling models module —
automatically raises an exception for any row flagged during validation.

INSTALL (once): pip install openpyxl python-multipart --break-system-packages

WIRE-UP (2 lines in your existing router.py):
    from .import_router import import_router
    router.include_router(import_router, prefix="/import", tags=["rpt-import"])
"""
import csv
import io
from datetime import datetime, date

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import import_models as im
from . import import_schemas as isch

import_router = APIRouter()

REQUIRED_COLUMNS = {"related_party", "transaction_type", "amount", "transaction_date"}
VARIANCE_FLAG_THRESHOLD_PCT = 10.0  # flag if amount differs from market_rate by more than this %


def _try_import_exception_model():
    """Best-effort import so this file works standalone even if models.py
    doesn't (yet) define RPTException, or has a different name for it."""
    try:
        from . import models as m
        return getattr(m, "RPTException", None)
    except Exception:
        return None


def _parse_date(value: str) -> date | None:
    value = (value or "").strip()
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _parse_float(value) -> float | None:
    try:
        s = str(value).replace(",", "").strip()
        return float(s) if s else None
    except (ValueError, TypeError):
        return None


def _read_rows(filename: str, raw: bytes) -> list[dict]:
    """Returns a list of dicts, one per data row, with lowercase keys."""
    lower = filename.lower()

    if lower.endswith(".csv"):
        text = raw.decode("utf-8-sig", errors="replace")
        reader = csv.DictReader(io.StringIO(text))
        return [{(k or "").strip().lower(): v for k, v in row.items()} for row in reader]

    if lower.endswith(".xlsx"):
        try:
            import openpyxl
        except ImportError:
            raise HTTPException(
                400,
                "XLSX support requires openpyxl. Run: pip install openpyxl --break-system-packages",
            )
        wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
        ws = wb.active
        rows_iter = ws.iter_rows(values_only=True)
        headers = [str(h or "").strip().lower() for h in next(rows_iter)]
        rows = []
        for row in rows_iter:
            if all(v is None for v in row):
                continue
            rows.append({headers[i]: row[i] for i in range(len(headers)) if i < len(row)})
        return rows

    raise HTTPException(400, "Unsupported file type. Upload a .csv or .xlsx file.")


def _validate_row(row: dict) -> dict:
    """Returns a dict ready to build an RPTImportTransaction, with status + notes set."""
    notes = []
    missing = [c for c in REQUIRED_COLUMNS if not str(row.get(c, "")).strip()]

    related_party = str(row.get("related_party", "")).strip()
    transaction_type = str(row.get("transaction_type", "")).strip()
    amount = _parse_float(row.get("amount"))
    currency = str(row.get("currency", "") or "INR").strip() or "INR"
    txn_date = _parse_date(str(row.get("transaction_date", "")))
    market_rate = _parse_float(row.get("market_rate"))

    if missing:
        notes.append(f"Missing required field(s): {', '.join(missing)}")
    if row.get("amount") and amount is None:
        notes.append("Amount could not be parsed as a number")
    if row.get("transaction_date") and txn_date is None:
        notes.append("Date could not be parsed (expected YYYY-MM-DD or DD-MM-YYYY)")

    variance_pct = None
    status = "valid"

    if notes:
        status = "error"
    elif market_rate and amount is not None and market_rate != 0:
        variance_pct = round(((amount - market_rate) / market_rate) * 100, 2)
        if abs(variance_pct) > VARIANCE_FLAG_THRESHOLD_PCT:
            status = "flagged"
            notes.append(
                f"Price variance {variance_pct:+.1f}% vs market rate exceeds "
                f"{VARIANCE_FLAG_THRESHOLD_PCT:.0f}% threshold — possible non-arm's-length pricing"
            )

    return {
        "related_party": related_party,
        "transaction_type": transaction_type,
        "amount": amount or 0.0,
        "currency": currency,
        "transaction_date": txn_date,
        "market_rate": market_rate,
        "variance_pct": variance_pct,
        "status": status,
        "validation_notes": "; ".join(notes),
    }


@import_router.post("/upload", response_model=isch.ImportBatchOut)
def upload_import(
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
):
    raw = file.file.read()
    rows = _read_rows(file.filename, raw)
    if not rows:
        raise HTTPException(400, "No data rows found in the uploaded file.")

    batch = im.RPTImportBatch(
        tenant_id=current_user.tenant_id,
        filename=file.filename,
        uploaded_by=getattr(current_user, "full_name", "") or getattr(current_user, "email", ""),
        total_rows=len(rows),
        status="processing",
    )
    db.add(batch)
    db.flush()  # get batch.id without committing yet

    ExceptionModel = _try_import_exception_model()
    valid = flagged = errored = 0

    for i, row in enumerate(rows, start=1):
        parsed = _validate_row(row)
        txn = im.RPTImportTransaction(
            tenant_id=current_user.tenant_id,
            batch_id=batch.id,
            row_num=i,
            **parsed,
        )
        db.add(txn)

        if parsed["status"] == "valid":
            valid += 1
        elif parsed["status"] == "flagged":
            flagged += 1
            if ExceptionModel is not None:
                db.add(
                    ExceptionModel(
                        tenant_id=current_user.tenant_id,
                        description=(
                            f"Import row {i}: {parsed['related_party']} — "
                            f"{parsed['transaction_type']} ({parsed['currency']} {parsed['amount']:,.2f}). "
                            f"{parsed['validation_notes']}"
                        ),
                        severity="high" if abs(parsed.get("variance_pct") or 0) > 25 else "medium",
                        status="open",
                        disposition="",
                    )
                )
        else:
            errored += 1

    batch.valid_count = valid
    batch.flagged_count = flagged
    batch.error_count = errored
    batch.status = "completed"

    db.commit()
    db.refresh(batch)
    return isch.ImportBatchOut.model_validate(batch)


@import_router.get("/batches", response_model=list[isch.ImportBatchOut])
def list_batches(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(im.RPTImportBatch), current_user).order_by(
        im.RPTImportBatch.uploaded_at.desc()
    )
    return [isch.ImportBatchOut.model_validate(b) for b in q.all()]


@import_router.get("/batches/{batch_id}/transactions", response_model=list[isch.ImportTransactionOut])
def list_batch_transactions(batch_id: int, current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(im.RPTImportTransaction), current_user).filter(
        im.RPTImportTransaction.batch_id == batch_id
    ).order_by(im.RPTImportTransaction.row_num)
    return [isch.ImportTransactionOut.model_validate(t) for t in q.all()]


@import_router.get("/template")
def download_template():
    """Returns a starter CSV template as plain text for the frontend to download."""
    sample = (
        "related_party,transaction_type,amount,currency,transaction_date,market_rate\n"
        "ABC Holdings Pvt Ltd,Purchase of Goods,1250000,INR,2026-04-15,1150000\n"
        "XYZ Trading LLP,Management Fee,450000,INR,2026-04-20,440000\n"
        "Promoter Family Trust,Unsecured Loan,5000000,INR,2026-05-01,\n"
    )
    return {"filename": "rpt_import_template.csv", "content": sample}
