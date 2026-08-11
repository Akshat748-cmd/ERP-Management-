import React from 'react';
import { StatCard, Card, CardHeader, CardBody, Button, Badge } from '@/shared/components';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccountantDashboardShell: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Accountant Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-md border border-teal-500/30">
                Finance &amp; Billing Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Finance Control Panel
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track student tuition fees, issue payment receipts, monitor pending balances, and generate financial reports.
            </p>
          </div>
          <Button
            onClick={() => navigate('/portal/fees')}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Collect Fee
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Q2 Collection Target" value="₹46.5 Lakhs" hint="Target set by Board" icon={DollarSign} tone="default" />
        <StatCard label="Collected to Date" value="₹42.8 Lakhs" hint="92% of target achieved" icon={TrendingUp} tone="success" trend="up" trendValue="+8.4%" />
        <StatCard label="Pending Fee Dues" value="₹3.7 Lakhs" hint="89 student accounts" icon={AlertCircle} tone="danger" />
        <StatCard label="Receipts Issued Today" value="24 Receipts" hint="Totaling ₹1.82 Lakhs" icon={CreditCard} tone="gold" />
      </div>

      {/* Recent Transactions Card */}
      <Card>
        <CardHeader title="Recent Fee Receipts" subtitle="Transactions logged today" />
        <CardBody className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Rahul Kumar (XII-A)</p>
                <p className="text-[11px] text-slate-400">Receipt #REC-2026-084 • Q3 Tuition Fee</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">₹14,500</p>
              <Badge tone="success" size="xs">Paid Online</Badge>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Priya Sharma (XII-A)</p>
                <p className="text-[11px] text-slate-400">Receipt #REC-2026-083 • Q3 Tuition Fee</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">₹14,500</p>
              <Badge tone="success" size="xs">Cash Counter</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
