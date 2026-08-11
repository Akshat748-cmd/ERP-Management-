import React from 'react';
import { SectionHeader, StatCard, Card, CardHeader, CardBody, StatusChip, Button } from '@/shared/components';
import { BookOpen, Plus, CheckCircle2, Clock } from 'lucide-react';

type Assignment = { id: string; title: string; subject: string; class: string; dueDate: string; submissions: string; status: 'published' | 'graded' | 'draft' };

const ASSIGNMENTS: Assignment[] = [
  { id: 'HW01', title: 'Calculus: Integration by Parts', subject: 'Mathematics', class: 'Class XII-A', dueDate: 'Tomorrow, 5:00 PM', submissions: '28 / 32 Submissions', status: 'published' },
  { id: 'HW02', title: 'Electrostatics Experiment Report', subject: 'Physics', class: 'Class XI-B', dueDate: '8th Aug 2026', submissions: '14 / 30 Submissions', status: 'published' },
  { id: 'HW03', title: 'Organic Chemistry Reactions', subject: 'Chemistry', class: 'Class XII-A', dueDate: '12th Aug 2026', submissions: '0 / 32 Submissions', status: 'draft' },
];

export const HomeworkPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Homework & Assignments Desk"
        subtitle="Create homework tasks, evaluate online student submissions, and publish solution keys."
        breadcrumb={[{ label: 'Academics' }, { label: 'Homework' }]}
        action={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Assignment
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Assignments" value="12 Published" hint="Across 4 sections" icon={BookOpen} tone="default" />
        <StatCard label="Total Submissions Today" value="84 Uploads" hint="Pending grading" icon={Clock} tone="gold" />
        <StatCard label="Evaluation Rate" value="92%" hint="Graded on schedule" icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardHeader title="Current Class Homework Tasks" subtitle="Tasks assigned to your classes for this term" />
        <CardBody className="p-0 divide-y divide-slate-100">
          {ASSIGNMENTS.map(a => (
            <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <StatusChip status={a.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {a.subject} • {a.class} • Due: <span className="font-semibold text-slate-700">{a.dueDate}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {a.submissions}
                </span>
                <Button variant="outline" size="xs">
                  Evaluate
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
