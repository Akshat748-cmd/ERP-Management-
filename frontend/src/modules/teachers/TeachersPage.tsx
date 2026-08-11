import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { Search, Plus, Filter, Download, Eye, Edit2, Trash2 } from 'lucide-react';

type Teacher = { id: string; name: string; department: string; subjects: string; classes: string; status: string };

const TEACHERS: Teacher[] = [
  { id: 'T001', name: 'Dr. Ramesh Sharma', department: 'Science & Physics', subjects: 'Physics, Lab', classes: 'Class XI, XII', status: 'Active' },
  { id: 'T002', name: 'Sunita Verma', department: 'Mathematics', subjects: 'Mathematics', classes: 'Class X, XI, XII', status: 'Active' },
  { id: 'T003', name: 'Anil Kapoor', department: 'Chemistry', subjects: 'Organic Chemistry', classes: 'Class XI, XII', status: 'Active' },
  { id: 'T004', name: 'Meenakshi Sundaram', department: 'English & Literature', subjects: 'English Core', classes: 'Class IX, X, XI', status: 'Active' },
  { id: 'T005', name: 'Rajesh Nair', department: 'Computer Science', subjects: 'Python, Informatics', classes: 'Class XI, XII', status: 'Active' },
];

export const TeachersPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = TEACHERS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Faculty Member',
      cell: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {t.name.charAt(4) || t.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{t.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{t.id}</p>
          </div>
        </div>
      ),
    },
    { header: 'Department', cell: (t: Teacher) => <span className="font-semibold text-slate-700">{t.department}</span> },
    { header: 'Subjects', cell: (t: Teacher) => <span className="text-slate-600">{t.subjects}</span> },
    { header: 'Assigned Classes', cell: (t: Teacher) => <span className="text-slate-600">{t.classes}</span> },
    { header: 'Status', cell: () => <StatusChip status="active" /> },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Faculty & Teaching Staff"
        subtitle="Manage faculty directory, subject allocations, and departmental roles."
        breadcrumb={[{ label: 'Academics' }, { label: 'Teachers' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Faculty Member
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Faculty" value="84" hint="Full-time teaching staff" tone="default" />
        <StatCard label="Departments" value="9 Subject Areas" hint="Science, Math, Humanities..." tone="purple" />
        <StatCard label="Faculty On Duty Today" value="82 / 84" hint="2 approved leaves" tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Teaching Staff Directory"
          subtitle="List of active teaching faculty and assigned subjects"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search faculty..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
              <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />}>Export</Button>
            </div>
          }
        />
        <Table data={filtered} columns={columns} keyExtractor={t => t.id} selectable />
      </Card>
    </div>
  );
};
