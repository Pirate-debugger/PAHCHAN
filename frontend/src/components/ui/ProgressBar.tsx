import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'saffron';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'sm',
  variant = 'blue',
  showLabel = false,
  label,
  animate = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5'
  }[size];

  const variantStyles = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
    saffron: 'bg-gradient-to-r from-amber-500 to-yellow-400'
  }[variant];

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-mono font-bold text-slate-900">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles}`}>
        <div
          className={`h-full rounded-full ${variantStyles} ${
            animate ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
