import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Card, CardHeader, Button } from '@/shared/components';
import { History, ShieldCheck, Search, Filter, Download } from 'lucide-react';

type AuditEntry = { id: string; user: string; action: string; resource: string; timestamp: string; ip: string; status: 'success' | 'warning' };

const AUDIT_LOGS: AuditEntry[] = [
  { id: 'LOG-001', user: 'Dr. Ramesh Sharma', action: 'MARK_ATTENDANCE', resource: 'Class XII-A Register', timestamp: 'Today, 09:15 AM', ip: '192.168.1.42', status: 'success' },
  { id: 'LOG-002', user: 'Sunita Verma', action: 'CREATE_HOMEWORK', resource: 'Math Assignment #4', timestamp: 'Today, 08:30 AM', ip: '192.168.1.18', status: 'success' },
  { id: 'LOG-003', user: 'Super Administrator', action: 'IMPERSONATE_START', resource: 'User usr_01 (Ramesh)', timestamp: 'Yesterday, 04:20 PM', ip: '10.0.0.1', status: 'warning' },
  { id: 'LOG-004', user: 'Accountant Desk', action: 'COLLECT_FEE', resource: 'Receipt #REC-2026-084', timestamp: 'Yesterday, 02:10 PM', ip: '192.168.1.88', status: 'success' },
  { id: 'LOG-005', user: 'Principal Rajesh', action: 'PUBLISH_RESULTS', resource: 'Term 1 Mid-Term Roster', timestamp: '3 days ago', ip: '192.168.1.10', status: 'success' },
];

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = AUDIT_LOGS.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Actor / User',
      cell: (l: AuditEntry) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{l.user}</p>
          <p className="text-[11px] text-slate-400 font-mono">IP: {l.ip}</p>
        </div>
      ),
    },
    {
      header: 'Action Type',
      cell: (l: AuditEntry) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {l.action}
        </span>
      ),
    },
    { header: 'Target Resource', cell: (l: AuditEntry) => <span className="text-slate-600">{l.resource}</span> },
    { header: 'Timestamp', cell: (l: AuditEntry) => <span className="text-slate-500 text-xs">{l.timestamp}</span> },
    { header: 'Status', cell: (l: AuditEntry) => <StatusChip status={l.status === 'success' ? 'approved' : 'warning'} customLabel={l.status.toUpperCase()} /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Audit & Activity Logs"
        subtitle="Immutable security audit trail logging system events, user actions, data modifications, and access history."
        breadcrumb={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
        action={
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Audit Log PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Logged Actions (24h)" value="142 Events" hint="All system events recorded" icon={History} tone="default" />
        <StatCard label="Security Compliance" value="100% Audited" hint="SOC2 & ISO compliant" icon={ShieldCheck} tone="success" />
        <StatCard label="Security Alerts" value="0 Critical" hint="No unauthorized attempts" tone="purple" />
      </div>

      <Card>
        <CardHeader
          title="System Audit Trail"
          subtitle="Real-time log of administrative and operational events"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
            </div>
          }
        />
        <Table data={filtered} columns={columns} keyExtractor={l => l.id} />
      </Card>
    </div>
  );
};
