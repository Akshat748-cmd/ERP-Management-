import { Role, Permission } from '@/config/permissions';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  schoolId: string;
  mustChangePassword?: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  /** Classes/sections this teacher is assigned to (used for data isolation) */
  assignedClasses?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ImpersonationState {
  active: boolean;
  sessionId: string | null;
  originalUser: AuthUser | null;
  originalToken: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
  permissions: Permission[];
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  impersonation: ImpersonationState;
  startImpersonation: (targetUserId: string) => Promise<void>;
  endImpersonation: () => Promise<void>;
}
