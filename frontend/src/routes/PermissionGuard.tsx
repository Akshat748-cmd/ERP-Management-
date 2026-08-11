import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/config/permissions';

export interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions?: Permission | Permission[];
  requireAll?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  requireAll = false,
}) => {
  const { isAuthenticated, hasPermission, hasAllPermissions, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying session permissions...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users redirected to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Permission evaluation (never checking raw roles directly)
  if (requiredPermissions) {
    const list = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const isAllowed = requireAll ? hasAllPermissions(list) : hasPermission(list);

    if (!isAllowed) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-maroon-100 text-maroon-600 flex items-center justify-center mb-4 font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-navy-900">Access Restricted</h3>
          <p className="text-sm text-slate-600 max-w-md mt-2">
            You do not possess the required action permissions (
            <span className="font-mono text-xs text-maroon-700 font-semibold">
              {list.join(', ')}
            </span>
            ) to access this portal section. Contact school administration if you require access.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
