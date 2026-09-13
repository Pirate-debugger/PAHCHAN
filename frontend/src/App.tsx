import React, { useState, useEffect } from 'react';
import { AppHeader } from './components/layout/AppHeader';
import { Navigation } from './components/layout/Navigation';
import { DocumentVerificationWorkspace } from './features/workspace/DocumentVerificationWorkspace';
import { OverviewPage } from './features/overview/OverviewPage';
import { ScreeningListPage } from './features/screening/ScreeningListPage';
import { ScreeningWorkstation } from './features/screening/ScreeningWorkstation';
import { NewScreeningModal } from './features/screening/NewScreeningModal';
import { AnalysisProgressModal } from './features/screening/AnalysisProgressModal';
import { ProviderCenterPage } from './features/providers/ProviderCenterPage';
import { DemoLabPage } from './features/demo/DemoLabPage';
import { ReportsListPage } from './features/reports/ReportsListPage';
import { OfficialReportView } from './features/reports/OfficialReportView';
import { AuditLogPage } from './features/audit/AuditLogPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastNotification, ToastMessage } from './components/common/ToastNotification';
import { ScreeningSessionDetail, OfficerDecisionType } from './types';
import { api } from './services/api';

export function App() {
  // Primary Experience Tab: 'workspace' is the hero document verification platform
  const [activeTab, setActiveTab] = useState<string>('workspace');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workstation / Active Case state
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ScreeningSessionDetail | null>(null);
  const [_loadingCase, setLoadingCase] = useState(false);

  // Modals state
  const [isNewScreeningOpen, setIsNewScreeningOpen] = useState(false);
  const [isAnalysisProgressOpen, setIsAnalysisProgressOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [pendingAnalysisCaseId, setPendingAnalysisCaseId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Demo lab loading
  const [loadingDemoScenarioId, setLoadingDemoScenarioId] = useState<string | null>(null);

  // Report view state
  const [activeReportData, setActiveReportData] = useState<any | null>(null);

  // Notifications Toast Queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load case detail into primary verification workspace
  const loadCaseDetail = async (caseId: string) => {
    try {
      setLoadingCase(true);
      const data = await api.getScreening(caseId);
      setActiveSession(data);
      setActiveCaseId(caseId);
      setActiveTab('workspace');
      addToast('info', 'Case Loaded', `Viewing verification case ${caseId}`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Load Failed', `Could not load case ${caseId}`);
    } finally {
      setLoadingCase(false);
    }
  };

  // Submit new document screening from modal
  const handleSubmitNewScreening = async (formData: FormData) => {
    try {
      setIsSubmittingNew(true);
      const summary = await api.createScreening(formData);
      setIsNewScreeningOpen(false);
      setPendingAnalysisCaseId(summary.id);
      setIsAnalysisProgressOpen(true);
    } catch (err) {
      console.error(err);
      addToast('error', 'Upload Failed', 'Failed to upload document for screening');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Complete modal analysis and transition to workspace
  const handleAnalysisComplete = async () => {
    if (!pendingAnalysisCaseId) return;
    try {
      const detailed = await api.analyzeScreening(pendingAnalysisCaseId);
      setIsAnalysisProgressOpen(false);
      setActiveSession(detailed);
      setActiveCaseId(pendingAnalysisCaseId);
      setPendingAnalysisCaseId(null);
      setActiveTab('workspace');
      addToast('success', 'Analysis Complete', `Session ${detailed.id} processed successfully`);
    } catch (err) {
      console.error(err);
      setIsAnalysisProgressOpen(false);
      addToast('error', 'Analysis Error', 'Error during automated screening analysis');
    }
  };

  // Load a demo scenario from Demo Lab
  const handleLoadDemoScenario = async (scenarioId: string): Promise<ScreeningSessionDetail> => {
    try {
      setLoadingDemoScenarioId(scenarioId);
      const detailed = await api.loadDemoScenario(scenarioId);
      setActiveSession(detailed);
      setActiveCaseId(detailed.id);
      setActiveTab('workspace');
      addToast('success', 'Scenario Loaded', `Evaluating ${detailed.document_type} case`);
      return detailed;
    } catch (err) {
      console.error(err);
      addToast('error', 'Scenario Failed', `Failed to execute demo scenario ${scenarioId}`);
      throw err;
    } finally {
      setLoadingDemoScenarioId(null);
    }
  };

  // Record officer screening decision
  const handleRecordDecision = async (decision: OfficerDecisionType, notes?: string) => {
    if (!activeCaseId) return;
    try {
      await api.recordDecision(activeCaseId, decision, notes);
      const updated = await api.getScreening(activeCaseId);
      setActiveSession(updated);
      addToast('success', 'Determination Stamped', `Action recorded: ${decision}`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Action Failed', 'Failed to record officer decision');
    }
  };

  // Edit OCR field
  const handleEditField = async (fieldKey: string, newValue: string, notes?: string) => {
    if (!activeCaseId) return;
    try {
      await api.editField(activeCaseId, fieldKey, newValue, notes);
      const updated = await api.getScreening(activeCaseId);
      setActiveSession(updated);
      addToast('success', 'Field Corrected', `Updated ${fieldKey}`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Edit Failed', 'Failed to save field correction');
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
      addToast('error', 'Dossier Error', `Failed to load report for case ${caseId}`);
    }
  };

  // Global stats for navigation badges
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshGlobalStats = async () => {
    try {
      const stats = await api.getStats();
      setPendingCount(stats.pending_reviews || 0);
    } catch {
      // Ignore background stats failure
    }
  };

  useEffect(() => {
    refreshGlobalStats();
  }, [activeTab]);

  // Command palette action router
  const handleCommandAction = (actionId: string) => {
    if (actionId === 'TOGGLE_COMMAND_PALETTE') {
      setIsCommandPaletteOpen((prev) => !prev);
      return;
    }
    if (actionId === 'verify_new') {
      setActiveSession(null);
      setActiveCaseId(null);
      setActiveTab('workspace');
    } else if (actionId === 'open_dashboard') {
      setActiveTab('overview');
    } else if (actionId === 'open_queue') {
      setActiveTab('screenings');
    } else if (actionId === 'open_providers') {
      setActiveTab('providers');
    } else if (actionId === 'open_demo_lab') {
      setActiveTab('demo');
    } else if (actionId === 'open_reports') {
      setActiveTab('reports');
    } else if (actionId === 'open_settings') {
      setActiveTab('settings');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Sovereign Application Header */}
      <AppHeader
        onNewScreening={() => {
          setActiveSession(null);
          setActiveCaseId(null);
          setActiveTab('workspace');
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeTab !== 'screenings') {
            setActiveTab('screenings');
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Navigation Bar */}
      <div className="no-print">
        <Navigation
          activeTab={activeTab === 'report_detail' ? '' : activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'workspace' && !activeSession) {
              setActiveCaseId(null);
            }
          }}
          pendingCount={pendingCount}
        />
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PRIMARY EXPERIENCE: DOCUMENT VERIFICATION WORKSPACE */}
        {activeTab === 'workspace' && (
          <DocumentVerificationWorkspace
            initialSession={activeSession}
            onOpenReport={handleOpenReport}
            onNotify={addToast}
            onLoadDemoScenario={handleLoadDemoScenario}
          />
        )}

        {activeTab === 'overview' && (
          <OverviewPage
            onOpenCase={loadCaseDetail}
            onNewScreening={() => {
              setActiveSession(null);
              setActiveCaseId(null);
              setActiveTab('workspace');
            }}
            onViewDemoLab={() => setActiveTab('demo')}
            onViewAllScreenings={() => setActiveTab('screenings')}
          />
        )}

        {activeTab === 'screenings' && (
          <ScreeningListPage
            onOpenCase={loadCaseDetail}
            onNewScreening={() => {
              setActiveSession(null);
              setActiveCaseId(null);
              setActiveTab('workspace');
            }}
          />
        )}

        {activeTab === 'workstation' && activeSession && (
          <ScreeningWorkstation
            session={activeSession}
            onBack={() => {
              setActiveTab('screenings');
              refreshGlobalStats();
            }}
            onRecordDecision={async (decision, notes) => {
              await handleRecordDecision(decision, notes);
              refreshGlobalStats();
            }}
            onEditField={handleEditField}
            onPrintReport={() => handleOpenReport(activeSession.id)}
          />
        )}

        {activeTab === 'providers' && (
          <ProviderCenterPage />
        )}

        {activeTab === 'demo' && (
          <DemoLabPage
            onLoadScenario={async (id) => {
              await handleLoadDemoScenario(id);
            }}
            loadingScenarioId={loadingDemoScenarioId}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsListPage onOpenReport={handleOpenReport} />
        )}

        {activeTab === 'report_detail' && activeReportData && (
          <OfficialReportView
            reportData={activeReportData}
            onBack={() => setActiveTab(activeCaseId ? 'workspace' : 'reports')}
          />
        )}

        {activeTab === 'audit' && <AuditLogPage />}

        {activeTab === 'settings' && <SettingsPage />}

      </main>

      {/* Sovereign Legal Footer */}
      <footer className="no-print bg-white border-t border-slate-200/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 tracking-wider">PAHCHAN (पहचान)</span>
            <span className="text-slate-300">&bull;</span>
            <span>AI Fake Identity &amp; Travel Document Screening System</span>
            <span className="text-slate-300 hidden md:inline">&bull;</span>
            <span className="font-mono text-slate-500 text-[11px] hidden md:inline">Border Screening Outpost</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>Sashastra Seema Bal &bull; Ministry of Home Affairs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">ICP-04 ACTIVE</span>
            <span className="text-slate-300">&bull;</span>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-slate-800 underline underline-offset-2"
            >
              Ctrl+K Actions
            </button>
          </div>
        </div>
      </footer>

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleCommandAction}
      />

      {/* Accessible Non-Blocking Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* New Screening Upload Modal (Secondary fallback) */}
      <NewScreeningModal
        isOpen={isNewScreeningOpen}
        onClose={() => setIsNewScreeningOpen(false)}
        onSubmit={handleSubmitNewScreening}
        isSubmitting={isSubmittingNew}
      />

      {/* Analysis Progress Stage Modal (Secondary fallback) */}
      <AnalysisProgressModal
        isOpen={isAnalysisProgressOpen}
        onComplete={handleAnalysisComplete}
      />

    </div>
  );
}

export default App;
