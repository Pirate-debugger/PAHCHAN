import React from 'react';
import type { SyntheticTestCase } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  FlaskConical, 
  History, 
  UserX,
  FileCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/sound';

interface OverviewDashboardProps {
  onStartScreening: () => void;
  onOpenScenario: (tc: SyntheticTestCase) => void;
  onOpenAudit: () => void;
  currentCheckpoint: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onStartScreening,
  onOpenScenario,
  onOpenAudit,
  currentCheckpoint
}) => {
  // Derive high-risk cases from evaluation scenarios
  const criticalCases = SYNTHETIC_TEST_CASES.filter((c) => c.expectedRiskLevel === 'CRITICAL');
  const reviewCases = SYNTHETIC_TEST_CASES.filter((c) => c.expectedRiskLevel === 'MEDIUM');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Top Welcome & Checkpoint Status Bar */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              COMMAND CENTER OVERVIEW
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-300 font-medium">
              {currentCheckpoint}
            </span>
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-wide">
            Automated Identity &amp; Travel Document Screening Workstation
          </h1>
          <p className="text-xs text-slate-400">
            Real-time forensic integrity, ICAO Doc 9303 checksum arithmetic, and 1:1 facial verification telemetry.
          </p>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={() => {
              sound.click();
              onStartScreening();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-900/30 transition-all border border-cyan-400/20"
          >
            <FileCheck className="w-4 h-4 text-cyan-200" />
            <span>Start New Screening</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenAudit();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* 4 Foundational Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Screenings */}
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono font-medium uppercase tracking-wider">Today's Screenings</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white font-mono">148</span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">+14 last hour</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            100% evaluated through multi-signal CV &amp; ICAO algorithms.
          </p>
        </div>

        {/* KPI 2: Clear Passes */}
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono font-medium uppercase tracking-wider">Clear Passes</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">124</span>
            <span className="text-[11px] text-slate-400 font-mono">83.8% clear</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Conforming MRZ, authentic substrate, and biometric match.
          </p>
        </div>

        {/* KPI 3: Secondary Reviews */}
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono font-medium uppercase tracking-wider">Secondary Inspection</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">16</span>
            <span className="text-[11px] text-slate-400 font-mono">10.8% flag</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Visa mismatches or expired validity requiring manual review.
          </p>
        </div>

        {/* KPI 4: Critical Alerts */}
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono font-medium uppercase tracking-wider">Critical Alerts</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">8</span>
            <span className="text-[11px] text-rose-400 font-mono font-bold">Immediate Hold</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Photo splicing, face impersonation, or forged entry stamps.
          </p>
        </div>
      </div>

      {/* Main 2-Column Command View: High-Risk Queue & Anomaly Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: High-Risk Intercept Queue Table (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Priority Review Queue
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {criticalCases.length + reviewCases.length} Cases Requiring Officer Decision
            </span>
          </div>

          <div className="space-y-2.5">
            {criticalCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  sound.click();
                  onOpenScenario(c);
                }}
                className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/80 hover:border-cyan-500/60 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      CRITICAL RISK ({c.sessionData.totalRiskScore}/100)
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      Case {c.caseNumber}: {c.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {c.description}
                  </p>
                </div>

                <button className="flex-shrink-0 p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-600 text-slate-300 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}

            {reviewCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  sound.click();
                  onOpenScenario(c);
                }}
                className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/60 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      SECONDARY REVIEW ({c.sessionData.totalRiskScore}/100)
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      Case {c.caseNumber}: {c.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {c.description}
                  </p>
                </div>

                <button className="flex-shrink-0 p-2 rounded-lg bg-slate-800 group-hover:bg-amber-600 text-slate-300 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Anomaly Signal Distribution & Fast Scenario Launch (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Forensic Anomaly Distribution */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Detected Anomaly Signals (Today)
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">Multi-Spectral</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Photo Splicing / Substitution</span>
                  <span className="text-rose-400 font-bold">38%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Face Biometric Impersonation</span>
                  <span className="text-rose-400 font-bold">25%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Expired Document Validity</span>
                  <span className="text-amber-400 font-bold">20%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Modified DOB / Checksum Alteration</span>
                  <span className="text-amber-400 font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Forged Immigration Stamp</span>
                  <span className="text-cyan-400 font-bold">5%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Evaluation Lab Launcher */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                SIH Evaluation Demonstration
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every synthetic case executes deterministic verification with ground truth evidence pointers. Click any case below to launch directly in the screening workstation:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <button
                onClick={() => {
                  sound.click();
                  onOpenScenario(SYNTHETIC_TEST_CASES[0]);
                }}
                className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="block text-emerald-400 font-bold text-[10px]">#1 GENUINE</span>
                <span className="text-[11px] text-slate-300 block truncate">Authentic Passport</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onOpenScenario(SYNTHETIC_TEST_CASES[1]);
                }}
                className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="block text-rose-400 font-bold text-[10px]">#2 SPLICING</span>
                <span className="text-[11px] text-slate-300 block truncate">Photo Tampering</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onOpenScenario(SYNTHETIC_TEST_CASES[2]);
                }}
                className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="block text-rose-400 font-bold text-[10px]">#3 DOB ALTER</span>
                <span className="text-[11px] text-slate-300 block truncate">Checksum Conflict</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  onOpenScenario(SYNTHETIC_TEST_CASES[4]);
                }}
                className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="block text-rose-400 font-bold text-[10px]">#5 IMPOSTER</span>
                <span className="text-[11px] text-slate-300 block truncate">Face Mismatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
