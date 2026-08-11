import React from 'react';
import { StatCard, Card, CardHeader, CardBody, Button, Badge } from '@/shared/components';
import { Globe, Building2, ShieldCheck, Activity, Plus, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboardShell: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Super Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md border border-purple-500/30">
                SaaS Platform Control Room
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Global Platform Overview
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Monitor multi-tenant infrastructure, onboard new institutions, manage global schemas, and track tenant subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/portal/platform')}
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Provision Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Global Infrastructure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tenants"
          value="4 Institutions"
          hint="All active & healthy"
          tone="success"
          icon={Building2}
        />
        <StatCard
          label="Global Platform Users"
          value="1,512"
          hint="Cross-tenant sessions"
          tone="purple"
          icon={Globe}
        />
        <StatCard
          label="Platform Uptime"
          value="99.98%"
          hint="30-day SLA performance"
          tone="success"
          icon={Activity}
        />
        <StatCard
          label="Database Load"
          value="14.2%"
          hint="Schema-isolated cluster"
          tone="gold"
          icon={ShieldCheck}
        />
      </div>

      {/* Quick Tenant Directory Preview */}
      <Card>
        <CardHeader
          title="Tenant Status Summary"
          subtitle="Provisioned school tenants across the SaaS platform"
          action={
            <Button
              onClick={() => navigate('/portal/platform')}
              variant="ghost"
              size="xs"
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Manage Platform
            </Button>
          }
        />
        <CardBody className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">AMPS Main Senior Secondary</p>
                <p className="text-[11px] text-slate-400 font-mono">amps-main • Jaipur, RJ</p>
              </div>
            </div>
            <Badge tone="success" size="sm" dot>Active</Badge>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">DPS World Academy</p>
                <p className="text-[11px] text-slate-400 font-mono">dps-jaipur • Jaipur, RJ</p>
              </div>
            </div>
            <Badge tone="success" size="sm" dot>Active</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
