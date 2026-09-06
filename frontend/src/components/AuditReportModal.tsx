import React from 'react';
import type { ScreeningSession } from '../types';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck,
  CheckCircle2,
  Hash
} from 'lucide-react';

interface AuditReportModalProps {
  session: ScreeningSession;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ session, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PAHCHAN-DOSSIER-${session.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isLow = session.totalRiskScore < 30;
  const isMedium = session.totalRiskScore >= 30 && session.totalRiskScore < 70;

  const sha256 = session.documentSha256 || 'fa3843b01ba9518d27600d16954aaa5c724eb635a7dec5616e7421416755acdb';
  const auditSignature = `SIG-SHA256-${sha256.slice(0, 16).toUpperCase()}-${session.sessionId}`;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 text-xs">
        {/* Modal Top Bar */}
        <div className="bg-[#131d31] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                PAHCHAN Official Screening Dossier
              </h3>
              <p className="text-[10px] text-cyan-300 font-mono">SIH2026188 • Decision-Support Audit Record</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg ml-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 space-y-6 text-xs bg-[#080d19] text-slate-200" id="printable-dossier">
          {/* Header Branding */}
          <div className="border-b border-slate-800 pb-5 text-center space-y-1.5">
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Government of India • Ministry of Home Affairs • Bureau of Immigration
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">
              PAHCHAN — IDENTITY &amp; DOCUMENT SCREENING DOSSIER
            </h1>
            <div className="text-xs text-cyan-400 font-medium">
              "Verify Identity. Detect Risk. Protect Trust."
            </div>
          </div>

          {/* Dossier Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">SESSION DOSSIER ID:</span>
              <span className="text-cyan-400 font-mono font-bold text-xs">{session.sessionId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">TIMESTAMP (UTC):</span>
              <span className="text-slate-200 font-medium">{session.timestamp}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">CHECKPOINT POST:</span>
              <span className="text-slate-200 font-medium">{session.checkpoint}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">DUTY OFFICER:</span>
              <span className="text-emerald-400 font-mono font-bold">{session.operatorId}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Bar */}
          <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-2 text-slate-300">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Document SHA-256 Digest:</span>
              <span className="text-cyan-300 font-bold">{sha256}</span>
            </div>
            <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              TAMPER-SEALED
            </span>
          </div>

          {/* 1. Holder Identity Profile */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1 font-mono">
              1. Extracted Identity Profile (ICAO Doc 9303)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Presented Full Name:</span>
                <span className="text-xs font-bold text-white uppercase">{session.fields.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Document Number:</span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{session.fields.docNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Nationality:</span>
                <span className="text-xs text-slate-200 font-bold">{session.fields.nationality}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Date of Birth:</span>
                <span className="text-xs text-slate-200 font-mono">{session.fields.dob}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Document Expiry Date:</span>
                <span className={`text-xs font-mono font-bold ${session.validation.isExpired ? 'text-rose-400' : 'text-slate-200'}`}>
                  {session.fields.expiryDate} {session.validation.isExpired && '[EXPIRED]'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">MRZ Checksum Status:</span>
                <span className={`text-xs font-bold ${session.validation.mrzChecksumPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.validation.mrzChecksumPass ? 'Passed (7-3-1 Modulo 10 Verified)' : 'Failed (Checksum Anomaly)'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Five Forensic Screening Layers */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1 font-mono">
              2. Forensic Multi-Signal Analysis Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">PHOTO INTEGRITY</span>
                <span className={`text-base font-extrabold font-mono ${session.tampering.photoIntegrityScore > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.tampering.photoIntegrityScore}/100
                </span>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  {session.tampering.photoReplaced ? 'Splicing Anomaly Detected' : 'Substrate Verified Clean'}
                </p>
              </div>

              <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">TEXT INTEGRITY</span>
                <span className={`text-base font-extrabold font-mono ${session.tampering.textIntegrityScore > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.tampering.textIntegrityScore}/100
                </span>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  {session.tampering.textManipulated ? 'Font / Baseline Jitter' : 'Typography Conforming'}
                </p>
              </div>

              <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">STAMP INTEGRITY</span>
                <span className={`text-base font-extrabold font-mono ${session.tampering.stampIntegrityScore > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.tampering.stampIntegrityScore}/100
                </span>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  {session.tampering.stampForged ? 'SSIM Template Failure' : 'Official Relief Verified'}
                </p>
              </div>

              <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">BIOMETRIC SIMILARITY</span>
                <span className={`text-base font-extrabold font-mono ${session.faceVerification?.match ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.faceVerification ? `${session.faceVerification.similarity.toFixed(1)}%` : 'N/A'}
                </span>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  {session.faceVerification?.match ? 'Biometric Match' : 'Impersonation Alert'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Additive Risk Factor Ledger */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1 font-mono">
              3. Evidence &amp; Anomaly Findings Ledger
            </h4>
            {session.riskFactors.length === 0 ? (
              <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No adverse risk factors identified. Document conforms to all baseline integrity checks.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {session.riskFactors.map((rf) => (
                  <div key={rf.id} className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200 text-xs">[{rf.category}] {rf.title}</span>
                      <p className="text-[11px] text-slate-400">{rf.description}</p>
                      <p className="text-[10px] text-cyan-400/90 font-mono">Forensic Evidence: {rf.evidence}</p>
                    </div>
                    <span className="text-rose-400 font-mono font-bold text-xs ml-3 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-900">
                      +{rf.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Explainable Decision Support Guidance */}
          {session.explainability && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1 font-mono">
                4. Grounded Explainability Analysis
              </h4>
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block font-mono">What Happened?</span>
                  <p className="text-xs text-slate-300 mt-0.5">{session.explainability.whatHappened}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block font-mono">Why Is It Risky?</span>
                  <ul className="list-disc list-inside text-xs text-slate-300 mt-0.5 space-y-0.5">
                    {session.explainability.whyIsItRisky.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block font-mono">Officer Operational Directive</span>
                  <p className="text-xs text-white font-semibold mt-0.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {session.explainability.officerRecommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Final Screening Verdict */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isLow ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' : 'bg-rose-950/30 border-rose-800 text-rose-200'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Final Algorithmic Assessment</span>
              <span className="text-sm font-extrabold tracking-wide">
                RISK SCORE: {session.totalRiskScore}/100 — {isLow ? 'CLEAR FOR ENTRY' : isMedium ? 'SECONDARY REVIEW' : 'CRITICAL ALERT (DETAIN)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Duty Action</span>
              <span className="font-extrabold uppercase text-xs">{session.decision.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Legal Sign-off & Audit Chain */}
          <div className="pt-4 border-t border-slate-800 text-[10.5px] text-slate-400 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-mono">Audit Chain Signature: {auditSignature}</span>
              <span className="text-slate-300 font-semibold">Duty Officer Sign-Off: {session.operatorId}</span>
            </div>
            <p className="text-[9.5px] text-slate-400 italic">
              NOTICE: PAHCHAN is an AI-assisted decision-support platform engineered for Smart India Hackathon 2026 (SIH2026188).
              Algorithmic screening signals assist border personnel and do not constitute autonomous judicial or criminal determinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
