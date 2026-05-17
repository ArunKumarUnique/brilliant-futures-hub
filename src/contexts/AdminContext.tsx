import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAuthenticated: boolean;
  tenantId: string | null;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminSession {
  email: string;
  tenantId: string;
  source: 'config' | 'platform';
}

const STORAGE_KEY = 'tenant_admin_session';

export const AdminProvider: React.FC<{ children: ReactNode; adminEmail: string; adminPassword: string; defaultTenantId: string }> = ({
  children,
  adminEmail,
  adminPassword,
  defaultTenantId,
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

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try tenant config credentials (legacy)
    if (trimmedEmail === adminEmail.trim().toLowerCase() && password === adminPassword) {
      setAdminSession({ email: trimmedEmail, tenantId: defaultTenantId, source: 'config' });
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
        // Ensure tenant is active (not disabled/deleted)
        const { data: t } = await supabase
          .from('tenants_registry')
          .select('status, tenant_id')
          .eq('id', data.tenant_registry_id)
          .maybeSingle();
        if (t && t.status === 'active' && t.tenant_id) {
          setAdminSession({ email: trimmedEmail, tenantId: t.tenant_id, source: 'platform' });
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
    <AdminContext.Provider value={{ isAuthenticated: !!session?.tenantId, tenantId: session?.tenantId || null, adminEmail: session?.email || null, login, logout }}>
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
