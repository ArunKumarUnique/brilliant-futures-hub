import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TenantRow {
  id: string;
  tenant_id: string;
  institute_name: string;
  email: string;
  mobile: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  logo_url?: string | null;
}

const fmtDate = (value: string | undefined | null) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '—';
  }
};

const PlatformTenants = () => {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { toast } = useToast();

  const loadTenants = async () => {
    setLoading(true);
    const queryFields = 'id, tenant_id, institute_name, email, mobile, status, created_at, updated_at, logo_url';
    let response: any = await supabase
      .from('tenants_registry')
      .select(queryFields)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (response.error && response.error.code === '42703') {
      response = await supabase
        .from('tenants_registry')
        .select('id, tenant_id, institute_name, email, mobile, status, created_at, logo_url')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });
    }

    const { data, error } = response;

    if (error) {
      toast({ title: 'Failed to load tenants', description: error.message, variant: 'destructive' });
      setTenants([]);
      setLoading(false);
      return;
    }
    setTenants((data as TenantRow[]) || []);
    setLoading(false);
  };

  const loadStudentCounts = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('tenant_id')
      .neq('status', 'deleted');

    if (error) {
      toast({ title: 'Failed to load student counts', description: error.message, variant: 'destructive' });
      return;
    }
    const countMap: Record<string, number> = {};
    (data || []).forEach((row) => {
      if (!row.tenant_id) return;
      countMap[row.tenant_id] = (countMap[row.tenant_id] || 0) + 1;
    });
    setCounts(countMap);
  };

  useEffect(() => {
    loadTenants();
  }, [refreshFlag]);

  useEffect(() => {
    loadStudentCounts();
  }, [refreshFlag]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (statusFilter !== 'all' && tenant.status !== statusFilter) return false;
      const searchValue = search.trim().toLowerCase();
      if (!searchValue) return true;
      return [tenant.institute_name, tenant.email, tenant.mobile].some((value) =>
        value?.toLowerCase().includes(searchValue),
      );
    });
  }, [tenants, search, statusFilter]);

  const toggleStatus = async (tenant: TenantRow) => {
    const nextStatus = tenant.status === 'active' ? 'disabled' : 'active';
    const { error } = await supabase
      .from('tenants_registry')
      .update({ status: nextStatus })
      .eq('id', tenant.id);

    if (error) {
      toast({ title: 'Failed to update status', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: `Tenant ${nextStatus === 'active' ? 'enabled' : 'disabled'}` });
    setRefreshFlag((count) => count + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-muted-foreground">Search tenants by name, email or mobile.</p>
        </div>
        <Link to="/platform-admin/tenants/new">
          <Button className="w-full sm:w-auto">Add Tenant</Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'disabled')}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading tenants…</div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No tenants match your search. Try a different query.</div>
        ) : (
          <div className="divide-y">
            {filteredTenants.map((tenant) => (
              <Link key={tenant.id} to={`/platform-admin/tenants/${tenant.id}`} className="block hover:bg-muted/50 transition">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"> 
                      {tenant.logo_url ? (
                        <img src={tenant.logo_url} alt={tenant.institute_name} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="text-sm font-semibold uppercase text-primary">
                          {tenant.institute_name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-foreground">{tenant.institute_name}</div>
                      <div className="text-sm text-muted-foreground">{tenant.email} · {tenant.mobile}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Created {fmtDate(tenant.created_at)}</span>
                        <span>Last updated {fmtDate(tenant.updated_at ?? tenant.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end sm:flex-shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>{tenant.status}</Badge>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {counts[tenant.tenant_id] ?? 0} students
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">View</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlatformTenants;
