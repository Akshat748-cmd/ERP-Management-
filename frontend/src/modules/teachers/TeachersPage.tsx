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
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { teachersApi } from '@/services/api/endpoints';
import { Teacher } from '@/types/entities';

/* ── Zod Form Validation Schema ────────────────────────────────────── */
const teacherFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  subjects: z.string().optional(), // comma-separated input
  classesAssigned: z.string().optional(), // comma-separated input
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

export const TeachersPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
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
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Form setup */
  const addForm = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      fullName: '',
      employeeCode: '',
      subjects: '',
      classesAssigned: '',
      phone: '',
      email: '',
    },
  });

  const editForm = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
  });

  /* Fetch Teachers */
  const fetchTeachers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await teachersApi.list(isSuperAdmin ? selectedSchoolId : undefined);
      setTeachers(res.data || []);
    } catch (err: any) {
      console.error('[TeachersPage] Failed to fetch teachers:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load faculty directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [selectedSchoolId]);

  /* Form Handlers */
  const handleAddSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: data.fullName,
        employeeCode: data.employeeCode,
        subjects: data.subjects ? data.subjects.split(',').map((s) => s.trim()) : [],
        classesAssigned: data.classesAssigned ? data.classesAssigned.split(',').map((c) => c.trim()) : [],
        phone: data.phone || undefined,
        email: data.email || undefined,
      };
      await teachersApi.create(payload);
      toast.success(`Faculty member '${data.fullName}' added successfully!`);
      setIsAddModalOpen(false);
      addForm.reset();
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to add faculty member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    editForm.reset({
      fullName: teacher.fullName,
      employeeCode: teacher.employeeCode,
      subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
      classesAssigned: teacher.classesAssigned ? teacher.classesAssigned.join(', ') : '',
      phone: teacher.phone || '',
      email: teacher.email || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: TeacherFormData) => {
    if (!teacherToEdit) return;
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: data.fullName,
        employeeCode: data.employeeCode,
        subjects: data.subjects ? data.subjects.split(',').map((s) => s.trim()) : [],
        classesAssigned: data.classesAssigned ? data.classesAssigned.split(',').map((c) => c.trim()) : [],
        phone: data.phone || undefined,
        email: data.email || undefined,
      };
      await teachersApi.update(teacherToEdit.id, payload);
      toast.success(`Faculty member '${data.fullName}' updated successfully!`);
      setIsEditModalOpen(false);
      setTeacherToEdit(null);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to update teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    setIsSubmitting(true);
    try {
      await teachersApi.remove(teacherToDelete.id);
      toast.success(`Faculty member '${teacherToDelete.fullName}' deactivated.`);
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to deactivate teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Filtering */
  const filtered = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      t.classesAssigned.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  const columns = [
    {
      header: 'Faculty Member',
      cell: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {t.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{t.fullName}</p>
            <p className="text-[11px] text-slate-400 font-mono">Code: {t.employeeCode}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Subjects Taught',
      cell: (t: Teacher) => (
        <span className="font-medium text-slate-700 text-xs">
          {t.subjects && t.subjects.length > 0 ? t.subjects.join(', ') : '—'}
        </span>
      ),
    },
    {
      header: 'Assigned Classes',
      cell: (t: Teacher) => (
        <span className="text-slate-600 text-xs font-semibold">
          {t.classesAssigned && t.classesAssigned.length > 0 ? t.classesAssigned.join(', ') : '—'}
        </span>
      ),
    },
    {
      header: 'Contact Info',
      cell: (t: Teacher) => (
        <div className="text-xs space-y-0.5">
          {t.email && (
            <p className="text-slate-600 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{t.email}</span>
            </p>
          )}
          {t.phone && (
            <p className="text-slate-500 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{t.phone}</span>
            </p>
          )}
          {!t.email && !t.phone && <span className="text-slate-400">—</span>}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (t: Teacher) => <StatusChip status={t.isActive ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      cell: (t: Teacher) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelectedTeacher(t); setIsViewModalOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title="View Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {hasPermission('manage_teachers') && (
            <button
              onClick={() => openEditModal(t)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              title="Edit Faculty Record"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission('manage_teachers') && (
            <button
              onClick={() => { setTeacherToDelete(t); setIsDeleteModalOpen(true); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title="Deactivate Faculty Member"
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
        title="Faculty & Teaching Staff"
        subtitle="Manage faculty directory, subject allocations, and departmental roles."
        breadcrumb={[{ label: 'Academics' }, { label: 'Teachers' }]}
        action={
          hasPermission('manage_teachers') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Faculty Member
            </Button>
          ) : undefined
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Faculty Enrolled" value={String(filtered.length)} hint="Full-time teaching staff" tone="default" />
        <StatCard label="Active Faculty" value={String(filtered.filter((t) => t.isActive).length)} hint="Active teaching status" tone="success" />
        <StatCard label="Subjects Covered" value={String(new Set(filtered.flatMap((t) => t.subjects)).size)} hint="Distinct academic subjects" tone="purple" />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader
          title="Teaching Staff Directory"
          subtitle={isSuperAdmin && selectedSchool ? `Viewing faculty roster for ${selectedSchool.name}` : 'List of active teaching faculty and assigned subjects'}
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search faculty name or code..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>
          }
        />

        {error ? (
          <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading faculty directory...</div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={(t) => t.id}
            selectable
            emptyMessage="No faculty members found matching search criteria."
          />
        )}
      </Card>

      {/* ── Add Teacher Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Faculty Member"
        subtitle="Enrol a teaching staff member in institution directory"
      >
        <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              {...addForm.register('fullName')}
              placeholder="e.g. Dr. Ramesh Sharma"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {addForm.formState.errors.fullName && (
              <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee Code *</label>
            <input
              {...addForm.register('employeeCode')}
              placeholder="e.g. EMP-2026-001"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
            {addForm.formState.errors.employeeCode && (
              <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.employeeCode.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subjects (comma-separated)</label>
              <input
                {...addForm.register('subjects')}
                placeholder="e.g. Physics, Chemistry"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Classes (comma-separated)</label>
              <input
                {...addForm.register('classesAssigned')}
                placeholder="e.g. Class 10, Class 12-A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                {...addForm.register('phone')}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                {...addForm.register('email')}
                placeholder="e.g. ramesh@school.edu"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {addForm.formState.errors.email && (
                <p className="text-[11px] text-red-500 mt-1">{addForm.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" isLoading={isSubmitting}>
              Enrol Faculty
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Teacher Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Faculty Record"
        subtitle={`Updating details for ${teacherToEdit?.fullName}`}
      >
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              {...editForm.register('fullName')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee Code *</label>
            <input
              {...editForm.register('employeeCode')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subjects (comma-separated)</label>
              <input
                {...editForm.register('subjects')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Classes (comma-separated)</label>
              <input
                {...editForm.register('classesAssigned')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                {...editForm.register('phone')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                {...editForm.register('email')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

      {/* ── View Teacher Profile Modal ────────────────────────────────── */}
      {selectedTeacher && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Faculty Profile Information"
          subtitle={`Details for ${selectedTeacher.fullName}`}
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg font-bold">
                {selectedTeacher.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedTeacher.fullName}</h4>
                <p className="text-xs text-slate-500 font-mono">Code: {selectedTeacher.employeeCode}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Subjects Taught:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedTeacher.subjects.length > 0 ? selectedTeacher.subjects.join(', ') : 'None assigned'}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 font-medium">Assigned Classes:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedTeacher.classesAssigned.length > 0 ? selectedTeacher.classesAssigned.join(', ') : 'None assigned'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedTeacher.email || '—'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedTeacher.phone || '—'}</p>
                </div>
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
        title="Deactivate Faculty Record"
        description={`Are you sure you want to deactivate faculty member '${teacherToDelete?.fullName}'?`}
        confirmLabel="Deactivate Faculty"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TeachersPage;
