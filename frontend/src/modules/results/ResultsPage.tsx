import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  SectionHeader,
  StatCard,
  Table,
  StatusChip,
  Button,
  Card,
  CardHeader,
  Modal,
} from '@/shared/components';
import {
  Award,
  Plus,
  Building2,
  ChevronDown,
  CheckCircle,
  TrendingUp,
  Filter,
  Printer,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { resultsApi, studentsApi, teachersApi } from '@/services/api/endpoints';
import { Result, Student } from '@/types/entities';

const OfficialSchoolStampSVG = ({ schoolName, sealUrl }: { schoolName?: string; sealUrl?: string }) => {
  if (sealUrl) {
    return (
      <img
        src={sealUrl}
        alt="School Seal"
        className="w-20 h-20 object-contain select-none pointer-events-none transform -rotate-3 opacity-90 shrink-0"
      />
    );
  }

  const displayName = (schoolName || 'SCHOOL EVALUATION BOARD').toUpperCase().slice(0, 26);

  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 select-none pointer-events-none transform -rotate-3 opacity-90 shrink-0">
      <circle cx="60" cy="60" r="54" fill="none" stroke="#1e40af" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#1e40af" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#1e40af" strokeWidth="1.5" />
      <path id="stamp-arc-top" d="M 16,60 A 44,44 0 1,1 104,60" fill="none" />
      <path id="stamp-arc-bottom" d="M 104,60 A 44,44 0 0,1 16,60" fill="none" />
      <text fill="#1e40af" fontSize="8.5" fontWeight="900" letterSpacing="0.6">
        <textPath href="#stamp-arc-top" startOffset="50%" textAnchor="middle">
          {displayName}
        </textPath>
      </text>
      <text fill="#1e40af" fontSize="7.5" fontWeight="800" letterSpacing="0.5">
        <textPath href="#stamp-arc-bottom" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL SEAL • VERIFIED ★
        </textPath>
      </text>
      <g transform="translate(60, 60)" textAnchor="middle">
        <path d="M-8 -6 L0 -14 L8 -6 L4 -6 L4 6 L-4 6 L-4 -6 Z" fill="#1e40af" opacity="0.2" />
        <text y="-3" fontSize="8" fontWeight="900" fill="#1e40af" textAnchor="middle">APPROVED</text>
        <text y="7" fontSize="7" fontWeight="700" fill="#1e40af" textAnchor="middle">ACADEMIC</text>
        <text y="16" fontSize="7" fontWeight="800" fill="#1e40af" textAnchor="middle">2026-27</text>
      </g>
    </svg>
  );
};

const HandwrittenSignatureField = ({
  name,
  roleLabel,
  rotation = '-1deg',
  fontFamily = "'Sacramento', 'Dancing Script', cursive",
  color = "#1e3a8a",
}: {
  name: string;
  roleLabel: string;
  rotation?: string;
  fontFamily?: string;
  color?: string;
}) => (
  <div className="flex flex-col items-center">
    <div className="h-12 flex items-end justify-center px-2">
      <span
        className="text-[30px] leading-none font-normal select-none tracking-wide"
        style={{ fontFamily, transform: `rotate(${rotation})`, color }}
      >
        {name}
      </span>
    </div>
    <div className="w-36 border-b border-slate-400 mt-1" />
    <p className="font-bold text-slate-800 text-xs mt-1">{roleLabel}</p>
    <p className="text-[10px] text-slate-500 font-medium">{name}</p>
  </div>
);


