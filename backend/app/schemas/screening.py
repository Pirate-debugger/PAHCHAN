"""
Pydantic Data Contracts for PAHCHAN API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ExtractedFieldSchema(BaseModel):
    key: str
    value: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    is_valid: bool = True
    bounding_box: Optional[List[float]] = None  # [x, y, w, h] in percentages

class ForensicRegionSchema(BaseModel):
    id: str
    name: str
    type: str  # PHOTO, TEXT, STAMP, METADATA
    x: float
    y: float
    width: float
    height: float
    risk_score: int
    status: str  # VALID, ALERT, SUSPICIOUS
    title: str
    explanation: str
    evidence: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class MRZChecksumDetails(BaseModel):
    doc_number_valid: bool = True
    dob_valid: bool = True
    expiry_valid: bool = True
    composite_valid: bool = True
    calculated_checksums: Dict[str, int] = {}
    expected_checksums: Dict[str, int] = {}

class ValidationResultSchema(BaseModel):
    is_valid: bool = True
    is_expired: bool = False
    is_dob_valid: bool = True
    is_format_valid: bool = True
    mrz_checksum_pass: bool = True
    mrz_details: MRZChecksumDetails = MRZChecksumDetails()
    issues: List[str] = []
    normalized_fields: Dict[str, str] = {}

class ForensicAnalysisResultSchema(BaseModel):
    ela_base64: str = ""
    ela_variance: float = 0.0
    max_difference: int = 0
    photo_integrity_score: int = 100
    text_integrity_score: int = 100
    stamp_integrity_score: int = 100
    metadata_integrity_score: int = 100
    photo_replaced: bool = False
    text_manipulated: bool = False
    stamp_forged: bool = False
    metadata_anomalous: bool = False
    software_detected: Optional[str] = None
    regions: List[ForensicRegionSchema] = []
    summary_notes: List[str] = []

class FaceVerificationResultSchema(BaseModel):
    match: bool = True
    similarity: float = 95.0
    confidence: float = 0.95
    threshold: float = 75.0
    status: str = "MATCH"  # MATCH, MISMATCH, NO_FACE_DETECTED
    live_detected: bool = True
    landmarks_detected: bool = True
    notes: str = "Biometric face match verified."

class CrossFieldMismatchSchema(BaseModel):
    field: str
    source1: str
    value1: str
    source2: str
    value2: str
    severity: str = "critical"
    description: str

class CrossDocumentResultSchema(BaseModel):
    match: bool = True
    mismatches: List[CrossFieldMismatchSchema] = []

class RiskFactorSchema(BaseModel):
    id: str
    category: str
    title: str
    points: int
    severity: str  # low, medium, high, critical
    description: str
    evidence: str

class ExplainabilityDossierSchema(BaseModel):
    what_happened: str
    why_is_it_risky: List[str]
    supporting_evidence: List[str]
    officer_recommendation: str

class RiskAssessmentResultSchema(BaseModel):
    total_risk_score: int
    risk_level: str  # LOW, MEDIUM, CRITICAL
    decision: str    # CLEAR_ENTRY, SECONDARY_INSPECTION, DETAIN_ALERT
    recommendation: str
    risk_factors: List[RiskFactorSchema]
    explainability: ExplainabilityDossierSchema

class ScreeningSessionCreate(BaseModel):
    document_type: str = "PASSPORT"
    operator_id: str = "OFFICER-SSB-449"
    checkpoint: str = "Raxaul Land Border Checkpoint (Indo-Nepal)"

class ScreeningSessionResponse(BaseModel):
    session_id: str
    timestamp: str
    operator_id: str
    checkpoint: str
    document_type: str
    document_sha256: str
    fields: Dict[str, Any]
    validation: ValidationResultSchema
    forensics: ForensicAnalysisResultSchema
    face_verification: FaceVerificationResultSchema
    cross_field: CrossDocumentResultSchema
    risk: RiskAssessmentResultSchema

class ScreeningReportResponse(BaseModel):
    session_id: str
    generated_at: str
    classification: str = "OFFICIAL GOVERNMENT SCREENING DOSSIER"
    document_type: str
    document_sha256: str
    operator_id: str
    checkpoint: str
    summary_verdict: str
    total_risk_score: int
    risk_level: str
    decision: str
    officer_action: str
    fields: Dict[str, Any]
    validation_findings: List[str]
    forensic_findings: List[ForensicRegionSchema]
    face_result: FaceVerificationResultSchema
    risk_factors: List[RiskFactorSchema]
    explainability: ExplainabilityDossierSchema
    audit_hash: str
