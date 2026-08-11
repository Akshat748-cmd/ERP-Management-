import React, { ReactNode } from 'react';
import { AlertCircle, FolderOpen, SearchX } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/shared/utils/cn';

/* ─── 1. EmptyState ──────────────────────────────────────────────── */
export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?:
    | { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'outline' }
    | ReactNode;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-10 px-4' : 'py-16 px-8',
        className
      )}
    >
      <div className={cn(
        'rounded-2xl flex items-center justify-center mb-4 text-slate-400',
        compact ? 'w-12 h-12 bg-slate-100' : 'w-16 h-16 bg-slate-100'
      )}>
        <Icon className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
      </div>
      <h3 className="text-[14px] font-semibold text-slate-800 leading-tight">{title}</h3>
      <p className="text-[13px] text-slate-400 max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {action && (
        <div className="mt-5">
          {typeof action === 'object' && 'label' in action && 'onClick' in action ? (
            <Button
              onClick={(action as any).onClick}
              variant={(action as any).variant ?? 'primary'}
              size="sm"
            >
              {(action as any).label}
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
};

/* ─── 2. SearchEmptyState ────────────────────────────────────────── */
export const SearchEmptyState: React.FC<{ query: string; className?: string }> = ({
  query,
  className,
}) => (
  <EmptyState
    icon={SearchX}
    title={`No results for "${query}"`}
    description="Try different keywords or check your spelling."
    className={className}
  />
);

/* ─── 3. LoadingState ────────────────────────────────────────────── */
export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading…',
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {/* Spinner ring */}
      <div className="relative w-10 h-10 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-700 animate-spin"
        />
      </div>
      <p className="text-[12px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
    </div>
  );
};

/* ─── 4. ErrorState ──────────────────────────────────────────────── */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Failed to load data. Please try again or contact support.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-8 text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
      <p className="text-[13px] text-slate-500 max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
};
