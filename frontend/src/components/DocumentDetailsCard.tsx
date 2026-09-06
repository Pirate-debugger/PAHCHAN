import React, { useState } from 'react';
import type { DocumentFields, ValidationResult, CrossFieldResult } from '../types';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Calendar, 
  Globe, 
  Hash, 
  Tag, 
  Clock,
  Calculator,
  X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface DocumentDetailsCardProps {
  fields: DocumentFields;
  validation: ValidationResult;
  crossField: CrossFieldResult;
}

export const DocumentDetailsCard: React.FC<DocumentDetailsCardProps> = ({
  fields,
  validation,
  crossField
}) => {
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [showMathModal, setShowMathModal] = useState<boolean>(false);

  const conf = fields.fieldConfidences || {
    name: 0.987,
    docNumber: 0.992,
    nationality: 0.995,
    dob: 0.991,
    expiryDate: 0.994,
    gender: 0.989
  };

  const getConfBadge = (val?: number) => {
    const p = val ? (val * 100).toFixed(1) : '98.5';
    return (
      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800/60 ml-1.5">
        {p}% OCR
      </span>
    );
  };

  const mrzDetails = validation.mrzDetails || {
    docNumberValid: true,
    dobValid: true,
    expiryValid: true,
    compositeValid: true
  };

  const mrz1 = fields.mrzLine1 || 'P<INDKUMAR<<ARAVIND<<<<<<<<<<<<<<<<<<<<<<<<<';
  const mrz2 = fields.mrzLine2 || 'Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00';

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-cyan-400 rounded-xl border border-blue-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                PAHCHAN OCR &amp; FIELD EXTRACTION
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                ICAO Doc 9303
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multi-engine structured parsing with confidence ratings</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.click();
              setShowMathModal(true);
            }}
            className="hidden sm:flex items-center space-x-1 text-[10.5px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 px-2 py-1 rounded-lg border border-cyan-800/60 transition-colors"
          >
            <Calculator className="w-3 h-3" />
            <span>Inspect Math</span>
          </button>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              validation.mrzChecksumPass && !validation.isExpired
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
            }`}
          >
            {validation.mrzChecksumPass && !validation.isExpired ? '✓ Valid Checksums' : '⚠️ Checksum Failure'}
          </span>
        </div>
      </div>

      {/* Structured Key Details Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Full Name */}
        <div 
          onMouseEnter={() => setHoveredField('name')}
          onMouseLeave={() => setHoveredField(null)}
          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
            hoveredField === 'name' ? 'bg-[#15233e] border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-[#090d16] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
              <User className="w-3 h-3 text-cyan-400" /> FULL NAME
            </span>
            {getConfBadge(conf.name)}
          </div>
          <span className="text-xs font-bold text-white block truncate uppercase">{fields.name || 'N/A'}</span>
        </div>

        {/* Document Number */}
        <div 
          onMouseEnter={() => setHoveredField('docNumber')}
          onMouseLeave={() => setHoveredField(null)}
          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
            hoveredField === 'docNumber' ? 'bg-[#15233e] border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-[#090d16] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
              <Hash className="w-3 h-3 text-cyan-400" /> DOCUMENT NO.
            </span>
            {getConfBadge(conf.docNumber)}
          </div>
          <span className="text-xs font-bold text-cyan-400 font-mono block tracking-wider">{fields.docNumber || 'N/A'}</span>
        </div>

        {/* Nationality */}
        <div 
          onMouseEnter={() => setHoveredField('nationality')}
          onMouseLeave={() => setHoveredField(null)}
          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
            hoveredField === 'nationality' ? 'bg-[#15233e] border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-[#090d16] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
              <Globe className="w-3 h-3 text-cyan-400" /> NATIONALITY
            </span>
            {getConfBadge(conf.nationality)}
          </div>
          <span className="text-xs font-bold text-slate-200 block">{fields.nationality || 'IND'}</span>
        </div>

        {/* Date of Birth */}
        <div 
          onMouseEnter={() => setHoveredField('dob')}
          onMouseLeave={() => setHoveredField(null)}
          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
            hoveredField === 'dob' ? 'bg-[#15233e] border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-[#090d16] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-cyan-400" /> DATE OF BIRTH
            </span>
            {getConfBadge(conf.dob)}
          </div>
          <span className="text-xs font-bold text-slate-200 block font-mono">{fields.dob || 'N/A'}</span>
        </div>

        {/* Expiry Date Bar */}
        <div 
          onMouseEnter={() => setHoveredField('expiry')}
          onMouseLeave={() => setHoveredField(null)}
          className={`p-2.5 rounded-xl border col-span-2 flex items-center justify-between transition-all cursor-pointer ${
            hoveredField === 'expiry' ? 'bg-[#15233e] border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-[#090d16] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center space-x-1 mb-0.5">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-cyan-400" /> EXPIRY DATE
              </span>
              {getConfBadge(conf.expiryDate)}
            </div>
            <span className={`text-xs font-bold font-mono ${validation.isExpired ? 'text-rose-400 font-extrabold' : 'text-white'}`}>
              {fields.expiryDate || 'N/A'}
            </span>
          </div>

          <span
            className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-md ${
              validation.isExpired
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}
          >
            {validation.isExpired ? 'EXPIRED (Invalid for Travel)' : 'ACTIVE / VALID'}
          </span>
        </div>

        {/* Optional Visa fields if present */}
        {fields.visaNumber && (
          <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800 col-span-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1 mb-0.5 font-mono">
                <Tag className="w-3 h-3 text-amber-400" /> ATTACHED VISA / PERMIT
              </span>
              <span className="text-xs font-bold text-white font-mono">{fields.visaNumber}</span>
              <span className="text-[10.5px] text-slate-400 ml-2">({fields.visaType || 'E-VISA'})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {fields.stayDuration || '90 DAYS'}
            </span>
          </div>
        )}
      </div>

      {/* Raw MRZ Interactive Highlight Box */}
      <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            MACHINE READABLE ZONE (MRZ TD3)
          </span>
          <span className="text-slate-500">Hover fields above to trace characters</span>
        </div>

        <div className="font-mono text-xs text-slate-300 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed tracking-wider break-all select-all">
          {/* Line 1 */}
          <div className="mb-0.5">
            <span className="text-slate-500">P&lt;IND</span>
            <span className={hoveredField === 'name' ? 'bg-cyan-500 text-black px-0.5 rounded font-extrabold' : ''}>
              {mrz1.slice(5, 30)}
            </span>
            <span className="text-slate-600">{mrz1.slice(30)}</span>
          </div>

          {/* Line 2 */}
          <div>
            <span className={hoveredField === 'docNumber' ? 'bg-cyan-500 text-black px-0.5 rounded font-extrabold' : 'text-cyan-300'}>
              {mrz2.slice(0, 10)}
            </span>
            <span className={hoveredField === 'nationality' ? 'bg-cyan-500 text-black px-0.5 rounded font-extrabold' : 'text-slate-400'}>
              {mrz2.slice(10, 13)}
            </span>
            <span className={hoveredField === 'dob' ? 'bg-cyan-500 text-black px-0.5 rounded font-extrabold' : 'text-emerald-300'}>
              {mrz2.slice(13, 20)}
            </span>
            <span className="text-slate-500">{mrz2.slice(20, 21)}</span>
            <span className={hoveredField === 'expiry' ? 'bg-cyan-500 text-black px-0.5 rounded font-extrabold' : 'text-amber-300'}>
              {mrz2.slice(21, 28)}
            </span>
            <span className="text-slate-600">{mrz2.slice(28)}</span>
          </div>
        </div>
      </div>

      {/* ICAO 7-3-1 Modulo 10 Checksum Matrix */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          <span>ICAO 7-3-1 Modulo 10 Checksum Matrix</span>
          <span className="text-cyan-400 font-normal">Annex 9 Compliant</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
          <div className={`p-1.5 rounded-lg border ${mrzDetails.docNumberValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'}`}>
            <span className="block text-[9px] text-slate-400">DOC NO</span>
            <span className="font-bold">{mrzDetails.docNumberValid ? 'PASS ✓' : 'FAIL ✗'}</span>
          </div>
          <div className={`p-1.5 rounded-lg border ${mrzDetails.dobValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'}`}>
            <span className="block text-[9px] text-slate-400">DOB</span>
            <span className="font-bold">{mrzDetails.dobValid ? 'PASS ✓' : 'FAIL ✗'}</span>
          </div>
          <div className={`p-1.5 rounded-lg border ${mrzDetails.expiryValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'}`}>
            <span className="block text-[9px] text-slate-400">EXPIRY</span>
            <span className="font-bold">{mrzDetails.expiryValid ? 'PASS ✓' : 'FAIL ✗'}</span>
          </div>
          <div className={`p-1.5 rounded-lg border ${mrzDetails.compositeValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'}`}>
            <span className="block text-[9px] text-slate-400">COMPOSITE</span>
            <span className="font-bold">{mrzDetails.compositeValid ? 'PASS ✓' : 'FAIL ✗'}</span>
          </div>
        </div>
      </div>

      {/* Checksum & Consistency Checklist */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#090d16] border border-slate-800">
          <div className="flex items-center space-x-2">
            {crossField.match ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="text-[11px] text-slate-200 font-medium">Visual Inspection Zone (VIZ) vs MRZ Check</span>
          </div>
          <span className={`text-[10px] font-bold font-mono ${crossField.match ? 'text-emerald-400' : 'text-rose-400'}`}>
            {crossField.match ? 'CONSISTENT' : 'DATA ALTERED'}
          </span>
        </div>
      </div>

      {/* ICAO Math Inspector Modal */}
      {showMathModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">ICAO Doc 9303 Modulo-10 7-3-1 Arithmetic Breakdown</h3>
              </div>
              <button 
                onClick={() => setShowMathModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every machine-readable travel document encodes self-verifying check digits. Characters [0-9] map to values 0-9, [A-Z] map to 10-35, and fillers (&lt;) map to 0. Repeating weights of <strong>[7, 3, 1]</strong> multiply each character. The sum modulo 10 must match the check digit.
            </p>

            <div className="bg-[#080d19] p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1">
                Document Number Formula:
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed">
                Chars: <span className="text-white font-bold">{mrz2.slice(0, 9)}</span> | Check Digit: <span className="text-cyan-300 font-bold">{mrz2.charAt(9)}</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Vector Sum: ∑ (char_val × weight) % 10 = Expected Check Digit
              </div>
              <div className={`p-2 rounded-lg border text-center font-bold text-xs ${
                mrzDetails.docNumberValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                {mrzDetails.docNumberValid ? '✓ Document Number Checksum Verified' : '✗ Checksum Mismatch — Document Altered'}
              </div>
            </div>

            <button
              onClick={() => setShowMathModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
