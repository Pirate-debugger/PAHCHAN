import React, { useState } from 'react';
import type { ScreeningSession, ForensicRegion, DecisionType } from '../types';
import { ForensicsViewer } from './ForensicsViewer';
import { DocumentDetailsCard } from './DocumentDetailsCard';
import { FaceMatchPanel } from './FaceMatchPanel';
import { RiskBreakdownCard } from './RiskBreakdownCard';
import { 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Layers, 
  UserCheck, 
  ArrowUpRight
} from 'lucide-react';

interface WorkstationViewProps {
  currentSession: ScreeningSession;
  onSetDecision: (decision: DecisionType) => void;
  onRunScan: () => void;
  onCustomUpload: (file: File) => void;
  onOpenReport: () => void;
  isScanning: boolean;
}

export const WorkstationView: React.FC<WorkstationViewProps> = ({
  currentSession,
  onSetDecision,
  onRunScan,
  onCustomUpload,
  onOpenReport,
  isScanning
}) => {
  const [selectedRegion, setSelectedRegion] = useState<ForensicRegion | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'FINDINGS' | 'FIELDS' | 'BIOMETRICS'>('FINDINGS');

  const riskScore = currentSession.totalRiskScore;
  const isLow = riskScore < 30;
  const isReview = riskScore >= 30 && riskScore < 60;
  const isHigh = riskScore >= 60 && riskScore < 80;
  const isCritical = riskScore >= 80;

  const activeFindings = currentSession.riskFactors.filter((f) => f.points > 0);

  // Focus region when officer clicks "View in document"
  const handleSelectRegionById = (regionId: string) => {
    const found = currentSession.tampering.regions.find((r) => r.id === regionId);
    if (found) {
      setSelectedRegion(found);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Quick Actions Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold font-mono text-[11px] uppercase">
            Active Case:
          </span>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {currentSession.sessionId}
          </span>
          <span className="text-slate-400 font-medium">
            ({currentSession.fields.name} &bull; {currentSession.fields.docNumber})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs">
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Document</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && onCustomUpload(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan AI'}</span>
          </button>
        </div>
      </div>

      {/* 2. The 3-Second Rule: Instant Screening Verdict Banner */}
      <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle ${
        isLow
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : isReview
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : isHigh
          ? 'bg-orange-50/80 border-orange-200 text-orange-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-md ${
            isLow ? 'bg-emerald-100 text-emerald-700' : isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isLow ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCritical ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {isLow
                  ? 'DOCUMENT INTEGRITY: NO ANOMALY DETECTED'
                  : isReview
                  ? 'POTENTIAL DISCREPANCY: SECONDARY REVIEW ADVISED'
                  : 'POTENTIAL ALTERATION / IDENTITY MISMATCH SIGNAL DETECTED'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-white/90 border border-slate-200">
                Score: {riskScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {isLow
                ? `Credentials conform to standard security baselines. 1:1 Biometric match signal is ${currentSession.faceVerification?.similarity.toFixed(1)}%.`
                : `${activeFindings.length} anomaly signal${activeFindings.length === 1 ? '' : 's'} flagged. Physical credential examination recommended before clearance.`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          className="self-start sm:self-center px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-md text-xs font-semibold border border-slate-300 shadow-xs whitespace-nowrap transition-colors"
        >
          View Assessment Report →
        </button>
      </div>

      {/* 3. Primary Two-Column Workstation Grid (Document dominates left 7 cols, Result on right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Large Document Inspection Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[480px]">
            <ForensicsViewer
              documentImageUrl={currentSession.documentImageUrl}
              tampering={currentSession.tampering}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              className="h-full"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Screening Risk Decision & Human Clearance (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <RiskBreakdownCard
            riskScore={riskScore}
            riskFactors={currentSession.riskFactors}
            decision={currentSession.decision}
            onSetDecision={onSetDecision}
            onOpenReportModal={onOpenReport}
            onSelectFindingRegion={handleSelectRegionById}
            explainability={currentSession.explainability}
          />
        </div>

      </div>

      {/* 4. Bottom Tabbed Inspection Deck: Findings & Evidence | Extracted Fields | Biometrics */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 flex items-center gap-2">
          <button
            onClick={() => setActiveBottomTab('FINDINGS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeBottomTab === 'FINDINGS'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Findings &amp; Evidence ({activeFindings.length})</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('FIELDS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeBottomTab === 'FIELDS'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extracted OCR Fields &amp; Validation</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('BIOMETRICS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeBottomTab === 'BIOMETRICS'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1:1 Facial Comparison</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-4">
          
          {/* TAB 1: Findings & Evidence Table (Section 21: Finding -> Severity -> Confidence -> Evidence -> Risk Contribution) */}
          {activeBottomTab === 'FINDINGS' && (
            <div className="space-y-3 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-2 px-3">Finding</th>
                      <th className="py-2 px-3">Severity</th>
                      <th className="py-2 px-3">Confidence</th>
                      <th className="py-2 px-3">Evidence Description</th>
                      <th className="py-2 px-3">Contribution</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSession.riskFactors.map((factor) => {
                      const isFlagged = factor.points > 0;
                      return (
                        <tr 
                          key={factor.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isFlagged ? 'bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {factor.title}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              factor.severity === 'critical' ? 'bg-rose-100 text-rose-800' : factor.severity === 'high' ? 'bg-orange-100 text-orange-800' : factor.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {factor.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            94%
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-md">
                            {factor.evidence || factor.description}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {factor.points > 0 ? `+${factor.points}` : '0'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {factor.regionId ? (
                              <button
                                onClick={() => handleSelectRegionById(factor.regionId!)}
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 hover:underline text-[11px]"
                              >
                                <span>Focus region</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Extracted Fields Card */}
          {activeBottomTab === 'FIELDS' && (
            <DocumentDetailsCard
              fields={currentSession.fields}
              validation={currentSession.validation}
              crossField={currentSession.crossField}
              onSelectFieldRegion={handleSelectRegionById}
            />
          )}

          {/* TAB 3: Face Comparison Panel */}
          {activeBottomTab === 'BIOMETRICS' && (
            <FaceMatchPanel
              documentPhotoUrl={currentSession.liveFaceImageUrl || currentSession.documentImageUrl}
              liveFaceUrl={currentSession.liveFaceImageUrl}
              faceResult={currentSession.faceVerification}
            />
          )}

        </div>

      </div>

    </div>
  );
};
