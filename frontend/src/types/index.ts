export type RiskLevel = 'LOW' | 'REVIEW' | 'HIGH' | 'CRITICAL' | 'PENDING';
export type SessionStatus = 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'ESCALATED' | 'ANALYSIS_FAILED';
export type OfficerDecisionType = 'STANDARD_REVIEW' | 'SECONDARY_REVIEW' | 'ESCALATE' | 'INCONCLUSIVE';

export interface DocumentItem {
  id: string;
  category: 'PRIMARY_DOCUMENT' | 'PRESENTED_PHOTO' | 'SECONDARY_VISA';
  filename: string;
  url: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  is_synthetic: boolean;
}

export interface ExtractedField {
  id: string;
  field_key: string;
  field_label: string;
  field_value: string | null;
  original_value: string | null;
  confidence: number;
  bbox_ymin: number | null;
  bbox_xmin: number | null;
  bbox_ymax: number | null;
  bbox_xmax: number | null;
  is_edited: boolean;
  source_zone: string;
}

export interface ValidationResult {
  id: string;
  rule_id: string;
  rule_name: string;
  category: 'CHECKSUM' | 'CHRONOLOGY' | 'FORMAT' | 'CONSISTENCY' | 'EXPIRY' | 'WATCHLIST' | 'GATEWAY';
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  message: string;
  details?: string;
  risk_points: number;
}

export interface ForensicFinding {
  id: string;
  category: 'PHOTO_ALTERATION' | 'TEXT_MANIPULATION' | 'STAMP_FORGERY' | 'METADATA_ANOMALY' | 'IDENTITY_CONSISTENCY' | 'FORMAT_TAMPERING' | 'DOCUMENT_TYPE_MISMATCH';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  explanation: string;
  evidence_preview_url?: string;
  heatmap_overlay_url?: string;
  bbox_ymin?: number;
  bbox_xmin?: number;
  bbox_ymax?: number;
  bbox_xmax?: number;
  technical_details?: string;
  risk_contribution: number;
}

export interface FaceVerification {
  id: string;
  portrait_url?: string;
  presented_url?: string;
  outcome: 'MATCH_SIGNAL' | 'REVIEW' | 'MISMATCH_SIGNAL' | 'UNABLE_TO_ASSESS';
  similarity_score: number;
  quality_score: number;
  quality_assessment?: string;
  explanation: string;
  recommendation: string;
  risk_contribution: number;
}

export interface ContributingFactor {
  title: string;
  category: string;
  points: number;
  severity: string;
}

export interface RiskAssessment {
  id: string;
  total_score: number;
  risk_level: RiskLevel;
  primary_concern?: string;
  recommendation: string;
  contributing_factors?: ContributingFactor[];
}

export interface ScreeningDecision {
  id: string;
  decision: OfficerDecisionType;
  officer_id: string;
  officer_name: string;
  notes?: string;
  decided_at: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  session_id?: string;
  actor: string;
  action: string;
  details?: string;
}

export interface ScreeningSessionSummary {
  id: string;
  created_at: string;
  updated_at: string;
  status: SessionStatus;
  document_type: string;
  risk_level: RiskLevel;
  total_score: number;
  primary_concern?: string;
  recommendation?: string;
  decision?: OfficerDecisionType;
  is_demo_scenario: boolean;
  demo_scenario_id?: string;
}

export interface ScreeningSessionDetail {
  id: string;
  created_at: string;
  updated_at: string;
  status: SessionStatus;
  document_type: string;
  officer_notes?: string;
  is_demo_scenario: boolean;
  demo_scenario_id?: string;
  documents: DocumentItem[];
  extracted_fields: ExtractedField[];
  validations: ValidationResult[];
  forensic_findings: ForensicFinding[];
  face_verification?: FaceVerification;
  risk_assessment?: RiskAssessment;
  decisions: ScreeningDecision[];
  audit_logs: AuditLogEntry[];
}

export interface DemoScenario {
  id: string;
  title: string;
  scenario_type: string;
  description: string;
  expected_risk_level: RiskLevel;
  primary_anomaly: string;
  document_type: string;
  preview_url?: string;
}

export interface WorkSummaryStats {
  pending_reviews: number;
  high_priority_reviews: number;
  completed_today: number;
  total_screenings: number;
}

export interface SystemSettings {
  risk_threshold_low: number;
  risk_threshold_review: number;
  risk_threshold_high: number;
  enable_demo_watchlist: boolean;
  demo_watchlist_name: string;
  ocr_engine: string;
  face_quality_threshold: number;
}

// Verification Flow State Machine
export type VerificationState =
  | 'IDLE'
  | 'UPLOADING'
  | 'PREVIEW_READY'
  | 'CLASSIFYING'
  | 'OCR_PROCESSING'
  | 'QR_PROCESSING'
  | 'MRZ_PROCESSING'
  | 'FORENSICS_PROCESSING'
  | 'AUTHORITY_CHECKING'
  | 'IDENTITY_CHECKING'
  | 'RISK_ANALYSIS'
  | 'COMPLETED'
  | 'SUSPICIOUS'
  | 'FAILED'
  | 'UNVERIFIABLE';

// Field Match Evaluation Status
export type FieldMatchStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'PARTIAL_MATCH'
  | 'NOT_FOUND'
  | 'LOW_CONFIDENCE'
  | 'NOT_VERIFIED';

// Verification Result Categorization
export type VerificationOutcomeType =
  | 'VERIFIED'
  | 'SUSPICIOUS'
  | 'LIKELY_COUNTERFEIT'
  | 'UNVERIFIABLE';

// Authoritative Identity Provider Status
export interface ProviderStatusInfo {
  provider_id: string;
  provider_name: string;
  is_configured: boolean;
  is_sandbox: boolean;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'SANDBOX' | 'DEMO_SANDBOX' | 'ERROR';
  capabilities: string[];
  environment: 'PRODUCTION' | 'SANDBOX' | 'UNCONFIGURED';
  last_checked: string;
  details?: string;
}

// Authoritative Comparison Record (Side-by-side verification)
export interface TrustedComparisonRecord {
  provider_id: string;
  provider_name: string;
  status: string;
  is_matched: boolean;
  identifier: string;
  confidence: number;
  evidence_notes: string;
  trusted_fields: Record<string, any>;
  mismatches: Array<{
    field: string;
    extracted?: string;
    trusted?: string;
    expected_initial?: string;
    extracted_surname?: string;
    severity: string;
  }>;
  authority_badge: string;
}

// 5-Category Risk Breakdown (Explains the risk score)
export interface RiskPillarBreakdown {
  document_integrity: number;
  issuer_verification: number;
  field_consistency: number;
  image_forensics: number;
  identity_match: number;
}

// 10-Stage Verification Timeline
export type TimelineStepId =
  | 'received'
  | 'classify'
  | 'ocr'
  | 'qr'
  | 'mrz'
  | 'structure'
  | 'tamper'
  | 'authority'
  | 'identity'
  | 'risk';

export type StepState =
  | 'PENDING'
  | 'PROCESSING'
  | 'PASSED'
  | 'WARNING'
  | 'FAILED'
  | 'UNAVAILABLE';

export interface TimelineStep {
  id: TimelineStepId;
  label: string;
  sublabel: string;
  state: StepState;
  telemetry?: string;
  durationMs?: number;
}

