import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Upload, Trash2, Loader2, Save, ImagePlus, KeyRound } from 'lucide-react';
import ChangePasswordDialog from '@/components/admin/ChangePasswordDialog';
import ImageCropperDialog from '@/components/admin/ImageCropperDialog';

interface TenantProfile {
  id: string;
  tenant_id: string;
  institute_name: string;
  owner_first_name: string;
  owner_last_name: string;
  email: string;
  mobile: string;
  alternate_mobile: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logo_url: string | null;
  website: string | null;
  whatsapp_number: string | null;
  description: string | null;
  timings: string | null;
  established_year: number | null;
}

const EMPTY = (): Partial<TenantProfile> => ({
  institute_name: '',
  owner_first_name: '',
  owner_last_name: '',
  email: '',
  mobile: '',
  alternate_mobile: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  logo_url: '',
  website: '',
  whatsapp_number: '',
  description: '',
  timings: '',
  established_year: null,
});

const isValidMobile = (v: string) => !v || /^\d{10}$/.test(v);


const AdminProfile = () => {
  const { tenantId, refreshTenantProfile } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<TenantProfile>>(EMPTY());
  const [original, setOriginal] = useState<Partial<TenantProfile>>(EMPTY());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingNav = useRef<null | (() => void)>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from('tenants_registry')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (data) {
        setForm(data as TenantProfile);
        setOriginal(data as TenantProfile);
      }
      setLoading(false);
    };
    load();
  }, [tenantId]);

  const dirty = useMemo(() => {
    const keys: (keyof TenantProfile)[] = [
      'institute_name','owner_first_name','owner_last_name','email','mobile','alternate_mobile',
      'address','city','state','pincode','logo_url','website','whatsapp_number',
      'description','timings','established_year',
    ];
    return keys.some(k => (form[k] ?? '') !== (original[k] ?? ''));
  }, [form, original]);

  const update = (k: keyof TenantProfile, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 5MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCroppedBlob = async (blob: Blob) => {
    setCropSrc(null);
    const previousLogo = form.logo_url;
    const localPreview = URL.createObjectURL(blob);
    setLogoPreview(localPreview);
    try {
      setUploading(true);
      setUploadPct(15);
      const path = `${tenantId}/logo-${Date.now()}.png`;
      const tick = setInterval(() => setUploadPct(p => Math.min(85, p + 7)), 120);
      const { error } = await supabase.storage.from('tenant-logos').upload(path, blob, {
        contentType: 'image/png', upsert: true,
      });
      clearInterval(tick);
      if (error) throw error;
      setUploadPct(100);
      const { data } = supabase.storage.from('tenant-logos').getPublicUrl(path);
      update('logo_url', data.publicUrl);
      toast({ title: 'Logo ready', description: 'Click Save to apply' });
    } catch (err: any) {
      setLogoPreview(null);
      update('logo_url', previousLogo || '');
      toast({ title: 'Upload failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadPct(0), 600);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    update('logo_url', '');
  };

  const handleSave = async () => {
    if (!tenantId) return;
    if (!form.institute_name?.trim()) { toast({ title: 'Institute name required', variant: 'destructive' }); return; }
    if (!isValidMobile(form.mobile || '')) { toast({ title: 'Mobile must be 10 digits', variant: 'destructive' }); return; }
    if (form.alternate_mobile && !isValidMobile(form.alternate_mobile)) { toast({ title: 'Alternate mobile must be 10 digits', variant: 'destructive' }); return; }
    if (form.whatsapp_number && !isValidMobile(form.whatsapp_number)) { toast({ title: 'WhatsApp number must be 10 digits', variant: 'destructive' }); return; }

    setSaving(true);
    const payload = {
      institute_name: form.institute_name?.trim(),
      owner_first_name: form.owner_first_name?.trim() || '',
      owner_last_name: form.owner_last_name?.trim() || '',
      email: form.email?.trim() || '',
      mobile: form.mobile?.trim() || '',
      alternate_mobile: form.alternate_mobile?.trim() || null,
      address: form.address?.trim() || '',
      city: form.city?.trim() || '',
      state: form.state?.trim() || '',
      pincode: form.pincode?.trim() || '',
      logo_url: form.logo_url || null,
      website: form.website?.trim() || null,
      whatsapp_number: form.whatsapp_number?.trim() || null,
      description: form.description?.trim() || null,
      timings: form.timings?.trim() || null,
      established_year: form.established_year ? Number(form.established_year) : null,
    };
    const { error } = await supabase
      .from('tenants_registry')
      .update(payload)
      .eq('tenant_id', tenantId);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    setOriginal({ ...form });
    setLogoPreview(null);
    await refreshTenantProfile();
    toast({ title: 'Profile updated successfully' });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    );
  }

  const initials = (form.institute_name || 'T').trim().charAt(0).toUpperCase();
  const currentLogo = logoPreview || form.logo_url;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your institute details, branding and contact info.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPwdOpen(true)}>
          <KeyRound className="w-4 h-4 mr-1.5" /> Change Password
        </Button>
      </div>
      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />

      {/* Branding */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Branding</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {currentLogo ? (
              <img src={currentLogo} alt="Logo preview" loading="lazy" className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : (currentLogo ? <Upload className="w-4 h-4 mr-1.5" /> : <ImagePlus className="w-4 h-4 mr-1.5" />)}
              {currentLogo ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            {currentLogo && (
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Remove
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">PNG / JPG up to 5MB. Auto-resized to 512px.</p>
      </section>

      {/* Basic Details */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Basic Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Institute / Tutorial Name *</Label>
            <Input value={form.institute_name || ''} onChange={e => update('institute_name', e.target.value)} />
          </div>
          <div>
            <Label>Owner First Name</Label>
            <Input value={form.owner_first_name || ''} onChange={e => update('owner_first_name', e.target.value)} />
          </div>
          <div>
            <Label>Owner Last Name</Label>
            <Input value={form.owner_last_name || ''} onChange={e => update('owner_last_name', e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} />
          </div>
          <div>
            <Label>Mobile Number *</Label>
            <Input inputMode="numeric" maxLength={10} value={form.mobile || ''}
              onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div>
            <Label>Alternate Mobile</Label>
            <Input inputMode="numeric" maxLength={10} value={form.alternate_mobile || ''}
              onChange={e => update('alternate_mobile', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input inputMode="numeric" maxLength={6} value={form.pincode || ''}
              onChange={e => update('pincode', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Textarea rows={2} value={form.address || ''} onChange={e => update('address', e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city || ''} onChange={e => update('city', e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.state || ''} onChange={e => update('state', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Social & Contact */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Social & Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Website URL</Label>
            <Input placeholder="https://" value={form.website || ''} onChange={e => update('website', e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input inputMode="numeric" maxLength={10} value={form.whatsapp_number || ''}
              onChange={e => update('whatsapp_number', e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>
      </section>

      {/* Tuition Details */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tuition Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>About</Label>
            <Textarea rows={3} value={form.description || ''} onChange={e => update('description', e.target.value)} />
          </div>
          <div>
            <Label>Timings</Label>
            <Input placeholder="e.g. Mon–Sat, 4PM–8PM" value={form.timings || ''} onChange={e => update('timings', e.target.value)} />
          </div>
          <div>
            <Label>Established Year</Label>
            <Input inputMode="numeric" maxLength={4} value={form.established_year ?? ''}
              onChange={e => update('established_year', e.target.value.replace(/\D/g, '') || null)} />
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-3 border-t border-border flex items-center justify-end gap-3">
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminProfile;
