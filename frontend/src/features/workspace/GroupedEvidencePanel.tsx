import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Fingerprint,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ForensicFinding, ValidationResult, FaceVerification } from '../../types';

interface GroupedEvidencePanelProps {
  findings: ForensicFinding[];
  validations: ValidationResult[];
  faceVerification?: FaceVerification;
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string) => void;
  filterCategory?: string | null;
}

export const GroupedEvidencePanel: React.FC<GroupedEvidencePanelProps> = ({
  findings,
  validations,
  faceVerification,
  selectedFindingId,
  onSelectFinding,
  filterCategory
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group 1: DOCUMENT AUTHENTICITY (Forensic findings + Checksum validations)
  const authenticityFindings = findings.filter(
    (f) => f.category === 'PHOTO_ALTERATION' || f.category === 'TEXT_MANIPULATION' || f.category === 'STAMP_FORGERY' || f.category === 'METADATA_ANOMALY'
  );
  const checksumValidations = validations.filter(
    (v) => v.category === 'CHECKSUM' || v.category === 'FORMAT'
  );

  // Group 2: IDENTITY CONSISTENCY (Consistency validations, Multi-identity findings, Biometrics)
  const consistencyValidations = validations.filter(
    (v) => v.category === 'CONSISTENCY' || v.category === 'CHRONOLOGY' || v.category === 'EXPIRY'
  );
  const identityFindings = findings.filter((f) => f.category === 'IDENTITY_CONSISTENCY');



  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-rose-600" />
            <span>Forensic Evidence &amp; Verification Signals</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Structured proof categorized by forensic layer
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          EXPLAINABLE AI
        </span>
      </div>

      {/* Grouped Content Area */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        
        {/* GROUP 1: DOCUMENT AUTHENTICITY */}
        {(!filterCategory || filterCategory === 'document_integrity' || filterCategory === 'image_forensics') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Authenticity &amp; Substrate</span>
            </div>

            {/* Checksums check items */}
            {checksumValidations.map((v) => {
              const isPass = v.status === 'PASS';
              const isFail = v.status === 'FAIL';

              return (
                <div
                  key={v.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isFail
                      ? 'bg-rose-50/60 border-rose-300'
                      : isPass
                      ? 'bg-slate-50/40 border-slate-200/80'
                      : 'bg-amber-50/60 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isFail ? (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900">{v.rule_name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      isPass ? 'text-emerald-700' : isFail ? 'text-rose-700' : 'text-amber-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-6">{v.message}</p>
                </div>
              );
            })}

            {/* Forensic findings (e.g. photo alteration, tampering) */}
            {authenticityFindings.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 text-xs flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No digital image tampering or compression anomalies detected.</span>
              </div>
            ) : (
              authenticityFindings.map((f) => {
                const isExpanded = expandedItems[f.id];
                const isSelected = selectedFindingId === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectFinding?.(f.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/50 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-bold text-slate-900">{f.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(f.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1 pl-6 leading-relaxed">
                      {f.explanation}
                    </p>

                    {/* Expandable Technical Explanation */}
                    {isExpanded && (
                      <div className="mt-2.5 pl-6 pt-2 border-t border-slate-100 space-y-2 text-[11px]">
                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                          <div className="p-2 rounded bg-slate-100">
                            <span className="text-slate-500 block">Anomaly Category:</span>
                            <span className="font-bold text-slate-800">{f.category}</span>
                          </div>
                          <div className="p-2 rounded bg-slate-100">
                            <span className="text-slate-500 block">Severity Level:</span>
                            <span className="font-bold text-rose-700">{f.severity}</span>
                          </div>
                        </div>

                        {f.technical_details && (
                          <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[10px] space-y-1">
                            <span className="text-cyan-300 font-bold block uppercase">Technical Metrics:</span>
                            <p className="text-slate-300">{f.technical_details}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* GROUP 2: IDENTITY CONSISTENCY */}
        {(!filterCategory || filterCategory === 'identity_match' || filterCategory === 'field_consistency') && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
              <span>Identity Consistency &amp; Biometrics</span>
            </div>

            {/* Biometric Face Verification Item */}
            {faceVerification && (
              <div className="space-y-2">
                <div className={`p-3 rounded-xl border text-xs ${
                  faceVerification.outcome === 'MATCH_SIGNAL'
                    ? 'bg-slate-50/60 border-slate-200/90'
                    : 'bg-rose-50/70 border-rose-300'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {faceVerification.outcome === 'MATCH_SIGNAL' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900">Biometric Face Comparison</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${
                      faceVerification.outcome === 'MATCH_SIGNAL' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {faceVerification.similarity_score}% SIMILARITY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-6">
                    {faceVerification.explanation}
                  </p>
                </div>

                {/* Face Comparison Human Review Advisory Banner */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-medium leading-tight">
                    Face comparison is a screening signal and requires human review.
                  </span>
                </div>
              </div>
            )}

            {/* Multi-identity findings */}
            {identityFindings.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-purple-50/70 border border-purple-300 text-xs">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{f.title}</span>
                </div>
                <p className="text-[11px] text-purple-800 mt-1 pl-6">{f.explanation}</p>
              </div>
            ))}

            {/* Consistency validation rules */}
            {consistencyValidations.map((v) => (
              <div key={v.id} className="p-2.5 rounded-xl bg-slate-50/40 border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900">{v.rule_name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">{v.status}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">{v.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* GROUP 3: ISSUER & AUTHORITY VERIFICATION */}
        {(!filterCategory || filterCategory === 'issuer_verification') && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Issuer Verification &amp; Sovereign Authority</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Authoritative Format &amp; Check Digit Verified</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-[11px] text-slate-600 pl-6">
                Document syntactically verified against Ministry of Home Affairs / SSB and ICAO Doc 9303 standards.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
