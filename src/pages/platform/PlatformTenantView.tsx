import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Copy, Pencil, Users, Package, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlatformTenantView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<any>(null);
  const [cred, setCred] = useState<any>(null);
  const [stats, setStats] = useState({ students: 0, packages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('tenants_registry').select('*').eq('id', id).maybeSingle();
      const { data: c } = await supabase.from('tenant_admin_credentials').select('*').eq('tenant_registry_id', id).maybeSingle();
      if (t) {
        const [studentsRes, packagesRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('tenant_id', t.tenant_id).neq('status', 'deleted'),
          supabase.from('tenant_packages').select('id', { count: 'exact', head: true }).eq('tenant_id', t.tenant_id).eq('status', 'active'),
        ]);
        setStats({
          students: studentsRes.count ?? 0,
          packages: packagesRes.count ?? 0,
        });
      }
      setTenant(t);
      setCred(c);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;
  if (!tenant) return <div className="text-center text-muted-foreground py-8">Tenant not found.</div>;

  const copyCreds = () => {
    if (!cred) return;
    navigator.clipboard.writeText(`Tenant: ${tenant.institute_name}\nEmail: ${cred.email}\nPassword: ${cred.temp_password}`);
    toast({ title: 'Copied to clipboard' });
  };

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between gap-4 py-3 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right text-foreground break-words">{value ?? '—'}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/platform-admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-border p-4 bg-muted">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Students</p>
              <p className="text-2xl font-semibold">{stats.students}</p>
            </div>
            <Users className="h-6 w-6 text-primary" />
          </div>
        </Card>
        <Card className="rounded-3xl border border-border p-4 bg-muted">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active packages</p>
              <p className="text-2xl font-semibold">{stats.packages}</p>
            </div>
            <Package className="h-6 w-6 text-primary" />
          </div>
        </Card>
        <Card className="rounded-3xl border border-border p-4 bg-muted">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tenant slug</p>
              <p className="text-2xl font-semibold">{tenant.tenant_id}</p>
            </div>
            <Database className="h-6 w-6 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h1 className="text-xl font-bold">{tenant.institute_name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>{tenant.status}</Badge>
            <Link to={`/platform-admin/tenants/${tenant.id}/edit`}>
              <Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
            </Link>
          </div>
        </div>
        <Row label="Tenant ID" value={tenant.tenant_id} />
        <Row label="Owner" value={`${tenant.owner_first_name} ${tenant.owner_last_name}`} />
        <Row label="Email" value={tenant.email} />
        <Row label="Mobile" value={tenant.mobile} />
        <Row label="Type" value={tenant.institute_type} />
        <Row label="Address" value={tenant.address} />
        <Row label="City" value={tenant.city} />
        <Row label="State" value={tenant.state} />
        <Row label="Pincode" value={tenant.pincode} />
        <Row label="Created" value={new Date(tenant.created_at).toLocaleString()} />
      </Card>

      {cred && (
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold mb-2">Tenant Admin Login</h2>
          <div className="bg-muted rounded p-3 space-y-1 text-sm">
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium break-all">{cred.email}</span></div>
            <div><span className="text-muted-foreground">Password:</span> <span className="font-mono font-medium">{cred.temp_password}</span></div>
          </div>
          <Button onClick={copyCreds} variant="outline" className="mt-3 w-full sm:w-auto">
            <Copy className="h-4 w-4 mr-1" /> Copy Credentials
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PlatformTenantView;
