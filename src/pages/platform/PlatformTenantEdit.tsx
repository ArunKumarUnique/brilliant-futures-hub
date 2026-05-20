import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<{
    form: typeof form;
    logoUrl: string | null;
    summerCampEnabled: boolean;
  } | null>(null);
  const [summerCampEnabled, setSummerCampEnabled] = useState(true);
  const [password, setPassword] = useState('');

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('tenants_registry').select('*').eq('id', id).maybeSingle();
      const { data: c } = await supabase.from('tenant_admin_credentials').select('id').eq('tenant_registry_id', id).maybeSingle();
      if (t) {
        const loadedForm = {
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
        };
        setForm(loadedForm);
        setLogoUrl(t.logo_url || null);
        setTenantSlug(t.tenant_id || null);
        setSummerCampEnabled(t.summer_camp_enabled ?? true);
        setInitialState({
          form: loadedForm,
          logoUrl: t.logo_url || null,
          summerCampEnabled: t.summer_camp_enabled ?? true,
        });
      }
      if (c) setCredId(c.id);
      setLoading(false);
    })();
  }, [id]);

  const clearLogoPreview = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const removeCurrentLogo = () => {
    clearLogoPreview();
    setLogoUrl(null);
    setRemoveLogo(true);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const isDirty = useMemo(() => {
    if (!initialState) return false;
    if (JSON.stringify(form) !== JSON.stringify(initialState.form)) return true;
    if (logoFile) return true;
    if (removeLogo && initialState.logoUrl) return true;
    if (!removeLogo && logoUrl !== initialState.logoUrl) return true;
    if (summerCampEnabled !== initialState.summerCampEnabled) return true;
    if (password.trim()) return true;
    return false;
  }, [form, logoFile, logoUrl, removeLogo, summerCampEnabled, password, initialState]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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

    if (logoFile && !/^image\//.test(logoFile.type)) {
      toast({ title: 'Invalid file', description: 'Please upload a valid image file for the logo.', variant: 'destructive' });
      return;
    }

    const email = form.email.trim().toLowerCase();
    setSubmitting(true);

    const { data: dup } = await supabase.from('tenants_registry').select('id').eq('email', email).neq('id', id).maybeSingle();
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

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `tenant-logos/${tenantSlug || id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('tenant-logos').upload(path, logoFile);
      if (uploadError) {
        setSubmitting(false);
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        return;
      }

      const { data: urlData } = supabase.storage.from('tenant-logos').getPublicUrl(path);
      if (urlData?.publicUrl) {
        const { error: logoError } = await supabase
          .from('tenants_registry')
          .update({ logo_url: urlData.publicUrl })
          .eq('id', id);

        if (logoError) {
          setSubmitting(false);
          toast({ title: 'Failed', description: logoError.message, variant: 'destructive' });
          return;
        }
      }
    } else if (removeLogo) {
      const { error: logoError } = await supabase
        .from('tenants_registry')
        .update({ logo_url: null })
        .eq('id', id);

      if (logoError) {
        setSubmitting(false);
        toast({ title: 'Failed', description: logoError.message, variant: 'destructive' });
        return;
      }
    }

    if (credId) {
      const credUpdate: any = { email };
      if (password.trim()) credUpdate.temp_password = password.trim();
      await supabase.from('tenant_admin_credentials').update(credUpdate).eq('id', credId);
    } else if (password.trim()) {
      await supabase.from('tenant_admin_credentials').insert({
        tenant_registry_id: id,
        email,
        temp_password: password.trim(),
      });
    }

    setSubmitting(false);
    toast({ title: 'Tenant updated' });
    navigate(`/platform-admin/tenants/${id}`);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to={`/platform-admin/tenants/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <Card className="p-4 sm:p-6">
        <h1 className="text-xl font-bold mb-4">Edit Tenant</h1>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-2xl">
              {logoPreview || logoUrl ? (
                <AvatarImage src={logoPreview || logoUrl || ''} alt={form.institute_name} />
              ) : (
                <AvatarFallback>
                  <span className="text-sm font-semibold uppercase">
                    {form.institute_name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                  </span>
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Tenant logo preview</p>
              <p className="text-sm font-medium">Supports JPG, PNG, SVG</p>
            </div>
          </div>
            {(logoPreview || logoUrl) && (
              <Button variant="outline" size="sm" onClick={logoPreview ? clearLogoPreview : removeCurrentLogo}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove logo
              </Button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setLogoFile(file);
                setRemoveLogo(false);
                if (file) {
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  setLogoPreview(URL.createObjectURL(file));
                } else {
                  setLogoPreview(null);
                }
              }}
              ref={logoInputRef}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Upload a new tenant logo to display in lists and summaries.</p>
          </div>

          <div>
            <Label>Institute Name *</Label>
            <Input value={form.institute_name} onChange={(e) => setField('institute_name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Owner First Name *</Label>
              <Input value={form.owner_first_name} onChange={(e) => setField('owner_first_name', e.target.value)} required />
            </div>
            <div>
              <Label>Owner Last Name *</Label>
              <Input value={form.owner_last_name} onChange={(e) => setField('owner_last_name', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setField('mobile', sanitizeMobile(e.target.value))}
                required
              />
            </div>
          </div>
          <div>
            <Label>Address *</Label>
            <Input value={form.address} onChange={(e) => setField('address', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => setField('city', e.target.value)} required />
            </div>
            <div>
              <Label>State *</Label>
              <Input value={form.state} onChange={(e) => setField('state', e.target.value)} required />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input
                inputMode="numeric"
                value={form.pincode}
                onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
          </div>
          <div>
            <Label>Institute Type</Label>
            <Select value={form.institute_type} onValueChange={(value) => setField('institute_type', value)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutorial">Tutorial</SelectItem>
                <SelectItem value="School">School</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="text-sm">Summer Camp Enabled</Label>
              <p className="text-xs text-muted-foreground">Show Summer Camp packages, fees, attendance & dashboard for this tenant.</p>
            </div>
            <Switch checked={summerCampEnabled} onCheckedChange={setSummerCampEnabled} />
          </div>
          <div>
            <Label>New Password (optional)</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters. Leave empty to keep existing password.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={submitting || !isDirty} className="flex-1">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/platform-admin/tenants/${id}`)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlatformTenantEdit;
