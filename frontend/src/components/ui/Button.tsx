import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'sovereign' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'saffron';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    xs: "text-xs px-2.5 py-1 gap-1.5",
    sm: "text-xs px-3.5 py-1.5 gap-2",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-sm font-semibold px-5 py-2.5 gap-2.5"
  }[size];

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm border border-blue-700",
    sovereign: "bg-brand-900 hover:bg-brand-950 text-white shadow-xs hover:shadow border border-brand-800",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs",
    outline: "bg-transparent hover:bg-slate-100/80 text-slate-700 border border-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border border-emerald-700",
    saffron: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-xs border border-amber-600"
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
