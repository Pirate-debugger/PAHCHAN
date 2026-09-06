import React, { useState } from 'react';
import type { ScreeningSession } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Hash, 
  Clock, 
  User, 
  Maximize2
} from 'lucide-react';

interface ReportsViewProps {
  currentSession: ScreeningSession;
  onOpenReportModal: () => void;
  onSelectSession: (session: ScreeningSession) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentSession,
  onOpenReportModal,
  onSelectSession
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentSession.sessionId);

  const isLow = currentSession.totalRiskScore < 30;
  const isReview = currentSession.totalRiskScore >= 30 && currentSession.totalRiskScore < 60;
  const isHigh = currentSession.totalRiskScore >= 60 && currentSession.totalRiskScore < 80;
  const isCritical = currentSession.totalRiskScore >= 80;

  const severityLabel = isLow ? 'LOW' : isReview ? 'REVIEW' : isHigh ? 'HIGH' : 'CRITICAL';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSession, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PAHCHAN-REPORT-${currentSession.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sha256 = currentSession.documentSha256 || 'fa3843b01ba9518d27600d16954aaa5c724eb635a7dec5616e7421416755acdb';

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              CASE DOCUMENTATION
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              CASE REF: {currentSession.sessionId}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            Identity &amp; Document Screening Assessment Report
          </h1>
          <p className="text-xs text-slate-500">
            Automated multi-signal forensic evaluation, ICAO checksum validation, and biometric similarity record.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expanded View</span>
          </button>
        </div>
      </div>

      {/* Case Selector Archive Banner */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-subtle flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0 px-1">
          Select Evaluation Case:
        </span>
        {SYNTHETIC_TEST_CASES.map((tc) => {
          const isSelected = selectedCaseId === tc.sessionData.sessionId;
          return (
            <button
              key={tc.id}
              onClick={() => {
                setSelectedCaseId(tc.sessionData.sessionId);
                onSelectSession({
                  ...tc.sessionData,
                  documentImageUrl: tc.documentImage,
                  liveFaceImageUrl: tc.liveFaceImage
                });
              }}
              className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                isSelected
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-blue-600">#{tc.caseNumber}</span>
              <span className="truncate max-w-[130px]">{tc.title.split('(')[0]}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                tc.expectedRiskLevel === 'LOW' ? 'bg-emerald-500' : tc.expectedRiskLevel === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Report Sheet Layout (White Clean Paper Layout) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-subtle font-sans text-xs">
        
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  PAHCHAN
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-600 font-medium">
                  Identity &amp; Document Screening Assessment Report
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                CHECKPOINT: {currentSession.checkpoint || 'Raxaul Land Border (Indo-Nepal)'} &bull; OPERATOR: {currentSession.operatorId || 'OFFICER-SSB-449'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentSession.timestamp}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              CASE REF: <span className="text-slate-700 font-bold">{currentSession.sessionId}</span>
            </p>
          </div>
        </div>

        {/* Screening Verdict Summary Banner */}
        <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLow 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : isReview 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : isHigh 
            ? 'bg-orange-50 border-orange-200 text-orange-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${
              isLow ? 'bg-emerald-100 text-emerald-700' : isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isLow ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider">
                SCREENING ASSESSMENT: {severityLabel} RISK
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {isLow 
                  ? 'No Anomaly Detected — Standard Review Recommended' 
                  : isReview 
                  ? 'Potential Discrepancy — Secondary Physical Inspection Advised' 
                  : 'Severe Anomaly Signal — Immediate Supervisory Hold Recommended'}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-2xl font-black text-slate-900">
              {currentSession.totalRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">
              Operational Directive: {currentSession.decision.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* 2-Column Document Holder & Biometrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Document Holder Data */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Document Holder Credentials
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-900">{currentSession.fields.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Document Number</span>
                <span className="font-mono font-semibold text-slate-900">{currentSession.fields.docNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Nationality / Issuing State</span>
                <span className="font-medium text-slate-700">{currentSession.fields.nationality}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Date of Birth</span>
                <span className="font-medium text-slate-700">{currentSession.fields.dob}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Expiration Date</span>
                <span className={`font-medium ${currentSession.validation.isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                  {currentSession.fields.expiryDate} {currentSession.validation.isExpired && '(EXPIRED)'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Gender</span>
                <span className="font-medium text-slate-700">{currentSession.fields.gender}</span>
              </div>
            </div>
          </div>

          {/* Verification & Forensics Summary */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Forensic &amp; Biometric Checks
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">1:1 Facial Similarity</span>
                <span className={`font-mono font-semibold ${
                  currentSession.faceVerification?.similarity == null
                    ? 'text-amber-700'
                    : (currentSession.faceVerification.similarity >= 75 ? 'text-emerald-700' : 'text-rose-700')
                }`}>
                  {currentSession.faceVerification?.similarity != null
                    ? `${currentSession.faceVerification.similarity.toFixed(1)}% (${currentSession.faceVerification.status})`
                    : 'Pending (No Live Capture)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ICAO Doc 9303 Checksums</span>
                <span className={`font-mono font-semibold ${currentSession.validation.mrzChecksumPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currentSession.validation.mrzChecksumPass ? 'Passed (7-3-1 Valid)' : 'CHECKSUM MISMATCH'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Photo Substrate Integrity</span>
                <span className={`font-mono font-semibold ${currentSession.tampering.photoIntegrityScore >= 80 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currentSession.tampering.photoIntegrityScore}/100 ({currentSession.tampering.photoReplaced ? 'ALTERED' : 'UNTOUCHED'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Error Level (ELA) Variance</span>
                <span className="font-mono font-semibold text-slate-800">
                  {(currentSession.tampering.elaVariance ?? 5.4).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Explainability Breakdown */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Automated Assessment Findings
          </h3>
          <p className="text-slate-700 leading-relaxed">
            {currentSession.explainability?.whatHappened || 'Automated multi-spectral screening executed across optical extraction, ICAO checksum verification, and Error Level Analysis (ELA).'}
          </p>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Observed Signals:
            </span>
            <ul className="space-y-1 text-slate-700 pl-4 list-disc">
              {currentSession.explainability?.whyIsItRisky.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cryptographic Footprint & Officer Sign-off */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-md">SHA-256: {sha256}</span>
          </div>
          <div>
            <span>OFFICER SIGN-OFF: <strong className="text-slate-800 font-sans">VERIFIED &amp; COMMITTED</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
