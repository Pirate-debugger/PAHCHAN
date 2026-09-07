import React, { useState, useEffect } from 'react';
import { AppHeader } from './components/layout/AppHeader';
import { Navigation } from './components/layout/Navigation';
import { OverviewPage } from './features/overview/OverviewPage';
import { ScreeningListPage } from './features/screening/ScreeningListPage';
import { ScreeningWorkstation } from './features/screening/ScreeningWorkstation';
import { NewScreeningModal } from './features/screening/NewScreeningModal';
import { AnalysisProgressModal } from './features/screening/AnalysisProgressModal';
import { DemoLabPage } from './features/demo/DemoLabPage';
import { ReportsListPage } from './features/reports/ReportsListPage';
import { OfficialReportView } from './features/reports/OfficialReportView';
import { AuditLogPage } from './features/audit/AuditLogPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ScreeningSessionDetail, OfficerDecisionType } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workstation state
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ScreeningSessionDetail | null>(null);
  const [loadingCase, setLoadingCase] = useState(false);

  // Modals state
  const [isNewScreeningOpen, setIsNewScreeningOpen] = useState(false);
  const [isAnalysisProgressOpen, setIsAnalysisProgressOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [pendingAnalysisCaseId, setPendingAnalysisCaseId] = useState<string | null>(null);

  // Demo lab loading
  const [loadingDemoScenarioId, setLoadingDemoScenarioId] = useState<string | null>(null);

  // Report view state
  const [activeReportData, setActiveReportData] = useState<any | null>(null);

  // Load case detail
  const loadCaseDetail = async (caseId: string) => {
    try {
      setLoadingCase(true);
      const data = await api.getScreening(caseId);
      setActiveSession(data);
      setActiveCaseId(caseId);
      setActiveTab('workstation');
    } catch (err) {
      console.error(err);
      alert(`Could not load case ${caseId}`);
    } finally {
      setLoadingCase(false);
    }
  };

  // Submit new document screening
  const handleSubmitNewScreening = async (formData: FormData) => {
    try {
      setIsSubmittingNew(true);
      const summary = await api.createScreening(formData);
      setIsNewScreeningOpen(false);
      setPendingAnalysisCaseId(summary.id);
      setIsAnalysisProgressOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to upload document for screening');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Complete analysis and transition to workstation
  const handleAnalysisComplete = async () => {
    if (!pendingAnalysisCaseId) return;
    try {
      const detailed = await api.analyzeScreening(pendingAnalysisCaseId);
      setIsAnalysisProgressOpen(false);
      setActiveSession(detailed);
      setActiveCaseId(pendingAnalysisCaseId);
      setPendingAnalysisCaseId(null);
      setActiveTab('workstation');
    } catch (err) {
      console.error(err);
      setIsAnalysisProgressOpen(false);
      alert('Error during automated screening analysis');
    }
  };

  // Load a demo scenario from Demo Lab
  const handleLoadDemoScenario = async (scenarioId: string) => {
    try {
      setLoadingDemoScenarioId(scenarioId);
      const detailed = await api.loadDemoScenario(scenarioId);
      setActiveSession(detailed);
      setActiveCaseId(detailed.id);
      setActiveTab('workstation');
    } catch (err) {
      console.error(err);
      alert(`Failed to execute demo scenario ${scenarioId}`);
    } finally {
      setLoadingDemoScenarioId(null);
    }
  };

  // Record officer screening decision
  const handleRecordDecision = async (decision: OfficerDecisionType, notes?: string) => {
    if (!activeCaseId) return;
    try {
      await api.recordDecision(activeCaseId, decision, notes);
      // Reload session
      const updated = await api.getScreening(activeCaseId);
      setActiveSession(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to record decision');
    }
  };

  // Edit OCR field
  const handleEditField = async (fieldKey: string, newValue: string, notes?: string) => {
    if (!activeCaseId) return;
    try {
      await api.editField(activeCaseId, fieldKey, newValue, notes);
      const updated = await api.getScreening(activeCaseId);
      setActiveSession(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to save field correction');
    }
  };

  // Open official report dossier
  const handleOpenReport = async (caseId: string) => {
    try {
      const report = await api.getReport(caseId);
      setActiveReportData(report);
      setActiveTab('report_detail');
    } catch (err) {
      console.error(err);
      alert(`Failed to load report for case ${caseId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      
      {/* Top Application Header */}
      <AppHeader
        onNewScreening={() => setIsNewScreeningOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Navigation Bar */}
      <div className="no-print">
        <Navigation
          activeTab={activeTab === 'workstation' || activeTab === 'report_detail' ? '' : activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setActiveCaseId(null);
          }}
        />
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'overview' && (
          <OverviewPage
            onOpenCase={loadCaseDetail}
            onNewScreening={() => setIsNewScreeningOpen(true)}
            onViewDemoLab={() => setActiveTab('demo')}
            onViewAllScreenings={() => setActiveTab('screenings')}
          />
        )}

        {activeTab === 'screenings' && (
          <ScreeningListPage
            onOpenCase={loadCaseDetail}
            onNewScreening={() => setIsNewScreeningOpen(true)}
          />
        )}

        {activeTab === 'workstation' && activeSession && (
          <ScreeningWorkstation
            session={activeSession}
            onBack={() => setActiveTab('screenings')}
            onRecordDecision={handleRecordDecision}
            onEditField={handleEditField}
            onPrintReport={() => handleOpenReport(activeSession.id)}
          />
        )}

        {activeTab === 'demo' && (
          <DemoLabPage
            onLoadScenario={handleLoadDemoScenario}
            loadingScenarioId={loadingDemoScenarioId}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsListPage onOpenReport={handleOpenReport} />
        )}

        {activeTab === 'report_detail' && activeReportData && (
          <OfficialReportView
            reportData={activeReportData}
            onBack={() => setActiveTab(activeCaseId ? 'workstation' : 'reports')}
          />
        )}

        {activeTab === 'audit' && <AuditLogPage />}

        {activeTab === 'settings' && <SettingsPage />}

      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PAHCHAN &mdash; AI Fake Identity &amp; Document Screening System &bull; SIH 2026 Problem Statement SIH2026188</span>
          <span className="font-mono text-slate-400">SSB Police II Division &bull; Ministry of Home Affairs</span>
        </div>
      </footer>

      {/* New Screening Upload Modal */}
      <NewScreeningModal
        isOpen={isNewScreeningOpen}
        onClose={() => setIsNewScreeningOpen(false)}
        onSubmit={handleSubmitNewScreening}
        isSubmitting={isSubmittingNew}
      />

      {/* Analysis Progress Stage Modal */}
      <AnalysisProgressModal
        isOpen={isAnalysisProgressOpen}
        onComplete={handleAnalysisComplete}
      />

    </div>
  );
}

export default App;
