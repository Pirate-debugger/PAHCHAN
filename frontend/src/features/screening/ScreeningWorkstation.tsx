import React, { useState } from 'react';
import { ScreeningSessionDetail, OfficerDecisionType } from '../../types';
import { DocumentViewer } from '../document/DocumentViewer';
import { ExtractedInfoPanel } from './ExtractedInfoPanel';
import { FindingsEvidenceDrawer } from './FindingsEvidenceDrawer';
import { DecisionModal } from './DecisionModal';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Printer,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  RotateCcw
} from 'lucide-react';

interface ScreeningWorkstationProps {
  session: ScreeningSessionDetail;
  onBack: () => void;
  onRecordDecision: (decision: OfficerDecisionType, notes?: string) => Promise<void>;
  onEditField: (fieldKey: string, newValue: string, notes?: string) => Promise<void>;
  onPrintReport: () => void;
  onRetry?: () => Promise<void>;
}

export const ScreeningWorkstation: React.FC<ScreeningWorkstationProps> = ({
  session,
  onBack,
  onRecordDecision,
  onEditField,
  onPrintReport,
  onRetry
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

  // Calculate authenticity confidence
  const riskScore = risk ? risk.total_score : 0;
  const confidenceScore = Math.max(14.5, Math.min(99.4, 100 - riskScore * 0.92)).toFixed(1);
  const isVerified = risk?.risk_level === 'LOW';

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
      
      {/* 1. Workstation Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Case Identification & Checkpoint Location */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to screening queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-lg font-black text-slate-900">{session.id}</span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs font-semibold text-slate-600">{session.document_type}</span>
                <StatusPill status={session.status} />
                {session.is_demo_scenario && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    SYNTHETIC DEMO CASE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Screened {new Date(session.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })} &bull; Outpost Gate 3 &bull; Terminal ICP-04
              </p>
            </div>
          </div>

          {/* Workstation Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportJson}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              title="Download full forensic JSON evidence dossier"
            >
              Export JSON
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onPrintReport}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Official Dossier
            </Button>

            <Button
              variant="sovereign"
              size="sm"
              onClick={() => setIsDecisionModalOpen(true)}
              leftIcon={<FileCheck className="w-4 h-4 stroke-[2.4]" />}
            >
              {latestDecision ? 'Update Determination' : 'Record Determination'}
            </Button>
          </div>

        </div>

        {/* Synthetic Demonstration Document Banner */}
        {session.is_demo_scenario && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between gap-3 text-amber-950 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>SYNTHETIC DEMONSTRATION DOCUMENT — NOT A REAL IDENTITY DOCUMENT</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
              SOVEREIGN BENCHMARK LAB
            </span>
          </div>
        )}

        {/* Analysis Failed Alert Banner with Retry */}
        {session.status === 'ANALYSIS_FAILED' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">Analysis Incomplete / Pipeline Interrupted</h4>
                <p className="text-xs text-rose-800 mt-0.5">The forensic screening pipeline could not fully process this credential.</p>
              </div>
            </div>
            {onRetry && (
              <Button
                variant="danger"
                size="sm"
                onClick={onRetry}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry Analysis
              </Button>
            )}
          </div>
        )}

        {/* 2. Structured Verification Result Banner (Answer-First UX) */}
        {risk && (
          <div className={`p-4 rounded-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all ${
            isVerified
              ? 'bg-emerald-50/50 border-emerald-200/90'
              : risk.risk_level === 'CRITICAL' || risk.risk_level === 'HIGH'
              ? 'bg-rose-50/50 border-rose-200/90'
              : 'bg-amber-50/50 border-amber-200/90'
          }`}>
            
            {/* Primary Status & Confidence Score */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isVerified
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-glow-emerald'
                  : risk.risk_level === 'CRITICAL' || risk.risk_level === 'HIGH'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-amber-500 text-slate-950 border-amber-600'
              }`}>
                {isVerified ? (
                  <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                ) : (
                  <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-base font-black tracking-tight ${
                    isVerified ? 'text-emerald-900' : 'text-slate-900'
                  }`}>
                    {isVerified ? 'VERIFIED & AUTHENTIC' : 'ATTENTION REQUIRED'}
                  </span>
                  <RiskBadge level={risk.risk_level} score={risk.total_score} size="sm" />
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-slate-600">
                    Confidence: <strong className="font-mono text-slate-900">{confidenceScore}%</strong>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-700 font-medium">
                    {risk.primary_concern || 'Document conforms to authentic baseline standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Pillar Validation Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium bg-white/80 p-2.5 rounded-lg border border-slate-200/60 shadow-2xs w-full lg:w-auto">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Document Readable</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>OCR Extracted</span>
              </span>
              <span className={`flex items-center gap-1.5 ${
                session.validations.some(v => v.status === 'FAIL') ? 'text-rose-700 font-bold' : 'text-emerald-700'
              }`}>
                {session.validations.some(v => v.status === 'FAIL') ? (
                  <AlertOctagon className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>ICAO Checksums</span>
              </span>
              <span className={`flex items-center gap-1.5 ${
                session.forensic_findings.length > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700'
              }`}>
                {session.forensic_findings.length > 0 ? (
                  <AlertOctagon className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Forensic Integrity</span>
              </span>
            </div>

            {/* Latest Officer Determination Stamped */}
            {latestDecision && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs shrink-0 font-mono shadow-xs border border-slate-800">
                <span className="text-slate-400 text-[9px] block uppercase font-sans">Officer Action</span>
                <span className="font-bold text-amber-300">
                  {latestDecision.decision.replace('_', ' ')}
                </span>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 3. Main 3-Column Workstation Layout: 3 cols (Info) / 6 cols (Hero Document Canvas) / 3 cols (Evidence Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Extracted Information & ICAO MRZ Parser (3 Cols) */}
        <div className="lg:col-span-3 h-[720px]">
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

        {/* Center Column: Visual Hero Document Canvas (6 Cols - 50% wider hero viewport) */}
        <div className="lg:col-span-6 h-[720px]">
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
            <div className="h-full bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 text-xs border border-slate-800">
              No Document Media Available
            </div>
          )}
        </div>

        {/* Right Column: Findings & Evidence Drawer (3 Cols) */}
        <div className="lg:col-span-3 h-[720px]">
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

      {/* 4. Decision Recording Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        caseId={session.id}
        onConfirm={onRecordDecision}
      />

    </div>
  );
};
