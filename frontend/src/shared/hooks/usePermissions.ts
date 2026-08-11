import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/config/permissions';

export const usePermissions = () => {
  const { permissions, hasPermission, hasAllPermissions, user } = useAuth();

  return {
    permissions,
    userRole: user?.role,
    can: (permission: Permission | Permission[]) => hasPermission(permission),
    canAll: (required: Permission[]) => hasAllPermissions(required),
  };
};
