import React, { useState, useEffect } from 'react';
import { WorkSummaryStats, ScreeningSessionSummary } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface OverviewPageProps {
  onOpenCase: (caseId: string) => void;
  onNewScreening: () => void;
  onViewDemoLab: () => void;
  onViewAllScreenings: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onOpenCase,
  onNewScreening,
  onViewDemoLab,
  onViewAllScreenings
}) => {
  const [stats, setStats] = useState<WorkSummaryStats>({
    pending_reviews: 0,
    high_priority_reviews: 0,
    completed_today: 0,
    total_screenings: 0
  });
  const [recentCases, setRecentCases] = useState<ScreeningSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, cases] = await Promise.all([
        api.getStats(),
        api.listScreenings()
      ]);
      setStats(s);
      setRecentCases(cases);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter cases that require attention (pending or in_review with score > 0)
  const needsAttention = recentCases.filter(
    (c) => c.status === 'IN_REVIEW' || (c.status === 'PENDING' && c.total_score > 0)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Checkpoint Operational Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Border Checkpoint Screening Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            SSB Police II Division &bull; Sector HQ Screening Gate 3 &bull; Active Source: <span className="font-medium text-slate-700">Demonstration Verification Registry</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh Terminal"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
          <button
            onClick={onNewScreening}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Start New Screening</span>
          </button>
        </div>
      </div>

      {/* Work Summary Cards (Minimal, Clean, No Chart Clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.pending_reviews}</span>
            <span className="text-xs text-slate-400">cases queued</span>
          </div>
        </div>

        {/* High-Priority Reviews */}
        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">High-Priority Concerns</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{stats.high_priority_reviews}</span>
            <span className="text-xs text-rose-500 font-medium">requires secondary review</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.completed_today}</span>
            <span className="text-xs text-slate-400">screenings cleared</span>
          </div>
        </div>

        {/* Total Processed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total System Cases</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total_screenings}</span>
            <span className="text-xs text-slate-400">all-time records</span>
          </div>
        </div>

      </div>

      {/* Needs Attention Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Needs Attention</h2>
            <p className="text-xs text-slate-500">Screening cases with flagged anomalies requiring officer determination</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {needsAttention.length} active
          </span>
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No screenings require your attention</p>
            <p className="text-xs text-slate-400 mt-0.5">All incoming screening cases have been processed or are low risk.</p>
            <button
              onClick={onViewDemoLab}
              className="mt-4 text-xs font-semibold text-brand-700 hover:text-brand-900 underline underline-offset-4 inline-flex items-center gap-1"
            >
              <span>Load synthetic scenario from Demo Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Case ID</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Primary Concern</th>
                  <th className="px-4 py-3">Risk Assessment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {needsAttention.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900">
                      {c.id}
                      {c.is_demo_scenario && (
                        <span className="ml-2 text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {c.document_type}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.primary_concern || 'Review recommended'}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onOpenCase(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-brand-800 hover:bg-brand-900 text-white transition active:scale-95"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Screenings & Demo Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Screenings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Screenings</h3>
            <button
              onClick={onViewAllScreenings}
              className="text-xs font-medium text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-5 py-2.5">Case ID</th>
                  <th className="px-4 py-2.5">Document</th>
                  <th className="px-4 py-2.5">Risk Level</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCases.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-medium text-slate-900">{c.id}</td>
                    <td className="px-4 py-3 text-slate-600">{c.document_type}</td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onOpenCase(c.id)}
                        className="text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline"
                      >
                        Review &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demo Lab Callout Card */}
        <div className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SIH 2026 EVALUATION LAB
            </div>
            <h3 className="text-base font-bold mt-2.5 text-white">8 Deterministic Scenarios</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Test all 4 mandatory SIH modules with pre-packaged synthetic documents:
              Photo Replacement, Modified DOB, Face Mismatch, Expired Passport, Visa Mismatch, Stamp Anomaly, and Multi-Identity.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onViewDemoLab}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm hover:shadow active:scale-95 text-center"
            >
              Open Demo Lab &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
