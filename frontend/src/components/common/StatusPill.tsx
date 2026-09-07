import React from 'react';
import { SessionStatus } from '../../types';

interface StatusPillProps {
  status: SessionStatus;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ESCALATED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PENDING':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStyle()}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
