import React from 'react';
import { StatCard, StatCardProps } from './StatCard';

export interface MetricCardProps extends StatCardProps {
  badgeText?: string;
  sparklineData?: number[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  badgeText,
  sparklineData,
  ...props
}) => {
  return (
    <div className="relative">
      <StatCard {...props} />
      {badgeText && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {badgeText}
        </span>
      )}
    </div>
  );
};
