import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordField = ({ id, label, value, onChange, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

const ChangePasswordDialog = ({ open, onOpenChange }: Props) => {
  const { adminEmail, tenantId, logout } = useAdmin();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [credExists, setCredExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrent(''); setNext(''); setConfirm('');
      return;
    }
    if (!adminEmail || !tenantId) return;
    setChecking(true);
    (async () => {
      const { data } = await supabase
        .from('tenant_admin_credentials')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();
      setCredExists(!!data);
      setChecking(false);
    })();
  }, [open, adminEmail, tenantId]);

  const errors = {
    current: !current ? 'Required' : '',
    next: !next ? 'Required' : next.length < 8 ? 'Minimum 8 characters' : '',
    confirm: !confirm ? 'Required' : confirm !== next ? 'Passwords do not match' : '',
  };
  const showErrors = submitting || (!!current || !!next || !!confirm);
  const canSubmit = !errors.current && !errors.next && !errors.confirm && credExists === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !adminEmail) return;
    setSubmitting(true);
    try {
      // 1. Verify current password (scoped to current admin email only)
      const { data: cred, error: vErr } = await supabase
        .from('tenant_admin_credentials')
        .select('id, temp_password')
        .eq('email', adminEmail)
        .maybeSingle();
      if (vErr || !cred) {
        toast({ title: 'Unable to verify account', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      if (cred.temp_password !== current) {
        toast({ title: 'Incorrect current password', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      // 2. Update password (only this admin's row)
      const { error: uErr } = await supabase
        .from('tenant_admin_credentials')
        .update({ temp_password: next, must_change_password: false })
        .eq('id', cred.id);
      if (uErr) {
        toast({ title: 'Update failed', description: uErr.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      toast({ title: 'Password updated', description: 'Please sign in again.' });
      setSubmitting(false);
      onOpenChange(false);
      logout();
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Try again', variant: 'destructive' });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>You will be signed out after a successful update.</DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading…
          </div>
        ) : credExists === false ? (
          <div className="py-4 text-sm text-muted-foreground bg-muted rounded-md p-3">
            Password changes are not available for this account. Please contact your platform administrator.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField id="cp-current" label="Current Password" value={current} onChange={setCurrent} error={showErrors ? errors.current : ''} />
            <PasswordField id="cp-new" label="New Password" value={next} onChange={setNext} error={showErrors ? errors.next : ''} />
            <PasswordField id="cp-confirm" label="Confirm New Password" value={confirm} onChange={setConfirm} error={showErrors ? errors.confirm : ''} />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
