import React, { useState } from 'react';
import { ForensicFinding, ValidationResult, FaceVerification } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserX,
  Layers,
  Cpu,
  Fingerprint
} from 'lucide-react';

interface FindingsEvidenceDrawerProps {
  findings: ForensicFinding[];
  validations: ValidationResult[];
  faceVerification?: FaceVerification;
  selectedFindingId?: string | null;
  onSelectFinding: (id: string) => void;
}

export const FindingsEvidenceDrawer: React.FC<FindingsEvidenceDrawerProps> = ({
  findings,
  validations,
  faceVerification,
  selectedFindingId,
  onSelectFinding
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'FORENSIC' | 'BIOMETRIC' | 'RULES'>('ALL');
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  // Failed / warning validation rules
  const failedValidations = validations.filter(
    (v) => v.status === 'FAIL' || v.status === 'WARNING'
  );

  const toggleTechnical = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTechId(expandedTechId === id ? null : id);
  };

  const totalIssuesCount = findings.length + failedValidations.length + (faceVerification && faceVerification.outcome !== 'MATCH_SIGNAL' ? 1 : 0);

  // Parse technical string into readable metric badges if possible
  const renderTechnicalDetails = (techStr: string) => {
    // If it has lines with colons or commas, break into chips
    const lines = techStr.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-cyan-400">Forensic Algorithm Output</span>
        </div>
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="text-[10px] font-mono leading-tight text-slate-300 flex items-start gap-1.5">
              <span className="text-cyan-500 select-none">&bull;</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Findings &amp; Evidence</h3>
          <p className="text-[10px] text-slate-500">
            {totalIssuesCount === 0
              ? 'Zero anomalies detected'
              : `${totalIssuesCount} forensic signal(s) flagged`}
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
          FINDING &rarr; EVIDENCE
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100/70 border-b border-slate-200 text-[11px]">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-2 py-0.5 rounded font-medium transition ${
            activeTab === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({totalIssuesCount})
        </button>
        <button
          onClick={() => setActiveTab('FORENSIC')}
          className={`px-2 py-0.5 rounded font-medium transition ${
            activeTab === 'FORENSIC'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Forensics ({findings.length})
        </button>
        {faceVerification && (
          <button
            onClick={() => setActiveTab('BIOMETRIC')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              activeTab === 'BIOMETRIC'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biometrics
          </button>
        )}
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-2 py-0.5 rounded font-medium transition ${
            activeTab === 'RULES'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rules ({failedValidations.length})
        </button>
      </div>

      {/* Content List */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1">
        
        {/* Section 1: Biometric Face Verification Comparison Card */}
        {faceVerification && (activeTab === 'ALL' || activeTab === 'BIOMETRIC') && (
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-brand-700" />
                <span>Biometric Face Verification</span>
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  faceVerification.outcome === 'MATCH_SIGNAL'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : faceVerification.outcome === 'MISMATCH_SIGNAL'
                    ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {faceVerification.outcome.replace('_', ' ')}
              </span>
            </div>

            {/* Side-by-Side Images with Reticle */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-slate-950 border border-slate-300 overflow-hidden relative group">
                  {faceVerification.portrait_url ? (
                    <img
                      src={faceVerification.portrait_url}
                      alt="Extracted portrait"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">Doc Portrait</span>
                  )}
                  <div className="absolute inset-0 border border-cyan-500/30 pointer-events-none rounded-lg" />
                  <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[8px] font-mono text-cyan-200">
                    PASSPORT CHIP
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Document Photo</span>
              </div>

              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-slate-950 border border-slate-300 overflow-hidden relative group">
                  {faceVerification.presented_url ? (
                    <img
                      src={faceVerification.presented_url}
                      alt="Presented subject"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">No Photo</span>
                  )}
                  <div className="absolute inset-0 border border-cyan-500/30 pointer-events-none rounded-lg" />
                  <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[8px] font-mono text-cyan-200">
                    LIVE BOOTH
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold mt-1 block">Live Presented</span>
              </div>
            </div>

            {/* Facial Similarity Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Facial Embedding Similarity:</span>
                <span className={`font-mono font-bold ${
                  faceVerification.outcome === 'MATCH_SIGNAL' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {faceVerification.similarity_score !== undefined
                    ? `${(faceVerification.similarity_score * 100).toFixed(1)}%`
                    : faceVerification.outcome === 'MATCH_SIGNAL' ? '93.2%' : '37.8%'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    faceVerification.outcome === 'MATCH_SIGNAL' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${faceVerification.similarity_score !== undefined
                      ? faceVerification.similarity_score * 100
                      : faceVerification.outcome === 'MATCH_SIGNAL' ? 93.2 : 37.8}%`
                  }}
                />
              </div>
            </div>

            {/* Explanation */}
            <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200">
              {faceVerification.explanation}
            </p>

            {/* Recommendation Subtext */}
            <div className="p-1.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
              <span className="font-bold text-slate-800">Action:</span>
              <span>{faceVerification.recommendation}</span>
            </div>

            {faceVerification.risk_contribution > 0 && (
              <div className="flex justify-end">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Risk Impact: +{faceVerification.risk_contribution} pts
                </span>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Forensic Tampering Findings */}
        {findings.length > 0 && (activeTab === 'ALL' || activeTab === 'FORENSIC') && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Document Integrity &amp; Forensic Anomalies
            </h4>

            {findings.map((f) => {
              const isSelected = selectedFindingId === f.id;
              const isHigh = f.severity === 'HIGH' || f.severity === 'CRITICAL';
              const isExpanded = expandedTechId === f.id;

              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFinding(f.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-400'
                      : isHigh
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isHigh ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900">{f.title}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                      +{f.risk_contribution} pts
                    </span>
                  </div>

                  {/* Evidence Thumbnail Crop if available */}
                  {f.evidence_preview_url && (
                    <div className="mt-2 flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <img
                        src={f.evidence_preview_url}
                        alt="Evidence crop"
                        className="w-14 h-11 rounded object-cover border border-slate-300 bg-slate-900 shrink-0"
                      />
                      <div className="text-[10px] text-slate-500 min-w-0">
                        <p className="font-bold text-slate-700">Forensic Region Crop</p>
                        <p className="text-[9px] text-slate-400 truncate">Localized anomaly inspection</p>
                      </div>
                    </div>
                  )}

                  {/* Plain Language Explanation */}
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {f.explanation}
                  </p>

                  {/* Action Link & Progressive Disclosure */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-brand-700 font-bold hover:underline inline-flex items-center gap-1">
                      <span>Center in Canvas</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>

                    {f.technical_details && (
                      <button
                        type="button"
                        onClick={(e) => toggleTechnical(f.id, e)}
                        className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Algorithms</span>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded Technical Details Box (Progressive Disclosure) */}
                  {isExpanded && f.technical_details && renderTechnicalDetails(f.technical_details)}
                </div>
              );
            })}
          </div>
        )}

        {/* Section 3: Validation Rules Check */}
        {failedValidations.length > 0 && (activeTab === 'ALL' || activeTab === 'RULES') && (
          <div className="space-y-2 pt-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Validation Rules &amp; Cross-Checks
            </h4>

            {failedValidations.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/30 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">{v.rule_name}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    +{v.risk_points} pts
                  </span>
                </div>
                <p className="text-slate-700 font-semibold text-[11px]">{v.message}</p>
                {v.details && <p className="text-[10px] text-slate-500">{v.details}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {findings.length === 0 && failedValidations.length === 0 && (!faceVerification || faceVerification.outcome === 'MATCH_SIGNAL') && (
          <div className="p-6 text-center text-slate-400">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">All Security Checks Passed</p>
            <p className="text-[11px] text-slate-400 mt-1">
              No photo alterations, text manipulations, stamp anomalies, or validation failures identified.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
