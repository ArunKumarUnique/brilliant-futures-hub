import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TenantPackage = {
  id: string;
  tenant_id: string;
  name: string;
  fee: number;
  description?: string | null;
  status: string;
  type: string;
  created_at?: string;
  updated_at?: string;
};

type FetchOpts = { type?: string | null; status?: string | null };

const DEFAULT_STALE_MS = 60 * 1000;
const cache = new Map<string, { ts: number; data: TenantPackage[] }>();

function cacheKey(tenantId: string, opts?: FetchOpts) {
  return `${tenantId}::${opts?.type || 'all'}::${opts?.status || 'any'}`;
}

export async function fetchPackages(tenantId: string, opts?: FetchOpts, bypassCache = false): Promise<TenantPackage[]> {
  if (!tenantId) return [];
  const key = cacheKey(tenantId, opts);
  const now = Date.now();
  const cached = cache.get(key);
  if (!bypassCache && cached && now - cached.ts < DEFAULT_STALE_MS) {
    return cached.data;
  }

  let query = supabase.from('tenant_packages').select('id,tenant_id,name,fee,description,status,type,created_at,updated_at').eq('tenant_id', tenantId);
  if (opts?.status) query = query.eq('status', opts.status);
  if (opts?.type) query = query.eq('type', opts.type);

  const { data, error } = await query.order('type', { ascending: true }).order('name', { ascending: true });
  if (error) {
    // Do not throw here; return empty list to fail gracefully in UI
    // Console log for developer visibility
    // eslint-disable-next-line no-console
    console.warn('fetchPackages error', error.message);
    return [];
  }

  const rows = (data || []) as TenantPackage[];
  cache.set(key, { ts: now, data: rows });
  return rows;
}

export function invalidatePackages(tenantId?: string, opts?: FetchOpts) {
  if (!tenantId) {
    // clear all cache
    cache.clear();
  } else {
    // remove any keys that start with tenantId
    for (const k of Array.from(cache.keys())) {
      if (k.startsWith(`${tenantId}::`)) cache.delete(k);
    }
  }
  try {
    // notify listeners
    const ev = new CustomEvent('packages:updated', { detail: { tenantId, opts } });
    window.dispatchEvent(ev);
  } catch (e) {
    // ignore (server-side or non-browser env)
  }
}

export function usePackages(tenantId: string | null, opts?: FetchOpts) {
  const [packages, setPackages] = useState<TenantPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!tenantId) {
      setPackages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPackages(tenantId, opts).then((rows) => {
      if (!mounted) return;
      setPackages(rows);
      setLoading(false);
    }).catch((err) => {
      if (!mounted) return;
      setError(err as Error);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [tenantId, opts?.type, opts?.status]);

  // listen for invalidation events so multiple components stay in sync
  useEffect(() => {
    const handler = (e: any) => {
      const d = e?.detail || {};
      // if tenantId matches or event is global, refetch
      if (!tenantId) return;
      if (!d.tenantId || d.tenantId === tenantId) {
        refetch(true);
      }
    };
    window.addEventListener('packages:updated', handler as EventListener);
    return () => { window.removeEventListener('packages:updated', handler as EventListener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const refetch = async (bypassCache = true) => {
    if (!tenantId) return [] as TenantPackage[];
    setLoading(true);
    try {
      const rows = await fetchPackages(tenantId, opts, bypassCache);
      setPackages(rows);
      setLoading(false);
      return rows;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return [] as TenantPackage[];
    }
  };

  return { packages, loading, error, refetch } as const;
}

export default usePackages;
