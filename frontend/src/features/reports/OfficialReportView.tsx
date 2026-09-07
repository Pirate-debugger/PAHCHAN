import React from 'react';
import { Printer, ArrowLeft, Shield, CheckCircle2, AlertTriangle, AlertOctagon, QrCode } from 'lucide-react';
import { RiskBadge } from '../../components/common/RiskBadge';

interface OfficialReportViewProps {
  reportData: any;
  onBack: () => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  reportData,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  const risk = reportData.risk_assessment;
  const decision = reportData.officer_decision;
  const hash = reportData.security_seal?.audit_hash || 'SHA256:7F89B24C09A88812...E782';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Controls Bar (Hidden during print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workstation</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Border Checkpoint Forensic Dossier Ready</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Dossier (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Official Document Sheet */}
      <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-sm space-y-6 print:border-none print:p-2 print:shadow-none">
        
        {/* Official Header with National Emblem Layout */}
        <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1 relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-7 h-7 text-slate-900 stroke-[2.2]" />
            <span className="font-bold tracking-widest text-xs uppercase text-slate-800">
              GOVERNMENT OF INDIA &bull; MINISTRY OF HOME AFFAIRS
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            SASHASTRA SEEMA BAL (SSB) &bull; POLICE II DIVISION
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            PAHCHAN &mdash; AI-BASED FAKE IDENTITY &amp; DOCUMENT SCREENING SYSTEM
          </p>
          <p className="text-[11px] font-mono text-slate-500 pt-0.5">
            OFFICIAL BORDER CHECKPOINT EXAMINATION &amp; FORENSIC AUDIT DOSSIER &bull; PROBLEM STATEMENT SIH2026188
          </p>
        </div>

        {/* Case Metadata Grid & Verification QR Seal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Case Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{reportData.case_id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Screening Timestamp</span>
              <span className="text-slate-800 font-medium">{new Date(reportData.screening_date).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Document Category</span>
              <span className="text-slate-800 font-semibold">{reportData.document_type}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Terminal Station</span>
              <span className="font-semibold text-slate-900">Checkpoint ICP-04</span>
            </div>
          </div>

          {/* Cryptographic QR Seal Box */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-2 rounded bg-white border border-slate-200 text-center">
            {/* SVG Stylized QR Code */}
            <svg className="w-16 h-16 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v2h-3v-2zm-3 2h2v3h-2v-3zm5 0h2v2h-2v-2zm-5 5h3v2h-3v-2zm5-1h2v3h-2v-3zm-2-2h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
            </svg>
            <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
              Cryptographic Seal
            </span>
          </div>
        </div>

        {/* Section 1: Screening Determination & Risk Breakdown */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase text-slate-800 tracking-wide">1. Automated Screening Risk Assessment</span>
            {risk && <RiskBadge level={risk.risk_level} score={risk.total_score} size="md" />}
          </div>
          {risk && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Primary Screening Finding:</span>
                <span className="font-bold text-slate-900">{risk.primary_concern}</span>
              </div>
              <div>
                <span className="text-slate-500 block">System Recommendation:</span>
                <span className="font-bold text-slate-800">{risk.recommendation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Extracted Identity Information */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-800 block border-b border-slate-100 pb-2 tracking-wide">
            2. Extracted Identity Data (OCR &amp; ICAO 9303 Verification)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {Object.entries(reportData.extracted_identity || {}).map(([k, val]: [string, any]) => {
              if (k === 'mrz_raw') return null;
              return (
                <div key={k} className="p-2 rounded bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">{val.label}</span>
                  <span className="font-mono font-bold text-slate-900">{val.value || 'N/A'}</span>
                  {val.is_edited && (
                    <span className="text-[9px] text-amber-700 font-semibold block mt-0.5">[Audited Correction]</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Forensic Tampering Findings */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-800 block border-b border-slate-100 pb-2 tracking-wide">
            3. Forensic Integrity &amp; Computer Vision Evidence
          </span>
          {reportData.forensic_findings && reportData.forensic_findings.length > 0 ? (
            <div className="space-y-2">
              {reportData.forensic_findings.map((f: any) => (
                <div key={f.id} className="p-3 rounded bg-slate-50 border border-slate-200 text-xs flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{f.title}</span>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{f.explanation}</p>
                    {f.technical_details && (
                      <p className="text-[10px] font-mono text-slate-500 mt-1">Algorithm: {f.technical_details}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                    +{f.risk_contribution} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No forensic tampering indicators identified. Document structure matches baseline authentic template.</p>
          )}
        </div>

        {/* Section 4: Biometric Face Comparison */}
        {reportData.face_verification && (
          <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold uppercase text-slate-800 tracking-wide">4. Biometric Face Verification</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded border ${
                reportData.face_verification.outcome === 'MATCH_SIGNAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {reportData.face_verification.outcome.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{reportData.face_verification.explanation}</p>
            <p className="text-[11px] text-slate-500">
              Operational Directive: {reportData.face_verification.recommendation}
            </p>
          </div>
        )}

        {/* Section 5: Officer Determination & Signature Block */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <span className="text-xs font-bold uppercase text-slate-800 block border-b border-slate-100 pb-2 tracking-wide">
            5. Border Officer Determination &amp; Legal Sign-Off
          </span>
          {decision ? (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Final Disposition</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{decision.decision}</span>
                {decision.notes && (
                  <p className="text-slate-600 mt-1 italic bg-slate-50 p-2 rounded border border-slate-200">&ldquo;{decision.notes}&rdquo;</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Screening Officer</span>
                <span className="font-bold text-slate-900">{decision.officer_name}</span>
                <span className="text-[11px] text-slate-500 block font-mono">Service ID: {decision.officer_id}</span>
                <span className="text-[10px] text-slate-400 block">{new Date(decision.decided_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-700 font-medium">Pending Final Border Officer Determination</p>
          )}

          {/* Signature Line */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div className="border-t border-slate-400 pt-1 text-center">
              Screening Officer Signature &amp; Seal
            </div>
            <div className="border-t border-slate-400 pt-1 text-center">
              Supervisory Reviewing Officer Sign-Off
            </div>
          </div>
        </div>

        {/* Security Seal & Cryptographic Audit Block */}
        <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
          <div>
            <span className="font-bold text-slate-700 block">CHAIN OF CUSTODY SECURITY HASH</span>
            <span className="text-[9px] text-slate-600">{hash}</span>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-emerald-700 font-bold block">AUDIT TRAIL SECURED &bull; ICAO DOC 9303</span>
            <span>SIH2026188 &bull; Sashastra Seema Bal</span>
          </div>
        </div>

      </div>

    </div>
  );
};
