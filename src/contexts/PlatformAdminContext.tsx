import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformAdmin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Ctx {
  admin: PlatformAdmin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const PlatformAdminContext = createContext<Ctx | undefined>(undefined);
const STORAGE_KEY = 'platform_admin_session';

export const PlatformAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('platform_admins')
      .select('id, first_name, last_name, email, password')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (error || !data || data.password !== password) return false;
    const session = { id: data.id, first_name: data.first_name, last_name: data.last_name, email: data.email };
    setAdmin(session);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PlatformAdminContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};

export const usePlatformAdmin = () => {
  const ctx = useContext(PlatformAdminContext);
  if (!ctx) throw new Error('usePlatformAdmin must be inside PlatformAdminProvider');
  return ctx;
};
