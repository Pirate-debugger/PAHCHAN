import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  User 
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCheckpoint: string;
  operatorId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentCheckpoint,
  operatorId,
  searchQuery,
  onSearchChange,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'screenings', label: 'Screenings' },
    { id: 'workstation', label: 'Screening Workstation' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'demo-lab', label: 'Demo Lab' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-subtle">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand & Subtitle */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  PAHCHAN
                </span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-xs text-slate-600 font-medium">
                  Identity &amp; Document Screening
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Prototype • SIH 2026
                </span>
              </div>
            </div>
          </div>

          {/* Quick Search Box */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case or document..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Operational Context & Officer Profile */}
          <div className="flex items-center space-x-4 text-xs">
            {/* Duty Post Indicator */}
            <div className="hidden lg:flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="font-medium truncate max-w-[180px]">{currentCheckpoint}</span>
            </div>

            {/* Officer Badge */}
            <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">{operatorId}</span>
            </div>

            {/* Minimal System Readiness Dot */}
            <div className="hidden sm:flex items-center space-x-1 text-slate-500 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Ready</span>
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Primary Workflow Navigation Bar */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-none py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
