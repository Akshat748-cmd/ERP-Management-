import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/api/client';
import { AuthContextType, AuthUser, ImpersonationState } from '@/types/auth';
import { Role, Permission, rolePermissions } from '@/config/permissions';
import { useTenant } from './TenantContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { schoolId } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('amps_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // TODO: move to httpOnly cookie storage before production launch
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('amps_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [impersonation, setImpersonation] = useState<ImpersonationState>(() => {
    const saved = localStorage.getItem('amps_impersonation_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse impersonation session:', e);
      }
    }
    return { active: false, sessionId: null, originalUser: null, originalToken: null };
  });

  // Sync session with localStorage
  // TODO: move to httpOnly cookie storage before production launch
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('amps_auth_user', JSON.stringify(user));
      localStorage.setItem('amps_auth_token', token);
    } else {
      localStorage.removeItem('amps_auth_user');
      localStorage.removeItem('amps_auth_token');
    }
  }, [user, token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Unauthorized event received. Clearing session...');
      setUser(null);
      setToken(null);
      setImpersonation({ active: false, sessionId: null, originalUser: null, originalToken: null });
      localStorage.clear();
      window.location.href = '/login';
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Derive permissions cleanly from single source of truth permissions.ts
  const permissions: Permission[] = useMemo(() => {
    if (!user) return [];
    return rolePermissions[user.role] || [];
  }, [user]);

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user) return false;
    const requiredList = Array.isArray(permission) ? permission : [permission];
    return requiredList.some((req) => permissions.includes(req));
  };

  const hasAllPermissions = (requiredList: Permission[]): boolean => {
    if (!user) return false;
    return requiredList.every((req) => permissions.includes(req));
  };

  const startImpersonation = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post(`/auth/impersonate/${targetUserId}`);
      const data = res.data;

      const impersonatedUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as Role,
        schoolId: data.user.schoolId,
        mustChangePassword: !!data.user.mustChangePassword,
      };

      const originalUser = impersonation.originalUser || user;
      const originalToken = impersonation.originalToken || token;

      const newImpState: ImpersonationState = {
        active: true,
        sessionId: data.impersonation_session_id,
        originalUser,
        originalToken,
      };

      setImpersonation(newImpState);
      setUser(impersonatedUser);
      setToken(data.access_token);
      // TODO: move to httpOnly cookie storage before production launch
      localStorage.setItem('amps_auth_user', JSON.stringify(impersonatedUser));
      localStorage.setItem('amps_auth_token', data.access_token);
      if (impersonatedUser.schoolId) {
        localStorage.setItem('amps_active_tenant_id', impersonatedUser.schoolId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const endImpersonation = async () => {
    setIsLoading(true);
    try {
      if (impersonation.sessionId) {
        try {
          await apiClient.post(`/auth/impersonate/${impersonation.sessionId}/end`);
        } catch (e) {
          console.warn('Error ending impersonation session on backend:', e);
        }
      }

      if (impersonation.originalUser && impersonation.originalToken) {
        setUser(impersonation.originalUser);
        setToken(impersonation.originalToken);
        // TODO: move to httpOnly cookie storage before production launch
        localStorage.setItem('amps_auth_user', JSON.stringify(impersonation.originalUser));
        localStorage.setItem('amps_auth_token', impersonation.originalToken);
        if (impersonation.originalUser.schoolId) {
          localStorage.setItem('amps_active_tenant_id', impersonation.originalUser.schoolId);
        }
      }

      setImpersonation({ active: false, sessionId: null, originalUser: null, originalToken: null });
      localStorage.removeItem('amps_impersonation_session');
      window.location.href = '/portal/platform';
    } finally {
      setIsLoading(false);
    }
  };

  const login = async ({
    email,
    password,
    role,
  }: {
    email: string;
    password: string;
    role: Role;
  }) => {
    setIsLoading(true);
    try {
      let data: any;
      try {
        const response = await apiClient.post(
          '/auth/login',
          { email, password, role },
          {
            headers: {
              'X-Tenant-Id': schoolId || '',
            },
          }
        );
        data = response.data;
      } catch (err: any) {
        const allowOfflineDemo =
          import.meta.env.DEV && import.meta.env.VITE_ALLOW_OFFLINE_DEMO === 'true';

        const apiErrorMessage =
          err.response?.data?.detail || err.response?.data?.message || err.message;

        if (
          allowOfflineDemo &&
          schoolId &&
          !apiErrorMessage?.includes('User does not belong') &&
          !apiErrorMessage?.includes('Invalid email')
        ) {
          console.warn('[AuthContext] Backend API unreachable, using developer offline demo bypass.');
          const authenticatedUser: AuthUser = {
            id: `usr_${Date.now()}`,
            email,
            name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Portal User',
            role,
            schoolId,
          };
          const fallbackToken = `jwt_token_${Date.now()}`;
          // TODO: move to httpOnly cookie storage before production launch
          localStorage.setItem('amps_auth_user', JSON.stringify(authenticatedUser));
          localStorage.setItem('amps_auth_token', fallbackToken);
          setUser(authenticatedUser);
          setToken(fallbackToken);
          return;
        }

        throw new Error(apiErrorMessage || 'Login failed. Please check credentials.');
      }

      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: (data.user.role as Role) || role,
        schoolId: data.user.schoolId || schoolId,
        mustChangePassword: !!data.user.mustChangePassword,
      };

      // TODO: move to httpOnly cookie storage before production launch
      localStorage.setItem('amps_auth_user', JSON.stringify(userData));
      localStorage.setItem('amps_auth_token', data.access_token);
      setUser(userData);
      setToken(data.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setImpersonation({ active: false, sessionId: null, originalUser: null, originalToken: null });
    localStorage.clear();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    permissions,
    hasPermission,
    hasAllPermissions,
    impersonation,
    startImpersonation,
    endImpersonation,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
