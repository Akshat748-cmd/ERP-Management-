import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  style,
  children,
  ...props
}) => {
  const isGlass = variant === 'glass';

  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0 relative overflow-hidden';

  const variants: Record<string, string> = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-900 shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400 shadow-sm',
    accent:
      'bg-[var(--tenant-from,#4f46e5)] text-white hover:opacity-90 active:opacity-95 focus-visible:ring-[var(--tenant-from,#4f46e5)] shadow-sm hover:shadow-md',
    outline:
      'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm hover:shadow-md',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm',
    glass:
      'text-white hover:bg-white/20 active:bg-white/30 focus-visible:ring-white/50',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] gap-1',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-[13px] gap-2',
    lg: 'px-6 py-3 text-sm gap-2.5',
  };

  return (
    <button
      style={
        isGlass
          ? {
              background: 'var(--tenant-glass-bg, rgba(255,255,255,0.15))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--tenant-glass-border, rgba(255,255,255,0.25))',
              ...style,
            }
          : style
      }
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