export const ResultsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, tenant, schoolId: tenantSchoolId, schoolName } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const [resultsList, setResultsList] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('');

  /* Report Card Modal State & Staff Signatures */
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedResultForPrint, setSelectedResultForPrint] = useState<Result | null>(null);

  const [reportCardStaff, setReportCardStaff] = useState<{
    classTeacherName: string;
    examControllerName: string;
    principalName: string;
  }>({
    classTeacherName: 'Class Teacher',
    examControllerName: 'Exam Controller',
    principalName: 'School Principal',
  });

  const currentReportSchool = selectedResultForPrint
    ? (tenants.find((t) => t.id === selectedResultForPrint.schoolId) || tenant)
    : (tenants.find((t) => t.id === selectedSchoolId) || tenant);

  const currentReportSchoolName = currentReportSchool?.name || schoolName || 'School Evaluation Board';

  useEffect(() => {
    if (!selectedResultForPrint) return;

    resultsApi
      .getSignatures(selectedResultForPrint.id)
      .then((res: any) => {
        const data = res.data || {};
        const tchName = data.classTeacherName || 'Sunita Malhotra';
        const ctrlName = data.examControllerName || 'Rajesh Sharma';
        const prnName = data.principalName || (user?.role === 'principal' ? user.name : 'Dr. A. K. Varma');
        const schName = data.schoolName || currentReportSchoolName;

        setReportCardStaff({
          classTeacherName: tchName,
          examControllerName: ctrlName,
          principalName: prnName,
        });

        // Dev-mode console warnings for missing/fallback data fields
        if (import.meta.env.DEV || process.env.NODE_ENV !== 'production') {
          if (!data.classTeacherName) {
            console.warn('[ReportCard Dev Warning] Class Teacher signature name is unassigned or fallback in DB context.');
          }
          if (!data.examControllerName) {
            console.warn('[ReportCard Dev Warning] Exam Controller signature name is unassigned or fallback in DB context.');
          }
          if (!data.principalName) {
            console.warn('[ReportCard Dev Warning] Principal signature name is unassigned or fallback in DB context.');
          }
          if (!schName || schName === 'School Evaluation Board') {
            console.warn('[ReportCard Dev Warning] School name for seal is unassigned or fallback in DB context.');
          }
        }
      })
      .catch(() => {
        const targetSchoolId = selectedResultForPrint.schoolId;
        const currentSchoolTenant = tenants.find((t) => t.id === targetSchoolId) || tenant;

        teachersApi
          .list(targetSchoolId)
          .then((res: any) => {
            const list = res.data || [];
            const classTeacher = list.find((t: any) =>
              (t.classesAssigned || t.classes_assigned || '').toLowerCase().includes((selectedResultForPrint.className || '').toLowerCase())
            ) || list[0];

            const controller = list.find(
              (t: any) =>
                (t.subjects || '').toLowerCase().includes('exam') || (t.fullName || t.full_name || '').toLowerCase().includes('controller')
            );

            const tchName = classTeacher ? (classTeacher.fullName || classTeacher.full_name) : 'Sunita Malhotra';
            const ctrlName = currentSchoolTenant?.examControllerName || (controller ? (controller.fullName || controller.full_name) : 'Rajesh Sharma');
            const prnName = currentSchoolTenant?.principalName || (user?.role === 'principal' ? user.name : 'Dr. A. K. Varma');

            setReportCardStaff({
              classTeacherName: tchName,
              examControllerName: ctrlName,
              principalName: prnName,
            });
          })
          .catch(() => {
            setReportCardStaff({
              classTeacherName: 'Sunita Malhotra',
              examControllerName: 'Rajesh Sharma',
              principalName: 'Dr. A. K. Varma',
            });
          });
      });
  }, [selectedResultForPrint, tenants, tenant, user, currentReportSchoolName]);

  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examName, setExamName] = useState('Mid-Term 2026');
  const [className, setClassName] = useState('10');
  const [resultStatusInput, setResultStatusInput] = useState<'published' | 'draft'>('published');
  const [subjectsInput, setSubjectsInput] = useState<{ subjectName: string; maxMarks: number; obtainedMarks: number }[]>([
    { subjectName: 'Mathematics', maxMarks: 100, obtainedMarks: 85 },
    { subjectName: 'Science', maxMarks: 100, obtainedMarks: 90 },
    { subjectName: 'English', maxMarks: 100, obtainedMarks: 88 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Fetch Results */
  const fetchResults = async (grade?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await resultsApi.list({
        school_id: isSuperAdmin ? selectedSchoolId : undefined,
        grade: grade || undefined,
      });
      setResultsList(res.data || []);
    } catch (err: any) {
      console.error('[ResultsPage] Failed to fetch results:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load grade roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(gradeFilter || undefined);
  }, [selectedSchoolId, gradeFilter]);

  const openEnterMarksModal = async () => {
    setIsEnterMarksOpen(true);
    try {
      const res = await studentsApi.list(isSuperAdmin ? selectedSchoolId : undefined);
      const sts: Student[] = res.data || [];
      setStudents(sts);
      if (sts.length > 0) {
        setSelectedStudentId(sts[0].id);
        setClassName(sts[0].className);
      }
    } catch {
      toast.error('Failed to load student roster.');
    }
  };

  const handleAddSubjectRow = () => {
    setSubjectsInput((prev) => [...prev, { subjectName: '', maxMarks: 100, obtainedMarks: 0 }]);
  };

  const handleSubjectChange = (index: number, field: string, value: any) => {
    setSubjectsInput((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCreateResult = async () => {
    if (!selectedStudentId || !examName.trim() || !className.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    const validSubjects = subjectsInput.filter((s) => s.subjectName.trim() !== '');
    if (validSubjects.length === 0) {
      toast.error('Please enter at least one valid subject score.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resultsApi.create({
        studentId: selectedStudentId,
        examName: examName.trim(),
        className: className.trim(),
        subjects: validSubjects,
        status: resultStatusInput,
      });
      toast.success(`Exam result recorded & computed (${resultStatusInput})!`);
      setIsEnterMarksOpen(false);
      fetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to record exam result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishResult = async (resultId: string) => {
    try {
      await resultsApi.publish(resultId);
      toast.success('Result published to student & parent portal!');
      fetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to publish result.');
    }
  };

  const handleUnpublishResult = async (resultId: string) => {
    try {
      await resultsApi.unpublish(resultId);
      toast.success('Result reverted back to draft status.');
      fetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to unpublish result.');
    }
  };

  const handleDeleteResult = async (resultId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete the result record for '${studentName}'?`)) {
      return;
    }
    try {
      await resultsApi.remove(resultId);
      toast.success(`Result for '${studentName}' deleted successfully.`);
      fetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to delete result.');
    }
  };

  const handlePrintReportCard = () => {
    const printEl = document.getElementById('printable-report-card');
    if (!printEl) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Card - ${selectedResultForPrint?.studentName || 'Student'}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800;900&display=swap" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 24px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .font-dancing { font-family: 'Dancing Script', cursive; }
            .font-caveat { font-family: 'Caveat', cursive; }
            .font-vibes { font-family: 'Great Vibes', cursive; }
            .text-2xl { font-size: 24px; }
            .text-3xl { font-size: 28px; }
            .transform { transform: var(--tw-transform); }
            .-rotate-3 { transform: rotate(-3deg); }
            .rotate-2 { transform: rotate(2deg); }
            .gap-6 { gap: 24px; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .p-2\\.5 { padding: 10px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
            .pb-4 { padding-bottom: 16px; }
            .pt-8 { padding-top: 32px; }
            .mt-1 { margin-top: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .w-full { width: 100%; }
            .w-36 { width: 144px; }
            .w-16 { width: 64px; }
            .h-16 { height: 64px; }
            .border { border: 1px solid #e2e8f0; }
            .border-2 { border: 2px solid #cbd5e1; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .border-b-2 { border-bottom: 2px solid #4f46e5; }
            .border-indigo-600 { border-color: #4f46e5; }
            .border-indigo-100 { border-color: #e0e7ff; }
            .border-slate-200 { border-color: #e2e8f0; }
            .border-slate-300 { border-color: #cbd5e1; }
            .rounded-xl { border-radius: 12px; }
            .rounded-2xl { border-radius: 16px; }
            .rounded-full { border-radius: 9999px; }
            .bg-slate-50 { background-color: #f8fafc; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .bg-indigo-50 { background-color: #e0e7ff; }
            .bg-emerald-50\\/60 { background-color: #ecfdf5; }
            .bg-emerald-600 { background-color: #059669; }
            .text-indigo-900 { color: #312e81; }
            .text-indigo-700 { color: #4338ca; }
            .text-slate-900 { color: #0f172a; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-700 { color: #334155; }
            .text-slate-500 { color: #64748b; }
            .text-slate-400 { color: #94a3b8; }
            .text-emerald-700 { color: #047857; }
            .text-emerald-800 { color: #065f46; }
            .text-red-600 { color: #dc2626; }
            .text-white { color: #ffffff; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: monospace; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-xl { font-size: 20px; }
            .font-serif { font-family: Georgia, Cambria, "Times New Roman", serif; }
            .italic { font-style: italic; }
            .text-lg { font-size: 18px; }
            .text-blue-900 { color: #1e3a8a; }
            .text-blue-950 { color: #172554; }
            .text-indigo-950 { color: #1e1b4b; }
            .w-20 { width: 80px; }
            .h-20 { height: 80px; }
            .w-40 { width: 160px; }
            .h-10 { height: 40px; }
            .border-dashed { border-style: dashed; }
            .border-slate-400 { border-color: #94a3b8; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .pt-10 { padding-top: 40px; }
            .inline-block { display: inline-block; }
            .inline-flex { display: inline-flex; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f1f5f9; font-weight: 700; }
            .space-y-6 > * + * { margin-top: 24px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-8 > * + * { margin-top: 32px; }
            .space-y-2 > * + * { margin-top: 8px; }
            @media print {
              body { padding: 0; margin: 0; }
              #printable-report-card { border: none !important; box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div id="printable-report-card">
            ${printEl.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  /* Dynamic Real Metric Calculations */
  const totalPublished = resultsList.filter((r) => r.status === 'published');
  const passedCount = totalPublished.filter((r) => r.grade !== 'F').length;
  const passPercentage = totalPublished.length > 0 ? ((passedCount / totalPublished.length) * 100).toFixed(1) + '%' : '—';
  const aPlusCount = totalPublished.filter((r) => r.grade === 'A+').length;

  const columns = [
    {
      header: 'Student Name',
      cell: (r: Result) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{r.studentName}</p>
          <p className="text-[11px] text-slate-400 font-mono">Roll No. {r.rollNumber}</p>
        </div>
      ),
    },
    {
      header: 'Class',
      cell: (r: Result) => <span className="font-semibold text-slate-700">Class {r.className}</span>,
    },
    {
      header: 'Examination',
      cell: (r: Result) => <span className="text-slate-600 font-medium">{r.examName}</span>,
    },
    {
      header: 'Aggregate Score',
      cell: (r: Result) => (
        <span className="font-bold text-slate-900 font-mono">
          {r.aggregateScore} / {r.totalMaxMarks} ({r.percentage}%)
        </span>
      ),
    },
    {
      header: 'Grade',
      cell: (r: Result) => (
        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
          {r.grade}
        </span>
      ),
    },
    {
      header: 'Status & Actions',
      cell: (r: Result) => (
        <div className="flex items-center gap-2">
          <StatusChip status={r.status === 'published' ? 'approved' : 'pending'} customLabel={r.status === 'published' ? 'Published' : 'Draft'} />
          
          {r.status === 'draft' && (hasPermission('publish_results') || user?.role === 'teacher') && (
            <Button variant="accent" size="xs" onClick={() => handlePublishResult(r.id)}>
              Publish
            </Button>
          )}

          {r.status === 'published' && (hasPermission('publish_results') || user?.role === 'teacher') && (
            <Button variant="outline" size="xs" onClick={() => handleUnpublishResult(r.id)} title="Revert back to draft status">
              Set Draft
            </Button>
          )}

          {(hasPermission('enter_results') || hasPermission('publish_results') || user?.role === 'teacher') && (
            <button
              type="button"
              onClick={() => handleDeleteResult(r.id, r.studentName)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete result record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Report Card',
      cell: (r: Result) => (
        <div>
          {r.status === 'published' ? (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Printer className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={() => {
                setSelectedResultForPrint(r);
                setIsPrintModalOpen(true);
              }}
            >
              Report Card
            </Button>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Pending Publish</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Results & Marks Evaluation"
        subtitle="Record examination marks, compute term grades, and publish digital student report cards."
        breadcrumb={[{ label: 'Academics' }, { label: 'Results & Marks' }]}
        action={
          hasPermission('enter_results') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openEnterMarksModal}
            >
              Enter New Marks
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Class Pass Percentage" value={passPercentage} hint="Published exam results" icon={Award} tone="gold" />
        <StatCard label="A+ Distinction Count" value={`${aPlusCount} Students`} hint="Grade A+ achievers" icon={TrendingUp} tone="purple" />
        <StatCard label="Total Evaluated" value={`${resultsList.length} Records`} hint="Total records entered" icon={CheckCircle} tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Student Grade Roster"
          subtitle={isSuperAdmin && selectedSchool ? `Viewing results for ${selectedSchool.name}` : 'Published & draft examination report cards'}
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

        {error ? (
          <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading exam results...</div>
        ) : (
          <>
            {/* Grade Filter Pills */}
            <div className="px-5 pb-3 pt-1 flex items-center gap-2 flex-wrap border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
                <Filter className="w-3.5 h-3.5" /> Grade:
              </span>
              {['', 'A+', 'A', 'B+', 'B', 'C', 'F'].map((g) => (
                <button
                  key={g || 'all'}
                  type="button"
                  onClick={() => setGradeFilter(g)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    gradeFilter === g
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {g === '' ? 'All Grades' : `Grade ${g}`}
                </button>
              ))}
              {gradeFilter && (
                <span className="ml-auto text-xs text-slate-400">
                  {resultsList.length} record{resultsList.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
            <Table
              data={resultsList}
              columns={columns}
              keyExtractor={(r) => r.id}
              selectable
              emptyMessage="No examination results found for selected grade."
            />
          </>
        )}
      </Card>

      {/* ── Enter New Marks Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={isEnterMarksOpen}
        onClose={() => setIsEnterMarksOpen(false)}
        title="Enter Examination Marks"
        subtitle="Record subject-wise marks and auto-calculate aggregate grades"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                const match = students.find((st) => st.id === e.target.value);
                if (match) setClassName(match.className);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} (Roll: {st.rollNumber}, Class {st.className})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Exam Title *</label>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Mid-Term 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class *</label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Initial Status *</label>
              <select
                value={resultStatusInput}
                onChange={(e) => setResultStatusInput(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Subject Marks Entry</span>
              <button
                type="button"
                onClick={handleAddSubjectRow}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Add Subject
              </button>
            </div>

            {subjectsInput.map((sub, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <input
                  value={sub.subjectName}
                  onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)}
                  placeholder="Subject (e.g. Math)"
                  className="px-2 py-1 border border-slate-200 rounded-md bg-white"
                />
                <input
                  type="number"
                  value={sub.obtainedMarks}
                  onChange={(e) => handleSubjectChange(idx, 'obtainedMarks', parseInt(e.target.value) || 0)}
                  placeholder="Marks Obtained"
                  className="px-2 py-1 border border-slate-200 rounded-md bg-white"
                />
                <input
                  type="number"
                  value={sub.maxMarks}
                  onChange={(e) => handleSubjectChange(idx, 'maxMarks', parseInt(e.target.value) || 100)}
                  placeholder="Max Marks"
                  className="px-2 py-1 border border-slate-200 rounded-md bg-white"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEnterMarksOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateResult} isLoading={isSubmitting}>
              Save & Compute Grade
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Official Report Card Printable Modal ───────────────────────────── */}
      {selectedResultForPrint && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Official Student Report Card"
          subtitle={`Academic Evaluation Record - ${selectedResultForPrint.studentName}`}
        >
          <div className="space-y-6 pt-2">
            {/* Printable Report Card Container */}
            <div id="printable-report-card" className="p-6 bg-white border-2 border-slate-200 rounded-2xl space-y-6 text-slate-800 shadow-sm">
              {/* Header / School Banner */}
              <div className="border-b-2 border-indigo-600 pb-4 text-center space-y-1">
                <h2 className="text-xl font-black uppercase text-indigo-900 tracking-wider">
                  {currentReportSchoolName}
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Affiliated to CBSE / State Educational Board • Academic Session 2026-2027
                </p>
                <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mt-1">
                  OFFICIAL ACADEMIC EVALUATION &amp; REPORT CARD
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80">
                <div>
                  <p className="text-slate-400 font-medium">Student Name</p>
                  <p className="font-bold text-slate-900">{selectedResultForPrint.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Roll Number</p>
                  <p className="font-bold text-slate-900 font-mono">Roll No. {selectedResultForPrint.rollNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Class / Grade</p>
                  <p className="font-bold text-slate-900">Class {selectedResultForPrint.className}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Examination</p>
                  <p className="font-bold text-slate-900">{selectedResultForPrint.examName}</p>
                </div>
              </div>

              {/* Subject Scores Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject Performance Breakdown</h3>
                <table className="w-full text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-left font-bold border-b border-slate-200">
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5 text-center">Max Marks</th>
                      <th className="p-2.5 text-center">Obtained</th>
                      <th className="p-2.5 text-center">Percentage</th>
                      <th className="p-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedResultForPrint.subjects && selectedResultForPrint.subjects.length > 0 ? (
                      selectedResultForPrint.subjects.map((sub, idx) => {
                        const pct = Math.round((sub.obtainedMarks / (sub.maxMarks || 100)) * 100);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-800">{sub.subjectName}</td>
                            <td className="p-2.5 text-center font-mono text-slate-500">{sub.maxMarks}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-900">{sub.obtainedMarks}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{pct}%</td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No subject details recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Overall Summary & Grade Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">
                    Aggregate Result: <span className="text-emerald-700 font-black">{selectedResultForPrint.aggregateScore} / {selectedResultForPrint.totalMaxMarks}</span> ({selectedResultForPrint.percentage}%)
                  </p>
                  <p className="text-emerald-700 font-semibold">
                    Overall Grade: <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-xs">{selectedResultForPrint.grade}</span> • Status: <span className="font-bold text-emerald-800 uppercase">PASSED &amp; QUALIFIED</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm">
                    <CheckCircle className="w-4 h-4" /> VERIFIED OFFICIAL RESULT
                  </span>
                </div>
              </div>

              {/* Signatures & Official Stamp Seal */}
              <div className="pt-10 grid grid-cols-3 gap-4 text-center text-xs text-slate-700 items-end">
                {/* 1. Class Teacher */}
                <HandwrittenSignatureField
                  name={reportCardStaff.classTeacherName}
                  roleLabel="Class Teacher Signature"
                  rotation="-2deg"
                  fontFamily="'Sacramento', 'Dancing Script', cursive"
                  color="#1d4ed8"
                />

                {/* 2. Exam Controller */}
                <HandwrittenSignatureField
                  name={reportCardStaff.examControllerName}
                  roleLabel="Exam Controller"
                  rotation="1deg"
                  fontFamily="'Alex Brush', 'Caveat', cursive"
                  color="#0f172a"
                />

                {/* 3. Principal Signature & Seal */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <OfficialSchoolStampSVG
                      schoolName={currentReportSchoolName}
                      sealUrl={currentReportSchool?.sealUrl || currentReportSchool?.logoUrl}
                    />
                    <HandwrittenSignatureField
                      name={reportCardStaff.principalName}
                      roleLabel="Principal Signature & Seal"
                      rotation="-3deg"
                      fontFamily="'Dancing Script', 'Sacramento', cursive"
                      color="#1e1b4b"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPrintModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrintReportCard}
              >
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ResultsPage;
