import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, Building2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

type Step = 'verify' | 'reset';

interface VerifiedCtx {
  credId: string;
  tenantName: string;
  tenantId: string;
}

const AdminForgotPassword = () => {
  const { config } = useTenant();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('verify');
  const [tenantEmail, setTenantEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState<VerifiedCtx | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantEmail.trim() || !adminEmail.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const tEmail = tenantEmail.trim().toLowerCase();
    const aEmail = adminEmail.trim().toLowerCase();
    try {
      // 1. Find tenant by registry email
      const { data: tenant } = await supabase
        .from('tenants_registry')
        .select('id, tenant_id, institute_name, forgot_password_enabled, status')
        .eq('email', tEmail)
        .maybeSingle();
      if (!tenant) {
        toast({ title: 'Invalid tenant', description: 'No tenant matches that email.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      if (tenant.status !== 'active') {
        toast({ title: 'Tenant is not active', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      if (!tenant.forgot_password_enabled) {
        toast({
          title: 'Forgot password disabled',
          description: 'Forgot password is disabled for this tenant. Please contact platform administrator.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }
      // 2. Strict: admin credential row must belong to THIS tenant
      const { data: cred } = await supabase
        .from('tenant_admin_credentials')
        .select('id')
        .eq('tenant_registry_id', tenant.id)
        .eq('email', aEmail)
        .maybeSingle();
      if (!cred) {
        toast({ title: 'Invalid admin email for this tenant', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      setVerified({ credId: cred.id, tenantName: tenant.institute_name, tenantId: tenant.tenant_id });
      setStep('reset');
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const pwdError = !newPwd ? 'Required' : newPwd.length < 8 ? 'Minimum 8 characters' : '';
  const confirmError = !confirmPwd ? 'Required' : confirmPwd !== newPwd ? 'Passwords do not match' : '';
  const canReset = !pwdError && !confirmError && !!verified;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReset || !verified) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('tenant_admin_credentials')
      .update({ temp_password: newPwd, must_change_password: false })
      .eq('id', verified.credId);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Password reset', description: 'Sign in with your new password.' });
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === 'verify' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {step === 'verify'
                ? 'Verify your tenant and admin email to reset.'
                : `Set a new password for ${verified?.tenantName}.`}
            </p>
          </div>

          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Tenant Email</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="tenant-email"
                    type="email"
                    placeholder="institute@example.com"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Verify
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pwd">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-pwd"
                    type={showNew ? 'text' : 'password'}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPwd && pwdError && <p className="text-xs text-destructive">{pwdError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-pwd"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPwd && confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={!canReset || submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
