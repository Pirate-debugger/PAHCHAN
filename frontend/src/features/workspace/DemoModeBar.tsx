import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  FileWarning,
  AlertOctagon,
  Users,
  HelpCircle
} from 'lucide-react';

interface DemoModeBarProps {
  onSelectScenario: (scenarioType: 'genuine' | 'tampered' | 'fake' | 'mismatch' | 'unverifiable') => void;
  isLoading?: boolean;
  activeScenario?: string | null;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({
  onSelectScenario,
  isLoading = false,
  activeScenario
}) => {
  const scenarios = [
    {
      id: 'genuine',
      label: 'Genuine Document',
      subtext: 'Arjun Mehta • Clean Pass',
      icon: ShieldCheck,
      color: 'hover:border-emerald-400 hover:bg-emerald-50/50 text-emerald-900'
    },
    {
      id: 'tampered',
      label: 'Tampered Document',
      subtext: 'Rajesh Sharma • Spliced Photo',
      icon: FileWarning,
      color: 'hover:border-amber-400 hover:bg-amber-50/50 text-amber-900'
    },
    {
      id: 'fake',
      label: 'Fully Fake Document',
      subtext: 'Sunil Kumar • Bad MRZ Checksum',
      icon: AlertOctagon,
      color: 'hover:border-rose-400 hover:bg-rose-50/50 text-rose-900'
    },
    {
      id: 'mismatch',
      label: 'Identity Mismatch',
      subtext: 'Deepak Patel • Face Impersonation',
      icon: Users,
      color: 'hover:border-purple-400 hover:bg-purple-50/50 text-purple-900'
    },
    {
      id: 'unverifiable',
      label: 'Unverifiable Document',
      subtext: 'Provider Unconfigured / Low DPI',
      icon: HelpCircle,
      color: 'hover:border-slate-400 hover:bg-slate-100 text-slate-800'
    }
  ];

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-elevated">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Banner Tag */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-amber-400">
                DEMO MODE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                EVALUATION BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic evaluation cases for verification testing
            </p>
          </div>
        </div>

        {/* 5 Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full md:w-auto">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isActive = activeScenario === s.id;

            return (
              <button
                key={s.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectScenario(s.id as any)}
                className={`p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-400/20 border-amber-400 text-white ring-1 ring-amber-400/50'
                    : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700 text-slate-200'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold truncate">{s.label}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 block truncate">
                  {s.subtext}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
