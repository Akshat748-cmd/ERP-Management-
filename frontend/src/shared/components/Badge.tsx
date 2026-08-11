import React from 'react';
import { cn } from '@/shared/utils/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'navy' | 'purple' | 'blue' | 'teal';

export interface BadgeProps {
  tone?: BadgeTone;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  toneOnGlass?: boolean;
  children: React.ReactNode;
  className?: string;
}

const toneMap: Record<BadgeTone, { bg: string; text: string; dot: string }> = {
  neutral: { bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400' },
  success: { bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-500' },
  danger:  { bg: 'bg-red-50',       text: 'text-red-600',     dot: 'bg-red-500' },
  gold:    { bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-400' },
  navy:    { bg: 'bg-slate-100',    text: 'text-slate-800',   dot: 'bg-slate-600' },
  purple:  { bg: 'bg-purple-50',    text: 'text-purple-700',  dot: 'bg-purple-500' },
  blue:    { bg: 'bg-blue-50',      text: 'text-blue-700',    dot: 'bg-blue-500' },
  teal:    { bg: 'bg-teal-50',      text: 'text-teal-700',    dot: 'bg-teal-500' },
};

const sizeMap = {
  xs: 'px-2 py-0.5 text-[10px] gap-1',
  sm: 'px-2.5 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  size = 'sm',
  dot = false,
  toneOnGlass = false,
  children,
  className = '',
}) => {
  const { bg, text, dot: dotColor } = toneMap[tone];

  if (toneOnGlass) {
    return (
      <span
        style={{
          background: 'rgba(255,255,255,0.18)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.28)',
          backdropFilter: 'blur(8px)',
        }}
        className={cn(
          'inline-flex items-center font-semibold rounded-full',
          sizeMap[size],
          className
        )}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />}
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        bg, text,
        sizeMap[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />}
      {children}
    </span>
  );
};
