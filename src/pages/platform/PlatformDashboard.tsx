import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Power, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Tenant {
  id: string;
  tenant_id: string;
  institute_name: string;
  owner_first_name: string;
  owner_last_name: string;
  email: string;
  mobile: string;
  institute_type: string | null;
  status: string;
  created_at: string;
}

const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString(); } catch { return '—'; }
};

const PlatformDashboard = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenants_registry')
      .select('id, tenant_id, institute_name, owner_first_name, owner_last_name, email, mobile, institute_type, status, created_at')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load tenants', description: error.message, variant: 'destructive' });
    } else {
      setTenants((data as Tenant[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (t: Tenant) => {
    const newStatus = t.status === 'active' ? 'disabled' : 'active';
    const { error } = await supabase.from('tenants_registry').update({ status: newStatus }).eq('id', t.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Tenant ${newStatus === 'active' ? 'enabled' : 'disabled'}` });
      load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('tenants_registry').update({ status: 'deleted' }).eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Tenant deleted' });
      setDeleteTarget(null);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-muted-foreground">Total: {tenants.length}</p>
        </div>
        <Link to="/platform-admin/tenants/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Add Tenant
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : tenants.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No tenants yet. Click "Add Tenant" to onboard one.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y">
              {tenants.map((t) => (
                <div key={t.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{t.institute_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.email}</div>
                    </div>
                    <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.owner_first_name} {t.owner_last_name} · {t.mobile}
                  </div>
                  <div className="text-xs text-muted-foreground">Created {fmtDate(t.created_at)}</div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link to={`/platform-admin/tenants/${t.id}`}>
                      <Button variant="outline" size="sm" className="w-full"><Eye className="h-4 w-4 mr-1" /> View</Button>
                    </Link>
                    <Link to={`/platform-admin/tenants/${t.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(t)}>
                      <Power className="h-4 w-4 mr-1" /> {t.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget(t)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Institute</th>
                    <th className="text-left p-3">Owner</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Mobile</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="p-3 font-medium">{t.institute_name}</td>
                      <td className="p-3">{t.owner_first_name} {t.owner_last_name}</td>
                      <td className="p-3">{t.email}</td>
                      <td className="p-3">{t.mobile}</td>
                      <td className="p-3">
                        <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
                      </td>
                      <td className="p-3">{fmtDate(t.created_at)}</td>
                      <td className="p-3 text-right space-x-1">
                        <Link to={`/platform-admin/tenants/${t.id}`}>
                          <Button variant="outline" size="sm" title="View"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link to={`/platform-admin/tenants/${t.id}/edit`}>
                          <Button variant="outline" size="sm" title="Edit"><Pencil className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => toggleStatus(t)} title={t.status === 'active' ? 'Disable' : 'Enable'}>
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(t)} title="Delete" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium">{deleteTarget?.institute_name}</span>?
              The tenant will be marked as deleted and hidden from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlatformDashboard;
