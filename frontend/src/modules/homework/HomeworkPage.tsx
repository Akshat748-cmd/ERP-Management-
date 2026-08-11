import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  SectionHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  StatusChip,
  Button,
  Modal,
} from '@/shared/components';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ChevronDown,
  Award,
  Trash2,
  UploadCloud,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { homeworkApi } from '@/services/api/endpoints';

export interface HomeworkItem {
  id: string;
  schoolId: string;
  title: string;
  subject: string;
  className: string;
  description?: string;
  createdByTeacherId?: string;
  dueDate: string;
  status: 'draft' | 'published';
  createdAt: string;
  submissionCount: number;
  isSubmitted?: boolean;
  submittedAt?: string;
  grade?: string;
  feedback?: string;
}

export interface HomeworkSubmissionItem {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submissionText?: string;
  submittedAt: string;
  grade?: string;
  feedback?: string;
}

const createHomeworkSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  subject: z.string().min(1, 'Subject is required'),
  className: z.string().min(1, 'Class is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
  status: z.enum(['published', 'draft']).optional().default('published'),
});

type CreateHomeworkData = z.infer<typeof createHomeworkSchema>;

export const HomeworkPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';
  const isStudent = user?.role === 'student';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* Create Homework Modal */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Submit Homework Modal (for students) */
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedHomeworkForSubmit, setSelectedHomeworkForSubmit] = useState<HomeworkItem | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  /* Submissions / Evaluate Modal (for teachers/admins) */
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [selectedHomeworkForEvaluate, setSelectedHomeworkForEvaluate] = useState<HomeworkItem | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmissionItem[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  /* Extend Deadline Modal */
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedHomeworkForExtend, setSelectedHomeworkForExtend] = useState<HomeworkItem | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  /* Grading state */
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const createForm = useForm<CreateHomeworkData>({
    resolver: zodResolver(createHomeworkSchema),
    defaultValues: {
      title: '',
      subject: '',
      className: '',
      dueDate: '',
      description: '',
      status: 'published',
    },
  });

  const fetchHomework = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await homeworkApi.list({
        school_id: isSuperAdmin ? selectedSchoolId : undefined,
      });
      setHomeworkList(res.data || []);
    } catch (err: any) {
      console.error('[HomeworkPage] Failed to fetch homework:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [selectedSchoolId]);

  const handleCreateSubmit = async (data: CreateHomeworkData) => {
    setIsSubmitting(true);
    try {
      await homeworkApi.create(data);
      toast.success(`Assignment '${data.title}' created (${data.status})!`);
      setIsCreateModalOpen(false);
      createForm.reset();
      fetchHomework();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishHomework = async (id: string, title: string) => {
    try {
      await homeworkApi.publish(id);
      toast.success(`Homework '${title}' has been published!`);
      fetchHomework();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to publish homework.');
    }
  };

  const handleDeleteHomework = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'? It will be safely archived in system for 2 months.`)) {
      return;
    }
    try {
      await homeworkApi.remove(id);
      toast.success(`Homework '${title}' deleted & archived (preserved for 2 months).`);
      fetchHomework();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to delete homework.');
    }
  };

  const handleStudentSubmitHomework = async () => {
    if (!selectedHomeworkForSubmit || !submissionText.trim()) {
      toast.error('Please enter your submission text.');
      return;
    }
    setIsSubmitting(true);
    try {
      await homeworkApi.submit(selectedHomeworkForSubmit.id, { submissionText });
      toast.success('Homework submitted successfully!');
      setIsSubmitModalOpen(false);
      setSubmissionText('');
      fetchHomework();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to submit homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEvaluateModal = async (hw: HomeworkItem) => {
    setSelectedHomeworkForEvaluate(hw);
    setIsEvaluateModalOpen(true);
    setIsLoadingSubmissions(true);
    try {
      const res = await homeworkApi.getSubmissions(hw.id);
      setSubmissions(res.data || []);
    } catch {
      toast.error('Failed to load submissions.');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradeSubmit = async (submissionId: string) => {
    if (!gradeInput.trim()) {
      toast.error('Please enter a grade.');
      return;
    }
    try {
      await homeworkApi.gradeSubmission(submissionId, {
        grade: gradeInput.trim(),
        feedback: feedbackInput.trim() || undefined,
      });
      toast.success('Submission graded successfully!');
      setGradingSubmissionId(null);
      setGradeInput('');
      setFeedbackInput('');
      if (selectedHomeworkForEvaluate) {
        openEvaluateModal(selectedHomeworkForEvaluate);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to grade submission.');
    }
  };

  const openExtendModal = (hw: HomeworkItem) => {
    setSelectedHomeworkForExtend(hw);
    setNewDueDate(hw.dueDate || new Date().toISOString().split('T')[0]);
    setIsExtendModalOpen(true);
  };

  const handleExtendDeadline = async () => {
    if (!selectedHomeworkForExtend || !newDueDate.trim()) {
      toast.error('Please select a valid new due date.');
      return;
    }
    setIsExtending(true);
    try {
      await homeworkApi.update(selectedHomeworkForExtend.id, { dueDate: newDueDate.trim() });
      toast.success(`Deadline for '${selectedHomeworkForExtend.title}' extended to ${newDueDate.trim()}!`);
      setIsExtendModalOpen(false);
      setSelectedHomeworkForExtend(null);
      fetchHomework();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to extend deadline.');
    } finally {
      setIsExtending(false);
    }
  };

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  const totalSubmissions = homeworkList.reduce((acc, h) => acc + h.submissionCount, 0);
  const publishedCount = homeworkList.filter((h) => h.status === 'published').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Homework & Assignments Desk"
        subtitle="Create homework tasks, submit solutions, evaluate student uploads, and provide feedback."
        breadcrumb={[{ label: 'Academics' }, { label: 'Homework' }]}
        action={
          hasPermission('create_homework') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Assignment
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Assignments" value={String(publishedCount)} hint="Published tasks" icon={BookOpen} tone="default" />
        <StatCard label="Total Submissions Uploaded" value={String(totalSubmissions)} hint="Student upload count" icon={Clock} tone="gold" />
        <StatCard label="Class Coverage" value={String(new Set(homeworkList.map((h) => h.className)).size)} hint="Distinct classes" icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Current Class Homework Tasks"
          subtitle={isSuperAdmin && selectedSchool ? `Assignments for ${selectedSchool.name}` : 'Tasks assigned to classes for this term'}
          action={
            isSuperAdmin ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSchoolDropOpen((o) => !o)}
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
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId(t.id);
                          setSchoolDropOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${
                          selectedSchoolId === t.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        {selectedSchoolId === t.id && <span className="text-indigo-600 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : undefined
          }
        />

        <CardBody className="p-0 divide-y divide-slate-100">
          {error ? (
            <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
          ) : isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading homework assignments...</div>
          ) : homeworkList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No homework assignments found.</div>
          ) : (
            homeworkList.map((a) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isOverdue = a.status === 'published' && Boolean(a.dueDate && a.dueDate < todayStr);
              return (
                <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                        <StatusChip status={a.status} />
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
                            Deadline Expired
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {a.subject} • Class {a.className} • Due: <span className={isOverdue ? 'font-bold text-red-600' : 'font-semibold text-slate-700'}>{a.dueDate}</span>
                      </p>
                      {a.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {a.submissionCount} Submissions
                    </span>

                    {isStudent && a.status === 'published' && (
                      a.isSubmitted ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Submitted {a.grade ? `(Grade: ${a.grade})` : ''}
                          </span>
                          {!isOverdue && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedHomeworkForSubmit(a);
                                setIsSubmitModalOpen(true);
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                            >
                              Update Solution
                            </button>
                          )}
                        </div>
                      ) : isOverdue ? (
                        <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200/60 rounded-xl">
                          Closed (Late)
                        </span>
                      ) : (
                        <Button
                          variant="accent"
                          size="xs"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedHomeworkForSubmit(a);
                            setIsSubmitModalOpen(true);
                          }}
                        >
                          Submit Homework
                        </Button>
                      )
                    )}

                    {hasPermission('create_homework') && a.status === 'draft' && (
                      <Button
                        variant="accent"
                        size="xs"
                        leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                        onClick={() => handlePublishHomework(a.id, a.title)}
                      >
                        Publish Draft
                      </Button>
                    )}

                    {hasPermission('grade_homework') && (
                      <Button variant="outline" size="xs" onClick={() => openEvaluateModal(a)}>
                        Evaluate
                      </Button>
                    )}

                    {(hasPermission('create_homework') || hasPermission('grade_homework')) && (
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Calendar className="w-3.5 h-3.5 text-amber-600" />}
                        onClick={() => openExtendModal(a)}
                        title="Extend submission deadline"
                      >
                        Extend Deadline
                      </Button>
                    )}

                    {hasPermission('create_homework') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteHomework(a.id, a.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete assignment (Soft-deleted & archived for 2 months)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {/* ── Create Assignment Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assignment"
        subtitle="Publish a homework task for class students"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
            <input
              {...createForm.register('title')}
              placeholder="e.g. Calculus: Integration by Parts"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {createForm.formState.errors.title && (
              <p className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subject *</label>
              <input
                {...createForm.register('subject')}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {createForm.formState.errors.subject && (
                <p className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class *</label>
              <input
                {...createForm.register('className')}
                placeholder="e.g. 10 or 12-A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {createForm.formState.errors.className && (
                <p className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.className.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                {...createForm.register('dueDate')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {createForm.formState.errors.dueDate && (
                <p className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.dueDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                {...createForm.register('status')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="published">Publish Immediately</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description / Instructions</label>
            <textarea
              {...createForm.register('description')}
              rows={3}
              placeholder="Provide instructions for students..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" isLoading={isSubmitting}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Submit Homework Modal (Student) ───────────────────────────── */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Homework Solution"
        subtitle={`Submitting for: ${selectedHomeworkForSubmit?.title}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Submission Text / Solution Link *</label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={5}
              placeholder="Paste your completed answer or online solution drive link here..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleStudentSubmitHomework} isLoading={isSubmitting}>
              Submit Solution
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Evaluate Submissions Modal (Teacher) ─────────────────────── */}
      {selectedHomeworkForEvaluate && (
        <Modal
          isOpen={isEvaluateModalOpen}
          onClose={() => setIsEvaluateModalOpen(false)}
          title="Evaluate Student Submissions"
          subtitle={`Task: ${selectedHomeworkForEvaluate.title} (Class ${selectedHomeworkForEvaluate.className})`}
        >
          <div className="space-y-4 pt-2">
            {isLoadingSubmissions ? (
              <p className="text-xs text-center py-6 text-slate-400">Loading student submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">No student submissions uploaded yet for this task.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Roll: {sub.rollNumber}</p>
                      </div>
                      {sub.grade ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Award className="w-3 h-3" /> Grade: {sub.grade}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                          Ungraded
                        </span>
                      )}
                    </div>

                    {sub.submissionText && (
                      <div className="p-2 bg-white rounded-lg border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                        {sub.submissionText}
                      </div>
                    )}

                    {sub.feedback && (
                      <p className="text-xs text-slate-500 italic">Feedback: "{sub.feedback}"</p>
                    )}

                    {gradingSubmissionId === sub.id ? (
                      <div className="pt-2 space-y-2 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="Grade e.g. A+, 95/100"
                            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                          <input
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            placeholder="Feedback comments..."
                            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={() => setGradingSubmissionId(null)}>
                            Cancel
                          </Button>
                          <Button variant="accent" size="xs" onClick={() => handleGradeSubmit(sub.id)}>
                            Save Grade
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setGradingSubmissionId(sub.id);
                            setGradeInput(sub.grade || '');
                            setFeedbackInput(sub.feedback || '');
                          }}
                        >
                          {sub.grade ? 'Update Grade' : 'Grade Submission'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsEvaluateModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Extend Deadline Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Homework Deadline"
        subtitle={selectedHomeworkForExtend ? `Set a new submission deadline for '${selectedHomeworkForExtend.title}'` : 'Extend due date'}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Details</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{selectedHomeworkForExtend?.title}</p>
              <p className="text-slate-500">{selectedHomeworkForExtend?.subject} • Class {selectedHomeworkForExtend?.className}</p>
              <p className="text-slate-600">Current Due Date: <span className="font-semibold text-red-600">{selectedHomeworkForExtend?.dueDate}</span></p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Due Date *</label>
            <input
              type="date"
              value={newDueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Students will be able to submit solutions until this new date.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleExtendDeadline}
              disabled={isExtending}
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
            >
              {isExtending ? 'Updating...' : 'Save New Deadline'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomeworkPage;
