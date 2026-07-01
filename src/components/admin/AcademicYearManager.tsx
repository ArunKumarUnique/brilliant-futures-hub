import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAcademicYear, AcademicYear } from '@/contexts/AcademicYearContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, CheckCircle2, Calendar } from 'lucide-react';

const AcademicYearManager = () => {
  const { years, createYear, updateYear, setActiveYear, loading } = useAcademicYear();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [makeActive, setMakeActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => { setName(''); setStartDate(''); setEndDate(''); setMakeActive(false); setEditing(null); };

  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (y: AcademicYear) => {
    setEditing(y);
    setName(y.name);
    setStartDate(y.start_date || '');
    setEndDate(y.end_date || '');
    setMakeActive(y.is_active);
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setBusy(true);
    try {
      if (editing) {
        await updateYear(editing.id, {
          name: name.trim(),
          start_date: startDate || null,
          end_date: endDate || null,
        });
        if (makeActive && !editing.is_active) await setActiveYear(editing.id);
        toast({ title: 'Academic year updated' });
      } else {
        await createYear({ name: name.trim(), start_date: startDate, end_date: endDate, is_active: makeActive });
        toast({ title: 'Academic year created' });
      }
      setOpen(false); reset();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const handleMakeActive = async (y: AcademicYear) => {
    if (y.is_active) return;
    try {
      await setActiveYear(y.id);
      toast({ title: `${y.name} is now the active year` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Academic Year Configuration</h2>
          <p className="text-xs text-muted-foreground mt-1">Create academic years and mark one as active. The active year drives the whole app.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> New Academic Year</Button>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        ) : years.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No academic years yet. Create one to get started.</div>
        ) : years.map(y => (
          <div key={y.id} className="flex items-center justify-between gap-3 p-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{y.name}</span>
                  {y.is_active && <Badge className="bg-secondary text-secondary-foreground">Active</Badge>}
                </div>
                {(y.start_date || y.end_date) && (
                  <div className="text-xs text-muted-foreground">
                    {y.start_date || '—'} to {y.end_date || '—'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!y.is_active && (
                <Button size="sm" variant="outline" onClick={() => handleMakeActive(y)}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Active
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => openEdit(y)} title="Edit">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Academic Year' : 'Create Academic Year'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input placeholder="e.g. 2026-2027" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
              <input type="checkbox" checked={makeActive} onChange={e => setMakeActive(e.target.checked)} />
              Mark as active academic year
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : (editing ? 'Save Changes' : 'Create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AcademicYearManager;
