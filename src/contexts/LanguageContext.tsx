import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTenant } from './TenantContext';
import { Translatable } from '@/types/tenant';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  tr: (value: Translatable) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config, tr: tenantTr } = useTenant();
  const defaultLanguage = config?.languages?.default || 'en';
  const [language, setLanguage] = useState(defaultLanguage);

  const t = (key: string): string => {
    const value = config.translations?.[key];
    if (!value) return key;
    if (typeof value === 'string') return value;
    return value[language] || value[defaultLanguage] || value[Object.keys(value)[0]] || key;
  };

  const tr = (value: Translatable): string => {
    return tenantTr(value, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
