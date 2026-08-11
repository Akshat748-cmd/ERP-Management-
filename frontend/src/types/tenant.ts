import { PortalGradientTheme } from '@/config/theme';

export interface SchoolTenant {
  id: string;
  name: string;
  code: string;
  domain?: string;
  logoUrl?: string;
  sealUrl?: string;
  examControllerName?: string;
  principalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  theme?: PortalGradientTheme;
  active: boolean;
}

export interface TenantContextType {
  schoolId: string;
  schoolName: string;
  tenant: SchoolTenant | null;
  tenants: SchoolTenant[];
  switchTenant: (schoolId: string) => Promise<void>;
  addTenant: (newTenant: Partial<SchoolTenant>) => SchoolTenant;
  isLoadingTenant: boolean;
  tenantNotFound: boolean;
}
