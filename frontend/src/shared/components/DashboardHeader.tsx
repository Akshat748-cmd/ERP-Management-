import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onGlass?: boolean;
  className?: string;
  eyebrow?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  action,
  onGlass = false,
  className = '',
  eyebrow,
}) => {
  return (
    <div className={clsx('relative', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className={clsx(
              'text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5',
              onGlass ? 'text-white/50' : 'text-slate-400'
            )}>
              {eyebrow}
            </p>
          )}
          <h1 className={clsx(
            'text-[22px] sm:text-[26px] font-bold tracking-tight leading-tight',
            onGlass ? 'text-white' : 'text-slate-900'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={clsx(
              'text-[13px] mt-1.5 leading-relaxed max-w-2xl',
              onGlass ? 'text-white/70' : 'text-slate-500'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0 flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
