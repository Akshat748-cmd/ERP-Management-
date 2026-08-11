import React from 'react';
import { cn } from '@/shared/utils/cn';

/* ─── Base Skeleton ────────────────────────────────────────────────── */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className,
  style,
}) => (
  <div className={cn('skeleton rounded-md', className)} style={style} />
);

/* ─── Skeleton Text lines ─────────────────────────────────────────── */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

/* ─── Skeleton MetricCard ─────────────────────────────────────────── */
export const SkeletonMetricCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-100 p-5', className)}>
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-9 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-28 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

/* ─── Skeleton Table ──────────────────────────────────────────────── */
export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 5,
  className,
}) => (
  <div className={cn('bg-white rounded-2xl border border-slate-100 overflow-hidden', className)}>
    {/* Header */}
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: i === 0 ? 120 : 80 }} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        {Array.from({ length: cols - 1 }).map((_, c) => (
          <Skeleton key={c} className="h-2.5 flex-1" style={{ maxWidth: c % 2 === 0 ? 80 : 60 }} />
        ))}
      </div>
    ))}
  </div>
);

/* ─── Skeleton Dashboard ──────────────────────────────────────────── */
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    {/* Hero */}
    <div className="bg-slate-200 rounded-3xl p-8 space-y-4">
      <Skeleton className="h-6 w-48 bg-white/30" />
      <Skeleton className="h-4 w-72 bg-white/20" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3 w-16 bg-white/30" />
            <Skeleton className="h-7 w-24 bg-white/30" />
          </div>
        ))}
      </div>
    </div>
    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
    {/* Table */}
    <SkeletonTable />
  </div>
);

/* ─── Skeleton Card ───────────────────────────────────────────────── */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-100 p-5 space-y-3', className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);
