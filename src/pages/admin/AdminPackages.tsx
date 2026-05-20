import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { invalidatePackages } from '@/hooks/usePackages';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react';

type PackageType = 'regular' | 'summer_camp';
type PackageStatus = 'active' | 'inactive';

interface TenantPackage {
  id: string;
  tenant_id: string;
  name: string;
  fee: number;
  description: string | null;
  status: PackageStatus;
  type: PackageType;
  created_at: string;
}

interface FormState {
  name: string;
  fee: string;
  description: string;
  status: PackageStatus;
}

const emptyForm: FormState = { name: '', fee: '', description: '', status: 'active' };

const AdminPackages = () => {
  const { tenantId, summerCampEnabled } = useAdmin();
  const [packages, setPackages] = useState<TenantPackage[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ type: PackageType; pkg: TenantPackage | null } | null>(null);
  const [viewing, setViewing] = useState<TenantPackage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tenant_packages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Failed to load packages', description: error.message, variant: 'destructive' });
    } else {
      setPackages((data || []) as TenantPackage[]);
    }
    setLoading(false);
  };

  const loadStudentCounts = async () => {
    if (!tenantId) return;
    const { data, error } = await supabase
      .from('students')
      .select('package_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');
    if (error) {
      toast({ title: 'Failed to load student counts', description: error.message, variant: 'destructive' });
      return;
    }
    const counts = (data || []).reduce((acc: Record<string, number>, row: { package_id: string | null }) => {
      if (!row.package_id) return acc;
      acc[row.package_id] = (acc[row.package_id] || 0) + 1;
      return acc;
    }, {});
    setStudentCounts(counts);
  };

  useEffect(() => { load(); }, [tenantId]);
  useEffect(() => { loadStudentCounts(); }, [tenantId]);

  const openCreate = (type: PackageType) => {
    setForm(emptyForm);
    setEditing({ type, pkg: null });
  };

  const openEdit = (pkg: TenantPackage) => {
    setForm({ name: pkg.name, fee: String(pkg.fee), description: pkg.description || '', status: pkg.status });
    setEditing({ type: pkg.type, pkg });
  };

  const closeEditor = () => { setEditing(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!editing || !tenantId) return;
    const name = form.name.trim();
    const feeNum = Number(form.fee);
    if (!name) return toast({ title: 'Package name is required', variant: 'destructive' });
    if (!feeNum || feeNum <= 0) return toast({ title: 'Fee must be greater than 0', variant: 'destructive' });

    // Duplicate name check within same tenant + type
    const duplicate = packages.find(
      (p) =>
        p.type === editing.type &&
        p.name.toLowerCase() === name.toLowerCase() &&
        p.id !== editing.pkg?.id
    );
    if (duplicate) return toast({ title: 'A package with this name already exists', variant: 'destructive' });

    setSaving(true);
    const payload = {
      tenant_id: tenantId,
      name,
      fee: feeNum,
      description: form.description.trim() || null,
      status: form.status,
      type: editing.type,
    };
    const { error } = editing.pkg
      ? await supabase.from('tenant_packages').update(payload).eq('id', editing.pkg.id)
      : await supabase.from('tenant_packages').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editing.pkg ? 'Package updated' : 'Package created' });
    closeEditor();
    // Invalidate package cache so other components refresh
    invalidatePackages(tenantId || undefined);
    load();
  };

  const handleDelete = async (pkg: TenantPackage) => {
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    const { error } = await supabase.from('tenant_packages').delete().eq('id', pkg.id);
    if (error) return toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Package deleted' });
    invalidatePackages(tenantId || undefined);
    load();
  };

  const renderSection = (type: PackageType, title: string) => {
    const items = packages.filter((p) => p.type === type);
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={() => openCreate(type)}
            className="inline-flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            No {title.toLowerCase()} yet. Click <strong>Add</strong> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((pkg) => (
              <div key={pkg.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pkg.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary mb-1">₹{Number(pkg.fee).toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground mb-3">Students enrolled: {studentCounts[pkg.id] ?? 0}</p>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>
                )}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setViewing(pkg)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-md py-1.5 hover:bg-muted">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(pkg)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-md py-1.5 hover:bg-muted">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(pkg)} className="inline-flex items-center justify-center text-xs border border-border rounded-md py-1.5 px-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  if (!tenantId) {
    return <p className="text-muted-foreground">Tenant session missing. Please log in again.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Packages</h1>

      {renderSection('regular', 'Regular Tuition Packages')}
      {summerCampEnabled && renderSection('summer_camp', 'Summer Camp Packages')}

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeEditor}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {editing.pkg ? 'Edit' : 'Add'} {editing.type === 'regular' ? 'Regular' : 'Summer Camp'} Package
              </h3>
              <button onClick={closeEditor} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Package Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                  placeholder="e.g. Class 10 Full Package"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fee Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                  placeholder="e.g. 2500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
                  placeholder="Subjects, timings, notes..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as PackageStatus })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={closeEditor} className="flex-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Package Details</h3>
              <button onClick={() => setViewing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <strong>{viewing.name}</strong></div>
              <div><span className="text-muted-foreground">Type:</span> {viewing.type === 'regular' ? 'Regular' : 'Summer Camp'}</div>
              <div><span className="text-muted-foreground">Fee:</span> ₹{Number(viewing.fee).toLocaleString('en-IN')}</div>
              <div><span className="text-muted-foreground">Status:</span> {viewing.status}</div>
              {viewing.description && (
                <div><span className="text-muted-foreground">Description:</span><br />{viewing.description}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
