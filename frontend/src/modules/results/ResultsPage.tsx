import React, { useState } from 'react';
import { SectionHeader, StatCard, Table, StatusChip, Button, Card, CardHeader } from '@/shared/components';
import { Award, Download, Plus, Filter } from 'lucide-react';

type ResultRecord = { id: string; studentName: string; class: string; term: string; percentage: string; grade: string; status: 'passed' | 'pending' };

const RESULTS: ResultRecord[] = [
  { id: 'R001', studentName: 'Rahul Kumar', class: 'XII-A', term: 'Term 1 Mid-Term', percentage: '96.2%', grade: 'A+', status: 'passed' },
  { id: 'R002', studentName: 'Priya Sharma', class: 'XII-A', term: 'Term 1 Mid-Term', percentage: '91.8%', grade: 'A+', status: 'passed' },
  { id: 'R003', studentName: 'Amit Singh', class: 'XI-B', term: 'Term 1 Mid-Term', percentage: '78.4%', grade: 'B', status: 'passed' },
  { id: 'R004', studentName: 'Nisha Verma', class: 'XI-B', term: 'Term 1 Mid-Term', percentage: '98.6%', grade: 'A+', status: 'passed' },
  { id: 'R005', studentName: 'Rohit Meena', class: 'X-A', term: 'Term 1 Mid-Term', percentage: '85.0%', grade: 'A', status: 'passed' },
];

export const ResultsPage: React.FC = () => {
  const [selectedTerm] = useState('Term 1 Mid-Term');

  const columns = [
    {
      header: 'Student Name',
      cell: (r: ResultRecord) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{r.studentName}</p>
          <p className="text-[11px] text-slate-400 font-mono">{r.id}</p>
        </div>
      ),
    },
    { header: 'Class', cell: (r: ResultRecord) => <span className="font-semibold text-slate-700">{r.class}</span> },
    { header: 'Examination', cell: (r: ResultRecord) => <span className="text-slate-600">{r.term}</span> },
    { header: 'Aggregate Score', cell: (r: ResultRecord) => <span className="font-bold text-slate-900">{r.percentage}</span> },
    { header: 'Grade', cell: (r: ResultRecord) => <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">{r.grade}</span> },
    { header: 'Status', cell: () => <StatusChip status="approved" customLabel="Published" /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Results & Marks Evaluation"
        subtitle="Record examination marks, compute term grades, and publish digital student report cards."
        breadcrumb={[{ label: 'Academics' }, { label: 'Results & Marks' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Enter New Marks
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Class Pass Percentage" value="98.6%" hint="Board exams 2025" icon={Award} tone="gold" trend="up" trendValue="+1.2%" />
        <StatCard label="District Rank" value="Rank #1" hint="Highest aggregate average" tone="success" />
        <StatCard label="A+ Distinction Count" value="342 Students" hint="24% of student body" tone="purple" />
      </div>

      <Card>
        <CardHeader
          title="Student Grade Roster"
          subtitle={`Viewing results for ${selectedTerm}`}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
              <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />}>Export Report Cards</Button>
            </div>
          }
        />
        <Table data={RESULTS} columns={columns} keyExtractor={r => r.id} selectable />
      </Card>
    </div>
  );
};
