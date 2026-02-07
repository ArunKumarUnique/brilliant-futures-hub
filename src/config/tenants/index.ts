import { TenantConfig } from '@/types/tenant';
import brilliantTutorials from './brilliant-tutorials';
import demoAcademy from './demo-academy';

const tenantRegistry: Record<string, TenantConfig> = {
  'brilliant-tutorials': brilliantTutorials,
  'demo-academy': demoAcademy,
};

export const loadTenantConfig = (tenantId: string): TenantConfig | null => {
  return tenantRegistry[tenantId] || null;
};

export const getAvailableTenants = (): string[] => {
  return Object.keys(tenantRegistry);
};
