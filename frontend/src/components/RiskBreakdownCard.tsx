import React, { useState } from 'react';
import type { RiskFactor, DecisionType, ExplainabilityDossier } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';

interface RiskBreakdownCardProps {
  riskScore: number;
  riskFactors: RiskFactor[];
  decision: DecisionType;
  onSetDecision: (decision: DecisionType) => void;
  onOpenReportModal: () => void;
  onSelectFindingRegion?: (regionId: string) => void;
  explainability?: ExplainabilityDossier;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({
  riskScore,
  riskFactors,
  decision,
  onSetDecision,
  onOpenReportModal,
  onSelectFindingRegion,
  explainability
}) => {
  const [showWhyScore, setShowWhyScore] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Standardized Risk Tiers
  // 0-29: LOW | 30-59: REVIEW | 60-79: HIGH | 80-100: CRITICAL
  const isLow = riskScore < 30;
  const isReview = riskScore >= 30 && riskScore < 60;
  const isHigh = riskScore >= 60 && riskScore < 80;
  const isCritical = riskScore >= 80;

  const severityLabel = isLow ? 'LOW' : isReview ? 'REVIEW' : isHigh ? 'HIGH' : 'CRITICAL';
  
  const activeAnomalies = riskFactors.filter((f) => f.points > 0);
  const signalsCount = activeAnomalies.length;

  const handleCopySummary = () => {
    const text = `PAHCHAN Screening Case Briefing\nRisk Score: ${riskScore}/100 (${severityLabel})\nSignals: ${signalsCount} flagged\nRecommendation: ${explainability?.officerRecommendation || 'Follow standard operating protocol.'}\nFindings: ${riskFactors.map(f => `${f.title} (+${f.points})`).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const text = `Screening Risk Score: ${riskScore} out of 100. Severity: ${severityLabel}. ${signalsCount} signals require review. Operational recommendation: ${explainability?.officerRecommendation || 'Check credentials'}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 space-y-4 text-xs">
      
      {/* Header: Title & Actions */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Decision Support
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Screening Risk Assessment
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReadAloud}
            className={`p-1.5 rounded transition-colors ${
              isSpeaking ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Read summary aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopySummary}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy briefing"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Score Display Box */}
      <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${
        isLow 
          ? 'bg-emerald-50/60 border-emerald-200' 
          : isReview 
          ? 'bg-amber-50/60 border-amber-200' 
          : isHigh 
          ? 'bg-orange-50/60 border-orange-200' 
          : 'bg-rose-50/60 border-rose-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {isLow ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isCritical ? (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            ) : (
              <AlertTriangle className={`w-4 h-4 ${isReview ? 'text-amber-600' : 'text-orange-600'}`} />
            )}
            <span className={`text-xs font-bold font-mono tracking-wider ${
              isLow ? 'text-emerald-800' : isReview ? 'text-amber-800' : isHigh ? 'text-orange-800' : 'text-rose-800'
            }`}>
              {severityLabel} RISK
            </span>
          </div>

          <p className="text-xs text-slate-600">
            {isLow 
              ? 'No anomaly detected. Credentials conform to baseline.' 
              : `${signalsCount} signal${signalsCount === 1 ? '' : 's'} require human review.`}
          </p>
        </div>

        {/* Numerical Score */}
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {riskScore}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Signal Contributions List */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Observed Risk Signals ({signalsCount})
        </span>

        <div className="space-y-1.5">
          {riskFactors.length > 0 ? (
            riskFactors.map((f) => {
              const isFlagged = f.points > 0;
              return (
                <div
                  key={f.id}
                  onClick={() => f.regionId && onSelectFindingRegion && onSelectFindingRegion(f.regionId)}
                  className={`p-2 rounded border flex items-center justify-between text-xs transition-colors ${
                    isFlagged 
                      ? 'bg-slate-50 border-slate-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40' 
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      !isFlagged ? 'bg-emerald-400' : f.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-400'
                    }`} />
                    <span className={`truncate ${isFlagged ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                      {f.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-mono font-bold ${
                      isFlagged ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {f.points > 0 ? `+${f.points}` : '0'}
                    </span>
                    {f.regionId && onSelectFindingRegion && (
                      <span className="text-[10px] text-blue-600 font-medium hover:underline">
                        View →
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400 italic py-1">
              No elevated risk factors detected.
            </div>
          )}
        </div>
      </div>

      {/* Operational Recommendation */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
          Operational Recommendation
        </span>
        <p className="text-xs font-medium text-slate-800 leading-relaxed">
          {explainability?.officerRecommendation || (
            isLow ? 'Recommendation: Standard review. No anomaly detected.' : 'Recommendation: Secondary review advised.'
          )}
        </p>
      </div>

      {/* Human-in-the-Loop Clearance Decision Controls */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
          Record Officer Determination
        </span>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetDecision('CLEAR_ENTRY')}
            className={`py-2 px-2 rounded-md font-medium text-xs transition-colors border text-center ${
              decision === 'CLEAR_ENTRY'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
            }`}
          >
            Standard Review
          </button>

          <button
            onClick={() => onSetDecision('SECONDARY_INSPECTION')}
            className={`py-2 px-2 rounded-md font-medium text-xs transition-colors border text-center ${
              decision === 'SECONDARY_INSPECTION'
                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
            }`}
          >
            Secondary Review
          </button>

          <button
            onClick={() => onSetDecision('DETAIN_ALERT')}
            className={`py-2 px-2 rounded-md font-medium text-xs transition-colors border text-center ${
              decision === 'DETAIN_ALERT'
                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
            }`}
          >
            Escalate Review
          </button>
        </div>
      </div>

      {/* Expandable "Why this score?" (Section 22) */}
      <div className="border-t border-slate-100 pt-2">
        <button
          onClick={() => setShowWhyScore(!showWhyScore)}
          className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 py-1 transition-colors font-medium"
        >
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why this score? (Scoring Breakdown)</span>
          </span>
          {showWhyScore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showWhyScore && (
          <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2 text-[11px] text-slate-600 animate-in fade-in duration-150">
            <p className="leading-relaxed">
              {explainability?.whatHappened || 'Score is calculated deterministically by accumulating point penalties across visual, structural, and biometric signals.'}
            </p>
            <div className="border-t border-slate-200 pt-1.5 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span>Biometric Impersonation:</span>
                <span>+40 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Photo Splicing / Substrate:</span>
                <span>+25 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Expired Validity:</span>
                <span>+30 pts</span>
              </div>
              <div className="flex justify-between">
                <span>MRZ / VIZ Inconsistency:</span>
                <span>+20 pts</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
              Prototype scoring configuration. Adjusted by authorized checkpoint administrators.
            </p>
          </div>
        )}
      </div>

      {/* View Assessment Report Action */}
      <div className="pt-2">
        <button
          onClick={onOpenReportModal}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Screening Assessment Report</span>
        </button>
      </div>

    </div>
  );
};
