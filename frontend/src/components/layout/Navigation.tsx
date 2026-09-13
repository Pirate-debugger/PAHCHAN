import React from 'react';
import {
  FileCheck,
  LayoutDashboard,
  ShieldAlert,
  Server,
  FlaskConical,
  FileText,
  History,
  Settings
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0
}) => {
  const navItems = [
    {
      id: 'workspace',
      label: 'Verification Workspace',
      icon: FileCheck,
      primary: true
    },
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard
    },
    {
      id: 'screenings',
      label: 'Queue & History',
      icon: ShieldAlert,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    {
      id: 'providers',
      label: 'Provider Center',
      icon: Server
    },
    {
      id: 'demo',
      label: 'Demo Lab',
      icon: FlaskConical,
      highlight: true
    },
    {
      id: 'reports',
      label: 'Legal Dossiers',
      icon: FileText
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`inline-flex items-center gap-2 py-3 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs'
                    : item.primary
                    ? 'text-blue-700 font-bold hover:bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isActive
                    ? 'text-blue-700 stroke-[2.5]'
                    : item.primary
                    ? 'text-blue-600 stroke-[2.2]'
                    : item.highlight
                    ? 'text-amber-600'
                    : 'text-slate-400'
                }`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold bg-amber-50 text-amber-700 border border-amber-300">
                    BENCHMARK
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
