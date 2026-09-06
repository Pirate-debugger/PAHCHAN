import { useState, useEffect, useCallback } from 'react';
import type { ScreeningSession, SyntheticTestCase, DecisionType } from './types';
import { SYNTHETIC_TEST_CASES } from './data/mockCases';
import { executeScreeningApi } from './services/api';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ScreeningsQueue } from './components/ScreeningsQueue';
import { WorkstationView } from './components/WorkstationView';
import { ReportsView } from './components/ReportsView';
import { AuditLogView } from './components/AuditLogView';
import { SyntheticLab } from './components/SyntheticLab';
import { SettingsPanel } from './components/SettingsPanel';
import { ScreeningProgressModal } from './components/ScreeningProgressModal';
import { AuditReportModal } from './components/AuditReportModal';
import { AlertTriangle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeCaseId, setActiveCaseId] = useState<string>(SYNTHETIC_TEST_CASES[0].id);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<string>('Raxaul Land Border — Demonstration Environment');
  const [operatorId] = useState<string>('DEMO-OPERATOR-01');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialize with Case 1 (Genuine Passport)
  const [currentSession, setCurrentSession] = useState<ScreeningSession>({
    ...SYNTHETIC_TEST_CASES[0].sessionData,
    checkpoint: 'Raxaul Land Border — Demonstration Environment',
    operatorId: 'DEMO-OPERATOR-01',
    documentImageUrl: SYNTHETIC_TEST_CASES[0].documentImage,
    liveFaceImageUrl: SYNTHETIC_TEST_CASES[0].liveFaceImage,
  });

  const [isScreeningScanning, setIsScreeningScanning] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [pastSessions, setPastSessions] = useState<ScreeningSession[]>([]);
  const [uploadError, setUploadError] = useState<{
    title: string;
    reason: string;
    file: File;
  } | null>(null);

  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(true);
  const [backendUnreachable, setBackendUnreachable] = useState<boolean>(false);

  // Load a synthetic test case into active session
  const handleLoadTestCase = useCallback((tc: SyntheticTestCase) => {
    setActiveCaseId(tc.id);
    setIsDemoFallback(true);
    setBackendUnreachable(false);
    setCurrentSession({
      ...tc.sessionData,
      checkpoint: currentCheckpoint,
      operatorId: operatorId,
      documentImageUrl: tc.documentImage,
      liveFaceImageUrl: tc.liveFaceImage,
    });
  }, [currentCheckpoint, operatorId]);

  // Run AI Re-Screening Scan
  const handleRunFullScan = useCallback(() => {
    setIsScreeningScanning(true);
  }, []);

  const handleScanComplete = useCallback(() => {
    setIsScreeningScanning(false);
  }, []);

  // Custom document upload handler with P1.8 fallback resilience & visible indicator
  const handleCustomUpload = async (file: File) => {
    setUploadError(null);
    setIsScreeningScanning(true);

    try {
      const liveResult = await executeScreeningApi(file);
      if (liveResult) {
        setCurrentSession({
          ...liveResult,
          checkpoint: currentCheckpoint,
          operatorId: operatorId,
        });
        setPastSessions((prev) => [liveResult, ...prev]);
        setActiveCaseId(liveResult.sessionId);
        setIsDemoFallback(false);
        setBackendUnreachable(false);
        setActiveTab('workstation');
      } else {
        // P1.8 Fallback session when backend is unreachable or returns empty
        const fallbackSession: ScreeningSession = {
          ...SYNTHETIC_TEST_CASES[0].sessionData,
          sessionId: `OFFLINE-DEMO-${Date.now().toString().slice(-4)}`,
          checkpoint: currentCheckpoint,
          operatorId: operatorId,
          documentSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          documentImageUrl: URL.createObjectURL(file),
        };
        setCurrentSession(fallbackSession);
        setIsDemoFallback(true);
        setBackendUnreachable(true);
        setActiveTab('workstation');
      }
    } catch {
      // P1.8 Network communication failure fallback
      const fallbackSession: ScreeningSession = {
        ...SYNTHETIC_TEST_CASES[0].sessionData,
        sessionId: `OFFLINE-DEMO-${Date.now().toString().slice(-4)}`,
        checkpoint: currentCheckpoint,
        operatorId: operatorId,
        documentSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        documentImageUrl: URL.createObjectURL(file),
      };
      setCurrentSession(fallbackSession);
      setIsDemoFallback(true);
      setBackendUnreachable(true);
      setActiveTab('workstation');
    } finally {
      setIsScreeningScanning(false);
    }
  };

  const handleSetDecision = useCallback((decision: DecisionType) => {
    setCurrentSession((prev) => ({
      ...prev,
      decision
    }));
  }, []);

  // Safe keyboard shortcut listener (Section 37: No unexpected single-letter decisions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      
      // Ctrl+K or Cmd+K: Focus Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Escape: Dismiss any open modal
      if (e.key === 'Escape') {
        setShowReportModal(false);
        setUploadError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* 1. Clean Enterprise Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentCheckpoint={currentCheckpoint}
        operatorId={operatorId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Main Active Workflow Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        
        {/* WORKFLOW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            onStartScreening={() => setActiveTab('workstation')}
            onOpenCase={(s) => {
              setCurrentSession(s);
              setActiveTab('workstation');
            }}
            onViewAllScreenings={() => setActiveTab('screenings')}
            onOpenDemoLab={() => setActiveTab('demo-lab')}
            currentCheckpoint={currentCheckpoint}
          />
        )}

        {/* WORKFLOW 2: SCREENINGS QUEUE */}
        {activeTab === 'screenings' && (
          <ScreeningsQueue
            onOpenCaseInWorkstation={(s) => {
              setCurrentSession(s);
              setActiveTab('workstation');
            }}
            onOpenReport={(s) => {
              setCurrentSession(s);
              setActiveTab('reports');
            }}
            externalSearchQuery={searchQuery}
          />
        )}

        {/* WORKFLOW 3: SCREENING WORKSTATION (Case Review Workspace) */}
        {activeTab === 'workstation' && (
          <div className="space-y-4">
            {/* P1.8 Visible Demo / Fallback Indicator */}
            {isDemoFallback && (
              <div
                id="offline-demo-banner"
                className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs ${
                  backendUnreachable
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      backendUnreachable
                        ? 'bg-rose-200 text-rose-900 border border-rose-300'
                        : 'bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {backendUnreachable ? 'Backend Unreachable' : 'Offline Demo Data'}
                  </span>
                  <span className="font-semibold">
                    {backendUnreachable
                      ? 'OFFLINE DEMO DATA — backend unreachable. Results are simulated fallback data and must not be used for live clearance.'
                      : 'OFFLINE DEMO DATA — viewing synthetic demonstration case. Connect to live backend for automated verification.'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Target API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}
                </span>
              </div>
            )}
            <WorkstationView
              currentSession={currentSession}
              onSetDecision={handleSetDecision}
              onRunScan={handleRunFullScan}
              onCustomUpload={handleCustomUpload}
              onOpenReport={() => setShowReportModal(true)}
              isScanning={isScreeningScanning}
            />
          </div>
        )}

        {/* WORKFLOW 4: REPORTS */}
        {activeTab === 'reports' && (
          <ReportsView
            currentSession={currentSession}
            onOpenReportModal={() => setShowReportModal(true)}
            onSelectSession={(s) => setCurrentSession(s)}
          />
        )}

        {/* WORKFLOW 5: AUDIT LOG */}
        {activeTab === 'audit' && (
          <AuditLogView
            sessions={pastSessions}
            onViewSession={(s) => {
              setCurrentSession(s);
              setActiveTab('workstation');
            }}
          />
        )}

        {/* WORKFLOW 6: DEMO LAB (Synthetic Scenarios) */}
        {activeTab === 'demo-lab' && (
          <SyntheticLab
            onLoadTestCase={(tc) => {
              handleLoadTestCase(tc);
              setActiveTab('workstation');
            }}
            activeCaseId={activeCaseId}
            onCustomUpload={handleCustomUpload}
          />
        )}

        {/* WORKFLOW 7: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsPanel
            currentCheckpoint={currentCheckpoint}
            onCheckpointChange={(cp) => {
              setCurrentCheckpoint(cp);
              setCurrentSession((prev) => ({ ...prev, checkpoint: cp }));
            }}
          />
        )}

      </main>

      {/* Transparent AI Verification Progress Modal */}
      <ScreeningProgressModal
        isOpen={isScreeningScanning}
        onComplete={handleScanComplete}
      />

      {/* Official Screening Assessment Report Modal */}
      {showReportModal && (
        <AuditReportModal
          onClose={() => setShowReportModal(false)}
          session={currentSession}
        />
      )}

      {/* Upload Error Modal (Section 14: Defensible Failure Handling) */}
      {uploadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{uploadError.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">File: {uploadError.file.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              <strong>Reason:</strong> {uploadError.reason}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUploadError(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
              >
                Try Another Document
              </button>
              <button
                onClick={() => {
                  const retryFile = uploadError.file;
                  setUploadError(null);
                  handleCustomUpload(retryFile);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
