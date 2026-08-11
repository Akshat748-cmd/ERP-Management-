import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard, Card, CardHeader, CardBody, Badge } from '@/shared/components';
import { Users, CalendarCheck, BookOpen, CreditCard } from 'lucide-react';

export const ParentDashboardShell: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Parent Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-pink-950 via-slate-900 to-rose-950 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold backdrop-blur-md border border-pink-500/30">
            Parent &amp; Guardian Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            Welcome, {user?.name || 'Parent'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitor your ward's daily attendance, academic achievements, homework progress, and fee payment history.
          </p>
        </div>
      </div>

      {/* Ward KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Ward" value="Rahul Kumar" hint="Class XII-A • Roll 01" icon={Users} tone="default" />
        <StatCard label="Ward Attendance" value="96%" hint="Present today" icon={CalendarCheck} tone="success" />
        <StatCard label="Homework Status" value="1 Pending" hint="Math HW #4 due tomorrow" icon={BookOpen} tone="gold" />
        <StatCard label="Fee Statement" value="Clear" hint="No outstanding dues" icon={CreditCard} tone="success" />
      </div>

      {/* Ward Activity Overview */}
      <Card>
        <CardHeader title="Ward Recent Activity" subtitle="Updates from school teachers and administration" />
        <CardBody className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Attendance Recorded</p>
              <p className="text-[11px] text-slate-400">Marked Present by Mr. Sharma • Period 1</p>
            </div>
            <Badge tone="success" size="sm">Present</Badge>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Term 1 Results Published</p>
              <p className="text-[11px] text-slate-400">Scored 92% aggregate • Grade A+</p>
            </div>
            <Badge tone="purple" size="sm">Passed</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
