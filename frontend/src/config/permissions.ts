export type Role =
  | 'student'
  | 'teacher'
  | 'parent'
  | 'chairman'
  | 'principal'
  | 'accountant'
  | 'school_admin'
  | 'super_admin'
  | 'reception'; // kept for DB compatibility — hidden from login UI

export type Permission =
  // ─── Student / Own-record permissions ───────────────────────────────────
  | 'view_own_academic_record'
  | 'view_own_attendance'
  | 'view_own_homework'
  | 'submit_homework'
  | 'view_own_results'       // only after principal publishes
  | 'view_own_fees'

  // ─── Parent / Child-data permissions ────────────────────────────────────
  | 'view_own_child_data'
  | 'view_child_attendance'
  | 'view_child_homework'    // read-only, parent cannot submit on behalf
  | 'view_child_results'     // only after principal publishes
  | 'view_child_fees'

  // ─── Students (school-wide) ──────────────────────────────────────────────
  | 'view_students'
  | 'create_students'
  | 'edit_students'
  | 'delete_students'

  // ─── Teachers ────────────────────────────────────────────────────────────
  | 'view_teachers'
  | 'manage_teachers'        // assign classes/subjects, create/edit teacher records

  // ─── Attendance ───────────────────────────────────────────────────────────
  | 'view_attendance'        // school-wide attendance (admin / principal)
  | 'mark_attendance'        // teachers — own class, same-day
  | 'edit_attendance'        // teachers — same-day correction
  | 'approve_attendance'     // principal — approve correction requests after cutoff

  // ─── Homework & Assignments ───────────────────────────────────────────────
  | 'view_homework'          // school-wide (admin / principal)
  | 'create_homework'
  | 'grade_homework'

  // ─── Results & Examination ────────────────────────────────────────────────
  | 'view_results'           // school-wide results (admin / principal)
  | 'enter_results'          // teacher enters marks for own subjects
  | 'publish_results'        // principal approves & publishes

  // ─── Fees & Finance ───────────────────────────────────────────────────────
  | 'view_fees'              // full transaction-level (admin / accountant)
  | 'view_fees_summary'      // summary-only (principal — no transaction detail)
  | 'collect_fees'
  | 'manage_fees'            // set fee structure

  // ─── Chairman: governance approvals ──────────────────────────────────────
  | 'approve_budget'
  | 'approve_fee_structure'

  // ─── User & Role Management ───────────────────────────────────────────────
  | 'view_users'
  | 'manage_users'
  | 'assign_roles'

  // ─── Analytics / Reporting ────────────────────────────────────────────────
  | 'view_analytics'         // school-level reports (chairman + admin + principal)
  | 'export_reports'
  | 'view_audit_logs'

  // ─── School Configuration ─────────────────────────────────────────────────
  | 'manage_school_settings'

  // ─── Platform / Multi-tenant (Super Admin only) ───────────────────────────
  | 'manage_tenants'
  | 'cross_school_analytics'
  | 'impersonate_users';

// ─── All permissions every role can ever be granted ──────────────────────────
const ALL_PERMISSIONS: Permission[] = [
  'view_own_academic_record', 'view_own_attendance', 'view_own_homework',
  'submit_homework', 'view_own_results', 'view_own_fees',
  'view_own_child_data', 'view_child_attendance', 'view_child_homework',
  'view_child_results', 'view_child_fees',
  'view_students', 'create_students', 'edit_students', 'delete_students',
  'view_teachers', 'manage_teachers',
  'view_attendance', 'mark_attendance', 'edit_attendance', 'approve_attendance',
  'view_homework', 'create_homework', 'grade_homework',
  'view_results', 'enter_results', 'publish_results',
  'view_fees', 'view_fees_summary', 'collect_fees', 'manage_fees',
  'approve_budget', 'approve_fee_structure',
  'view_users', 'manage_users', 'assign_roles',
  'view_analytics', 'export_reports', 'view_audit_logs',
  'manage_school_settings',
  'manage_tenants', 'cross_school_analytics', 'impersonate_users',
];

export const rolePermissions: Record<Role, Permission[]> = {
  // ── Student: own-record read + homework submit ────────────────────────────
  student: [
    'view_own_academic_record',
    'view_own_attendance',
    'view_own_homework',
    'submit_homework',
    'view_own_results',
    'view_own_fees',
  ],

  // ── Parent: child read-only (no submit on behalf) ─────────────────────────
  parent: [
    'view_own_child_data',
    'view_child_attendance',
    'view_child_homework',
    'view_child_results',
    'view_child_fees',
  ],

  // ── Teacher: own-class attendance + homework + enter marks (no publish) ───
  teacher: [
    'view_students',        // scoped to assigned classes at runtime
    'view_attendance',
    'mark_attendance',
    'edit_attendance',
    'view_homework',
    'create_homework',
    'grade_homework',
    'view_results',
    'enter_results',
  ],

  // ── Chairman: strategic view + governance approvals — NO operational CRUD ─
  chairman: [
    'view_students',
    'view_teachers',
    'view_attendance',
    'view_homework',
    'view_results',
    'view_fees',
    'view_analytics',
    'export_reports',
    'view_audit_logs',
    'approve_budget',
    'approve_fee_structure',
  ],

  // ── Principal: academic ops head — NO delete students/teachers, NO user mgmt
  principal: [
    'view_students',
    'edit_students',
    'view_teachers',
    'manage_teachers',
    'view_attendance',
    'approve_attendance',
    'view_homework',
    'create_homework',
    'view_fees_summary',    // summary only — no transaction-level access
    'view_results',
    'enter_results',
    'publish_results',
    'view_users',
    'view_analytics',
    'export_reports',
    'view_audit_logs',
  ],

  // ── Accountant: fees full access + student view for mapping — nothing else ─
  accountant: [
    'view_students',
    'view_fees',
    'collect_fees',
    'manage_fees',
    'export_reports',
  ],

  // ── School Admin: full single-school operational control ──────────────────
  school_admin: [
    'view_students', 'create_students', 'edit_students', 'delete_students',
    'view_teachers', 'manage_teachers',
    'view_attendance', 'mark_attendance', 'edit_attendance', 'approve_attendance',
    'view_homework', 'create_homework', 'grade_homework',
    'view_fees', 'view_fees_summary', 'collect_fees', 'manage_fees',
    'view_results', 'enter_results', 'publish_results',
    'view_users', 'manage_users', 'assign_roles',
    'view_analytics', 'export_reports', 'view_audit_logs',
    'manage_school_settings',
  ],

  // ── Super Admin: all permissions from all 7 roles + platform-level ────────
  super_admin: ALL_PERMISSIONS,

  // ── Reception: kept for DB compat, not shown in login UI ──────────────────
  reception: [
    'view_students',
    'create_students',
    'edit_students',
    'view_attendance',
    'mark_attendance',
    'view_teachers',
  ],
};
