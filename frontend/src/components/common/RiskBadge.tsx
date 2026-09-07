import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md'
}) => {
  const getStyles = () => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          label: 'LOW RISK'
        };
      case 'REVIEW':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: 'REVIEW RECOMMENDED'
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-800',
          border: 'border-rose-200',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          label: 'HIGH RISK'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-900',
          border: 'border-purple-300',
          icon: <AlertOctagon className="w-4 h-4 text-purple-700" />,
          label: 'CRITICAL ANOMALY'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <HelpCircle className="w-4 h-4 text-slate-500" />,
          label: 'PENDING'
        };
    }
  };

  const style = getStyles();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}>
      {style.icon}
      <span>{style.label}</span>
      {showScore && score !== undefined && score > 0 && (
        <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded bg-white/70 border border-current">
          {score}
        </span>
      )}
    </span>
  );
};
