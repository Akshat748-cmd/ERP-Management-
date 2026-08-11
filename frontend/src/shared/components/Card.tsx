import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

/* ─── Card ────────────────────────────────────────────────────────── */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'solid' | 'glass' | 'elevated' | 'flat';
  hover?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  variant = 'solid',
  hover = false,
  noPadding = false,
  style,
  ...props
}) => {
  const isGlass = variant === 'glass';
  const isElevated = variant === 'elevated';
  const isFlat = variant === 'flat';

  return (
    <div
      style={
        isGlass
          ? {
              background: 'var(--tenant-glass-bg, rgba(255,255,255,0.12))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--tenant-glass-border, rgba(255,255,255,0.20))',
              borderRadius: '20px',
              ...style,
            }
          : style
      }
      className={cn(
        'overflow-hidden transition-all duration-200',
        isGlass && 'text-white',
        isElevated && 'bg-white rounded-2xl shadow-lg border border-slate-100',
        isFlat && 'bg-white rounded-2xl border border-slate-100',
        !isGlass && !isElevated && !isFlat && 'bg-white rounded-2xl border border-slate-100/80 shadow-sm',
        hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* ─── CardHeader ──────────────────────────────────────────────────── */
export const CardHeader: React.FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  onGlass?: boolean;
  noBorder?: boolean;
}> = ({ title, subtitle, action, className, onGlass, noBorder }) => {
  return (
    <div
      className={cn(
        'px-5 py-4 flex items-start justify-between gap-4',
        !noBorder && (onGlass ? 'border-b border-white/10' : 'border-b border-slate-100'),
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            'text-[14px] font-semibold leading-tight tracking-tight truncate',
            onGlass ? 'text-white' : 'text-slate-900'
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p className={cn('text-xs mt-0.5 leading-relaxed', onGlass ? 'text-white/65' : 'text-slate-500')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

/* ─── CardBody ────────────────────────────────────────────────────── */
export const CardBody: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('p-5', className)}>{children}</div>;
};

/* ─── CardFooter ──────────────────────────────────────────────────── */
export const CardFooter: React.FC<{
  children: ReactNode;
  className?: string;
  onGlass?: boolean;
}> = ({ children, className, onGlass }) => {
  return (
    <div
      className={cn(
        'px-5 py-3 flex items-center justify-between',
        onGlass
          ? 'bg-white/5 border-t border-white/10'
          : 'bg-slate-50/60 border-t border-slate-100',
        className
      )}
    >
      {children}
    </div>
  );
};
