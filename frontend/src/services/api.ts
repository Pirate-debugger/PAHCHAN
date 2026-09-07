import {
  ScreeningSessionSummary,
  ScreeningSessionDetail,
  WorkSummaryStats,
  DemoScenario,
  OfficerDecisionType,
  SystemSettings,
  AuditLogEntry
} from '../types';

const BASE_URL = '/api';

export const api = {
  async getStats(): Promise<WorkSummaryStats> {
    const res = await fetch(`${BASE_URL}/screenings/stats`);
    if (!res.ok) throw new Error('Failed to fetch summary stats');
    return res.json();
  },

  async listScreenings(status?: string, search?: string): Promise<ScreeningSessionSummary[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/screenings?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch screenings list');
    return res.json();
  },

  async getScreening(id: string): Promise<ScreeningSessionDetail> {
    const res = await fetch(`${BASE_URL}/screenings/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch screening case ${id}`);
    return res.json();
  },

  async createScreening(formData: FormData): Promise<ScreeningSessionSummary> {
    const res = await fetch(`${BASE_URL}/screenings`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to create screening session');
    return res.json();
  },

  async analyzeScreening(
    id: string,
    options?: { force_flags?: string; force_face?: string }
  ): Promise<ScreeningSessionDetail> {
    const params = new URLSearchParams();
    if (options?.force_flags) params.append('force_scenario_flags', options.force_flags);
    if (options?.force_face) params.append('force_face_outcome', options.force_face);

    const res = await fetch(`${BASE_URL}/screenings/${id}/analyze?${params.toString()}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to execute screening analysis');
    return res.json();
  },

  async recordDecision(
    id: string,
    decision: OfficerDecisionType,
    notes?: string,
    officerName: string = 'S. Sharma (Inspector/GD)'
  ): Promise<any> {
    const res = await fetch(`${BASE_URL}/screenings/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        notes,
        officer_name: officerName
      })
    });
    if (!res.ok) throw new Error('Failed to record screening decision');
    return res.json();
  },

  async editField(
    sessionId: string,
    fieldKey: string,
    newValue: string,
    notes?: string
  ): Promise<any> {
    const res = await fetch(`${BASE_URL}/screenings/${sessionId}/fields/${fieldKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_value: newValue,
        officer_notes: notes
      })
    });
    if (!res.ok) throw new Error('Failed to update extracted field');
    return res.json();
  },

  async listDemoScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${BASE_URL}/demo/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch demo scenarios');
    return res.json();
  },

  async loadDemoScenario(scenarioId: string): Promise<ScreeningSessionDetail> {
    const res = await fetch(`${BASE_URL}/demo/scenarios/${scenarioId}/load`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to load scenario ${scenarioId}`);
    return res.json();
  },

  async listReports(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports archive');
    return res.json();
  },

  async getReport(sessionId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/reports/${sessionId}`);
    if (!res.ok) throw new Error(`Failed to fetch report for case ${sessionId}`);
    return res.json();
  },

  async getAuditLogs(sessionId?: string, action?: string): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    if (action) params.append('action', action);
    const res = await fetch(`${BASE_URL}/audit?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit trail');
    return res.json();
  },

  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch system settings');
    return res.json();
  },

  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update system settings');
    return res.json();
  }
};
