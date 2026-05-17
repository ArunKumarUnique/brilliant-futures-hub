import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode; adminEmail: string; adminPassword: string }> = ({
  children,
  adminEmail,
  adminPassword,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try tenant config credentials (legacy)
    if (trimmedEmail === adminEmail.trim().toLowerCase() && password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
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
          .select('status')
          .eq('id', data.tenant_registry_id)
          .maybeSingle();
        if (t && t.status === 'active') {
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_authenticated', 'true');
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
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
