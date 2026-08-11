import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { StatCard, Card, CardHeader, CardBody, Badge, Button } from '@/shared/components';
import { Crown, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChairmanDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const { schoolName } = useTenant();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-md border border-amber-500/30">
                Board Governance
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/70 text-xs font-medium">{schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome, {user?.name || 'Chairman'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Board Governance &amp; Strategic Oversight. Review financial metrics, approve revisions, and monitor academic progress.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/portal/analytics')}
              variant="secondary"
              size="sm"
            >
              Executive Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Strategic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Annual Revenue"
          value="₹1.72 Cr"
          hint="FY 2025–26 Actuals"
          tone="gold"
          trend="up"
          trendValue="+11.4%"
        />
        <StatCard
          label="Fee Collection Rate"
          value="94.2%"
          hint="Target: 96%"
          tone="success"
          trend="up"
          trendValue="+2.1%"
        />
        <StatCard
          label="Academic Pass Rate"
          value="98.6%"
          hint="Board Exams 2025"
          tone="success"
        />
        <StatCard
          label="Total Faculty & Staff"
          value="84"
          hint="4 vacancies pending"
          tone="default"
        />
      </div>

      {/* Approval Queue Section */}
      <Card>
        <CardHeader
          title="Board Approval Queue"
          subtitle="Items awaiting Chairman review & sign-off"
          action={
            <Badge tone="warning" size="md">
              2 Pending
            </Badge>
          }
        />
        <CardBody className="divide-y divide-slate-100 p-0">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Fee Structure Revision — FY 2026–27
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted by School Admin • 2 days ago • Proposed 5% tuition adjustment
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="success" size="xs" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Approve
              </Button>
              <Button variant="outline" size="xs" leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                Review Details
              </Button>
            </div>
          </div>

          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Annual Capital Expenditure Budget — AY 2026–27
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted by Principal • 5 days ago • STEM lab hardware expansion
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="success" size="xs" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Approve
              </Button>
              <Button variant="outline" size="xs" leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                Review Details
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Access info note */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs font-medium flex items-center gap-3">
        <Crown className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Chairman access is <strong>view &amp; approve only</strong>. Operational data entry, student/teacher management, and daily records are managed by School Admin and Principal.
        </span>
      </div>
    </div>
  );
};
