import axios, { InternalAxiosRequestConfig } from 'axios';

// Create base Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor Stub for Token & Tenant Injection
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject Auth Token if stored
    // TODO: move to httpOnly cookie storage before production launch
    const token = localStorage.getItem('amps_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Tenant ID Header dynamically from URL query or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlSchoolId = urlParams.get('school');
    const storedSchoolId = localStorage.getItem('amps_active_tenant_id');
    const schoolId = urlSchoolId || storedSchoolId;

    if (schoolId && config.headers) {
      config.headers['X-Tenant-Id'] = schoolId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[ApiClient] 401 Unauthorized encountered. Session expired.');
      localStorage.removeItem('amps_auth_token');
      localStorage.removeItem('amps_auth_user');
      localStorage.removeItem('amps_impersonation_session');

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
