import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const sanitizeMobile = (v: string) => v.replace(/\D/g, '').slice(0, 10);
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const PlatformTenantEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [credId, setCredId] = useState<string | null>(null);
  const [form, setForm] = useState({
    institute_name: '', owner_first_name: '', owner_last_name: '',
    email: '', mobile: '', address: '', city: '', state: '', pincode: '',
    institute_type: 'Tutorial',
  });
  const [summerCampEnabled, setSummerCampEnabled] = useState(true);
  const [password, setPassword] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('tenants_registry').select('*').eq('id', id).maybeSingle();
      const { data: c } = await supabase.from('tenant_admin_credentials').select('id').eq('tenant_registry_id', id).maybeSingle();
      if (t) {
        setForm({
          institute_name: t.institute_name || '',
          owner_first_name: t.owner_first_name || '',
          owner_last_name: t.owner_last_name || '',
          email: t.email || '',
          mobile: t.mobile || '',
          address: t.address || '',
          city: t.city || '',
          state: t.state || '',
          pincode: t.pincode || '',
          institute_type: t.institute_type || 'Tutorial',
        });
        setSummerCampEnabled(t.summer_camp_enabled ?? true);
      }
      if (c) setCredId(c.id);
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institute_name.trim() || !form.owner_first_name.trim() || !form.owner_last_name.trim() ||
        !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast({ title: 'Validation', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      toast({ title: 'Validation', description: 'Invalid email', variant: 'destructive' });
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      toast({ title: 'Validation', description: 'Enter valid 10-digit mobile number', variant: 'destructive' });
      return;
    }
    if (password && password.trim().length < 6) {
      toast({ title: 'Validation', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    const email = form.email.trim().toLowerCase();
    setSubmitting(true);

    // Duplicate email check (excluding current)
    const { data: dup } = await supabase
      .from('tenants_registry').select('id').eq('email', email).neq('id', id).maybeSingle();
    if (dup) {
      setSubmitting(false);
      toast({ title: 'Duplicate', description: 'Email already exists', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('tenants_registry')
      .update({ ...form, email, summer_camp_enabled: summerCampEnabled })
      .eq('id', id);
    if (error) {
      setSubmitting(false);
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Update credentials email + password (if provided)
    if (credId) {
      const credUpdate: any = { email };
      if (password.trim()) credUpdate.temp_password = password.trim();
      await supabase.from('tenant_admin_credentials').update(credUpdate).eq('id', credId);
    } else if (password.trim()) {
      await supabase.from('tenant_admin_credentials').insert({
        tenant_registry_id: id, email, temp_password: password.trim(),
      });
    }

    setSubmitting(false);
    toast({ title: 'Tenant updated' });
    navigate(`/platform-admin/tenants/${id}`);
  };

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to={`/platform-admin/tenants/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>
      <Card className="p-4 sm:p-6">
        <h1 className="text-xl font-bold mb-4">Edit Tenant</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Institute Name *</Label>
            <Input value={form.institute_name} onChange={(e) => set('institute_name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Owner First Name *</Label>
              <Input value={form.owner_first_name} onChange={(e) => set('owner_first_name', e.target.value)} required />
            </div>
            <div>
              <Label>Owner Last Name *</Label>
              <Input value={form.owner_last_name} onChange={(e) => set('owner_last_name', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input type="tel" inputMode="numeric" maxLength={10}
                value={form.mobile}
                onChange={(e) => set('mobile', sanitizeMobile(e.target.value))} required />
            </div>
          </div>
          <div>
            <Label>Address *</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} required />
            </div>
            <div>
              <Label>State *</Label>
              <Input value={form.state} onChange={(e) => set('state', e.target.value)} required />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input inputMode="numeric" value={form.pincode}
                onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 10))} required />
            </div>
          </div>
          <div>
            <Label>Institute Type</Label>
            <Select value={form.institute_type} onValueChange={(v) => set('institute_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutorial">Tutorial</SelectItem>
                <SelectItem value="School">School</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>New Password (optional)</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current" />
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters. Leave empty to keep existing password.</p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/platform-admin/tenants/${id}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlatformTenantEdit;
