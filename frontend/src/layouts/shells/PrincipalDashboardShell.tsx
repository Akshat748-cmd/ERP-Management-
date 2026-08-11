import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { StatCard, QuickActions } from '@/shared/components';
import { GraduationCap, Users, CalendarCheck, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrincipalDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const { schoolName } = useTenant();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Principal Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md border border-blue-500/30">
                Academic Administration
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/70 text-xs font-medium">{schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome, Principal {user?.name || ''}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Academic operations dashboard. Monitor faculty coverage, student attendance trends, and class schedules.
            </p>
          </div>
          <button
            onClick={() => navigate('/portal/analytics')}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer shrink-0"
          >
            Academic Performance
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="1,420" hint="Active enrolment" icon={GraduationCap} tone="default" />
        <StatCard label="Faculty On Duty" value="82 / 84" hint="2 on leave" icon={Users} tone="success" />
        <StatCard label="Overall Attendance" value="95.1%" hint="Today's register" icon={CalendarCheck} tone="gold" />
        <StatCard label="Active Classes" value="36 Sections" hint="Timetable running" icon={BookOpen} tone="purple" />
      </div>
    </div>
  );
};
