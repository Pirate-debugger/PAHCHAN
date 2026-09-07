import React, { useState } from 'react';
import { ScreeningSessionDetail, OfficerDecisionType } from '../../types';
import { DocumentViewer } from '../document/DocumentViewer';
import { ExtractedInfoPanel } from './ExtractedInfoPanel';
import { FindingsEvidenceDrawer } from './FindingsEvidenceDrawer';
import { DecisionModal } from './DecisionModal';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import {
  ArrowLeft,
  Printer,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ScreeningWorkstationProps {
  session: ScreeningSessionDetail;
  onBack: () => void;
  onRecordDecision: (decision: OfficerDecisionType, notes?: string) => Promise<void>;
  onEditField: (fieldKey: string, newValue: string, notes?: string) => Promise<void>;
  onPrintReport: () => void;
}

export const ScreeningWorkstation: React.FC<ScreeningWorkstationProps> = ({
  session,
  onBack,
  onRecordDecision,
  onEditField,
  onPrintReport
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [hoveredFieldKey, setHoveredFieldKey] = useState<string | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const primaryDoc = session.documents.find((d) => d.category === 'PRIMARY_DOCUMENT') || session.documents[0];
  const heatmapFinding = session.forensic_findings.find((f) => f.heatmap_overlay_url);
  const heatmapUrl = heatmapFinding?.heatmap_overlay_url;

  const risk = session.risk_assessment;
  const latestDecision = session.decisions && session.decisions.length > 0
    ? session.decisions[session.decisions.length - 1]
    : null;

  // Export Case JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PAHCHAN_CASE_${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      
      {/* Workstation Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Case Identification & Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Back to queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900">{session.id}</span>
                <span className="text-xs text-slate-500 font-medium">&bull; {session.document_type}</span>
                <StatusPill status={session.status} />
                {session.is_demo_scenario && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    DEMO LAB SCENARIO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Screening started {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Border Checkpoint Terminal 3
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Download full forensic JSON dossier"
            >
              <span>Export Dossier (JSON)</span>
            </button>

            <button
              onClick={onPrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Report</span>
            </button>

            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand-800 hover:bg-brand-900 text-white transition shadow-sm active:scale-95"
            >
              <FileCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{latestDecision ? 'Update Determination' : 'Record Determination'}</span>
            </button>
          </div>

        </div>

        {/* Screening Answer Banner (UX Principle: Answer First!) */}
        {risk && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <RiskBadge level={risk.risk_level} score={risk.total_score} size="lg" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {risk.primary_concern || 'No significant concerns identified'}
                </span>
                <span className="text-xs text-slate-600">
                  Recommended Action: <strong className="text-slate-800">{risk.recommendation}</strong>
                </span>
              </div>
            </div>

            {latestDecision && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] block">Officer Determination</span>
                <span className="font-bold text-slate-900 font-mono">
                  {latestDecision.decision.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main 3-Column Workstation Layout: 3 cols (Info) / 6 cols (Document Canvas Hero) / 3 cols (Evidence Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Extracted Information (Field -> Source) (3 Cols) */}
        <div className="lg:col-span-3 h-[680px]">
          <ExtractedInfoPanel
            fields={session.extracted_fields}
            selectedFieldKey={selectedFieldKey}
            onSelectField={(key) => {
              setSelectedFieldKey(key);
              setSelectedFindingId(null);
            }}
            onHoverField={(key) => setHoveredFieldKey(key)}
            onEditField={onEditField}
          />
        </div>

        {/* Center Column: Visual Hero Document Canvas (6 Cols - 50% wider hero viewport!) */}
        <div className="lg:col-span-6 h-[680px]">
          {primaryDoc ? (
            <DocumentViewer
              documentUrl={primaryDoc.url}
              heatmapUrl={heatmapUrl}
              findings={session.forensic_findings}
              fields={session.extracted_fields}
              selectedFindingId={selectedFindingId}
              selectedFieldKey={selectedFieldKey}
              hoveredFieldKey={hoveredFieldKey}
              onSelectFinding={(id) => {
                setSelectedFindingId(id);
                setSelectedFieldKey(null);
              }}
              onSelectField={(key) => {
                setSelectedFieldKey(key);
                setSelectedFindingId(null);
              }}
            />
          ) : (
            <div className="h-full bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 text-xs">
              No Document Media Available
            </div>
          )}
        </div>

        {/* Right Column: Findings & Evidence (3 Cols) */}
        <div className="lg:col-span-3 h-[680px]">
          <FindingsEvidenceDrawer
            findings={session.forensic_findings}
            validations={session.validations}
            faceVerification={session.face_verification}
            selectedFindingId={selectedFindingId}
            onSelectFinding={(id) => {
              setSelectedFindingId(id);
              setSelectedFieldKey(null);
            }}
          />
        </div>

      </div>

      {/* Decision Recording Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        caseId={session.id}
        onConfirm={onRecordDecision}
      />

    </div>
  );
};
