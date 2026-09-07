import React from 'react';
import { Plus, Search, Shield, User, Terminal } from 'lucide-react';

interface AppHeaderProps {
  onNewScreening: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onNewScreening,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 border border-brand-500/30 flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6 text-brand-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-white">PAHCHAN</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-800 text-brand-200 border border-brand-700">
                  SSB Checkpoint AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Ministry of Home Affairs &bull; Police II Division
              </p>
            </div>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search case ID, passenger name, document number..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 transition"
              />
            </div>
          </div>

          {/* Officer Info & Primary Action */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Shortcut */}
            <button
              onClick={() => onTabChange('demo')}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                activeTab === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Lab (8 Cases)</span>
            </button>

            {/* Officer Profile Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-200 leading-tight">Insp. S. Sharma</p>
                <p className="text-[10px] text-slate-400 leading-tight">SSB-4821</p>
              </div>
            </div>

            {/* + NEW SCREENING (PRIMARY CTA) */}
            <button
              onClick={onNewScreening}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-all hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Screening</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
