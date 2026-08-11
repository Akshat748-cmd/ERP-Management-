import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { Shield, Plus, Search, Filter, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type UserItem = { id: string; name: string; email: string; role: string; status: 'active' | 'inactive'; lastLogin: string };

const USERS: UserItem[] = [
  { id: 'usr_01', name: 'Dr. Ramesh Sharma', email: 'ramesh.sharma@amps.edu', role: 'teacher', status: 'active', lastLogin: 'Today, 09:12 AM' },
  { id: 'usr_02', name: 'Sunita Verma', email: 'sunita.v@amps.edu', role: 'teacher', status: 'active', lastLogin: 'Yesterday' },
  { id: 'usr_03', name: 'Principal Rajesh', email: 'principal@amps.edu', role: 'principal', status: 'active', lastLogin: 'Today, 08:00 AM' },
  { id: 'usr_04', name: 'Chairman Oberoi', email: 'chairman@amps.edu', role: 'chairman', status: 'active', lastLogin: '3 days ago' },
  { id: 'usr_05', name: 'Super Administrator', email: 'admin@ampsportal.edu', role: 'super_admin', status: 'active', lastLogin: 'Active session' },
];

export const UsersPage: React.FC = () => {
  const { user: currentUser, startImpersonation } = useAuth();
  const [search, setSearch] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const filtered = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'User Account',
      cell: (u: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{u.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (u: UserItem) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-100 text-slate-700 tracking-wider">
          {u.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    { header: 'Status', cell: (u: UserItem) => <StatusChip status={u.status} /> },
    { header: 'Last Active', cell: (u: UserItem) => <span className="text-slate-500 text-xs">{u.lastLogin}</span> },
    {
      header: 'Actions',
      cell: (u: UserItem) => (
        <div className="flex items-center gap-2">
          {isSuperAdmin && u.id !== currentUser?.id && (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => startImpersonation(u.id)}
            >
              Impersonate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User & Access Management"
        subtitle="Manage administrative user accounts, role assignments, system permissions, and impersonation sessions."
        breadcrumb={[{ label: 'Administration' }, { label: 'User Management' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create User Account
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Accounts" value="1,512" hint="Cross-role accounts" icon={Shield} tone="default" />
        <StatCard label="Active Staff Accounts" value="94" hint="Faculty & admin desk" icon={UserCheck} tone="success" />
        <StatCard label="Security Level" value="RBAC Enforced" hint="Strict permission guards" tone="purple" />
      </div>

      <Card>
        <CardHeader
          title="Registered System Accounts"
          subtitle="User accounts and permission profiles"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search user..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
            </div>
          }
        />
        <Table data={filtered} columns={columns} keyExtractor={u => u.id} selectable />
      </Card>
    </div>
  );
};
