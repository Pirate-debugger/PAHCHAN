from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class BoundingBox(BaseModel):
    ymin: float
    xmin: float
    ymax: float
    xmax: float

class ExtractedFieldBase(BaseModel):
    field_key: str
    field_label: str
    field_value: Optional[str] = None
    original_value: Optional[str] = None
    confidence: float = 1.0
    bbox_ymin: Optional[float] = None
    bbox_xmin: Optional[float] = None
    bbox_ymax: Optional[float] = None
    bbox_xmax: Optional[float] = None
    is_edited: bool = False
    source_zone: str = "VIZ"

class ExtractedFieldResponse(ExtractedFieldBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class EditFieldRequest(BaseModel):
    new_value: str
    officer_notes: Optional[str] = None

class ValidationResultResponse(BaseModel):
    id: str
    rule_id: str
    rule_name: str
    category: str
    status: str
    message: str
    details: Optional[str] = None
    risk_points: int = 0
    model_config = ConfigDict(from_attributes=True)

class ForensicFindingResponse(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    explanation: str
    evidence_preview_url: Optional[str] = None
    heatmap_overlay_url: Optional[str] = None
    bbox_ymin: Optional[float] = None
    bbox_xmin: Optional[float] = None
    bbox_ymax: Optional[float] = None
    bbox_xmax: Optional[float] = None
    technical_details: Optional[str] = None
    risk_contribution: int = 0
    model_config = ConfigDict(from_attributes=True)

class FaceVerificationResponse(BaseModel):
    id: str
    portrait_url: Optional[str] = None
    presented_url: Optional[str] = None
    outcome: str
    similarity_score: float
    quality_score: float
    quality_assessment: Optional[str] = None
    explanation: str
    recommendation: str
    risk_contribution: int = 0
    model_config = ConfigDict(from_attributes=True)

class ContributingFactor(BaseModel):
    title: str
    category: str
    points: int
    severity: str

class RiskAssessmentResponse(BaseModel):
    id: str
    total_score: int
    risk_level: str
    primary_concern: Optional[str] = None
    recommendation: str
    contributing_factors: Optional[List[ContributingFactor]] = None
    model_config = ConfigDict(from_attributes=True)

class ScreeningDecisionRequest(BaseModel):
    decision: str = Field(..., description="STANDARD_REVIEW, SECONDARY_REVIEW, ESCALATE, INCONCLUSIVE")
    officer_name: Optional[str] = "S. Sharma (Inspector/GD)"
    officer_id: Optional[str] = "SSB-OFFICER-4821"
    notes: Optional[str] = None

class ScreeningDecisionResponse(BaseModel):
    id: str
    decision: str
    officer_id: str
    officer_name: str
    notes: Optional[str] = None
    decided_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    category: str
    filename: str
    url: str
    mime_type: str
    file_size: int
    width: int
    height: int
    is_synthetic: bool
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    session_id: Optional[str] = None
    actor: str
    action: str
    details: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ScreeningSessionSummary(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    status: str
    document_type: str
    risk_level: Optional[str] = "PENDING"
    total_score: Optional[int] = 0
    primary_concern: Optional[str] = None
    recommendation: Optional[str] = None
    decision: Optional[str] = None
    is_demo_scenario: bool = False
    demo_scenario_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ScreeningSessionDetail(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    status: str
    document_type: str
    officer_notes: Optional[str] = None
    is_demo_scenario: bool = False
    demo_scenario_id: Optional[str] = None

    documents: List[DocumentResponse] = []
    extracted_fields: List[ExtractedFieldResponse] = []
    validations: List[ValidationResultResponse] = []
    forensic_findings: List[ForensicFindingResponse] = []
    face_verification: Optional[FaceVerificationResponse] = None
    risk_assessment: Optional[RiskAssessmentResponse] = None
    decisions: List[ScreeningDecisionResponse] = []
    audit_logs: List[AuditLogResponse] = []
    model_config = ConfigDict(from_attributes=True)

class DemoScenarioSummary(BaseModel):
    id: str
    title: str
    scenario_type: str
    description: str
    expected_risk_level: str
    primary_anomaly: str
    document_type: str
    preview_url: Optional[str] = None

class SystemSettingsSchema(BaseModel):
    risk_threshold_low: int
    risk_threshold_review: int
    risk_threshold_high: int
    enable_demo_watchlist: bool
    demo_watchlist_name: str
    ocr_engine: str = "EasyOCR + ICAO Doc 9303"
    face_quality_threshold: float = 35.0
