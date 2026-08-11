import React from 'react';
import { SectionHeader, StatCard, Card, CardHeader, CardBody, Button } from '@/shared/components';
import { Download } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics & Executive Intelligence"
        subtitle="Institutional performance metrics, financial forecasts, student progression trends, and attendance distribution."
        breadcrumb={[{ label: 'Platform' }, { label: 'Analytics' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Executive PDF
          </Button>
        }
      />

      {/* Top Strategic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross Fee Revenue" value="₹1.48 Cr" hint="+12.4% vs last FY" tone="success" trend="up" trendValue="+12.4%" />
        <StatCard label="Student Retention" value="97.2%" hint="+1.8% vs target" tone="default" />
        <StatCard label="Academic Pass Rate" value="98.6%" hint="Highest in district" tone="gold" />
        <StatCard label="Student-Teacher Ratio" value="17 : 1" hint="Optimal range" tone="purple" />
      </div>

      {/* Analytics Bento Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Trend Chart Card */}
        <Card>
          <CardHeader
            title="Monthly Fee Collection Trend"
            subtitle="Comparing FY 2025–26 target vs actuals"
            action={<span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">On Track</span>}
          />
          <CardBody>
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              {[
                { month: 'Apr', val: 70 },
                { month: 'May', val: 85 },
                { month: 'Jun', val: 60 },
                { month: 'Jul', val: 95 },
                { month: 'Aug', val: 75 },
                { month: 'Sep', val: 90 },
              ].map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-100 rounded-t-xl relative h-40 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${m.val}%` }}
                      className="w-full bg-indigo-600 rounded-t-xl group-hover:bg-indigo-500 transition-all duration-300 relative chart-bar"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
              <span>Collection Target: ₹1.60 Cr</span>
              <span className="font-semibold text-slate-900">Current: ₹1.48 Cr (92.5%)</span>
            </div>
          </CardBody>
        </Card>

        {/* Academic Grade Distribution Card */}
        <Card>
          <CardHeader
            title="Grade Breakdown (Term 1)"
            subtitle="Distribution across 1,420 enrolled students"
            action={<span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Board Focus</span>}
          />
          <CardBody className="space-y-4">
            {[
              { grade: 'A+ (90% - 100%)', count: 342, pct: '24%', color: 'bg-emerald-500' },
              { grade: 'A  (75% - 89%)', count: 580, pct: '41%', color: 'bg-blue-500' },
              { grade: 'B  (60% - 74%)', count: 320, pct: '22%', color: 'bg-amber-500' },
              { grade: 'C  (45% - 59%)', count: 140, pct: '10%', color: 'bg-orange-500' },
              { grade: 'D  (< 45%)', count: 38, pct: '3%', color: 'bg-red-500' },
            ].map(g => (
              <div key={g.grade} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{g.grade}</span>
                  <span>{g.count} students ({g.pct})</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${g.color} rounded-full progress-fill`} style={{ width: g.pct }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
