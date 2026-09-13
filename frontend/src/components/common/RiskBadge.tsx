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
          bg: 'bg-emerald-50/80',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          label: 'LOW RISK'
        };
      case 'REVIEW':
        return {
          bg: 'bg-amber-50/80',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
          label: 'REVIEW'
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50/80',
          text: 'text-rose-800',
          border: 'border-rose-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
          label: 'HIGH RISK'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-purple-50/90',
          text: 'text-purple-900',
          border: 'border-purple-300',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-purple-700 shrink-0" />,
          label: 'CRITICAL'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
          label: 'PENDING'
        };
    }
  };

  const style = getStyles();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-xs font-bold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase font-mono ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}>
      {style.icon}
      <span>{style.label}</span>
      {showScore && score !== undefined && score > 0 && (
        <span className="ml-0.5 px-1 py-0.1 text-[9px] font-mono font-bold rounded bg-white/80 border border-current shadow-2xs">
          {score}
        </span>
      )}
    </span>
  );
};
