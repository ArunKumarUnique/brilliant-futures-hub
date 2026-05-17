import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'tenant';

const DEFAULT_PASSWORD = 'Tutorials@1234';

const sanitizeMobile = (v: string) => v.replace(/\D/g, '').slice(0, 10);
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

interface Created {
  tenantName: string;
  email: string;
  password: string;
}

const PlatformTenantNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  const [form, setForm] = useState({
    institute_name: '',
    owner_first_name: '',
    owner_last_name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    institute_type: 'Tutorial',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validations
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

    setSubmitting(true);
    const email = form.email.trim().toLowerCase();

    // Duplicate check
    const { data: existing } = await supabase
      .from('tenants_registry').select('id').eq('email', email).maybeSingle();
    if (existing) {
      setSubmitting(false);
      toast({ title: 'Duplicate', description: 'Email already exists', variant: 'destructive' });
      return;
    }

    // Generate unique tenant_id
    const base = slugify(form.institute_name);
    const tenantId = `${base}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: inserted, error } = await supabase
      .from('tenants_registry')
      .insert({ ...form, email, tenant_id: tenantId })
      .select('id')
      .single();

    if (error || !inserted) {
      setSubmitting(false);
      toast({ title: 'Failed', description: error?.message || 'Could not create tenant', variant: 'destructive' });
      return;
    }

    const tempPassword = DEFAULT_PASSWORD;
    const { error: credErr } = await supabase.from('tenant_admin_credentials').insert({
      tenant_registry_id: inserted.id,
      email,
      temp_password: tempPassword,
    });

    setSubmitting(false);
    if (credErr) {
      toast({ title: 'Partial', description: 'Tenant created but credentials failed', variant: 'destructive' });
      return;
    }

    setCreated({ tenantName: form.institute_name, email, password: tempPassword });
  };

  const copyCreds = () => {
    if (!created) return;
    const text = `Tenant: ${created.tenantName}\nEmail: ${created.email}\nPassword: ${created.password}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-primary">Tenant Onboarded ✓</h2>
          <div className="bg-muted rounded p-4 space-y-2 text-sm">
            <div><span className="text-muted-foreground">Tenant:</span> <span className="font-medium">{created.tenantName}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium break-all">{created.email}</span></div>
            <div><span className="text-muted-foreground">Default Password:</span> <span className="font-mono font-medium">{created.password}</span></div>
          </div>
          <p className="text-xs text-muted-foreground">Share these credentials securely. The tenant admin should change the password on first login.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={copyCreds} className="flex-1"><Copy className="h-4 w-4 mr-1" /> Copy Credentials</Button>
            <Button variant="outline" onClick={() => navigate('/platform-admin/dashboard')} className="flex-1">Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/platform-admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>
      <Card className="p-4 sm:p-6">
        <h1 className="text-xl font-bold mb-4">Onboard New Tenant</h1>
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
              <Input
                type="tel" inputMode="numeric" maxLength={10}
                value={form.mobile}
                onChange={(e) => set('mobile', sanitizeMobile(e.target.value))}
                placeholder="10-digit number" required
              />
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
              <Input inputMode="numeric" value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 10))} required />
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
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating...' : 'Onboard Tenant'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PlatformTenantNew;
