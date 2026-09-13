import React, { useState, useEffect } from 'react';
import { WorkSummaryStats, ScreeningSessionSummary } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerificationStepper } from '../../components/ui/VerificationStepper';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles
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

  // Cases requiring attention (in review or pending with score > 0)
  const needsAttention = recentCases.filter(
    (c) => c.status === 'IN_REVIEW' || (c.status === 'PENDING' && c.total_score > 0)
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Operational Command Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              TERMINAL ICP-04 OPERATIONAL
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">&bull;</span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Sector HQ Screening Gate 3 &bull; Nepal-Bhutan Corridor
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Border Security &amp; Identity Verification Command
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time optical forensics, ICAO Doc 9303 checksum validation, and 512-D biometric face comparison for frontline Sashastra Seema Bal (SSB) checkpoints.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Refresh Terminal Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <Button
            variant="sovereign"
            size="md"
            onClick={onNewScreening}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Start New Screening
          </Button>
        </div>
      </div>

      {/* 2. Interactive Guided Verification Stepper */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>PAHCHAN 6-Stage Automated Verification Architecture</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Sub-second execution per stage</span>
        </div>
        <VerificationStepper
          currentStage="upload"
          onStageClick={() => onNewScreening()}
        />
      </div>

      {/* 3. Operational Statistics & Vital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Reviews Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Queue Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats.pending_reviews}</span>
              <span className="text-xs text-slate-400 font-medium">dossiers</span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Awaiting officer determination
            </p>
          </div>
        </div>

        {/* High-Priority Tampering Signals */}
        <div className="bg-white rounded-xl border border-rose-200 p-4.5 shadow-subtle bg-rose-50/20 hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">High-Priority Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-4 h-4 stroke-[2.4]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700 font-mono">{stats.high_priority_reviews}</span>
              <span className="text-xs text-rose-500 font-medium">flagged</span>
            </div>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              Requires secondary inspection booth
            </p>
          </div>
        </div>

        {/* Cleared Today */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Cleared Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats.completed_today}</span>
              <span className="text-xs text-slate-400 font-medium">passengers</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Standard review certified
            </p>
          </div>
        </div>

        {/* Total Processed All-Time */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Audit Records</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
              <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats.total_screenings}</span>
              <span className="text-xs text-slate-400 font-medium">total cases</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cryptographically sealed
            </p>
          </div>
        </div>

      </div>

      {/* 4. Action-Required Triage Queue */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Priority Triage Queue &bull; Immediate Officer Review</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Screening sessions with detected optical tampering, checksum failures, or biometric mismatches
            </p>
          </div>
          <Badge variant={needsAttention.length > 0 ? 'warning' : 'success'} size="sm">
            {needsAttention.length} active flags
          </Badge>
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">All Flagged Cases Cleared</p>
              <p className="text-xs text-slate-400 mt-0.5">
                There are currently no active high-risk anomalies requiring physical examination.
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={onViewDemoLab}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Test with Synthetic Scenarios
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3 font-mono">Case ID</th>
                  <th className="px-4 py-3">Document Category</th>
                  <th className="px-4 py-3">Forensic Anomaly Signal</th>
                  <th className="px-4 py-3">Risk Assessment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Workstation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {needsAttention.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {c.id}
                      {c.is_demo_scenario && (
                        <span className="ml-2 text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {c.document_type}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold max-w-xs truncate">
                      {c.primary_concern || 'Inspection recommended'}
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="sovereign"
                        size="xs"
                        onClick={() => onOpenCase(c.id)}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Examine
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Two-Column Split: Recent Verifications Stream + Demo Lab Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Verifications Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Verification Dossiers</h3>
                <p className="text-xs text-slate-500">Live checkpoint throughput across Terminal 3</p>
              </div>
              <button
                onClick={onViewAllScreenings}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Queue</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-2.5 font-mono">Case ID</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Risk Level</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCases.slice(0, 6).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-slate-900">{c.id}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{c.document_type}</td>
                      <td className="px-4 py-3">
                        <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => onOpenCase(c.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Live Outpost Cache Synchronized</span>
            <span className="font-mono">Total {recentCases.length} records</span>
          </div>
        </div>

        {/* Sovereign Demo Lab Callout Card (1 Col) */}
        <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 text-white rounded-xl border border-slate-800 p-6 shadow-elevated flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-saffron">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>SYNTHETIC BENCHMARK LAB</span>
            </div>

            <h3 className="text-base font-extrabold text-white tracking-tight">
              8 Deterministic Scenarios
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluate every verification module with pre-packaged synthetic test artifacts:
            </p>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Photo Splicing &amp; ELA Heatmaps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>ICAO 7-3-1 Modulo-10 Check Digit Fails</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Biometric Face Embedding Mismatches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Visa Expiry &amp; Watchlist Collisions</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 relative z-10">
            <Button
              variant="saffron"
              size="md"
              className="w-full"
              onClick={onViewDemoLab}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Demo Evaluation Lab
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
