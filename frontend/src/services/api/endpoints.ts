export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  TENANTS: {
    DETAILS: (id: string) => `/tenants/${id}`,
  },
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
  },
  TEACHERS: {
    BASE: '/teachers',
    BY_ID: (id: string) => `/teachers/${id}`,
  },
  PARENTS: {
    BASE: '/parents',
  },
  ATTENDANCE: {
    BASE: '/attendance',
    MARK: '/attendance/mark',
  },
  HOMEWORK: {
    BASE: '/homework',
  },
  FEES: {
    BASE: '/fees',
    COLLECT: '/fees/collect',
  },
  RESULTS: {
    BASE: '/results',
  },
  USERS: {
    BASE: '/users',
  },
  AUDIT: {
    LOGS: '/audit-logs',
  },
};

import { apiClient } from './client';

export const studentsApi = {
  list: (schoolId?: string) =>
    apiClient.get(ENDPOINTS.STUDENTS.BASE, { params: schoolId ? { school_id: schoolId } : {} }),
  getById: (id: string) => apiClient.get(ENDPOINTS.STUDENTS.BY_ID(id)),
  create: (data: any) => apiClient.post(ENDPOINTS.STUDENTS.BASE, data),
  update: (id: string, data: any) => apiClient.put(ENDPOINTS.STUDENTS.BY_ID(id), data),
  remove: (id: string) => apiClient.delete(ENDPOINTS.STUDENTS.BY_ID(id)),
};

export const teachersApi = {
  list: (schoolId?: string) =>
    apiClient.get(ENDPOINTS.TEACHERS.BASE, { params: schoolId ? { school_id: schoolId } : {} }),
  getById: (id: string) => apiClient.get(ENDPOINTS.TEACHERS.BY_ID(id)),
  create: (data: any) => apiClient.post(ENDPOINTS.TEACHERS.BASE, data),
  update: (id: string, data: any) => apiClient.put(ENDPOINTS.TEACHERS.BY_ID(id), data),
  remove: (id: string) => apiClient.delete(ENDPOINTS.TEACHERS.BY_ID(id)),
  // Self check-in (daily attendance)
  checkIn: (data: { status: 'present' | 'late'; note?: string }) =>
    apiClient.post(`${ENDPOINTS.TEACHERS.BASE}/checkin`, data),
  getTodayCheckIn: () =>
    apiClient.get(`${ENDPOINTS.TEACHERS.BASE}/checkin/today`),
  getCheckInRoster: (date?: string) =>
    apiClient.get(`${ENDPOINTS.TEACHERS.BASE}/checkin/roster`, { params: date ? { date } : {} }),
};

export const attendanceApi = {
  list: (params?: { class_name?: string; date?: string; school_id?: string }) =>
    apiClient.get(ENDPOINTS.ATTENDANCE.BASE, { params }),
  markBulk: (data: { className: string; date: string; records: { studentId: string; status: string }[] }) =>
    apiClient.post(ENDPOINTS.ATTENDANCE.MARK, data),
  update: (id: string, data: { status: string }) =>
    apiClient.put(`${ENDPOINTS.ATTENDANCE.BASE}/${id}`, data),
};

export const homeworkApi = {
  list: (params?: { class_name?: string; school_id?: string }) =>
    apiClient.get(ENDPOINTS.HOMEWORK.BASE, { params }),
  create: (data: { title: string; subject: string; className: string; dueDate: string; description?: string; status?: string }) =>
    apiClient.post(ENDPOINTS.HOMEWORK.BASE, data),
  update: (id: string, data: any) =>
    apiClient.put(`${ENDPOINTS.HOMEWORK.BASE}/${id}`, data),
  publish: (id: string) =>
    apiClient.post(`${ENDPOINTS.HOMEWORK.BASE}/${id}/publish`),
  remove: (id: string) =>
    apiClient.delete(`${ENDPOINTS.HOMEWORK.BASE}/${id}`),
  submit: (id: string, data: { submissionText: string }) =>
    apiClient.post(`${ENDPOINTS.HOMEWORK.BASE}/${id}/submit`, data),
  getSubmissions: (id: string) =>
    apiClient.get(`${ENDPOINTS.HOMEWORK.BASE}/${id}/submissions`),
  gradeSubmission: (submissionId: string, data: { grade: string; feedback?: string }) =>
    apiClient.post(`${ENDPOINTS.HOMEWORK.BASE}/submissions/${submissionId}/grade`, data),
};

