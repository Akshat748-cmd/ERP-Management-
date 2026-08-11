import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  ConfirmDialog,
} from '@/shared/components';
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { studentsApi } from '@/services/api/endpoints';
import { Student } from '@/types/entities';

/* ── Zod Form Validation Schema ────────────────────────────────────── */
const studentFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class is required'),
  section: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  parentUserId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export const StudentsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';
  const isStudentRole = user?.role === 'student';
  const isParentRole = user?.role === 'parent';

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  /* Modal state */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Form setup */
  const addForm = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: '',
      rollNumber: '',
      className: '',
      section: '',
      dateOfBirth: '',
      gender: '',
      parentUserId: '',
    },
  });

  const editForm = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  /* Fetch Students */
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isStudentRole || isParentRole) {
        // Fetch single record or filtered list
        if (user?.id) {
          try {
            const res = await studentsApi.getById(user.id);
            setStudents([res.data]);
          } catch {
            const listRes = await studentsApi.list();
            const allSts: Student[] = listRes.data || [];
            if (isParentRole) {
              setStudents(allSts.filter((s) => s.parentUserId === user.id));
            } else {
              setStudents(allSts.filter((s) => s.id === user.id || s.schoolId === user.schoolId));
            }
          }
        }
      } else {
        const res = await studentsApi.list(isSuperAdmin ? selectedSchoolId : undefined);
        setStudents(res.data || []);
      }
    } catch (err: any) {
      console.error('[StudentsPage] Failed to fetch students:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load students roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSchoolId, user?.role, user?.id]);

  /* Form Handlers */
  const handleAddSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      await studentsApi.create(data);
      toast.success(`Student '${data.fullName}' created successfully!`);
      setIsAddModalOpen(false);
      addForm.reset();
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (student: Student) => {
    setStudentToEdit(student);
    editForm.reset({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section || '',
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || '',
      parentUserId: student.parentUserId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: StudentFormData) => {
    if (!studentToEdit) return;
    setIsSubmitting(true);
    try {
      await studentsApi.update(studentToEdit.id, data);
      toast.success(`Student '${data.fullName}' updated successfully!`);
      setIsEditModalOpen(false);
      setStudentToEdit(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to update student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsSubmitting(true);
    try {
      await studentsApi.remove(studentToDelete.id);
      toast.success(`Student '${studentToDelete.fullName}' deactivated successfully.`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to delete student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Filtering */
  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  /* ── 1. Student Own-Record View ──────────────────────────────────── */
  if (isStudentRole) {
    const studentData = students[0];
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Academic Profile"
          subtitle="View your personal student enrollment details, roll number, and class information."
          breadcrumb={[{ label: 'Portal' }, { label: 'My Academic Record' }]}
        />

        {isLoading ? (
          <Card className="p-8 text-center text-slate-500">Loading your academic record...</Card>
        ) : studentData ? (
          <Card className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {studentData.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{studentData.fullName}</h2>
                <p className="text-xs text-slate-500 font-mono">Student ID: {studentData.id}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusChip status={studentData.isActive ? 'active' : 'inactive'} />
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                    Class {studentData.className} {studentData.section ? `(${studentData.section})` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Roll Number</p>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{studentData.rollNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Gender</p>
                <p className="font-semibold text-slate-800 capitalize mt-0.5">{studentData.gender || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Date of Birth</p>
                <p className="font-semibold text-slate-800 mt-0.5">{studentData.dateOfBirth || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Admission Date</p>
                <p className="font-semibold text-slate-800 mt-0.5">{studentData.admissionDate || '—'}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-slate-500">No student profile record found linked to your account.</Card>
        )}
      </div>
    );
  }

  /* ── 2. Parent Child View ─────────────────────────────────────────── */
  if (isParentRole) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Child Academic Profile"
          subtitle="View enrolled child details, class allocation, and academic status."
          breadcrumb={[{ label: 'Parent Portal' }, { label: 'Child Profile' }]}
        />

        {isLoading ? (
          <Card className="p-8 text-center text-slate-500">Loading child record...</Card>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((child) => (
              <Card key={child.id} className="p-6 space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {child.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{child.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">ID: {child.id}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusChip status={child.isActive ? 'active' : 'inactive'} />
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        Class {child.className} {child.section ? `(${child.section})` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Roll Number:</span>
                    <p className="font-bold text-slate-800 font-mono">{child.rollNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth:</span>
                    <p className="font-semibold text-slate-800">{child.dateOfBirth || '—'}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">No child records currently linked to your parent account.</Card>
        )}
      </div>
    );
  }

  /* ── 3. Staff / Admin Roster View ────────────────────────────────── */
  const columns = [
    {
      header: 'Student',
      cell: (s: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {s.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{s.fullName}</p>
            <p className="text-[11px] text-slate-400 font-mono">{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      cell: (s: Student) => (
        <span className="font-semibold text-slate-700">
          Class {s.className} {s.section ? `(${s.section})` : ''}
        </span>
      ),
    },
    {
      header: 'Roll No.',
      cell: (s: Student) => <span className="text-slate-500 font-mono font-semibold">{s.rollNumber}</span>,
    },
    {
      header: 'Gender',
      cell: (s: Student) => <span className="text-slate-600 capitalize text-xs">{s.gender || '—'}</span>,
    },
    {
      header: 'Status',
      cell: (s: Student) => <StatusChip status={s.isActive ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      cell: (s: Student) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelectedStudent(s); setIsViewModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {hasPermission('edit_students') && (
            <button
              onClick={() => openEditModal(s)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              title="Edit Record"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission('delete_students') && (
            <button
              onClick={() => { setStudentToDelete(s); setIsDeleteModalOpen(true); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title="Deactivate Student"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        title="Students Directory"
        subtitle="Manage student enrolment records, track academic rosters, and edit student profiles."
        breadcrumb={[{ label: 'Academics' }, { label: 'Students' }]}
        action={
          hasPermission('create_students') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Student
            </Button>
          ) : undefined
        }
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Roster" value={String(filtered.length)} tone="default" />
        <StatCard label="Active Students" value={String(filtered.filter((st) => st.isActive).length)} tone="success" />
        <StatCard label="Inactive / Soft-Deleted" value={String(filtered.filter((st) => !st.isActive).length)} tone="danger" />
        <StatCard label="Classes Represented" value={String(new Set(filtered.map((st) => st.className)).size)} tone="gold" />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader
          title="Enrolled Students Roster"
          subtitle={isSuperAdmin && selectedSchool ? `Viewing records for ${selectedSchool.name}` : 'Current academic term student directory'}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Super Admin School Switcher Dropdown */}
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
                            setSearch('');
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

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>
          }
        />

        {error ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            {error.includes('token') || error.includes('Authentication') ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-[#0F1D33] text-white text-xs font-bold rounded-xl hover:bg-[#1a2e4a] transition-colors cursor-pointer shadow-md"
              >
                Session Expired — Click to Sign In Again →
              </button>
            ) : undefined}
          </div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading student directory...</div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={(s) => s.id}
            selectable
            emptyMessage="No students found matching search criteria."
          />
        )}
      </Card>

      {/* ── Add Student Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enrol New Student"
        subtitle="Add a student record to the institution roster"
      >
        <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              {...addForm.register('fullName')}
              placeholder="e.g. Rahul Kumar"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {addForm.formState.errors.fullName && (
              <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class *</label>
              <input
                {...addForm.register('className')}
                placeholder="e.g. 10 or 12-A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {addForm.formState.errors.className && (
                <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.className.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Roll Number *</label>
              <input
                {...addForm.register('rollNumber')}
                placeholder="e.g. 01"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {addForm.formState.errors.rollNumber && (
                <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.rollNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Section</label>
              <input
                {...addForm.register('section')}
                placeholder="e.g. A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                {...addForm.register('gender')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...addForm.register('dateOfBirth')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parent User ID</label>
              <input
                {...addForm.register('parentUserId')}
                placeholder="e.g. usr_amps_parent"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" isLoading={isSubmitting}>
              Enrol Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Student Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Record"
        subtitle={`Updating information for ${studentToEdit?.fullName}`}
      >
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              {...editForm.register('fullName')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class *</label>
              <input
                {...editForm.register('className')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Roll Number *</label>
              <input
                {...editForm.register('rollNumber')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Section</label>
              <input
                {...editForm.register('section')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                {...editForm.register('gender')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...editForm.register('dateOfBirth')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parent User ID</label>
              <input
                {...editForm.register('parentUserId')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View Details Modal ───────────────────────────────────────── */}
      {selectedStudent && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Student Information Profile"
          subtitle={`Details for ${selectedStudent.fullName}`}
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedStudent.fullName}</h4>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedStudent.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Class & Section:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  Class {selectedStudent.className} {selectedStudent.section ? `(${selectedStudent.section})` : ''}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Roll Number:</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedStudent.rollNumber}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Gender:</span>
                <p className="font-semibold text-slate-800 capitalize mt-0.5">{selectedStudent.gender || '—'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Date of Birth:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.dateOfBirth || '—'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                <span className="text-slate-400 font-medium">Parent User ID:</span>
                <p className="font-mono text-slate-800 mt-0.5">{selectedStudent.parentUserId || 'None linked'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Soft Delete Confirm Dialog ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Student Record"
        description={`Are you sure you want to deactivate student '${studentToDelete?.fullName}'? Soft-deleted student records can be restored by administrators.`}
        confirmLabel="Deactivate Record"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StudentsPage;
