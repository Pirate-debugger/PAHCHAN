import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  FileSearch, 
  FlaskConical, 
  History, 
  Radio, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  MapPin, 
  X,
  LayoutDashboard,
  FileText,
  Sliders
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { sound } from '../utils/sound';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalAlertCount: number;
  currentCheckpoint?: string;
  onCheckpointChange?: (cp: string) => void;
}

const CHECKPOINTS = [
  { id: 'raxaul', name: 'Raxaul Land Border Checkpoint', region: 'Indo-Nepal Border (SSB)' },
  { id: 'attari', name: 'Attari-Wagah Integrated Check Post', region: 'Indo-Pakistan Border (BSF/BOI)' },
  { id: 'petrapole', name: 'Petrapole Integrated Check Post', region: 'Indo-Bangladesh Border (BOI)' },
  { id: 'delhi', name: 'Indira Gandhi Int’l Airport (T3)', region: 'Bureau of Immigration (MHA)' },
  { id: 'mumbai', name: 'CSM International Airport (T2)', region: 'Bureau of Immigration (MHA)' }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  criticalAlertCount,
  currentCheckpoint = 'Raxaul Land Border Checkpoint',
  onCheckpointChange
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showCheckpointDropdown, setShowCheckpointDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
      setUtcTime(now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    const healthTimer = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 8000);
    return () => clearInterval(healthTimer);
  }, []);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.enabled = !next;
    if (!next) sound.click();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'screening', label: 'Screening', icon: FileSearch },
    { id: 'evidence', label: 'Evidence', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'Audit', icon: History },
    { id: 'demo-lab', label: 'Demo Lab', icon: FlaskConical, badge: '8 Cases' },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <>
      <header className="border-b border-slate-800/90 bg-[#070b14]/95 backdrop-blur-md sticky top-0 z-40 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Government Identity Branding */}
            <div 
              className="flex items-center space-x-3.5 cursor-pointer select-none group" 
              onClick={() => {
                sound.click();
                setActiveTab('overview');
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                {criticalAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-[8px] font-bold text-white items-center justify-center">!</span>
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-white tracking-widest font-mono">
                    PAHCHAN
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-800/80 tracking-wider">
                    SIH2026188
                  </span>
                  <span className="hidden md:inline text-[9px] font-mono font-medium text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    SSB-MHA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Verify Identity. Detect Risk. Protect Trust.
                </p>
              </div>
            </div>

            {/* Segmented Main Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.click();
                      setActiveTab(item.id);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-cyan-400 border border-cyan-900/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Checkpoint HUD, Threat Status & Controls */}
            <div className="flex items-center space-x-2.5">
              
              {/* Checkpoint Selector Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    sound.click();
                    setShowCheckpointDropdown(!showCheckpointDropdown);
                  }}
                  className="hidden md:flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900/90 hover:bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-all shadow-sm"
                  title="Switch Active Checkpoint"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold truncate max-w-[130px]">
                    {currentCheckpoint.split(' ')[0]}
                  </span>
                </button>

                {showCheckpointDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0c1222] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Designated Border Posts
                    </div>
                    {CHECKPOINTS.map((cp) => (
                      <button
                        key={cp.id}
                        onClick={() => {
                          sound.click();
                          if (onCheckpointChange) onCheckpointChange(cp.name);
                          setShowCheckpointDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                          currentCheckpoint.includes(cp.name.split(' ')[0])
                            ? 'bg-blue-950/70 border border-blue-800 text-cyan-300'
                            : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="font-bold">{cp.name}</span>
                        <span className="text-[10px] text-slate-400">{cp.region}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Synchronized Telemetry Clock (IST & UTC) */}
              <div className="hidden xl:flex flex-col items-end text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                <span className="text-cyan-300 font-bold">{istTime || '01:15:30 IST'}</span>
                <span className="text-[9px] text-slate-500">{utcTime || '19:45:30 UTC'}</span>
              </div>

              {/* Online Readiness Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Radio className={`w-3 h-3 ${backendOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span className="text-[11px] font-mono font-medium text-slate-300">
                  {backendOnline ? 'API READY' : 'OFFLINE LAB'}
                </span>
              </div>

              {/* Audio Toggle */}
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title={soundMuted ? 'Unmute Checkpoint Sounds' : 'Mute Sounds'}
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* Keyboard Shortcuts Cheatsheet */}
              <button
                onClick={() => {
                  sound.click();
                  setShowShortcuts(true);
                }}
                className="hidden sm:flex p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* 8 Scenarios Quick Modal Trigger */}
              <button
                onClick={() => {
                  sound.click();
                  setActiveTab('demo-lab');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all border border-cyan-400/20"
              >
                <FlaskConical className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                <span className="hidden sm:inline">8 Evaluation Scenarios</span>
                <span className="sm:hidden">8 Cases</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Subnav */}
        <div className="lg:hidden flex overflow-x-auto space-x-1 px-4 py-2 bg-[#080d19] border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.click();
                  setActiveTab(item.id);
                }}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Officer Workstation Hotkeys</h3>
              </div>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-400">Switch Scenarios</span>
                <span className="text-cyan-300 font-bold">[Key 1 to 8]</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-400">Trigger AI Rescan</span>
                <span className="text-cyan-300 font-bold">[Key R]</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-400">Open Official Dossier</span>
                <span className="text-cyan-300 font-bold">[Key D]</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-400">Toggle Mute Audio</span>
                <span className="text-cyan-300 font-bold">[Key M]</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#080d1a] border border-slate-800">
                <span className="text-slate-400">Switch View Mode</span>
                <span className="text-cyan-300 font-bold">[Tab / E / S]</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              Got it (ESC)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
