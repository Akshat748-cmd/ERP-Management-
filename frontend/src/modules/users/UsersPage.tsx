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
  ConfirmDialog,
} from '@/shared/components';
import {
  Shield,
  Plus,
  Search,
  UserCheck,
  ShieldAlert,
  Building2,
  ChevronDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { usersApi } from '@/services/api/endpoints';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  status: 'Active' | 'Inactive' | string;
  mustChangePassword?: boolean;
  lastLogin?: string;
}

export const UsersPage: React.FC = () => {
  const { user: currentUser, hasPermission, startImpersonation } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  /* Create User Modal */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createRole, setCreateRole] = useState('teacher');
  const [createPassword, setCreatePassword] = useState('');

  /* Edit User Modal */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editFullName, setEditFullName] = useState('');

  /* Deactivate Modal */
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<UserItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.list(isSuperAdmin ? selectedSchoolId : undefined);
      setUsersList(res.data || []);
    } catch (err: any) {
      console.error('[UsersPage] Failed to fetch users:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load system accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedSchoolId]);

  const handleCreateUserSubmit = async () => {
    if (!createEmail.trim() || !createFullName.trim() || !createRole) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await usersApi.create({
        email: createEmail.trim(),
        fullName: createFullName.trim(),
        role: createRole,
        schoolId: isSuperAdmin ? selectedSchoolId : undefined,
        password: createPassword.trim() || undefined,
      });
      toast.success(`User account for '${createEmail}' created!`);
      setIsCreateModalOpen(false);
      setCreateEmail('');
      setCreateFullName('');
      setCreatePassword('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (u: UserItem) => {
    setUserToEdit(u);
    setEditRole(u.role);
    setEditFullName(u.name);
    setIsEditModalOpen(true);
  };

  const handleEditUserSubmit = async () => {
    if (!userToEdit) return;
    setIsSubmitting(true);
    try {
      await usersApi.update(userToEdit.id, {
        fullName: editFullName.trim(),
        role: editRole,
      });
      toast.success(`User account '${userToEdit.email}' updated!`);
      setIsEditModalOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to update user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!userToDeactivate) return;
    setIsSubmitting(true);
    try {
      await usersApi.remove(userToDeactivate.id);
      toast.success(`User account '${userToDeactivate.email}' deactivated.`);
      setIsDeactivateModalOpen(false);
      setUserToDeactivate(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to deactivate user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  const columns = [
    {
      header: 'User Account',
      cell: (u: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{u.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (u: UserItem) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-100 text-slate-700 tracking-wider">
          {u.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (u: UserItem) => <StatusChip status={u.status.toLowerCase() === 'active' ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      cell: (u: UserItem) => (
        <div className="flex items-center gap-2">
          {hasPermission('assign_roles') && (
            <button
              onClick={() => openEditModal(u)}
              className="p-1 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              title="Edit Role"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {hasPermission('manage_users') && u.id !== currentUser?.id && (
            <button
              onClick={() => {
                setUserToDeactivate(u);
                setIsDeactivateModalOpen(true);
              }}
              className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title="Deactivate Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isSuperAdmin && u.id !== currentUser?.id && (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => startImpersonation(u.id)}
            >
              Impersonate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User & Access Management"
        subtitle="Manage administrative user accounts, role assignments, system permissions, and impersonation sessions."
        breadcrumb={[{ label: 'Administration' }, { label: 'User Management' }]}
        action={
          hasPermission('manage_users') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create User Account
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Accounts" value={String(filtered.length)} hint="Enrolled user accounts" icon={Shield} tone="default" />
        <StatCard label="Active Staff Accounts" value={String(filtered.filter((u) => u.status.toLowerCase() === 'active').length)} hint="Active logins" icon={UserCheck} tone="success" />
        <StatCard label="Security Enforcement" value="RBAC Enforced" hint="Strict permission guards" tone="purple" />
      </div>

      <Card>
        <CardHeader
          title="Registered System Accounts"
          subtitle={isSuperAdmin && selectedSchool ? `Viewing accounts for ${selectedSchool.name}` : 'User accounts and permission profiles'}
          action={
            <div className="flex items-center gap-2 flex-wrap">
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
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user name or email..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>
          }
        />

        {error ? (
          <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading user accounts...</div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={(u) => u.id}
            selectable
            emptyMessage="No registered user accounts found."
          />
        )}
      </Card>

      {/* ── Create User Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User Account"
        subtitle="Provision an authenticated user account"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              value={createFullName}
              onChange={(e) => setCreateFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="e.g. ramesh@school.edu"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">System Role *</label>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white capitalize"
              >
                <option value="school_admin">School Admin</option>
                <option value="principal">Principal</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="accountant">Accountant</option>
                <option value="chairman">Chairman</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Custom Password (optional)</label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Leave blank for auto-default"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateUserSubmit} isLoading={isSubmitting}>
              Provision Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit User Role Modal ─────────────────────────────────────── */}
      {userToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Profile & Role"
          subtitle={`Modifying access for ${userToEdit.email}`}
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white capitalize"
              >
                <option value="school_admin">School Admin</option>
                <option value="principal">Principal</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="accountant">Accountant</option>
                <option value="chairman">Chairman</option>
                {isSuperAdmin && <option value="super_admin">Super Admin</option>}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleEditUserSubmit} isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Deactivate User Dialog ────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate System Account"
        description={`Are you sure you want to deactivate account '${userToDeactivate?.email}'? The user will no longer be able to log in.`}
        confirmLabel="Deactivate Account"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default UsersPage;
