import { apiClient } from '../api/client';

export interface PasswordResetAuditRecord {
  id: string;
  timestamp: string;
  school_id: string;
  target_email: string;
  target_role: string;
  reset_type: 'self_service' | 'admin_forced';
  performed_by: string;
  performed_by_role?: string;
}

export interface ImpersonationAuditRecord {
  id: string;
  started_at: string;
  ended_at: string | null;
  super_admin_email: string;
  target_email: string;
  target_school_id: string;
  status: 'Active' | 'Completed';
}

export interface AuditService {
  getPasswordResetAudits: (schoolId?: string) => Promise<PasswordResetAuditRecord[]>;
  getImpersonationAudits: () => Promise<ImpersonationAuditRecord[]>;
}

class RealAuditService implements AuditService {
  async getPasswordResetAudits(schoolId?: string): Promise<PasswordResetAuditRecord[]> {
    const params = schoolId ? { school_id: schoolId } : {};
    const res = await apiClient.get<PasswordResetAuditRecord[]>('/audit/password-resets', { params });
    return res.data;
  }

  async getImpersonationAudits(): Promise<ImpersonationAuditRecord[]> {
    const res = await apiClient.get<ImpersonationAuditRecord[]>('/audit/impersonations');
    return res.data;
  }
}

export const auditService: AuditService = new RealAuditService();
