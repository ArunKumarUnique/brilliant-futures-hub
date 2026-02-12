import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { TenantConfig, Translatable } from '@/types/tenant';
import { loadTenantConfig } from '@/config/tenants';
import { applyTheme } from '@/lib/apply-theme';
import { useSEO } from '@/lib/use-seo';

interface TenantContextType {
  config: TenantConfig;
  tr: (value: Translatable, language: string) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const tenantId = import.meta.env.VITE_TENANT_ID || 'brilliant-tutorials';
const tenantConfig = loadTenantConfig(tenantId);

export const isTenantValid = (): boolean => !!tenantConfig;

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (!tenantConfig) {
    throw new Error(`Tenant config not found for id: ${tenantId}`);
  }
  const config = tenantConfig;

  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]);

  useSEO(config.seo);

  const tr = (value: Translatable, language: string): string => {
    if (typeof value === 'string') return value;
    return value[language] || value[Object.keys(value)[0]] || '';
  };

  return (
    <TenantContext.Provider value={{ config, tr }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
