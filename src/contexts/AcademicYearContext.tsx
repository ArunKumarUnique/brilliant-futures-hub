import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

export interface AcademicYear {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface AcademicYearContextType {
  years: AcademicYear[];
  loading: boolean;
  activeYear: AcademicYear | null;
  selectedYearId: string | null;
  setSelectedYearId: (id: string) => void;
  refresh: () => Promise<void>;
  createYear: (input: { name: string; start_date?: string; end_date?: string; is_active?: boolean }) => Promise<AcademicYear | null>;
  updateYear: (id: string, input: Partial<Pick<AcademicYear, 'name' | 'start_date' | 'end_date'>>) => Promise<boolean>;
  setActiveYear: (id: string) => Promise<boolean>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

const storageKey = (tenantId: string) => `ay_selected_${tenantId}`;

export const AcademicYearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tenantId, isAuthenticated } = useAdmin();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYearId, setSelectedYearIdState] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) { setYears([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from('academic_years')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: false });
    const list = (data || []) as AcademicYear[];

    setYears(list);
    // Determine selected: sessionStorage > active > first
    let stored: string | null = null;
    try { stored = sessionStorage.getItem(storageKey(tenantId)); } catch {}
    const active = list.find(y => y.is_active) || null;
    const initial =
      (stored && list.find(y => y.id === stored)?.id) ||
      active?.id ||
      list[0]?.id ||
      null;
    setSelectedYearIdState(initial);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    if (isAuthenticated && tenantId) load();
    else { setYears([]); setSelectedYearIdState(null); setLoading(false); }
  }, [isAuthenticated, tenantId, load]);

  const setSelectedYearId = (id: string) => {
    setSelectedYearIdState(id);
    if (tenantId) {
      try { sessionStorage.setItem(storageKey(tenantId), id); } catch {}
    }
  };

  const createYear: AcademicYearContextType['createYear'] = async (input) => {
    if (!tenantId) return null;
    // Duplicate name check
    if (years.some(y => y.name.trim().toLowerCase() === input.name.trim().toLowerCase())) {
      throw new Error('An academic year with this name already exists');
    }
    if (input.is_active) {
      await supabase.from('academic_years' as any).update({ is_active: false }).eq('tenant_id', tenantId).eq('is_active', true);
    }
    const { data, error } = await supabase
      .from('academic_years' as any)
      .insert({
        tenant_id: tenantId,
        name: input.name.trim(),
        start_date: input.start_date || null,
        end_date: input.end_date || null,
        is_active: !!input.is_active,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await load();
    return data as AcademicYear;
  };

  const updateYear: AcademicYearContextType['updateYear'] = async (id, input) => {
    if (!tenantId) return false;
    if (input.name) {
      if (years.some(y => y.id !== id && y.name.trim().toLowerCase() === input.name!.trim().toLowerCase())) {
        throw new Error('An academic year with this name already exists');
      }
    }
    const { error } = await supabase.from('academic_years' as any).update(input).eq('id', id).eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
    await load();
    return true;
  };

  const setActiveYear: AcademicYearContextType['setActiveYear'] = async (id) => {
    if (!tenantId) return false;
    // Deactivate current active first (partial unique index would otherwise conflict)
    await supabase.from('academic_years' as any).update({ is_active: false }).eq('tenant_id', tenantId).eq('is_active', true);
    const { error } = await supabase.from('academic_years' as any).update({ is_active: true }).eq('id', id).eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
    setSelectedYearId(id);
    await load();
    return true;
  };

  const activeYear = years.find(y => y.is_active) || null;

  return (
    <AcademicYearContext.Provider value={{
      years, loading, activeYear, selectedYearId,
      setSelectedYearId, refresh: load, createYear, updateYear, setActiveYear,
    }}>
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => {
  const ctx = useContext(AcademicYearContext);
  if (!ctx) throw new Error('useAcademicYear must be used inside AcademicYearProvider');
  return ctx;
};
