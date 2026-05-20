import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAuthenticated: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantLogo: string | null;
  adminEmail: string | null;
  summerCampEnabled: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshTenantProfile: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminSession {
  email: string;
  tenantId: string;
  tenantName: string;
  source: 'config' | 'platform';
  summerCampEnabled?: boolean;
  tenantLogo?: string | null;
}

const STORAGE_KEY = 'tenant_admin_session';

export const AdminProvider: React.FC<{ children: ReactNode; adminEmail: string; adminPassword: string; defaultTenantId: string; defaultTenantName: string }> = ({
  children,
  adminEmail,
  adminPassword,
  defaultTenantId,
  defaultTenantName,
}) => {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AdminSession;
      return parsed?.tenantId ? parsed : null;
    } catch {
      return null;
    }
  });

  const setAdminSession = (next: AdminSession) => {
    setSession(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  const refreshTenantProfile = useCallback(async () => {
    if (!session?.tenantId) return;
    const { data } = await supabase
      .from('tenants_registry')
      .select('institute_name, logo_url, summer_camp_enabled')
      .eq('tenant_id', session.tenantId)
      .maybeSingle();
    if (!data) return;
    setAdminSession({
      ...session,
      tenantName: data.institute_name || session.tenantName,
      tenantLogo: data.logo_url || null,
      summerCampEnabled: data.summer_camp_enabled ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.tenantId]);

  // Hydrate name/logo/summer flag from DB whenever the session's tenant changes
  useEffect(() => {
    if (!session?.tenantId) return;
    refreshTenantProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.tenantId]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try tenant config credentials (legacy)
    if (trimmedEmail === adminEmail.trim().toLowerCase() && password === adminPassword) {
      const { data: t } = await supabase
        .from('tenants_registry')
        .select('summer_camp_enabled, logo_url, institute_name')
        .eq('tenant_id', defaultTenantId)
        .maybeSingle();
      setAdminSession({
        email: trimmedEmail,
        tenantId: defaultTenantId,
        tenantName: t?.institute_name || defaultTenantName,
        source: 'config',
        summerCampEnabled: t?.summer_camp_enabled ?? true,
        tenantLogo: t?.logo_url || null,
      });
      return true;
    }

    // 2. Fallback: check platform-managed tenant credentials in DB
    try {
      const { data } = await supabase
        .from('tenant_admin_credentials')
        .select('temp_password, tenant_registry_id')
        .eq('email', trimmedEmail)
        .maybeSingle();
      if (data && data.temp_password === password) {
        const { data: t } = await supabase
          .from('tenants_registry')
          .select('status, tenant_id, institute_name, summer_camp_enabled, logo_url')
          .eq('id', data.tenant_registry_id)
          .maybeSingle();
        if (t && t.status === 'active' && t.tenant_id) {
          setAdminSession({
            email: trimmedEmail,
            tenantId: t.tenant_id,
            tenantName: t.institute_name || t.tenant_id,
            source: 'platform',
            summerCampEnabled: t.summer_camp_enabled ?? true,
            tenantLogo: t.logo_url || null,
          });
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  const logout = () => {
    setSession(null);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('admin_authenticated');
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated: !!session?.tenantId,
      tenantId: session?.tenantId || null,
      tenantName: session?.tenantName || null,
      tenantLogo: session?.tenantLogo || null,
      adminEmail: session?.email || null,
      summerCampEnabled: session?.summerCampEnabled ?? true,
      login,
      logout,
      refreshTenantProfile,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
