from datetime import datetime, date
from pydantic import BaseModel, ConfigDict


class ImportBatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    uploaded_by: str
    uploaded_at: datetime
    total_rows: int
    valid_count: int
    flagged_count: int
    error_count: int
    status: str


class ImportTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    batch_id: int
    row_num: int
    related_party: str
    transaction_type: str
    amount: float
    currency: str
    transaction_date: date | None
    market_rate: float | None
    variance_pct: float | None
    status: str
    validation_notes: str
