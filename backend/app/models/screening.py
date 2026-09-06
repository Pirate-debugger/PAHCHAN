"""
SQLAlchemy Models for Screening Sessions, Extracted Fields, and Tampering Findings
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ScreeningSessionModel(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    operator_id = Column(String(64), default="OFFICER-SSB-449", nullable=False)
    checkpoint = Column(String(128), default="Raxaul Land Border Checkpoint", nullable=False)
    document_type = Column(String(32), default="PASSPORT", nullable=False)
    
    # Hashes & References
    document_sha256 = Column(String(64), nullable=True)
    document_filename = Column(String(255), nullable=True)
    
    # Screening Verdict & Risk
    total_risk_score = Column(Integer, default=0, nullable=False)
    risk_level = Column(String(16), default="LOW", nullable=False)
    decision = Column(String(32), default="CLEAR_ENTRY", nullable=False)
    recommendation = Column(Text, nullable=True)
    
    # Biometric Face Result
    face_match = Column(Boolean, default=True)
    face_similarity = Column(Float, default=95.0)
    face_status = Column(String(32), default="MATCH")
    
    # Complete State Snapshot in JSON
    full_session_json = Column(Text, nullable=True)

    # Relationships
    fields = relationship("DocumentFieldModel", back_populates="session", cascade="all, delete-orphan")
    findings = relationship("TamperingFindingModel", back_populates="session", cascade="all, delete-orphan")

class DocumentFieldModel(Base):
    __tablename__ = "document_fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("screening_sessions.session_id"), nullable=False)
    field_key = Column(String(64), nullable=False)
    field_value = Column(String(255), nullable=True)
    confidence = Column(Float, default=1.0)
    is_valid = Column(Boolean, default=True)
    source = Column(String(32), default="OCR")

    session = relationship("ScreeningSessionModel", back_populates="fields")

class TamperingFindingModel(Base):
    __tablename__ = "tampering_findings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("screening_sessions.session_id"), nullable=False)
    finding_id = Column(String(64), nullable=False)
    category = Column(String(64), nullable=False)  # PHOTO, TEXT, STAMP, METADATA
    severity = Column(String(32), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.85)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    
    # Coordinates in percentage (0-100)
    box_x = Column(Float, default=0.0)
    box_y = Column(Float, default=0.0)
    box_width = Column(Float, default=0.0)
    box_height = Column(Float, default=0.0)

    session = relationship("ScreeningSessionModel", back_populates="findings")
