import React, { useState } from 'react';
import type { RiskFactor, DecisionType, ExplainabilityDossier } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  UserX, 
  HelpCircle, 
  FileText,
  AlertTriangle, 
  Lightbulb,
  Volume2,
  Copy,
  Check,
  Sliders,
  X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface RiskBreakdownCardProps {
  riskScore: number;
  riskFactors: RiskFactor[];
  decision: DecisionType;
  onSetDecision: (decision: DecisionType) => void;
  onOpenReportModal: () => void;
  explainability?: ExplainabilityDossier;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({
  riskScore,
  riskFactors,
  decision,
  onSetDecision,
  onOpenReportModal,
  explainability
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showWeightsModal, setShowWeightsModal] = useState<boolean>(false);

  const isLow = riskScore < 30;
  const isMedium = riskScore >= 30 && riskScore < 70;

  const handleCopyDispatch = () => {
    sound.click();
    const briefingText = `[PAHCHAN INTELLIGENCE BRIEFING]\nRisk Score: ${riskScore}/100 (${isLow ? 'LOW' : isMedium ? 'MEDIUM' : 'CRITICAL'})\nRecommendation: ${explainability?.officerRecommendation || 'Proceed according to standard operating procedure.'}\nEvidence: ${explainability?.supportingEvidence?.join('; ') || 'Standard check passed.'}`;
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    sound.click();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const textToSpeak = `PAHCHAN Screening Verdict. Risk score ${riskScore} out of 100. Severity: ${isLow ? 'Low risk. Passenger clear.' : isMedium ? 'Medium risk. Secondary physical inspection advised.' : 'Critical risk. Severe document anomaly or imposter detected.'} Operational directive: ${explainability?.officerRecommendation || 'Check document credentials.'}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDecision = (d: DecisionType) => {
    if (d === 'CLEAR_ENTRY') sound.success();
    else if (d === 'DETAIN_ALERT') sound.alert();
    else sound.click();
    onSetDecision(d);
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-cyan-400 rounded-xl border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                PAHCHAN RISK ENGINE
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                Additive 0-100
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Explainable multi-signal forensic risk ledger</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.click();
              setShowWeightsModal(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
            title="Configure Risk Weights"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenReportModal();
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-blue-900/30 border border-cyan-400/20"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-200" />
            <span>Official Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Score Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          isLow
            ? 'bg-emerald-950/25 border-emerald-800/80 shadow-emerald-950/20'
            : isMedium
            ? 'bg-amber-950/25 border-amber-800/80 shadow-amber-950/20'
            : 'bg-rose-950/25 border-rose-800/80 shadow-rose-950/20'
        }`}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Calibrated Risk Severity
          </span>
          <div className="text-sm font-extrabold flex items-center space-x-2">
            <span
              className={
                isLow ? 'text-emerald-400' : isMedium ? 'text-amber-400' : 'text-rose-400'
              }
            >
              {isLow
                ? 'LOW RISK — PASSENGER CLEAR'
                : isMedium
                ? 'MEDIUM RISK — SECONDARY REVIEW'
                : 'CRITICAL RISK — ACTION REQUIRED'}
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            {isLow
              ? 'Pristine security substrate, authentic MRZ check digits, and high biometric face match.'
              : isMedium
              ? 'Discrepancies identified across text or metadata. Physical inspection recommended.'
              : 'Severe tampering or identity impersonation confirmed across multiple signals.'}
          </p>
        </div>

        {/* Circular SVG Risk Gauge */}
        <div className="flex flex-col items-center flex-shrink-0 ml-3">
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-700 ease-out ${
                  isLow ? 'text-emerald-500' : isMedium ? 'text-amber-500' : 'text-rose-500'
                }`}
                strokeDasharray={`${riskScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-base font-extrabold text-white">{riskScore}</span>
              <span className="text-[9px] text-slate-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Signals / Issues List */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
          Additive Risk Factors Ledger ({riskFactors.length})
        </span>

        {riskFactors.length === 0 ? (
          <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>All biometric, forensic, and cryptographic check digits conform to authentic baseline.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {riskFactors.map((rf) => (
              <div
                key={rf.id}
                className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex items-start justify-between text-xs space-x-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="font-bold text-white text-[11.5px]">{rf.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{rf.description}</p>
                  {rf.evidence && (
                    <p className="text-[10px] text-cyan-300/80 font-mono">Evidence: {rf.evidence}</p>
                  )}
                </div>
                <span className="text-[10.5px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800 flex-shrink-0 font-mono">
                  +{rf.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Support Briefing with Read Aloud & Copy */}
      {explainability && (
        <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[10.5px] uppercase tracking-wider font-mono">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Operational Intelligence Briefing</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleReadAloud}
                className={`p-1 rounded-md text-xs transition-colors ${
                  isSpeaking ? 'bg-cyan-500 text-black animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isSpeaking ? 'Stop Speaking' : 'Read Aloud Briefing'}
              >
                <Volume2 className="w-3 h-3" />
              </button>

              <button
                onClick={handleCopyDispatch}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Briefing"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {explainability.officerRecommendation}
          </p>
        </div>
      )}

      {/* Officer Decision Directives */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Officer Clearance Directive
          </span>
          <span className="text-[9px] text-slate-400 italic font-mono">Human-in-the-loop</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDecision('CLEAR_ENTRY')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              decision === 'CLEAR_ENTRY'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clear Entry</span>
          </button>

          <button
            onClick={() => handleDecision('SECONDARY_INSPECTION')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              decision === 'SECONDARY_INSPECTION'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Secondary</span>
          </button>

          <button
            onClick={() => handleDecision('DETAIN_ALERT')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              decision === 'DETAIN_ALERT'
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Detain / Flag</span>
          </button>
        </div>
      </div>

      {/* Configurable Weights Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">Calibrated Risk Factor Weights</h3>
              </div>
              <button 
                onClick={() => setShowWeightsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Deterministic additive scoring engine assigns calibrated points per signal (0 to 100 maximum):
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">Photo Tampering / Splicing</span>
                <span className="text-cyan-400 font-bold">+30 pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">Biometric Face Impersonation</span>
                <span className="text-cyan-400 font-bold">+45 pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">Text &amp; DOB Manipulation</span>
                <span className="text-cyan-400 font-bold">+25 pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">Forged Immigration Stamp</span>
                <span className="text-cyan-400 font-bold">+25 pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">Expired Document</span>
                <span className="text-cyan-400 font-bold">+35 pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-300">INTERPOL / LEA Watchlist Hit</span>
                <span className="text-rose-400 font-bold">+50 pts</span>
              </div>
            </div>

            <button
              onClick={() => setShowWeightsModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
