import React, { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatTone = 'default' | 'success' | 'warning' | 'danger' | 'gold' | 'purple';

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  tone?: StatTone;
  variant?: 'solid' | 'glass';
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  action?: ReactNode;
}

const toneTokens: Record<StatTone, { icon: string; hint: string; bg: string; border: string; dot: string }> = {
  default: {
    icon: 'bg-slate-100 text-slate-600',
    hint: 'text-slate-400',
    bg: '',
    border: '',
    dot: 'bg-slate-400',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600',
    hint: 'text-emerald-600',
    bg: '',
    border: '',
    dot: 'bg-emerald-500',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600',
    hint: 'text-amber-600',
    bg: '',
    border: '',
    dot: 'bg-amber-500',
  },
  danger: {
    icon: 'bg-red-50 text-red-500',
    hint: 'text-red-500',
    bg: '',
    border: '',
    dot: 'bg-red-500',
  },
  gold: {
    icon: 'bg-amber-50 text-amber-600',
    hint: 'text-amber-600',
    bg: '',
    border: '',
    dot: 'bg-amber-400',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600',
    hint: 'text-purple-600',
    bg: '',
    border: '',
    dot: 'bg-purple-500',
  },
};

const glassToneHint: Record<StatTone, string> = {
  default: 'text-white/70',
  success: 'text-emerald-200',
  warning: 'text-amber-200',
  danger: 'text-red-300',
  gold: 'text-amber-200',
  purple: 'text-purple-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  variant = 'solid',
  trend,
  trendValue,
  className = '',
  size = 'md',
  action,
}) => {
  const isGlass = variant === 'glass';
  const tokens = toneTokens[tone];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  const valueSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-2xl' : 'text-3xl';
  const padding = size === 'lg' ? 'p-6' : size === 'sm' ? 'p-3.5' : 'p-5';
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const iconPad = size === 'lg' ? 'p-3' : 'p-2.5';

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
            }
          : undefined
      }
      className={cn(
        'transition-all duration-200',
        isGlass
          ? 'text-white'
          : 'bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className={cn('flex flex-col h-full', padding)}>
        {/* Top row: label + icon */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className={cn(
            'text-[11px] font-semibold uppercase tracking-widest truncate',
            isGlass ? 'text-white/60' : 'text-slate-400'
          )}>
            {label}
          </p>
          {Icon && (
            <div className={cn(
              'rounded-xl shrink-0 flex items-center justify-center',
              iconPad,
              isGlass ? 'bg-white/15 text-white' : tokens.icon
            )}>
              <Icon className={iconSize} />
            </div>
          )}
        </div>

        {/* Value */}
        <p className={cn(
          'font-bold leading-none tracking-tight font-sans count-animate',
          valueSize,
          isGlass ? 'text-white' : 'text-slate-900'
        )}>
          {value}
        </p>

        {/* Bottom row: hint + trend */}
        <div className="flex items-center justify-between mt-2.5 gap-2">
          {hint && (
            <p className={cn(
              'text-[11.5px] font-medium leading-tight',
              isGlass ? glassToneHint[tone] : tokens.hint
            )}>
              {hint}
            </p>
          )}
          {trend && trendValue && (
            <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </span>
          )}
        </div>

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
};
