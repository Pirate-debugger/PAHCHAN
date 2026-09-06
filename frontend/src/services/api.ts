/**
 * PAHCHAN Frontend API Client
 * Connects React UI to FastAPI backend with graceful local resilience.
 */

import type { ScreeningSession } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8000/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function executeScreeningApi(
  docFile: File,
  liveFile?: File,
  mrz1?: string,
  mrz2?: string,
  threshold: number = 75.0
): Promise<ScreeningSession | null> {
  try {
    const formData = new FormData();
    formData.append('doc_file', docFile);
    if (liveFile) {
      formData.append('live_file', liveFile);
    }
    if (mrz1) formData.append('mrz_line1', mrz1);
    if (mrz2) formData.append('mrz_line2', mrz2);
    formData.append('face_threshold', threshold.toString());

    const res = await fetch(`${API_BASE_URL}/screenings`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Screening API returned error:', errText);
      return null;
    }

    const data = await res.json();
    return {
      sessionId: data.session_id,
      timestamp: data.timestamp,
      operatorId: data.operator_id,
      checkpoint: data.checkpoint,
      documentType: data.document_type,
      documentImageUrl: URL.createObjectURL(docFile),
      documentSha256: data.document_sha256,
      liveFaceImageUrl: liveFile ? URL.createObjectURL(liveFile) : undefined,
      fields: data.fields,
      validation: data.validation,
      tampering: data.forensics,
      faceVerification: data.face_verification,
      crossField: data.cross_field,
      riskFactors: data.risk.risk_factors || [],
      totalRiskScore: data.risk.total_risk_score,
      riskLevel: data.risk.risk_level,
      decision: data.risk.decision,
      operatorNotes: data.risk.recommendation,
      explainability: data.risk.explainability
    };
  } catch (err) {
    console.warn('Network error calling screening API:', err);
    return null;
  }
}

export async function fetchAuditLogsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit/logs?limit=50`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}
