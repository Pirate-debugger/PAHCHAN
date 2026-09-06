import React, { useState } from 'react';
import type { ScreeningSession } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  Search, 
  ArrowUpRight, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface ScreeningsQueueProps {
  onOpenCaseInWorkstation: (session: ScreeningSession) => void;
  onOpenReport: (session: ScreeningSession) => void;
  externalSearchQuery?: string;
}

export const ScreeningsQueue: React.FC<ScreeningsQueueProps> = ({
  onOpenCaseInWorkstation,
  onOpenReport,
  externalSearchQuery = ''
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedDrawerSession, setSelectedDrawerSession] = useState<ScreeningSession | null>(null);

  const query = externalSearchQuery || localSearch;

  // Build case list from synthetic test cases
  const allCases: ScreeningSession[] = SYNTHETIC_TEST_CASES.map((tc) => ({
    ...tc.sessionData,
    documentImageUrl: tc.documentImage,
    liveFaceImageUrl: tc.liveFaceImage
  }));

  const filteredCases = allCases.filter((c) => {
    const matchesQuery = 
      c.sessionId.toLowerCase().includes(query.toLowerCase()) ||
      c.fields.name.toLowerCase().includes(query.toLowerCase()) ||
      c.fields.docNumber.toLowerCase().includes(query.toLowerCase()) ||
      c.fields.nationality.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (filterStatus === 'NEEDS_REVIEW') return c.totalRiskScore >= 30;
    if (filterStatus === 'CRITICAL') return c.totalRiskScore >= 80;
    if (filterStatus === 'HIGH') return c.totalRiskScore >= 60 && c.totalRiskScore < 80;
    if (filterStatus === 'CLEAR') return c.totalRiskScore < 30;

    return true;
  });

  const getRiskBadge = (score: number) => {
    if (score < 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Low ({score})</span>
        </span>
      );
    }
    if (score < 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Review ({score})</span>
        </span>
      );
    }
    if (score < 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          <span>High ({score})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <ShieldAlert className="w-3 h-3 text-rose-600" />
        <span>Critical ({score})</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Screening Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active and archived screening cases awaiting human clearance or supervisory review.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search queue..."
              className="pl-8 pr-3 py-1 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44 bg-slate-50"
            />
          </div>

          {/* Filter Badges */}
          <div className="flex items-center flex-wrap gap-1">
            {[
              { id: 'ALL', label: 'All Cases' },
              { id: 'NEEDS_REVIEW', label: 'Needs Review' },
              { id: 'CRITICAL', label: 'Critical Alert' },
              { id: 'HIGH', label: 'High Risk' },
              { id: 'CLEAR', label: 'Standard Clear' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === f.id
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Document Holder</th>
                <th className="px-4 py-3">Document Number</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Primary Signal</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const primarySignal = c.explainability?.whyIsItRisky[0] || 'Standard baseline integrity';
                return (
                  <tr 
                    key={c.sessionId}
                    onClick={() => setSelectedDrawerSession(c)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-blue-600">
                      {c.sessionId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.fields.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {c.fields.docNumber} <span className="text-[10px] text-slate-400">({c.fields.nationality})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {c.timestamp.split(' ')[0]}
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(c.totalRiskScore)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={primarySignal}>
                      {primarySignal}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {c.decision === 'CLEAR_ENTRY' ? 'Standard Review' : c.decision === 'SECONDARY_INSPECTION' ? 'Secondary Inspection' : 'Supervisor Hold'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenCaseInWorkstation(c)}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs transition-colors"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm font-medium">No matching screening cases found.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Right-Side Case Details Drawer */}
      {selectedDrawerSession && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Case Summary</span>
                <h3 className="text-sm font-bold text-slate-900 font-mono">{selectedDrawerSession.sessionId}</h3>
              </div>
              <button 
                onClick={() => setSelectedDrawerSession(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* Risk Banner */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-slate-500 text-[11px] block">Screening Risk Score</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {selectedDrawerSession.totalRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </span>
                </div>
                {getRiskBadge(selectedDrawerSession.totalRiskScore)}
              </div>

              {/* Document Image Thumbnail */}
              <div>
                <span className="text-slate-500 font-semibold block mb-1.5 text-[11px] uppercase tracking-wide">Document Artifact</span>
                <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 text-center">
                  <img 
                    src={selectedDrawerSession.documentImageUrl} 
                    alt="Document Artifact"
                    className="max-h-40 mx-auto object-contain rounded"
                  />
                </div>
              </div>

              {/* Subject Info */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">Document Holder</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-900">{selectedDrawerSession.fields.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Document Number</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedDrawerSession.fields.docNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nationality</span>
                    <span className="font-medium text-slate-700">{selectedDrawerSession.fields.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expiration Date</span>
                    <span className="font-medium text-slate-700">{selectedDrawerSession.fields.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">Key Findings &amp; Signals</span>
                <ul className="space-y-1 text-slate-600">
                  {selectedDrawerSession.explainability?.whyIsItRisky.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1">
                <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">Operational Guidance</span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {selectedDrawerSession.explainability?.officerRecommendation || 'Proceed with standard immigration verification protocols.'}
                </p>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenCaseInWorkstation(selectedDrawerSession);
                  setSelectedDrawerSession(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Open in Workstation</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  onOpenReport(selectedDrawerSession);
                  setSelectedDrawerSession(null);
                }}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-medium transition-colors"
              >
                Assessment Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
