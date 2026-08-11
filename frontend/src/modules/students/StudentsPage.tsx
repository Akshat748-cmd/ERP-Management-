import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { Search, Plus, Download, Filter, ChevronDown, Eye, Edit2, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';

/* ── Per-school mock student data ───────────────────────────────── */
type Student = { id: string; name: string; class: string; roll: string; attendance: string; fees: string; status: string };

const STUDENTS_BY_SCHOOL: Record<string, Student[]> = {
  'amps-main': [
    { id: 'S001', name: 'Rahul Kumar',   class: 'XII-A', roll: '01', attendance: '96%', fees: 'Paid',    status: 'Active' },
    { id: 'S002', name: 'Priya Sharma',  class: 'XII-A', roll: '02', attendance: '91%', fees: 'Paid',    status: 'Active' },
    { id: 'S003', name: 'Amit Singh',    class: 'XI-B',  roll: '07', attendance: '78%', fees: 'Pending', status: 'Active' },
    { id: 'S004', name: 'Nisha Verma',   class: 'XI-B',  roll: '08', attendance: '99%', fees: 'Paid',    status: 'Active' },
    { id: 'S005', name: 'Rohit Meena',   class: 'X-A',   roll: '11', attendance: '85%', fees: 'Partial', status: 'Active' },
    { id: 'S006', name: 'Kavita Gupta',  class: 'X-A',   roll: '12', attendance: '92%', fees: 'Paid',    status: 'Active' },
    { id: 'S007', name: 'Sunil Yadav',   class: 'IX-C',  roll: '03', attendance: '70%', fees: 'Pending', status: 'Active' },
    { id: 'S008', name: 'Anjali Joshi',  class: 'IX-C',  roll: '04', attendance: '95%', fees: 'Paid',    status: 'Active' },
    { id: 'S009', name: 'Deepak Patel',  class: 'VIII-B',roll: '15', attendance: '88%', fees: 'Paid',    status: 'Active' },
    { id: 'S010', name: 'Sunita Kumari', class: 'VIII-B',roll: '16', attendance: '97%', fees: 'Paid',    status: 'Active' },
  ],
  '__default__': [
    { id: 'S101', name: 'Arjun Mishra',  class: 'X-A',   roll: '01', attendance: '92%', fees: 'Paid',    status: 'Active' },
    { id: 'S102', name: 'Sneha Tiwari',  class: 'X-B',   roll: '02', attendance: '87%', fees: 'Partial', status: 'Active' },
    { id: 'S103', name: 'Vivek Kumar',   class: 'IX-A',  roll: '05', attendance: '74%', fees: 'Pending', status: 'Active' },
    { id: 'S104', name: 'Ritu Singh',    class: 'IX-A',  roll: '06', attendance: '98%', fees: 'Paid',    status: 'Active' },
    { id: 'S105', name: 'Manish Soni',   class: 'VIII-A',roll: '11', attendance: '82%', fees: 'Paid',    status: 'Active' },
  ],
};

const attColor = (a: string) => {
  const n = parseInt(a);
  return n >= 90 ? 'text-emerald-600 font-bold' : n >= 80 ? 'text-amber-600 font-bold' : 'text-red-500 font-bold';
};

export const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const { tenants } = useTenant();
  const isSuperAdmin = user?.role === 'super_admin';

  const [search, setSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  /* Resolve student list */
  const getStudents = (): Student[] => {
    if (!isSuperAdmin) return STUDENTS_BY_SCHOOL['amps-main'];
    if (!selectedSchoolId) return [];
    return STUDENTS_BY_SCHOOL[selectedSchoolId] || STUDENTS_BY_SCHOOL['__default__'];
  };

  const students = getStudents();
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSchool = tenants.find(t => t.id === selectedSchoolId);
  const feePending = filtered.filter(s => s.fees !== 'Paid').length;
  const avgAtt = filtered.length
    ? Math.round(filtered.reduce((acc, s) => acc + parseInt(s.attendance), 0) / filtered.length) + '%'
    : '—';

  const columns = [
    {
      header: 'Student',
      cell: (s: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {s.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{s.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Class',
      cell: (s: Student) => <span className="font-semibold text-slate-700">{s.class}</span>,
    },
    {
      header: 'Roll No.',
      cell: (s: Student) => <span className="text-slate-500 font-mono">{s.roll}</span>,
    },
    {
      header: 'Attendance',
      cell: (s: Student) => <span className={attColor(s.attendance)}>{s.attendance}</span>,
    },
    {
      header: 'Fee Status',
      cell: (s: Student) => (
        <StatusChip
          status={s.fees === 'Paid' ? 'paid' : s.fees === 'Partial' ? 'partial' : 'pending'}
          customLabel={s.fees}
        />
      ),
    },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View Profile">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Edit Student">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete Record">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        title="Students Directory"
        subtitle="Manage student enrolment records, track attendance and fee status across all classes."
        breadcrumb={[{ label: 'Academics' }, { label: 'Students' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Student
          </Button>
        }
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Enrolled" value={isSuperAdmin ? (selectedSchoolId ? String(filtered.length) : '—') : '1,420'} tone="default" />
        <StatCard label="Active Status" value={isSuperAdmin ? (selectedSchoolId ? String(filtered.filter(st => st.status === 'Active').length) : '—') : '1,398'} tone="success" />
        <StatCard label="Fee Pending" value={isSuperAdmin ? (selectedSchoolId ? String(feePending) : '—') : '89'} tone="danger" />
        <StatCard label="Avg Attendance" value={isSuperAdmin ? (selectedSchoolId ? avgAtt : '—') : '91.4%'} tone="gold" />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader
          title="Enroled Students List"
          subtitle={isSuperAdmin && selectedSchool ? `Viewing records for ${selectedSchool.name}` : 'Current academic term student roster'}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Super Admin School Switcher Dropdown */}
              {isSuperAdmin && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSchoolDropOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {selectedSchool ? selectedSchool.name : 'Select School'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${schoolDropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {schoolDropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 overflow-hidden p-2 space-y-1">
                      {tenants.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setSelectedSchoolId(t.id); setSchoolDropOpen(false); setSearch(''); }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${selectedSchoolId === t.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span className="truncate">{t.name}</span>
                          {selectedSchoolId === t.id && <span className="text-indigo-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student or ID..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>
                Filter
              </Button>

              <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export
              </Button>
            </div>
          }
        />

        {/* Super admin prompt when no school is selected */}
        {isSuperAdmin && !selectedSchoolId ? (
          <div className="py-16 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Select a school to view student roster</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Use the institution dropdown above to filter students by school branch.</p>
          </div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={s => s.id}
            selectable
            emptyMessage="No students found matching search criteria."
          />
        )}
      </Card>
    </div>
  );
};
