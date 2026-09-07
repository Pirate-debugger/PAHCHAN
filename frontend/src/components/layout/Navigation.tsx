import React from 'react';
import { LayoutDashboard, FileText, FlaskConical, History, Settings, ShieldAlert } from 'lucide-react';

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
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'screenings',
      label: 'Screenings',
      icon: ShieldAlert,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'demo', label: 'Demo Lab', icon: FlaskConical, highlight: true },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`inline-flex items-center gap-2 py-3.5 px-1 border-b-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-brand-700 text-brand-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-700' : 'text-slate-400'} ${item.highlight ? 'text-amber-600' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    SIH
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
