import React, { useState, useEffect } from 'react';
import {
  Search,
  FileCheck,
  LayoutDashboard,
  Server,
  Settings,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Command,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction('TOGGLE_COMMAND_PALETTE');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'verify_new',
      title: 'Verify New Document',
      category: 'Verification Workspace',
      icon: FileCheck
    },
    {
      id: 'open_dashboard',
      title: 'Open Operational Dashboard',
      category: 'Analytics',
      icon: LayoutDashboard
    },
    {
      id: 'open_queue',
      title: 'Browse Verification Queue / History',
      category: 'Cases',
      icon: Clock
    },
    {
      id: 'open_providers',
      title: 'Authoritative Provider Center',
      category: 'Gateways',
      icon: Server
    },
    {
      id: 'open_demo_lab',
      title: 'Synthetic Benchmark Lab',
      category: 'Evaluation',
      icon: Sparkles
    },
    {
      id: 'open_reports',
      title: 'Official Court-Admissible Reports',
      category: 'Legal Dossier',
      icon: FileText
    },
    {
      id: 'open_settings',
      title: 'System Settings & Thresholds',
      category: 'Configuration',
      icon: Settings
    }
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-modal border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to screen... (e.g., verify, providers, demo)"
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </span>
        </div>

        {/* Action Options List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No matching commands found
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectAction(item.id);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>PAHCHAN Command Hub</span>
          <span>&uarr; &darr; navigate &bull; ENTER select</span>
        </div>

      </div>
    </div>
  );
};
