import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StatCard, Card, CardHeader, CardBody, Badge } from '@/shared/components';
import { CalendarCheck, BookOpen, Award, CreditCard, ArrowRight } from 'lucide-react';
import { homeworkApi, attendanceApi, resultsApi, feesApi } from '@/services/api/endpoints';

export const StudentDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [attendancePct, setAttendancePct] = useState<string>('Loading...');
  const [attendanceHint, setAttendanceHint] = useState<string>('Fetching records...');
  const [resultGrade, setResultGrade] = useState<string>('N/A');
  const [resultHint, setResultHint] = useState<string>('No published results yet');
  const [feeStatus, setFeeStatus] = useState<string>('Clear');
  const [feeHint, setFeeHint] = useState<string>('No pending dues');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);

      // 1. Load Homeworks
      try {
        const hwRes = await homeworkApi.list();
        if (isMounted) setHomeworks(hwRes.data || []);
      } catch (err) {
        console.warn('Failed to fetch student homework:', err);
      }

      // 2. Load Attendance
      try {
        const attRes = await attendanceApi.list();
        const records: any[] = attRes.data || [];
        if (records.length > 0) {
          const presentCount = records.filter((r) => r.status === 'present').length;
          const pct = Math.round((presentCount / records.length) * 100);
          if (isMounted) {
            setAttendancePct(`${pct}%`);
            setAttendanceHint(pct >= 75 ? 'Eligible for Exams ✓' : 'Attendance Shortage Warning');
          }
        } else if (isMounted) {
          setAttendancePct('Not Marked');
          setAttendanceHint('No attendance logged yet');
        }
      } catch (err) {
        if (isMounted) {
          setAttendancePct('Not Marked');
          setAttendanceHint('Attendance pending');
        }
      }

      // 3. Load Results
      try {
        const resRes = await resultsApi.list();
        const resultsList: any[] = resRes.data || [];
        if (resultsList.length > 0) {
          const latest = resultsList[0];
          if (isMounted) {
            setResultGrade(`${latest.grade || 'N/A'} (${latest.percentage || 0}%)`);
            setResultHint(`${latest.examName} Report`);
          }
        } else if (isMounted) {
          setResultGrade('N/A');
          setResultHint('No published results');
        }
      } catch (err) {
        console.warn('Failed to fetch student results:', err);
      }

      // 4. Load Fees
      try {
        const feeRes = await feesApi.list();
        const feeList: any[] = feeRes.data || [];
        if (feeList.length > 0) {
          const totalDue = feeList.reduce((acc, f) => acc + (Number(f.amountDue) || 0), 0);
          const totalPaid = feeList.reduce((acc, f) => acc + (Number(f.amountPaid) || 0), 0);
          const diff = totalDue - totalPaid;

          if (isMounted) {
            if (diff <= 0) {
              setFeeStatus('Paid');
              setFeeHint('All Dues Clear ✓');
            } else {
              setFeeStatus(`Pending ₹${diff.toLocaleString('en-IN')}`);
              setFeeHint('Dues Outstanding → Click to pay');
            }
          }
        } else if (isMounted) {
          setFeeStatus('No Dues');
          setFeeHint('No fee invoices assigned');
        }
      } catch (err) {
        console.warn('Failed to fetch student fees:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = homeworks.filter((h) => !h.isSubmitted && h.status === 'published').length;

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

      {/* Personal KPIs - 100% REAL BACKEND DATA & DIRECT CLICKABLE NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/portal/attendance')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatCard label="Overall Attendance" value={attendancePct} hint={attendanceHint} icon={CalendarCheck} tone="success" />
        </div>
        <div onClick={() => navigate('/portal/homework')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatCard label="Pending Homework" value={`${pendingCount} Due`} hint={pendingCount === 0 ? 'All caught up ✓' : 'Click to view & submit →'} icon={BookOpen} tone="gold" />
        </div>
        <div onClick={() => navigate('/portal/results')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatCard label="Term 1 Grade" value={resultGrade} hint={resultHint} icon={Award} tone="purple" />
        </div>
        <div onClick={() => navigate('/portal/fees')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatCard label="Fee Status" value={feeStatus} hint={feeHint} icon={CreditCard} tone="success" />
        </div>
      </div>

      {/* Active Assignments - DIRECT CLICKABLE TO HOMEWORK */}
      <Card>
        <CardHeader
          title="My Active Assignments"
          subtitle="Click any assignment to navigate directly to the homework desk"
          action={
            <button
              onClick={() => navigate('/portal/homework')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View All Assignments <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <CardBody className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading your assignments...</div>
          ) : homeworks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No active homework assignments for your class.</div>
          ) : (
            homeworks.slice(0, 5).map((hw) => (
              <div
                key={hw.id}
                onClick={() => navigate('/portal/homework')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {hw.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {hw.subject} • Class {hw.className} • Due: <span className="font-semibold text-slate-600">{hw.dueDate}</span>
                  </p>
                </div>
                {hw.isSubmitted ? (
                  <Badge tone="success" size="sm">Submitted ✓</Badge>
                ) : (
                  <Badge tone="warning" size="sm">Pending</Badge>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
};
