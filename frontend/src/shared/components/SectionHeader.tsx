import React, { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { ChevronRight } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  action,
  className,
  size = 'md',
}) => {
  const titleSize = {
    sm: 'text-[16px]',
    md: 'text-[20px]',
    lg: 'text-[24px]',
  }[size];

  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="min-w-0 flex-1">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 mb-1.5">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                <span className={cn(
                  'text-[11px] font-medium',
                  idx === breadcrumb.length - 1 ? 'text-slate-500' : 'text-slate-400'
                )}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className={cn('font-semibold text-slate-900 tracking-tight leading-tight truncate', titleSize)}>
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {action && (
        <div className="shrink-0 flex items-center gap-2 pt-0.5">
          {action}
        </div>
      )}
    </div>
  );
};
