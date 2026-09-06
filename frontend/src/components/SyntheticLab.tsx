import React, { useState } from 'react';
import type { SyntheticTestCase } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  FlaskConical, 
  Play, 
  UploadCloud,
  Check
} from 'lucide-react';

interface SyntheticLabProps {
  onLoadTestCase: (testCase: SyntheticTestCase) => void;
  activeCaseId?: string;
  onCustomUpload: (file: File) => void;
}

export const SyntheticLab: React.FC<SyntheticLabProps> = ({
  onLoadTestCase,
  activeCaseId,
  onCustomUpload
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filteredCases = SYNTHETIC_TEST_CASES.filter((c) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'GENUINE') return c.category === 'GENUINE';
    if (selectedFilter === 'TAMPER') return ['PHOTO_TAMPER', 'TEXT_TAMPER', 'STAMP_TAMPER'].includes(c.category);
    if (selectedFilter === 'BIOMETRIC') return c.category === 'FACE_MISMATCH';
    if (selectedFilter === 'CROSS_FIELD') return ['CROSS_DOC_MISMATCH', 'EXPIRED_METADATA'].includes(c.category);
    if (selectedFilter === 'COMBINED') return c.category === 'MULTIPLE_RISK';
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCustomUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <FlaskConical className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              SIH2026188 Benchmark Evaluation Lab
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Synthetic Document Forensics Lab
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All 8 deterministic evaluation scenarios built specifically for border screening judges. Every test case features calibrated expected findings across ELA compression, Sobel edge gradients, MRZ checksums, biometric comparison, and cross-document validation.
          </p>
        </div>

        {/* Custom Upload */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-600/30">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Custom Document</span>
            <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: `All Scenarios (${SYNTHETIC_TEST_CASES.length})` },
          { id: 'GENUINE', label: 'Genuine Baseline' },
          { id: 'TAMPER', label: 'Physical & Digital Tampering' },
          { id: 'BIOMETRIC', label: 'Identity Impersonation' },
          { id: 'CROSS_FIELD', label: 'Cross-Document Mismatches' },
          { id: 'COMBINED', label: 'Multi-Signal Combined Threats' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCases.map((tc) => {
          const isActive = activeCaseId === tc.id;
          const isGenuine = tc.category === 'GENUINE';

          return (
            <div
              key={tc.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden bg-[#0f172a] shadow-sm ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-blue-900/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Case {tc.caseNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isGenuine
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {isGenuine ? 'Verdict: Clear' : 'Verdict: Alert'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{tc.title}</h4>
                  <p className="text-[11px] text-cyan-400 font-medium mt-0.5 line-clamp-1">{tc.tagline}</p>
                </div>

                {/* Preview Thumbnail */}
                <div className="relative w-full h-32 bg-[#080d1a] rounded-xl overflow-hidden border border-slate-800/80 p-2 flex items-center justify-center">
                  <img
                    src={tc.documentImage}
                    alt={tc.title}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-slate-950/90 rounded text-[9.5px] font-mono font-bold text-slate-300 border border-slate-800">
                    {tc.fields.docNumber}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {tc.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#11192d] border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Risk: <span className={isGenuine ? 'text-emerald-400 font-bold font-mono' : 'text-rose-400 font-bold font-mono'}>
                    {tc.expectedScoreRange[0]}–{tc.expectedScoreRange[1]}/100
                  </span>
                </div>

                <button
                  onClick={() => onLoadTestCase(tc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isActive ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isActive ? 'Loaded' : 'Run Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
