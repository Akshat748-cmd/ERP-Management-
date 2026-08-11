import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { Calendar, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

type AttendanceRecord = { id: string; studentName: string; class: string; roll: string; date: string; status: 'present' | 'absent' | 'late' };

const RECORDS: AttendanceRecord[] = [
  { id: 'A001', studentName: 'Rahul Kumar', class: 'XII-A', roll: '01', date: 'Today', status: 'present' },
  { id: 'A002', studentName: 'Priya Sharma', class: 'XII-A', roll: '02', date: 'Today', status: 'present' },
  { id: 'A003', studentName: 'Amit Singh', class: 'XI-B', roll: '07', date: 'Today', status: 'absent' },
  { id: 'A004', studentName: 'Nisha Verma', class: 'XI-B', roll: '08', date: 'Today', status: 'present' },
  { id: 'A005', studentName: 'Rohit Meena', class: 'X-A', roll: '11', date: 'Today', status: 'late' },
];

export const AttendancePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('XII-A');

  const columns = [
    {
      header: 'Student',
      cell: (r: AttendanceRecord) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{r.studentName}</p>
          <p className="text-[11px] text-slate-400">Roll No. {r.roll}</p>
        </div>
      ),
    },
    { header: 'Class', cell: (r: AttendanceRecord) => <span className="font-semibold text-slate-700">{r.class}</span> },
    { header: 'Date', cell: (r: AttendanceRecord) => <span className="text-slate-500">{r.date}</span> },
    { header: 'Status', cell: (r: AttendanceRecord) => <StatusChip status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Daily Class Attendance"
        subtitle="Mark class registers, monitor student presence, and send absentee alerts to parents."
        breadcrumb={[{ label: 'Academics' }, { label: 'Attendance' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Mark Daily Register
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Present Today" value="1,348" hint="94.9% of total students" icon={CheckCircle2} tone="success" />
        <StatCard label="Absent Today" value="52" hint="3.6% of total students" icon={XCircle} tone="danger" />
        <StatCard label="Late Arrivals" value="20" hint="1.5% of total students" icon={Clock} tone="warning" />
      </div>

      <Card>
        <CardHeader
          title="Class Attendance Register"
          subtitle={`Viewing records for Class ${selectedClass}`}
          action={
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="XII-A">Class XII-A</option>
                <option value="XI-B">Class XI-B</option>
                <option value="X-A">Class X-A</option>
              </select>
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
            </div>
          }
        />
        <Table data={RECORDS} columns={columns} keyExtractor={r => r.id} />
      </Card>
    </div>
  );
};
