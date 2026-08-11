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
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { attendanceApi, studentsApi } from '@/services/api/endpoints';
import { AttendanceRecord, Student } from '@/types/entities';

export const AttendancePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allSchoolStudents, setAllSchoolStudents] = useState<Student[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  /* Mark Register Modal State */
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markClass, setMarkClass] = useState<string>('');
  const [markDate, setMarkDate] = useState<string>(todayStr);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Fetch Available Classes on School Select */
  useEffect(() => {
    studentsApi.list(isSuperAdmin ? selectedSchoolId : undefined)
      .then((res) => {
        const sts: Student[] = res.data || [];
        setAllSchoolStudents(sts);
        const classes = Array.from(new Set(sts.map((s) => s.className))).filter(Boolean).sort();
        setAvailableClasses(classes);
      })
      .catch(() => {});
  }, [selectedSchoolId, isSuperAdmin]);

  /* Fetch Attendance Records */
  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.list({
        date: selectedDate || undefined,
        class_name: selectedClass || undefined,
        school_id: isSuperAdmin ? selectedSchoolId : undefined,
      });
      setAttendanceRecords(res.data || []);
    } catch (err: any) {
      console.error('[AttendancePage] Failed to fetch attendance:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load attendance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedClass, selectedSchoolId]);

  /* Load Students when opening Mark Register Modal */
  const handleOpenMarkModal = async () => {
    setIsMarkModalOpen(true);
    setIsLoadingStudents(true);
    try {
      const res = await studentsApi.list(isSuperAdmin ? selectedSchoolId : undefined);
      const allStudents: Student[] = res.data || [];
      setAllSchoolStudents(allStudents);

      const classes = Array.from(new Set(allStudents.map((s) => s.className))).filter(Boolean).sort();
      setAvailableClasses(classes);

      const targetClass = (markClass && classes.includes(markClass))
        ? markClass
        : (classes[0] || 'XII-A');

      setMarkClass(targetClass);

      const targetClassSts = allStudents.filter(
        (s) => s.className.toLowerCase() === targetClass.toLowerCase()
      );
      setClassStudents(targetClassSts);

      const initialMap: Record<string, 'present' | 'absent' | 'late'> = {};
      targetClassSts.forEach((st) => {
        initialMap[st.id] = 'present';
      });
      setStudentStatusMap(initialMap);
    } catch (err: any) {
      toast.error('Failed to load class roster.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleClassChangeInModal = (newClass: string) => {
    setMarkClass(newClass);
    const targetClassSts = allSchoolStudents.filter(
      (s) => s.className.toLowerCase() === newClass.toLowerCase()
    );
    setClassStudents(targetClassSts);

    const initialMap: Record<string, 'present' | 'absent' | 'late'> = {};
    targetClassSts.forEach((st) => {
      initialMap[st.id] = 'present';
    });
    setStudentStatusMap(initialMap);
  };

  const handleSetAllStatus = (status: 'present' | 'absent' | 'late') => {
    const updatedMap: Record<string, 'present' | 'absent' | 'late'> = {};
    classStudents.forEach((st) => {
      updatedMap[st.id] = status;
    });
    setStudentStatusMap(updatedMap);
  };

  const handleBulkSubmit = async () => {
    if (!markClass || !markDate) {
      toast.error('Please select both class and date.');
      return;
    }
    if (classStudents.length === 0) {
      toast.error('No students found in selected class.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadRecords = classStudents.map((st) => ({
        studentId: st.id,
        status: studentStatusMap[st.id] || 'present',
      }));

      await attendanceApi.markBulk({
        className: markClass,
        date: markDate,
        records: payloadRecords,
      });

      toast.success(`Attendance submitted for Class ${markClass} (${payloadRecords.length} students)!`);
      setIsMarkModalOpen(false);
      fetchAttendance();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  /* Real-time StatCard Metrics */
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'absent').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;

  const columns = [
    {
      header: 'Student',
      cell: (r: AttendanceRecord) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{r.studentName}</p>
          <p className="text-[11px] text-slate-400 font-mono">Roll No. {r.rollNumber}</p>
        </div>
      ),
    },
    {
      header: 'Class',
      cell: (r: AttendanceRecord) => <span className="font-semibold text-slate-700">Class {r.className}</span>,
    },
    {
      header: 'Date',
      cell: (r: AttendanceRecord) => <span className="text-slate-500 font-mono text-xs">{r.date}</span>,
    },
    {
      header: 'Status',
      cell: (r: AttendanceRecord) => <StatusChip status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        title="Daily Class Attendance"
        subtitle="Mark class registers, monitor student presence, and track daily class rosters."
        breadcrumb={[{ label: 'Academics' }, { label: 'Attendance' }]}
        action={
          (hasPermission('mark_attendance') || hasPermission('edit_attendance') || user?.role === 'teacher' || user?.role === 'school_admin' || user?.role === 'principal') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={handleOpenMarkModal}
            >
              Mark Daily Register
            </Button>
          ) : undefined
        }
      />

      {/* Real Dynamic StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Present Today" value={String(presentCount)} hint="Verified present students" icon={CheckCircle2} tone="success" />
        <StatCard label="Absent Today" value={String(absentCount)} hint="Recorded absent students" icon={XCircle} tone="danger" />
        <StatCard label="Late Arrivals" value={String(lateCount)} hint="Recorded late arrivals" icon={Clock} tone="warning" />
      </div>

      {/* Register Table Card */}
      <Card>
        <CardHeader
          title="Class Attendance Register"
          subtitle={
            isSuperAdmin && selectedSchool
              ? `Viewing records for ${selectedSchool.name}`
              : selectedClass
              ? `Viewing records for Class ${selectedClass}`
              : 'Viewing all class attendance records'
          }
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Super Admin School Switcher */}
              {isSuperAdmin && (
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
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                        schoolDropOpen ? 'rotate-180' : ''
                      }`}
                    />
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
                            selectedSchoolId === t.id
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          {selectedSchoolId === t.id && <span className="text-indigo-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date Selector */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
              />

              {/* Class Dropdown Selector */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Classes</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
          }
        />

        {error ? (
          <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading attendance register...</div>
        ) : (
          <Table
            data={attendanceRecords}
            columns={columns}
            keyExtractor={(r) => r.id}
            emptyMessage="No attendance records found for selected class and date."
          />
        )}
      </Card>

      {/* ── Mark Daily Register Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Mark Daily Class Register"
        subtitle="Record student presence for selected class roster"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Class *</label>
              <select
                value={markClass}
                onChange={(e) => handleClassChangeInModal(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
              >
                {availableClasses.length === 0 && <option value="">No classes found</option>}
                {availableClasses.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Bulk Action Bar */}
          <div className="flex items-center justify-between bg-slate-100/80 p-2 rounded-xl text-xs font-semibold">
            <span className="text-slate-600 text-[11px]">Quick Bulk Set:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAllStatus('present')}
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                All Present ✓
              </button>
              <button
                type="button"
                onClick={() => handleSetAllStatus('absent')}
                className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                All Absent ✗
              </button>
              <button
                type="button"
                onClick={() => handleSetAllStatus('late')}
                className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                All Late 🕒
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 max-h-80 overflow-y-auto space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <span>Student Roster ({classStudents.length})</span>
              <span>Status Toggle</span>
            </div>

            {isLoadingStudents ? (
              <p className="text-xs text-center py-6 text-slate-400">Loading class roster...</p>
            ) : classStudents.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">No students enrolled in Class '{markClass}'.</p>
            ) : (
              classStudents.map((st) => (
                <div key={st.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{st.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Roll: {st.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setStudentStatusMap((m) => ({ ...m, [st.id]: 'present' }))}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        studentStatusMap[st.id] === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentStatusMap((m) => ({ ...m, [st.id]: 'absent' }))}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        studentStatusMap[st.id] === 'absent'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentStatusMap((m) => ({ ...m, [st.id]: 'late' }))}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        studentStatusMap[st.id] === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsMarkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleBulkSubmit}
              isLoading={isSubmitting}
              disabled={classStudents.length === 0}
            >
              Submit Register
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;
