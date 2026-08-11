import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { CreditCard, DollarSign, Download, Plus, Search, Filter } from 'lucide-react';

type FeeRecord = { id: string; studentName: string; class: string; term: string; amount: string; status: 'paid' | 'partial' | 'pending' };

const FEES: FeeRecord[] = [
  { id: 'F001', studentName: 'Rahul Kumar', class: 'XII-A', term: 'Q3 Tuition', amount: '₹14,500', status: 'paid' },
  { id: 'F002', studentName: 'Priya Sharma', class: 'XII-A', term: 'Q3 Tuition', amount: '₹14,500', status: 'paid' },
  { id: 'F003', studentName: 'Amit Singh', class: 'XI-B', term: 'Q3 Tuition', amount: '₹14,500', status: 'pending' },
  { id: 'F004', studentName: 'Nisha Verma', class: 'XI-B', term: 'Q3 Tuition', amount: '₹14,500', status: 'paid' },
  { id: 'F005', studentName: 'Rohit Meena', class: 'X-A', term: 'Q3 Tuition', amount: '₹14,500', status: 'partial' },
];

export const FeesPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = FEES.filter(f =>
    f.studentName.toLowerCase().includes(search.toLowerCase()) ||
    f.class.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Student',
      cell: (f: FeeRecord) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{f.studentName}</p>
          <p className="text-[11px] text-slate-400 font-mono">{f.id}</p>
        </div>
      ),
    },
    { header: 'Class', cell: (f: FeeRecord) => <span className="font-semibold text-slate-700">{f.class}</span> },
    { header: 'Fee Term', cell: (f: FeeRecord) => <span className="text-slate-600">{f.term}</span> },
    { header: 'Amount Dues', cell: (f: FeeRecord) => <span className="font-bold text-slate-900">{f.amount}</span> },
    { header: 'Payment Status', cell: (f: FeeRecord) => <StatusChip status={f.status} /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fees & Accounts Desk"
        subtitle="Manage student fee collection, issue payment receipts, and track term collection targets."
        breadcrumb={[{ label: 'Finance' }, { label: 'Fees & Accounts' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Collect Fee Payment
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Q2 Collection Target" value="₹46.5 Lakhs" hint="Target set by Board" icon={DollarSign} tone="default" />
        <StatCard label="Total Collected" value="₹42.8 Lakhs" hint="92% target achieved" icon={CreditCard} tone="success" trend="up" trendValue="+8.4%" />
        <StatCard label="Outstanding Balance" value="₹3.7 Lakhs" hint="89 student accounts pending" tone="danger" />
      </div>

      <Card>
        <CardHeader
          title="Student Fee Ledger"
          subtitle="Fee payment statuses for current academic session"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by student name..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
              <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />}>Export Ledger</Button>
            </div>
          }
        />
        <Table data={filtered} columns={columns} keyExtractor={f => f.id} selectable />
      </Card>
    </div>
  );
};
