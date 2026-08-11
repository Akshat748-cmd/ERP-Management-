import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard, Card, CardHeader, CardBody, Badge } from '@/shared/components';
import { CalendarCheck, BookOpen, Award, CreditCard } from 'lucide-react';

export const StudentDashboardShell: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Student Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold backdrop-blur-md border border-orange-500/30">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your class attendance, view pending homework assignments, check term exam scores, and manage fee dues.
          </p>
        </div>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Attendance" value="96%" hint="Eligible for Board Exams" icon={CalendarCheck} tone="success" />
        <StatCard label="Pending Homework" value="2 Due" hint="Math & Physics" icon={BookOpen} tone="gold" />
        <StatCard label="Term 1 Grade" value="A+ (92%)" hint="Rank 3 in Class" icon={Award} tone="purple" />
        <StatCard label="Fee Status" value="Paid" hint="Q3 Tuition Clear" icon={CreditCard} tone="success" />
      </div>

      {/* Assignments list */}
      <Card>
        <CardHeader title="My Active Assignments" subtitle="Upcoming homework submissions" />
        <CardBody className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Mathematics Assignment #4</p>
              <p className="text-[11px] text-slate-400">Chapter 5: Integration by Parts • Due Tomorrow</p>
            </div>
            <Badge tone="warning" size="sm">Pending</Badge>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Physics Lab Report #2</p>
              <p className="text-[11px] text-slate-400">Optics Experiment • Due 8th Aug</p>
            </div>
            <Badge tone="success" size="sm">Submitted</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
