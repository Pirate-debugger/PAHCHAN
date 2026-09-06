"""
SQLAlchemy Model for Immutable Audit Trail
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    operator_id = Column(String(64), nullable=False)
    checkpoint = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)  # SCREENING_COMPLETED, DECISION_OVERRIDE, DOSSIER_EXPORTED
    document_sha256 = Column(String(64), nullable=False)
    total_risk_score = Column(Integer, default=0)
    risk_level = Column(String(16), default="LOW")
    decision = Column(String(32), default="CLEAR_ENTRY")
    event_details_json = Column(Text, nullable=True)
