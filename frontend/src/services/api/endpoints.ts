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
