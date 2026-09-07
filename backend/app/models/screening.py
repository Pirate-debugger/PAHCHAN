import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_case_id():
    # Generate clean, human-readable case ID: PH-1000 series
    return f"PH-{int(datetime.now(timezone.utc).timestamp() * 10) % 9000 + 1000}"

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(String(32), primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    status = Column(String(32), default="PENDING", index=True)  # PENDING, IN_REVIEW, COMPLETED, ESCALATED
    document_type = Column(String(32), default="PASSPORT")      # PASSPORT, VISA, NATIONAL_ID, DRIVING_LICENSE, PERMIT
    officer_notes = Column(Text, nullable=True)
    is_demo_scenario = Column(Boolean, default=False)
    demo_scenario_id = Column(String(64), nullable=True)

    # Relationships
    documents = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    extracted_fields = relationship("ExtractedField", back_populates="session", cascade="all, delete-orphan")
    validations = relationship("ValidationResult", back_populates="session", cascade="all, delete-orphan")
    forensic_findings = relationship("ForensicFinding", back_populates="session", cascade="all, delete-orphan")
    face_verification = relationship("FaceVerification", back_populates="session", uselist=False, cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="session", uselist=False, cascade="all, delete-orphan")
    decisions = relationship("ScreeningDecision", back_populates="session", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogEntry", back_populates="session", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(32), default="PRIMARY_DOCUMENT")  # PRIMARY_DOCUMENT, PRESENTED_PHOTO, SECONDARY_VISA
    filename = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(64), default="image/jpeg")
    file_size = Column(Integer, default=0)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    is_synthetic = Column(Boolean, default=False)

    session = relationship("ScreeningSession", back_populates="documents")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    field_key = Column(String(64), nullable=False)
    field_label = Column(String(128), nullable=False)
    field_value = Column(Text, nullable=True)
    original_value = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    
    # Normalized coordinates 0.0 - 1.0 (ymin, xmin, ymax, xmax)
    bbox_ymin = Column(Float, nullable=True)
    bbox_xmin = Column(Float, nullable=True)
    bbox_ymax = Column(Float, nullable=True)
    bbox_xmax = Column(Float, nullable=True)

    is_edited = Column(Boolean, default=False)
    source_zone = Column(String(32), default="VIZ")  # MRZ, VIZ, STAMP, HEADER

    session = relationship("ScreeningSession", back_populates="extracted_fields")

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(String(64), nullable=False)
    rule_name = Column(String(256), nullable=False)
    category = Column(String(64), default="CHECKSUM")  # CHECKSUM, CHRONOLOGY, FORMAT, CONSISTENCY, EXPIRY, WATCHLIST
    status = Column(String(32), default="PASS")        # PASS, FAIL, WARNING, NOT_APPLICABLE
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    risk_points = Column(Integer, default=0)

    session = relationship("ScreeningSession", back_populates="validations")

class ForensicFinding(Base):
    __tablename__ = "forensic_findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(64), nullable=False)  # PHOTO_ALTERATION, TEXT_MANIPULATION, STAMP_FORGERY, METADATA_ANOMALY
    severity = Column(String(32), default="MEDIUM") # INFO, LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(256), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_preview_path = Column(String(512), nullable=True)
    heatmap_overlay_path = Column(String(512), nullable=True)

    # Bounding box for evidence region
    bbox_ymin = Column(Float, nullable=True)
    bbox_xmin = Column(Float, nullable=True)
    bbox_ymax = Column(Float, nullable=True)
    bbox_xmax = Column(Float, nullable=True)

    technical_details = Column(Text, nullable=True)  # JSON formatted technical forensic metrics
    risk_contribution = Column(Integer, default=0)

    session = relationship("ScreeningSession", back_populates="forensic_findings")

class FaceVerification(Base):
    __tablename__ = "face_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    portrait_crop_path = Column(String(512), nullable=True)
    presented_photo_path = Column(String(512), nullable=True)
    outcome = Column(String(32), default="REVIEW")  # MATCH_SIGNAL, REVIEW, MISMATCH_SIGNAL, UNABLE_TO_ASSESS
    similarity_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=1.0)
    quality_assessment = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    risk_contribution = Column(Integer, default=0)

    session = relationship("ScreeningSession", back_populates="face_verification")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    total_score = Column(Integer, default=0)           # 0 - 100
    risk_level = Column(String(32), default="LOW")     # LOW, REVIEW, HIGH, CRITICAL
    primary_concern = Column(String(256), nullable=True)
    recommendation = Column(Text, nullable=False)
    contributing_factors = Column(Text, nullable=True)  # JSON array

    session = relationship("ScreeningSession", back_populates="risk_assessment")

class ScreeningDecision(Base):
    __tablename__ = "screening_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="CASCADE"), nullable=False)
    decision = Column(String(64), nullable=False)  # STANDARD_REVIEW, SECONDARY_REVIEW, ESCALATE, INCONCLUSIVE
    officer_id = Column(String(64), default="SSB-OFFICER-4821")
    officer_name = Column(String(128), default="S. Sharma (Inspector/GD)")
    notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("ScreeningSession", back_populates="decisions")

class AuditLogEntry(Base):
    __tablename__ = "audit_log_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    session_id = Column(String(32), ForeignKey("screening_sessions.id", ondelete="SET NULL"), nullable=True)
    actor = Column(String(128), default="SSB-OPERATOR-AUTO")
    action = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), default="127.0.0.1")

    session = relationship("ScreeningSession", back_populates="audit_logs")
