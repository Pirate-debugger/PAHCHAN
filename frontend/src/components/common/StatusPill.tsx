import React from 'react';
import { SessionStatus } from '../../types';

interface StatusPillProps {
  status: SessionStatus;
  size?: 'xs' | 'sm';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50/80 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Cleared'
        };
      case 'IN_REVIEW':
        return {
          bg: 'bg-amber-50/80 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'In Review'
        };
      case 'ESCALATED':
        return {
          bg: 'bg-rose-50/80 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Escalated'
        };
      case 'PENDING':
      default:
        return {
          bg: 'bg-slate-100/90 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Pending'
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${style.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  );
};
