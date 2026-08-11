import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, StatCard, Card, CardHeader, CardBody, Button, StatusChip } from '@/shared/components';
import { useTenant } from '@/context/TenantContext';
import { apiClient } from '@/services/api/client';
import { Plus, Globe, Building2, Activity, ShieldCheck } from 'lucide-react';

interface DisplayTenant {
  id: string;
  name: string;
  location: string;
  students: number | string;
  staff: number | string;
  status: string;
  plan: string;
}

export const PlatformPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenants: contextTenants } = useTenant();
  const [tenantsList, setTenantsList] = useState<DisplayTenant[]>([]);

  useEffect(() => {
    apiClient
      .get('/tenants')
      .then((res) => {
        const fetched = res.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          location: t.address || 'Jaipur, India',
          students: '1,420',
          staff: '84',
          status: t.active ? 'Active' : 'Inactive',
          plan: 'Enterprise SaaS',
        }));
        setTenantsList(fetched);
      })
      .catch(() => {
        // Fallback to local context tenants if backend unreachable
        const mapped = contextTenants.map((t) => ({
          id: t.id,
          name: t.name,
          location: t.address || 'Jaipur, India',
          students: '1,420',
          staff: '84',
          status: t.active ? 'Active' : 'Inactive',
          plan: 'Enterprise SaaS',
        }));
        setTenantsList(mapped);
      });
  }, [contextTenants]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform & Multi-Tenant Management"
        subtitle="Global platform control room. Provision new school tenants, monitor system infrastructure, and manage global database instances."
        breadcrumb={[{ label: 'Platform' }, { label: 'Platform Admin' }]}
        action={
          <Button
            onClick={() => navigate('/register-school')}
            variant="accent"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Provision New Tenant
          </Button>
        }
      />

      {/* Global Infrastructure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Provisioned" value={`${tenantsList.length} Schools`} hint="All operational" icon={Building2} tone="success" />
        <StatCard label="Active Platform Sessions" value="1,512" hint="Cross-tenant users" icon={Globe} tone="default" />
        <StatCard label="SaaS Platform Uptime" value="99.98%" hint="30-day SLA metric" icon={Activity} tone="success" />
        <StatCard label="SaaS Database Load" value="14.2%" hint="Isolated schemas" icon={ShieldCheck} tone="purple" />
      </div>

      {/* Tenant Directory Card */}
      <Card>
        <CardHeader
          title="Provisioned School Tenants Directory"
          subtitle="All tenant instances onboarded on the AMPS SaaS Platform"
          action={
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              Super Admin Override Enabled
            </span>
          }
        />
        <CardBody className="p-0 divide-y divide-slate-100">
          {tenantsList.length > 0 ? (
            tenantsList.map((t) => (
              <div key={t.id} className="p-5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold shrink-0 text-sm shadow-xs border border-slate-800">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800">{t.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.id} • {t.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Enrolment / Staff</p>
                    <p className="text-xs font-semibold text-slate-700">{t.students} / {t.staff}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Plan</p>
                    <p className="text-xs font-semibold text-purple-700">{t.plan}</p>
                  </div>
                  <StatusChip status={t.status === 'Active' ? 'active' : 'inactive'} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              No school tenants registered on platform yet. Click "Provision New Tenant" above to onboard the first school.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
