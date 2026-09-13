import React from 'react';
import { Plus, Search, Shield, User, Terminal } from 'lucide-react';

interface AppHeaderProps {
  onNewScreening: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCommandPalette?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onNewScreening,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onOpenCommandPalette
}) => {
  return (
    <header className="bg-brand-950 text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-sm backdrop-blur-md">
      {/* Top Sovereign Tri-color Hairline Strip */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-500 via-white/80 to-emerald-500 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Sovereign Security Title */}
          <div
            onClick={() => onTabChange('workspace')}
            className="flex items-center gap-3 min-w-max cursor-pointer group"
            title="Go to Verification Workspace"
          >
            {/* National Security Emblem Crest */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-800 via-slate-900 to-brand-950 border border-slate-700/80 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
              <Shield className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                  <span>PAHCHAN</span>
                  <span className="text-xs font-normal text-slate-400 font-sans tracking-normal">पहचान</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  SSB OUTPOST AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                Ministry of Home Affairs &bull; Sashastra Seema Bal &bull; Police II
              </p>
            </div>
          </div>

          {/* Global Search Bar with Keyboard Shortcut */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search case ID, passenger name, document number..."
                className="w-full pl-9 pr-12 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 hover:text-white hover:bg-slate-700 rounded border border-slate-700 transition"
                title="Open Command Palette (Ctrl+K)"
              >
                Ctrl+K
              </button>
            </div>
          </div>

          {/* Operational Status & Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Edge Node Status Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">ICP-04 EDGE NODE</span>
            </div>

            {/* Quick Demo Lab Shortcut */}
            <button
              onClick={() => onTabChange('demo')}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-glow-saffron'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Lab</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 font-bold">
                8 Scenarios
              </span>
            </button>

            {/* Officer Profile Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-200 leading-tight">Insp. S. Sharma</p>
                <p className="text-[9px] text-slate-400 leading-tight font-mono">SSB-4821</p>
              </div>
            </div>

            {/* Primary CTA: Start New Screening */}
            <button
              onClick={onNewScreening}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-glow-blue transition-all active:scale-95 border border-blue-500"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Screening</span>
              <span className="sm:hidden">Scan</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
