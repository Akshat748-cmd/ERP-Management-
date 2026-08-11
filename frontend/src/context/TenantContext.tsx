import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SchoolTenant, TenantContextType } from '@/types/tenant';
import { getTenantGradient } from '@/config/theme';
import { apiClient } from '@/services/api/client';

/**
 * MULTI-TENANT ACCESS RESOLUTION CONVENTION:
 * ----------------------------------------------------
 * 1. Primary Resolution: 'school' URL query parameter (e.g. ?school=dps-jaipur)
 * 2. Persistent Storage: Stored in localStorage under 'amps_active_tenant_id'
 * 3. Backend Verification: Public tenant lookup endpoint GET /api/v1/tenants/{id}
 * 4. Future Upgrade Path: Subdomain-based resolution (<slug>.yourdomain.com)
 *    can be parsed from window.location.hostname in production.
 */

const ACTIVE_TENANT_KEY = 'amps_active_tenant_id';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<SchoolTenant[]>([]);

  const [activeTenantId, setActiveTenantId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSchool = params.get('school');
    if (urlSchool) return urlSchool.toLowerCase();
    return localStorage.getItem(ACTIVE_TENANT_KEY) || null;
  });

  const [currentTenant, setCurrentTenant] = useState<SchoolTenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(true);
  const [tenantNotFound, setTenantNotFound] = useState<boolean>(false);

  // 1. Fetch real active tenant list on mount
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/tenants')
      .then((res) => {
        if (!isMounted) return;
        const list: SchoolTenant[] = (res.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          logoUrl: t.logoUrl || undefined,
          domain: `${t.id}.ampsportal.edu`,
          active: true,
          theme: getTenantGradient(t.id),
        }));
        setTenants(list);
      })
      .catch((err) => {
        console.warn('[TenantContext] Failed to fetch active tenants list:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sync active tenant id from URL query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSchool = params.get('school');
    if (urlSchool && urlSchool.toLowerCase() !== activeTenantId) {
      setActiveTenantId(urlSchool.toLowerCase());
    }
  }, [window.location.search]);

  // 3. Fetch specific tenant details from backend GET /api/v1/tenants/{id}
  useEffect(() => {
    let isMounted = true;
    if (activeTenantId === 'platform') {
      setIsLoadingTenant(false);
      setTenantNotFound(false);
      setCurrentTenant({
        id: 'platform',
        name: 'AMPS SaaS Platform',
        code: 'PLATFORM',
        domain: 'ampsportal.edu',
        active: true,
        theme: getTenantGradient('platform'),
      });
      return;
    }

    setIsLoadingTenant(true);
    setTenantNotFound(false);

    apiClient
      .get(`/tenants/${activeTenantId}`)
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        const fetchedTenant: SchoolTenant = {
          id: data.id,
          name: data.name,
          code: data.code,
          domain: data.domain,
          logoUrl: data.logoUrl || undefined,
          contactEmail: data.contactEmail || undefined,
          contactPhone: data.contactPhone || undefined,
          address: data.address || undefined,
          theme: getTenantGradient(data.id),
          active: data.active,
        };

        setCurrentTenant(fetchedTenant);
        setTenantNotFound(false);
        localStorage.setItem(ACTIVE_TENANT_KEY, fetchedTenant.id);

        // Keep local registry updated
        setTenants((prev) => [
          ...prev.filter((t) => t.id !== fetchedTenant.id),
          fetchedTenant,
        ]);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn(`[TenantContext] Could not resolve tenant '${activeTenantId}' from backend:`, err.message);
        setCurrentTenant(null);
        setTenantNotFound(true);
        localStorage.removeItem(ACTIVE_TENANT_KEY);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTenant(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTenantId]);

  const switchTenant = async (schoolId: string) => {
    setIsLoadingTenant(true);
    if (!schoolId) {
      setActiveTenantId(null);
      setCurrentTenant(null);
      localStorage.removeItem(ACTIVE_TENANT_KEY);
      setIsLoadingTenant(false);
      return;
    }
    const targetId = schoolId.toLowerCase();
    setActiveTenantId(targetId);
  };

  const addTenant = (data: Partial<SchoolTenant>): SchoolTenant => {
    const id = data.id ? data.id.toLowerCase() : `school-${Date.now().toString(36)}`;
    const newTenant: SchoolTenant = {
      id,
      name: data.name || 'New School Institution',
      code: data.code || id.toUpperCase(),
      domain: data.domain || `${id}.ampsportal.edu`,
      logoUrl: data.logoUrl,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      active: true,
      theme: getTenantGradient(id),
    };

    setTenants((prev) => [...prev.filter((t) => t.id !== newTenant.id), newTenant]);
    setActiveTenantId(newTenant.id);
    setCurrentTenant(newTenant);
    setTenantNotFound(false);
    return newTenant;
  };

  const value: TenantContextType = {
    schoolId: currentTenant?.id || activeTenantId || '',
    schoolName: currentTenant?.name || 'School Portal',
    tenant: currentTenant,
    tenants,
    switchTenant,
    addTenant,
    isLoadingTenant,
    tenantNotFound,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
