export type DocumentType = 'PASSPORT' | 'VISA' | 'NATIONAL_ID' | 'DRIVING_LICENSE' | 'PERMIT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'CRITICAL';

export type DecisionType = 'CLEAR_ENTRY' | 'SECONDARY_INSPECTION' | 'DETAIN_ALERT' | 'PENDING';

export interface RiskFactor {
  id: string;
  category: 'OCR' | 'VALIDATION' | 'PHOTO_TAMPERING' | 'TEXT_TAMPERING' | 'STAMP_TAMPERING' | 'METADATA' | 'FACE_BIOMETRIC' | 'CROSS_FIELD' | 'WATCHLIST';
  title: string;
  points: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  regionId?: string;
}

export interface DocumentFields {
  name: string;
  docNumber: string;
  nationality: string;
  dob: string;
  expiryDate: string;
  gender: string;
  issueDate?: string;
  docType: DocumentType;
  visaNumber?: string;
  visaType?: string;
  entryValidation?: string;
  stayDuration?: string;
  mrzLine1?: string;
  mrzLine2?: string;
  mrzLine3?: string;
  rawText?: string;
  fieldConfidences?: Record<string, number>;
}

export interface ValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isDobValid: boolean;
  isFormatValid: boolean;
  mrzChecksumPass: boolean;
  mrzDetails: {
    docNumberValid: boolean;
    dobValid: boolean;
    expiryValid: boolean;
    compositeValid: boolean;
    calculatedChecksums: Record<string, number>;
    expectedChecksums: Record<string, number>;
  };
  issues: string[];
  normalizedFields: Record<string, string>;
}

export interface ForensicRegion {
  id: string;
  name: string;
  type: 'PHOTO' | 'TEXT' | 'STAMP' | 'METADATA' | 'MRZ';
  x: number;
  y: number;
  width: number;
  height: number;
  riskScore: number;
  status: 'VALID' | 'WARNING' | 'ALERT';
  title: string;
  explanation: string;
  evidence?: string;
  metrics: {
    elaVariance?: number;
    edgeDiscontinuity?: number;
    noiseIndex?: number;
    ssimMatch?: number;
    fontConsistency?: number;
  };
  cropUrl?: string;
}

export interface TamperingAnalysis {
  photoIntegrityScore: number;
  textIntegrityScore: number;
  stampIntegrityScore: number;
  metadataIntegrityScore: number;
  photoReplaced: boolean;
  textManipulated: boolean;
  stampForged: boolean;
  metadataAnomalous: boolean;
  softwareDetected?: string;
  metadataTags?: Record<string, string>;
  regions: ForensicRegion[];
  summaryNotes: string[];
  elaImageUrl?: string;
  elaVariance?: number;
}

export interface FaceVerificationResult {
  match: boolean | null;
  similarity: number | null;
  confidence: number;
  threshold: number;
  status: 'MATCH' | 'INCONCLUSIVE' | 'MISMATCH' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES' | 'NO_LIVE_CAPTURE';
  liveDetected: boolean;
  landmarksDetected: boolean;
  notes: string;
}

export interface CrossFieldResult {
  match: boolean;
  mismatches: Array<{
    field: string;
    source1: string;
    value1: string;
    source2: string;
    value2: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
  }>;
}

export interface WatchlistRecord {
  id: string;
  fullName: string;
  aliases?: string[];
  docNumber: string;
  nationality: string;
  dob: string;
  riskCategory: 'TERRORISM' | 'HUMAN_TRAFFICKING' | 'FINANCIAL_CRIME' | 'IMMIGRATION_VIOLATION' | 'INTERPOL_RED_NOTICE';
  flaggedBy: 'SSB Intelligence' | 'MHA Bureau of Immigration' | 'INTERPOL' | 'State Police CID';
  severity: 'CRITICAL' | 'HIGH';
  alertNotes: string;
  dateAdded: string;
  photoUrl?: string;
}

export interface ExplainabilityDossier {
  whatHappened: string;
  whyIsItRisky: string[];
  supportingEvidence: string[];
  officerRecommendation: string;
}

export interface ScreeningSession {
  sessionId: string;
  timestamp: string;
  operatorId: string;
  checkpoint: string;
  documentType: DocumentType;
  documentImageUrl: string;
  documentSha256?: string;
  liveFaceImageUrl?: string;
  fields: DocumentFields;
  validation: ValidationResult;
  tampering: TamperingAnalysis;
  faceVerification?: FaceVerificationResult;
  crossField: CrossFieldResult;
  watchlistHit?: WatchlistRecord | null;
  riskFactors: RiskFactor[];
  totalRiskScore: number;
  riskLevel: RiskLevel;
  decision: DecisionType;
  operatorNotes?: string;
  explainability?: ExplainabilityDossier;
}

export interface SyntheticTestCase {
  id: string;
  caseNumber: number;
  title: string;
  tagline: string;
  category: 'GENUINE' | 'PHOTO_TAMPER' | 'TEXT_TAMPER' | 'STAMP_TAMPER' | 'FACE_MISMATCH' | 'EXPIRED_METADATA' | 'CROSS_DOC_MISMATCH' | 'MULTIPLE_RISK';
  expectedRiskLevel: RiskLevel;
  expectedScoreRange: [number, number];
  description: string;
  documentImage: string;
  liveFaceImage: string;
  visaImage?: string;
  fields: DocumentFields;
  sessionData: ScreeningSession;
}
