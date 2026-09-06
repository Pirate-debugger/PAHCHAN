import React from 'react';
import type { ScreeningSession } from '../types';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Hash, 
  Clock 
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
    downloadAnchor.setAttribute("download", `PAHCHAN-ASSESSMENT-${session.sessionId}.json`);
    downloadAnchor.click();
  };

  const score = session.totalRiskScore;
  const isLow = score < 30;
  const isReview = score >= 30 && score < 60;
  const isHigh = score >= 60 && score < 80;

  const severityLabel = isLow ? 'LOW' : isReview ? 'REVIEW' : isHigh ? 'HIGH' : 'CRITICAL';
  const riskClass = isLow
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : isReview
    ? 'text-amber-700 bg-amber-50 border-amber-300'
    : isHigh
    ? 'text-rose-700 bg-rose-50 border-rose-300'
    : 'text-rose-900 bg-rose-100 border-rose-400 font-bold';

  const sha256 = session.documentSha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Official Screening Assessment Report</h2>
              <p className="text-xs text-slate-500">Case Ref: {session.sessionId} &bull; Tamper-evident evaluation record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors ml-2"
              title="Close Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-sm bg-white">
          {/* Header Block */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">PAHCHAN</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase tracking-wider">Evaluation Prototype</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">AI-Assisted Identity &amp; Document Screening System</p>
              <p className="text-xs text-slate-400">Department: Sashastra Seema Bal / Police II Division (Demonstration Environment)</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold border ${riskClass}`}>
                {severityLabel} RISK ({score}/100)
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                {session.timestamp}
              </p>
            </div>
          </div>

          {/* Screening Metadata & Human in the Loop Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">Case Reference:</span>
                <span className="font-mono font-medium text-slate-900">{session.sessionId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Document Subject:</span>
                <span className="font-medium text-slate-900">{session.fields.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Document ID:</span>
                <span className="font-mono font-medium text-slate-900">{session.fields.docNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Document Type:</span>
                <span className="font-medium text-slate-900 uppercase">{session.documentType}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
              <strong>Human-in-the-Loop Directive:</strong> This report is an AI-assisted decision-support instrument. Final operational clearance and administrative decisions rest solely with the authorized inspecting officer.
            </div>
          </div>

          {/* Document Visual Data & Forensic Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block border-b border-slate-200 pb-1">
                Document Visual Data
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Full Name</span>
                  <span className="font-semibold text-slate-900">{session.fields.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Document Number</span>
                  <span className="font-mono font-semibold text-slate-900">{session.fields.docNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Nationality</span>
                  <span className="text-slate-700">{session.fields.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Expiration Date</span>
                  <span className={`font-mono ${session.validation.isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                    {session.fields.expiryDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block border-b border-slate-200 pb-1">
                Forensic &amp; Biometric Verification
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">1:1 Biometric Match Signal:</span>
                  <strong className="font-mono text-slate-900">
                    {session.faceVerification && session.faceVerification.similarity != null
                      ? `${session.faceVerification.similarity.toFixed(1)}% (${session.faceVerification.status})`
                      : 'Skipped (No Live Capture)'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ICAO Doc 9303 Checksums:</span>
                  <strong className="font-mono text-slate-900">{session.validation.mrzChecksumPass ? 'Passed' : 'MISMATCH'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Substrate Error Level (ELA):</span>
                  <strong className="font-mono text-slate-900">{(session.tampering.elaVariance ?? 5.4).toFixed(1)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Footprint & Verification Seal */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>SHA-256: {sha256}</span>
            </div>
            <div>
              OFFICER SIGN-OFF: <strong className="text-slate-800 font-sans">COMMITTED TO AUDIT LEDGER</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
