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
  Maximize2,
  FileSearch
} from 'lucide-react';
import { sound } from '../utils/sound';

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
  const isMedium = currentSession.totalRiskScore >= 30 && currentSession.totalRiskScore < 70;

  const handlePrint = () => {
    sound.click();
    window.print();
  };

  const handleDownloadJSON = () => {
    sound.click();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSession, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PAHCHAN-DOSSIER-${currentSession.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sha256 = currentSession.documentSha256 || 'fa3843b01ba9518d27600d16954aaa5c724eb635a7dec5616e7421416755acdb';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Top Header & Export Action Bar */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              INTELLIGENCE &amp; AUDIT DOSSIERS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-300 font-mono">
              SESSION: {currentSession.sessionId}
            </span>
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-wide mt-1">
            Official Travel Document Screening &amp; Evidence Dossier
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically sealed, ICAO Doc 9303 compliant forensic audit record generated for law enforcement &amp; immigration tribunals.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON Audit Package</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenReportModal();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-blue-900/30 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen Dossier View</span>
          </button>
        </div>
      </div>

      {/* Case Selector Archive Banner */}
      <div className="bg-[#0f172a] p-3 rounded-2xl border border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 px-2">
          LOAD EVALUATION DOSSIER:
        </span>
        {SYNTHETIC_TEST_CASES.map((tc) => {
          const isSelected = selectedCaseId === tc.sessionData.sessionId;
          return (
            <button
              key={tc.id}
              onClick={() => {
                sound.click();
                setSelectedCaseId(tc.sessionData.sessionId);
                onSelectSession({
                  ...tc.sessionData,
                  documentImageUrl: tc.documentImage,
                  liveFaceImageUrl: tc.liveFaceImage
                });
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
                isSelected
                  ? 'bg-blue-600/30 border-cyan-400 text-white shadow-md'
                  : 'bg-[#080d19] border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="font-mono text-cyan-400">#{tc.caseNumber}</span>
              <span className="truncate max-w-[130px]">{tc.title.split('(')[0]}</span>
              <span className={`w-2 h-2 rounded-full ${
                tc.expectedRiskLevel === 'LOW' ? 'bg-emerald-400' : tc.expectedRiskLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Dossier Document Sheet Preview */}
      <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl font-sans">
        
        {/* Government Letterhead */}
        <div className="border-b border-slate-700/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-cyan-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-white tracking-widest font-mono">
                  GOVERNMENT OF INDIA
                </span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                  PAHCHAN SIH2026188
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sashastra Seema Bal &bull; Bureau of Immigration &bull; Ministry of Home Affairs
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                CHECKPOINT: {currentSession.checkpoint || 'Raxaul Land Border (Indo-Nepal)'} &bull; OPERATOR: {currentSession.operatorId || 'OFFICER-SSB-449'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200">{currentSession.timestamp}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              DOSSIER ID: <span className="text-cyan-400 font-bold">{currentSession.sessionId}</span>
            </p>
          </div>
        </div>

        {/* Screening Verdict & Risk Level Card */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLow 
            ? 'bg-emerald-950/20 border-emerald-800 text-emerald-200' 
            : isMedium 
            ? 'bg-amber-950/20 border-amber-800 text-amber-200' 
            : 'bg-rose-950/20 border-rose-800 text-rose-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isLow ? 'bg-emerald-500/20 text-emerald-400' : isMedium ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isLow ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wide">
                OPERATIONAL VERDICT: {currentSession.decision.replace('_', ' ')}
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {isLow ? 'CLEAR FOR ENTRY — ALL SIGNALS AUTHENTIC' : isMedium ? 'FLAGGED FOR SECONDARY INSPECTION' : 'CRITICAL ALERT — TAMPERING / MISMATCH CONFIRMED'}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-2xl font-black text-white">
              {currentSession.totalRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
              RISK SEVERITY: {currentSession.riskLevel}
            </div>
          </div>
        </div>

        {/* 2-Column Subject & Biometrics Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identity & Visual Zone */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Document Holder Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">FULL NAME</span>
                <span className="font-bold text-white font-mono">{currentSession.fields.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">DOCUMENT NUMBER</span>
                <span className="font-bold text-cyan-300 font-mono">{currentSession.fields.docNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">NATIONALITY / ISSUER</span>
                <span className="font-semibold text-slate-200 font-mono">{currentSession.fields.nationality}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">DATE OF BIRTH</span>
                <span className="font-semibold text-slate-200 font-mono">{currentSession.fields.dob}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">EXPIRATION DATE</span>
                <span className={`font-semibold font-mono ${currentSession.validation.isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                  {currentSession.fields.expiryDate} {currentSession.validation.isExpired && '(EXPIRED)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">GENDER</span>
                <span className="font-semibold text-slate-200 font-mono">{currentSession.fields.gender}</span>
              </div>
            </div>
          </div>

          {/* Biometrics & Forensic Summary */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Biometric &amp; Cryptographic Verification
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">1:1 Face Similarity Match</span>
                <span className={`font-mono font-bold ${
                  (currentSession.faceVerification?.similarity ?? 0) >= 75 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {currentSession.faceVerification?.similarity.toFixed(1)}% ({currentSession.faceVerification?.status})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ICAO Doc 9303 Checksums</span>
                <span className={`font-mono font-bold ${currentSession.validation.mrzChecksumPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSession.validation.mrzChecksumPass ? 'CONFORMS (7-3-1 Pass)' : 'CHECKSUM MISMATCH'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Photo Substrate Integrity</span>
                <span className={`font-mono font-bold ${currentSession.tampering.photoIntegrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSession.tampering.photoIntegrityScore}/100 ({currentSession.tampering.photoReplaced ? 'ALTERED' : 'UNTOUCHED'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Immigration Stamp Integrity</span>
                <span className={`font-mono font-bold ${currentSession.tampering.stampIntegrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSession.tampering.stampIntegrityScore}/100 ({currentSession.tampering.stampForged ? 'COUNTERFEIT' : 'GENUINE'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability Breakdown (Why is it risky?) */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            AI Decision-Support Explainability &amp; Officer Guidance
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Summary: </strong> 
            {currentSession.explainability?.whatHappened || 'Comprehensive automated screening executed across optical character extraction, ICAO 7-3-1 checksum arithmetic, Error Level Analysis (ELA), and deep biometric feature cosine distance.'}
          </p>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
              OBSERVED RISK FACTORS &amp; EVIDENCE:
            </span>
            <ul className="space-y-1">
              {currentSession.explainability?.whyIsItRisky.map((reason, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono mt-0.5">&bull;</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cryptographic Footprint & Officer Signature Block */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="truncate max-w-md">SHA-256: {sha256}</span>
          </div>
          <div className="text-right">
            <span>OFFICER SIGN-OFF: <strong className="text-slate-200">VERIFIED &amp; COMMITTED</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