export const resultsApi = {
  list: (params?: { class_name?: string; exam_name?: string; grade?: string; school_id?: string }) =>
    apiClient.get(ENDPOINTS.RESULTS.BASE, { params }),
  create: (data: { studentId: string; examName: string; className: string; subjects: { subjectName: string; maxMarks: number; obtainedMarks: number }[]; status?: string }) =>
    apiClient.post(ENDPOINTS.RESULTS.BASE, data),
  update: (id: string, data: any) =>
    apiClient.put(`${ENDPOINTS.RESULTS.BASE}/${id}`, data),
  publish: (id: string) =>
    apiClient.post(`${ENDPOINTS.RESULTS.BASE}/${id}/publish`),
  unpublish: (id: string) =>
    apiClient.post(`${ENDPOINTS.RESULTS.BASE}/${id}/unpublish`),
  remove: (id: string) =>
    apiClient.delete(`${ENDPOINTS.RESULTS.BASE}/${id}`),
  getSignatures: (id: string) =>
    apiClient.get(`${ENDPOINTS.RESULTS.BASE}/${id}/signatures`),
};

export const feesApi = {
  list: (params?: { fee_term?: string; school_id?: string }) =>
    apiClient.get(ENDPOINTS.FEES.BASE, { params }),
  create: (data: { studentId: string; feeTerm: string; title: string; amountDue: number; dueDate: string }) =>
    apiClient.post(ENDPOINTS.FEES.BASE, data),
  collect: (feeId: string, data: { amountPaid: number }) =>
    apiClient.post(`${ENDPOINTS.FEES.BASE}/${feeId}/collect`, data),
};

export const usersApi = {
  list: (schoolId?: string) =>
    apiClient.get(ENDPOINTS.USERS.BASE, { params: schoolId ? { school_id: schoolId } : {} }),
  create: (data: { email: string; fullName: string; role: string; schoolId?: string; password?: string }) =>
    apiClient.post(ENDPOINTS.USERS.BASE, data),
  update: (id: string, data: any) =>
    apiClient.put(`${ENDPOINTS.USERS.BASE}/${id}`, data),
  remove: (id: string) =>
    apiClient.delete(`${ENDPOINTS.USERS.BASE}/${id}`),
};

export const auditApi = {
  getPasswordResets: (schoolId?: string) =>
    apiClient.get('/audit/password-resets', { params: schoolId ? { school_id: schoolId } : {} }),
  getImpersonations: () =>
    apiClient.get('/audit/impersonations'),
};

export const analyticsApi = {
  getSummary: (schoolId?: string) =>
    apiClient.get('/analytics/summary', { params: schoolId ? { school_id: schoolId } : {} }),
};

export const announcementsApi = {
  list: (schoolId?: string) =>
    apiClient.get('/announcements', { params: schoolId ? { school_id: schoolId } : {} }),
  create: (data: { title: string; content: string; targetAudience?: string }) =>
    apiClient.post('/announcements', data),
  remove: (id: string) =>
    apiClient.delete(`/announcements/${id}`),
};

export const schedulesApi = {
  list: (params?: { class_name?: string; day?: string; school_id?: string }) =>
    apiClient.get('/schedules', { params }),
  create: (data: { className: string; subject: string; teacherName: string; timeSlot: string; roomNumber: string; dayOfWeek?: string }) =>
    apiClient.post('/schedules', data),
};
