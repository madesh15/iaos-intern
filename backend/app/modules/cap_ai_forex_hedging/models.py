from sqlalchemy import String, Text, Float, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class ForexExposure(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_exposures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    currency_pair: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    direction: Mapped[str] = mapped_column(String(20), default="Export") # Export, Import
    maturity_date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Unhedged") # Hedged, Unhedged, Partially Hedged
    completeness_status: Mapped[str] = mapped_column(String(30), default="Verified") # Verified, Missing Invoice, Pending Verification
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=True)


class HedgeContract(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_contracts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    contract_type: Mapped[str] = mapped_column(String(30), default="Forward") # Forward, Option
    underlying_exposure_id: Mapped[int] = mapped_column(Integer, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    strike_rate: Mapped[float] = mapped_column(Float, nullable=False)
    fair_value: Mapped[float] = mapped_column(Float, default=0.0) # Mark-to-Market fair value
    gain_loss: Mapped[float] = mapped_column(Float, default=0.0)
    effectiveness_pct: Mapped[float] = mapped_column(Float, default=100.0) # Ind AS 109 correlation percentage
    maturity_date: Mapped[str] = mapped_column(String(30), nullable=False)
    bank_confirmation: Mapped[str] = mapped_column(String(30), default="Confirmed") # Confirmed, Pending, Mismatch
    is_speculative: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(30), default="Active") # Active, Rolled Over, Cancelled, Settled
    counterparty: Mapped[str] = mapped_column(String(100), default="HSBC Bank")
    premium_cost: Mapped[float] = mapped_column(Float, default=0.0)


class AuditException(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_exceptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium") # Low, Medium, High, Critical
    status: Mapped[str] = mapped_column(String(30), default="Open") # Open, Under Review, Resolved
    assigned_to: Mapped[str] = mapped_column(String(100), default="Unassigned")
    created_at: Mapped[str] = mapped_column(String(30), nullable=False)


class AuditFinding(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    root_cause: Mapped[str] = mapped_column(Text, default="")
    recommendation: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String(30), nullable=False)


class RemediationAction(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_remediation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    finding_id: Mapped[int] = mapped_column(Integer, nullable=False)
    capa_action: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[str] = mapped_column(String(100), nullable=False)
    due_date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Not Started") # Not Started, In Progress, Completed, Pending Re-test
    retesting_status: Mapped[str] = mapped_column(String(30), default="Pending") # Pending, Passed, Failed


class HedgeDocument(Base, TenantMixin):
    __tablename__ = "mod_cap_ai_forex_hedging_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(100), default="Designation Memo") # Designation Memo, Confirmation, Policy Approval
    uploaded_at: Mapped[str] = mapped_column(String(30), nullable=False)
