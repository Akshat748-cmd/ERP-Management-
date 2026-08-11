import React, { useState, useEffect } from 'react';
import { SectionHeader, StatCard, Card, CardHeader, CardBody } from '@/shared/components';
import { Users, GraduationCap, DollarSign, Award, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { analyticsApi } from '@/services/api/endpoints';

export interface AnalyticsSummary {
  schoolId: string;
  totalStudents: number;
  totalTeachers: number;
  attendance: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    totalMarked: number;
    attendanceRate: number;
  };
  fees: {
    totalTarget: number;
    totalCollected: number;
    outstandingBalance: number;
    collectionRate: number;
  };
  results: {
    totalPublished: number;
    passPercentage: number;
    distinctionCount: number;
    gradeDistribution: Record<string, number>;
  };
  homework: {
    activeAssignments: number;
  };
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getSummary(isSuperAdmin ? selectedSchoolId : undefined);
      setAnalytics(res.data);
    } catch (err: any) {
      console.error('[AnalyticsPage] Failed to fetch analytics:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSchoolId]);

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics & Executive Intelligence"
        subtitle="Institutional performance metrics, financial progress, student progression trends, and grade distribution."
        breadcrumb={[{ label: 'Platform' }, { label: 'Analytics' }]}
        action={
          isSuperAdmin ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSchoolDropOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate max-w-[140px]">
                  {selectedSchool ? selectedSchool.name : 'Select School'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${schoolDropOpen ? 'rotate-180' : ''}`} />
              </button>

              {schoolDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 overflow-hidden p-2 space-y-1 z-50">
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedSchoolId(t.id);
                        setSchoolDropOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${
                        selectedSchoolId === t.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                      {selectedSchoolId === t.id && <span className="text-indigo-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : undefined
        }
      />

      {error ? (
        <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
      ) : isLoading || !analytics ? (
        <div className="py-12 text-center text-slate-400 text-sm">Computing real-time analytics...</div>
      ) : (
        <>
          {/* Top Strategic KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Students"
              value={String(analytics.totalStudents)}
              hint="Enrolled active roster"
              icon={Users}
              tone="default"
            />
            <StatCard
              label="Teaching Faculty"
              value={String(analytics.totalTeachers)}
              hint="Active faculty members"
              icon={GraduationCap}
              tone="purple"
            />
            <StatCard
              label="Gross Fee Collected"
              value={`₹${analytics.fees.totalCollected.toLocaleString('en-IN')}`}
              hint={`${analytics.fees.collectionRate}% of target collected`}
              icon={DollarSign}
              tone="success"
              trend="up"
            />
            <StatCard
              label="Academic Pass Rate"
              value={`${analytics.results.passPercentage}%`}
              hint={`${analytics.results.distinctionCount} A+ distinction records`}
              icon={Award}
              tone="gold"
            />
          </div>

          {/* Analytics Grid Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Progress Card */}
            <Card>
              <CardHeader
                title="Financial Fee Collection Target"
                subtitle="Live realization vs target dues"
                action={
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {analytics.fees.collectionRate}% Realized
                  </span>
                }
              />
              <CardBody className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Total Target: ₹{analytics.fees.totalTarget.toLocaleString('en-IN')}</span>
                    <span>Collected: ₹{analytics.fees.totalCollected.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, analytics.fees.collectionRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Outstanding: ₹{analytics.fees.outstandingBalance.toLocaleString('en-IN')}</span>
                    <span>Target Realization</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Academic Grade Distribution Card */}
            <Card>
              <CardHeader
                title="Grade Breakdown (Published Exm Results)"
                subtitle={`Distribution across ${analytics.results.totalPublished} report cards`}
                action={<span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Exam Roster</span>}
              />
              <CardBody className="space-y-3">
                {Object.entries(analytics.results.gradeDistribution).map(([gradeKey, count]) => {
                  const pct = analytics.results.totalPublished > 0 ? Math.round((count / analytics.results.totalPublished) * 100) : 0;
                  const color = gradeKey === 'A+' ? 'bg-emerald-500' : gradeKey === 'A' ? 'bg-blue-500' : gradeKey === 'B+' || gradeKey === 'B' ? 'bg-amber-500' : 'bg-red-500';

                  return (
                    <div key={gradeKey} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Grade {gradeKey}</span>
                        <span>{count} students ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
