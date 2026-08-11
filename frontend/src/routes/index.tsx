import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '@/layouts/PortalLayout';
import { PermissionGuard } from './PermissionGuard';
import { useAuth } from '@/context/AuthContext';

// Import dashboard shells
import { SuperAdminDashboardShell } from '@/layouts/shells/SuperAdminDashboardShell';
import { AdminDashboardShell } from '@/layouts/shells/AdminDashboardShell';
import { ChairmanDashboardShell } from '@/layouts/shells/ChairmanDashboardShell';
import { PrincipalDashboardShell } from '@/layouts/shells/PrincipalDashboardShell';
import { TeacherDashboardShell } from '@/layouts/shells/TeacherDashboardShell';
import { StudentDashboardShell } from '@/layouts/shells/StudentDashboardShell';
import { ParentDashboardShell } from '@/layouts/shells/ParentDashboardShell';
import { AccountantDashboardShell } from '@/layouts/shells/AccountantDashboardShell';

// Dispatch appropriate dashboard shell based on logged-in user's role
const RoleDashboardDispatcher: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboardShell />;
    case 'school_admin':
      return <AdminDashboardShell />;
    case 'chairman':
      return <ChairmanDashboardShell />;
    case 'principal':
      return <PrincipalDashboardShell />;
    case 'teacher':
      return <TeacherDashboardShell />;
    case 'student':
      return <StudentDashboardShell />;
    case 'parent':
      return <ParentDashboardShell />;
    case 'accountant':
    case 'reception':
      return <AccountantDashboardShell />;
    default:
      return <StudentDashboardShell />;
  }
};



import { LoginPage } from '@/modules/auth/LoginPage';
import { StudentsPage } from '@/modules/students/StudentsPage';
import { TeachersPage } from '@/modules/teachers/TeachersPage';
import { AttendancePage } from '@/modules/attendance/AttendancePage';
import { FeesPage } from '@/modules/fees/FeesPage';
import { ResultsPage } from '@/modules/results/ResultsPage';
import { HomeworkPage } from '@/modules/homework/HomeworkPage';
import { AnalyticsPage } from '@/modules/analytics/AnalyticsPage';
import { UsersPage } from '@/modules/users/UsersPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';
import { PlatformPage } from '@/modules/platform/PlatformPage';
import { SchoolRegistrationPage } from '@/modules/auth/SchoolRegistrationPage';
import { ResetPasswordPage } from '@/modules/auth/ResetPasswordPage';
import { ChangePasswordPage } from '@/modules/auth/ChangePasswordPage';
import { AuditLogPage } from '@/modules/audit/AuditLogPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/portal/dashboard" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-school" element={<SchoolRegistrationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Protected Portal Root wrapped in PortalLayout */}
      <Route
        path="/portal"
        element={
          <PermissionGuard>
            <PortalLayout />
          </PermissionGuard>
        }
      >
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<RoleDashboardDispatcher />} />

        <Route
          path="students"
          element={
            <PermissionGuard requiredPermissions={['view_students', 'view_own_academic_record']}>
              <StudentsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="teachers"
          element={
            <PermissionGuard requiredPermissions="view_teachers">
              <TeachersPage />
            </PermissionGuard>
          }
        />

        <Route
          path="attendance"
          element={
            <PermissionGuard requiredPermissions={[
              'view_attendance', 'mark_attendance', 'approve_attendance',
              'view_own_attendance', 'view_child_attendance',
            ]}>
              <AttendancePage />
            </PermissionGuard>
          }
        />

        <Route
          path="homework"
          element={
            <PermissionGuard requiredPermissions={[
              'view_homework', 'create_homework', 'grade_homework',
              'view_own_homework', 'view_child_homework', 'submit_homework',
            ]}>
              <HomeworkPage />
            </PermissionGuard>
          }
        />

        <Route
          path="fees"
          element={
            <PermissionGuard requiredPermissions={[
              'view_fees', 'view_fees_summary', 'collect_fees', 'manage_fees',
              'view_own_fees', 'view_child_fees',
            ]}>
              <FeesPage />
            </PermissionGuard>
          }
        />

        <Route
          path="results"
          element={
            <PermissionGuard requiredPermissions={[
              'view_results', 'enter_results', 'publish_results',
              'view_own_results', 'view_child_results',
            ]}>
              <ResultsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="analytics"
          element={
            <PermissionGuard requiredPermissions={['view_analytics', 'cross_school_analytics']}>
              <AnalyticsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="users"
          element={
            <PermissionGuard requiredPermissions="view_users">
              <UsersPage />
            </PermissionGuard>
          }
        />

        <Route
          path="settings"
          element={
            <PermissionGuard requiredPermissions="manage_school_settings">
              <SettingsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="platform"
          element={
            <PermissionGuard requiredPermissions="manage_tenants">
              <PlatformPage />
            </PermissionGuard>
          }
        />

        <Route
          path="audit-log"
          element={
            <PermissionGuard requiredPermissions="view_audit_logs">
              <AuditLogPage />
            </PermissionGuard>
          }
        />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
    </Routes>
  );
};
