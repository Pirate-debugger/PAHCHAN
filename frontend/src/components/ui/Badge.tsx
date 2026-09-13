import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'critical' | 'saffron' | 'neutral' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pill?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pill = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.2',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium'
  }[size];

  const roundedStyle = pill ? 'rounded-full' : 'rounded-md';

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    brand: 'bg-blue-50 text-blue-800 border border-blue-200 font-medium',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-medium',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200 font-medium',
    critical: 'bg-purple-50 text-purple-900 border border-purple-200 font-semibold',
    saffron: 'bg-amber-100/70 text-amber-900 border border-amber-300 font-medium',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
    outline: 'bg-transparent text-slate-700 border border-slate-300'
  }[variant];

  const dotColors = {
    default: 'bg-slate-400',
    brand: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    critical: 'bg-purple-600',
    saffron: 'bg-amber-500',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-500'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans leading-none ${roundedStyle} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />
      )}
      <span>{children}</span>
    </span>
  );
};
