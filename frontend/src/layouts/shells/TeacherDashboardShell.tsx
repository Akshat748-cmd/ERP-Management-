import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard, Card, CardHeader, CardBody, Button } from '@/shared/components';
import { BookOpen, CalendarCheck, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Teacher Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-500/30">
                Faculty Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome, {user?.name || 'Teacher'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Manage your assigned classes, mark attendance, post homework assignments, and record student marks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/portal/attendance')} variant="secondary" size="sm">
              Mark Attendance
            </Button>
            <Button onClick={() => navigate('/portal/homework')} variant="glass" size="sm">
              Assign Homework
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Classes" value="4 Sections" hint="XII-A, XI-B, X-A, IX-C" icon={BookOpen} tone="default" />
        <StatCard label="Total Students" value="168" hint="Across 4 sections" icon={Users} tone="success" />
        <StatCard label="Attendance Status" value="Marked" hint="Period 1 complete" icon={CalendarCheck} tone="gold" />
        <StatCard label="Pending Homework" value="3 Reviews" hint="To be evaluated" icon={Clock} tone="purple" />
      </div>

      {/* Today's Schedule Card */}
      <Card>
        <CardHeader title="Today's Teaching Schedule" subtitle="Assigned periods for today" />
        <CardBody className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                08:30 AM
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Class XII-A • Mathematics</p>
                <p className="text-[11px] text-slate-400">Room 302 • Calculus Differential Equations</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Completed</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">
                10:15 AM
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Class XI-B • Physics</p>
                <p className="text-[11px] text-slate-400">Lab 2 • Electrostatics Experiment</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">Upcoming</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
