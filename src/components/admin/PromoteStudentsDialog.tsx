import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, GraduationCap, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface StudentRow {
  id: string;
  student_name: string;
  parent_name: string | null;
  student_mobile: string | null;
  parent_mobile: string;
  student_email: string | null;
  parent_email: string | null;
  class: string;
  package_id: string;
  monthly_fee: number;
  status: string;
  student_type: string;
  notes: string | null;
  gender: string | null;
  parent_relation: string | null;
}

const PromoteStudentsDialog = ({ open, onClose, onComplete }: Props) => {
  const { tenantId } = useAdmin();
  const { years } = useAcademicYear();

  const [fromYearId, setFromYearId] = useState('');
  const [toYearId, setToYearId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'select' | 'summary'>('select');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFromYearId(''); setToYearId(''); setSelectedClass('');
      setStudents([]); setSelected(new Set()); setStep('select');
    }
  }, [open]);

  useEffect(() => {
    const load = async () => {
      if (!tenantId || !fromYearId) { setStudents([]); return; }
      setLoading(true);
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('academic_year_id' as any, fromYearId)
        .eq('status', 'active')
        .order('student_name');
      setStudents((data || []) as any);
      setLoading(false);
    };
    load();
  }, [tenantId, fromYearId]);

  const classes = useMemo(
    () => Array.from(new Set(students.map(s => s.class).filter(Boolean))).sort(),
    [students],
  );

  const visible = useMemo(
    () => selectedClass ? students.filter(s => s.class === selectedClass) : students,
    [students, selectedClass],
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (visible.every(s => selected.has(s.id))) {
      const next = new Set(selected); visible.forEach(s => next.delete(s.id)); setSelected(next);
    } else {
      const next = new Set(selected); visible.forEach(s => next.add(s.id)); setSelected(next);
    }
  };

  const proceed = () => {
    if (!fromYearId || !toYearId) return toast({ title: 'Select both years', variant: 'destructive' });
    if (fromYearId === toYearId) return toast({ title: 'Choose a different target year', variant: 'destructive' });
    if (selected.size === 0) return toast({ title: 'Select at least one student', variant: 'destructive' });
    setStep('summary');
  };

  const confirm = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const chosen = students.filter(s => selected.has(s.id));
      const rows = chosen.map(s => ({
        tenant_id: tenantId,
        academic_year_id: toYearId,
        student_name: s.student_name,
        parent_name: s.parent_name,
        student_mobile: s.student_mobile,
        parent_mobile: s.parent_mobile,
        student_email: s.student_email,
        parent_email: s.parent_email,
        class: s.class,
        package_id: s.package_id,
        monthly_fee: s.monthly_fee,
        status: 'active',
        student_type: s.student_type,
        notes: s.notes,
        gender: s.gender,
        parent_relation: s.parent_relation,
      }));
      const { error } = await supabase.from('students').insert(rows as any);
      if (error) throw error;
      toast({ title: `Promoted ${rows.length} student${rows.length > 1 ? 's' : ''}` });
      onComplete();
      onClose();
    } catch (e: any) {
      toast({ title: 'Promotion failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fromYear = years.find(y => y.id === fromYearId);
  const toYear = years.find(y => y.id === toYearId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Promote Students
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Academic Year *</Label>
                <Select value={fromYearId} onValueChange={setFromYearId}>
                  <SelectTrigger><SelectValue placeholder="Current year" /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}{y.is_active ? ' • Active' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>To Academic Year *</Label>
                <Select value={toYearId} onValueChange={setToYearId}>
                  <SelectTrigger><SelectValue placeholder="Next year" /></SelectTrigger>
                  <SelectContent>
                    {years.filter(y => y.id !== fromYearId).map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Class Filter</Label>
              <Select value={selectedClass || 'all'} onValueChange={(v) => setSelectedClass(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Students {visible.length > 0 && `(${visible.length})`}</Label>
                {visible.length > 0 && (
                  <button type="button" className="text-xs text-primary hover:underline" onClick={toggleAll}>
                    {visible.every(s => selected.has(s.id)) ? 'Unselect all' : 'Select all'}
                  </button>
                )}
              </div>
              <div className="border border-border rounded-md max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Loading…</div>
                ) : !fromYearId ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Select a source year to see students.</div>
                ) : visible.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No students found.</div>
                ) : visible.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-2.5 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/40">
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.student_name}</div>
                      <div className="text-xs text-muted-foreground">{s.class}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={proceed}>Continue <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-3 text-sm">
                <Badge variant="outline" className="px-3 py-1">{fromYear?.name}</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge className="px-3 py-1 bg-primary text-primary-foreground">{toYear?.name}</Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{selected.size}</div>
                <div className="text-xs text-muted-foreground">Student{selected.size > 1 ? 's' : ''} to promote</div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                New records will be created in <b>{toYear?.name}</b>. Existing records in <b>{fromYear?.name}</b> stay untouched.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('select')} disabled={saving}>Back</Button>
              <Button onClick={confirm} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Promoting…</> : 'Confirm Promotion'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStudentsDialog;
