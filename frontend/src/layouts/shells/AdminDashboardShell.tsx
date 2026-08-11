import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { StatCard, QuickActions, Card, CardHeader, CardBody } from '@/shared/components';
import { Users, GraduationCap, CalendarCheck, CreditCard, ShieldCheck, Award, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const { schoolName } = useTenant();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-white/10">
                School Administrator
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/70 text-xs font-medium">{schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}, {user?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Here is what is happening across your campus today. You have 3 pending approvals and 14 new enrolments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/portal/students')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all shadow-md cursor-pointer"
            >
              Enrol Student
            </button>
            <button
              onClick={() => navigate('/portal/analytics')}
              className="px-4 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-xs hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 cursor-pointer"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Bento Grid Layout (Unequal card sizes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Large Stat Card - 2 Columns */}
        <div className="md:col-span-2">
          <StatCard
            label="Total Student Body"
            value="1,420"
            hint="+4.2% increase from previous term"
            icon={GraduationCap}
            tone="success"
            size="lg"
            trend="up"
            trendValue="+58 students"
          />
        </div>

        {/* Medium Stat Cards */}
        <StatCard
          label="Active Faculty"
          value="84"
          hint="Full-time teaching staff"
          icon={Users}
          tone="default"
          size="md"
        />

        <StatCard
          label="Today's Attendance"
          value="94.8%"
          hint="Target: 95%"
          icon={CalendarCheck}
          tone="gold"
          size="md"
          trend="up"
          trendValue="+1.2%"
        />

        {/* Financial KPI Card - 2 Columns */}
        <div className="md:col-span-2">
          <StatCard
            label="Quarterly Fee Collection"
            value="₹42.8 Lakhs"
            hint="92% of Q2 target collected on schedule"
            icon={CreditCard}
            tone="purple"
            size="lg"
            trend="up"
            trendValue="₹3.4L overdue"
          />
        </div>

        {/* System Health Card */}
        <Card className="md:col-span-2">
          <CardHeader
            title="System & Operations Overview"
            subtitle="Real-time campus infrastructure metrics"
            action={
              <button
                onClick={() => navigate('/portal/settings')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Settings <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Biometric Attendance Sync</p>
                  <p className="text-[11px] text-slate-400">All 6 gateways operational</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                100% Online
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Term Exam Results</p>
                  <p className="text-[11px] text-slate-400">Class X & XII moderation complete</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                Published
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
