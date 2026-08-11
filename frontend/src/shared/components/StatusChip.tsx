import React from 'react';
import { cn } from '@/shared/utils/cn';

export type StatusVariant =
  | 'active' | 'inactive' | 'pending' | 'paid' | 'partial' | 'overdue'
  | 'present' | 'absent' | 'late' | 'approved' | 'rejected' | 'draft'
  | 'published' | 'submitted' | 'graded' | 'open' | 'closed';

const statusConfig: Record<StatusVariant, { label: string; dot: string; bg: string; text: string }> = {
  active:    { label: 'Active',     dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  inactive:  { label: 'Inactive',   dot: 'bg-slate-400',   bg: 'bg-slate-100',   text: 'text-slate-600'   },
  pending:   { label: 'Pending',    dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  paid:      { label: 'Paid',       dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  partial:   { label: 'Partial',    dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  overdue:   { label: 'Overdue',    dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-600'     },
  present:   { label: 'Present',    dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  absent:    { label: 'Absent',     dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-600'     },
  late:      { label: 'Late',       dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  approved:  { label: 'Approved',   dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  rejected:  { label: 'Rejected',   dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-600'     },
  draft:     { label: 'Draft',      dot: 'bg-slate-400',   bg: 'bg-slate-100',   text: 'text-slate-600'   },
  published: { label: 'Published',  dot: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'    },
  submitted: { label: 'Submitted',  dot: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'    },
  graded:    { label: 'Graded',     dot: 'bg-purple-500',  bg: 'bg-purple-50',   text: 'text-purple-700'  },
  open:      { label: 'Open',       dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  closed:    { label: 'Closed',     dot: 'bg-slate-400',   bg: 'bg-slate-100',   text: 'text-slate-600'   },
};

export interface StatusChipProps {
  status: StatusVariant | string;
  customLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  customLabel,
  size = 'sm',
  className,
}) => {
  const config = statusConfig[status as StatusVariant] ?? {
    label: status,
    dot: 'bg-slate-400',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  };

  const sizeClass = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
  }[size];

  const dotSize = { xs: 'w-1 h-1', sm: 'w-1.5 h-1.5', md: 'w-1.5 h-1.5' }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        config.bg,
        config.text,
        sizeClass,
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', config.dot, dotSize)} />
      {customLabel ?? config.label}
    </span>
  );
};
