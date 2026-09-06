import React from 'react';
import type { ScreeningSession } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  ChevronRight, 
  PlusCircle, 
  FlaskConical, 
  ListFilter
} from 'lucide-react';

interface OverviewDashboardProps {
  onStartScreening: () => void;
  onOpenCase: (session: ScreeningSession) => void;
  onViewAllScreenings: () => void;
  onOpenDemoLab: () => void;
  currentCheckpoint: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onStartScreening,
  onOpenCase,
  onViewAllScreenings,
  onOpenDemoLab,
  currentCheckpoint
}) => {
  // Actionable cases that require attention (Medium / High / Critical)
  const attentionCases = SYNTHETIC_TEST_CASES.filter((c) => c.expectedRiskLevel !== 'LOW');
  const recentCases = SYNTHETIC_TEST_CASES.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. What is Happening? — KPI Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Screened */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
              Today's Screenings
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              142
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              At {currentCheckpoint}
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            142
          </div>
        </div>

        {/* Require Review */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
              Requires Review
            </span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              18
            </span>
            <span className="text-[11px] text-amber-700/80 mt-0.5 block">
              Secondary inspection advised
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
              High Risk
            </span>
            <span className="text-2xl font-bold text-orange-600 mt-1 block">
              7
            </span>
            <span className="text-[11px] text-orange-700/80 mt-0.5 block">
              Photographic / field mismatch
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
              Critical Alerts
            </span>
            <span className="text-2xl font-bold text-rose-600 mt-1 block">
              3
            </span>
            <span className="text-[11px] text-rose-700/80 mt-0.5 block">
              Tampering or impersonation
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Primary Action Hero Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Case Screening Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest travel credentials, inspect multi-spectral evidence, and record human clearance determinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartScreening}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Screening</span>
          </button>

          <button
            onClick={onViewAllScreenings}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ListFilter className="w-4 h-4" />
            <span>Open Queue</span>
          </button>

          <button
            onClick={onOpenDemoLab}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <span>Demo Lab</span>
          </button>
        </div>
      </div>

      {/* 2. What Needs Attention? — Attention Queue (Actionable Cases) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Attention Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Screenings exhibiting elevated forensic or biometric anomaly signals awaiting officer review.
            </p>
          </div>
          <button 
            onClick={onViewAllScreenings}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {attentionCases.map((c) => {
            const isCritical = c.expectedRiskLevel === 'CRITICAL';
            return (
              <div
                key={c.id}
                onClick={() => onOpenCase({
                  ...c.sessionData,
                  documentImageUrl: c.documentImage,
                  liveFaceImageUrl: c.liveFaceImage
                })}
                className="p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 p-1.5 rounded ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {c.sessionData.sessionId}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Score {c.sessionData.totalRiskScore}
                      </span>
                      <span className="text-xs text-slate-600 font-medium truncate">
                        {c.fields.name} ({c.fields.nationality})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs font-medium text-slate-500">
                    {c.sessionData.decision === 'SECONDARY_INSPECTION' ? 'Secondary Review' : 'Supervisor Hold'}
                  </span>
                  <button className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Screenings Summary Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of the most recent document screening assessments at this post.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Case Reference</th>
                <th className="px-4 py-2.5">Document Holder</th>
                <th className="px-4 py-2.5">Document Number</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Screening Risk</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCases.map((tc) => {
                const s = tc.sessionData;
                return (
                  <tr 
                    key={s.sessionId}
                    onClick={() => onOpenCase({
                      ...s,
                      documentImageUrl: tc.documentImage,
                      liveFaceImageUrl: tc.liveFaceImage
                    })}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-blue-600 font-medium">{s.sessionId}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{s.fields.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{s.fields.docNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {s.totalRiskScore < 30 ? 'Cleared' : s.totalRiskScore < 70 ? 'Secondary Advised' : 'Flagged'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.totalRiskScore < 30 ? 'bg-emerald-50 text-emerald-700' : s.totalRiskScore < 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {s.totalRiskScore} / 100
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs text-blue-600 font-medium hover:underline">Review Case →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
