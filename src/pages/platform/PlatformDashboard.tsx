import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, LayoutDashboard, Package, Sparkles } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const fmtDate = (s?: string | null) => {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return '—';
  }
};

const StatsCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <Card className="rounded-3xl border border-border p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  </Card>
);

const PlatformDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tenants: 0,
    students: 0,
    activePackages: 0,
    summerStudents: 0,
    feesThisMonth: 0,
  });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const { toast } = useToast();

  const loadDashboard = async () => {
    setLoading(true);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [tenantCountRes, studentCountRes, packageCountRes, summerStudentCountRes, feeRecordsRes, tenantsRes, studentsRes] =
      await Promise.all([
        supabase.from('tenants_registry').select('id', { count: 'exact', head: true }).neq('status', 'deleted'),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tenant_packages').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('student_type', 'summer_camp'),
        supabase.from('fee_records').select('amount').eq('status', 'paid').eq('month', currentMonth).eq('year', currentYear),
        supabase.from('tenants_registry').select('id, institute_name, email, status, created_at').neq('status', 'deleted').order('created_at', { ascending: false }).limit(4),
        supabase.from('students').select('id, student_name, tenant_id, class, student_type').eq('status', 'active').order('admission_date', { ascending: false }).limit(4),
      ]);

    if (tenantCountRes.error || studentCountRes.error || packageCountRes.error || summerStudentCountRes.error || feeRecordsRes.error || tenantsRes.error || studentsRes.error) {
      const message = tenantCountRes.error?.message || studentCountRes.error?.message || packageCountRes.error?.message || summerStudentCountRes.error?.message || feeRecordsRes.error?.message || tenantsRes.error?.message || studentsRes.error?.message;
      toast({ title: 'Failed to load dashboard', description: message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const feesThisMonth = (feeRecordsRes.data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    setStats({
      tenants: tenantCountRes.count ?? 0,
      students: studentCountRes.count ?? 0,
      activePackages: packageCountRes.count ?? 0,
      summerStudents: summerStudentCountRes.count ?? 0,
      feesThisMonth,
    });
    setRecentTenants(tenantsRes.data || []);
    setRecentStudents(studentsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Tenants" value={stats.tenants} icon={<Users className="h-6 w-6" />} />
        <StatsCard label="Total Students" value={stats.students} icon={<LayoutDashboard className="h-6 w-6" />} />
        <StatsCard label="Active Packages" value={stats.activePackages} icon={<Package className="h-6 w-6" />} />
        <StatsCard label="Summer Camp Students" value={stats.summerStudents} icon={<Sparkles className="h-6 w-6" />} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-3xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Fees Collected This Month</h2>
              <p className="text-sm text-muted-foreground">Paid fee records for the current month.</p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{formatCurrency(stats.feesThisMonth)}</div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Recently Added Tenants</h2>
          <div className="mt-4 space-y-3">
            {(recentTenants.length === 0 ? Array.from({ length: 2 }) : recentTenants).map((tenant, idx) => (
              <div key={tenant?.id ?? idx} className="flex flex-col gap-1 rounded-2xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{tenant?.institute_name ?? 'No tenant yet'}</p>
                    <p className="text-xs text-muted-foreground">{tenant?.email}</p>
                  </div>
                  <Badge variant={tenant?.status === 'active' ? 'default' : 'secondary'}>
                    {tenant?.status ?? '—'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Created {fmtDate(tenant?.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl border border-border p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <p className="text-sm text-muted-foreground">Latest active student records added across tenants.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recentStudents.length > 0 ? recentStudents.map((student) => (
            <div key={student.id} className="rounded-2xl border border-border bg-background p-4">
              <p className="font-medium">{student.student_name}</p>
              <p className="text-sm text-muted-foreground">{student.class} • {student.student_type === 'summer_camp' ? 'Summer Camp' : 'Regular'}</p>
              <p className="text-sm text-muted-foreground mt-2">Tenant: {student.tenant_id}</p>
            </div>
          )) : (
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">No recent students yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PlatformDashboard;
