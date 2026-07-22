from pydantic import BaseModel, Field


class TestCreate(BaseModel):
    procedure_code: int = Field(ge=1, le=15)
    status: str = "not_started"
    tester: str = ""
    period: str = ""
    risk_rating: str = "none"
    observations: str = ""
    evidence_url: str = ""
    tested_on: str = ""
    conclusion: str = ""


class TestUpdate(BaseModel):
    status: str | None = None
    tester: str | None = None
    period: str | None = None
    risk_rating: str | None = None
    observations: str | None = None
    evidence_url: str | None = None
    tested_on: str | None = None
    conclusion: str | None = None


class TestOut(BaseModel):
    id: int
    procedure_code: int
    status: str
    tester: str
    period: str
    risk_rating: str
    observations: str
    evidence_url: str
    tested_on: str
    conclusion: str

    model_config = {"from_attributes": True}


class ProcedureSummary(BaseModel):
    procedure_code: int
    procedure_name: str
    description: str
    total: int = 0
    by_status: dict[str, int] = {}
    latest_risk: str = "none"
