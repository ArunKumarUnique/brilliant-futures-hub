import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Plus, BookOpen, Loader2, Trash2, CalendarIcon } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DailyLearning {
  id: string;
  date: string;
  class: string;
  topic: string;
  notes: string | null;
  student_id: string | null;
  created_at: string;
}

interface Student {
  id: string;
  student_name: string;
  class: string;
}

const CLASS_OPTIONS = [
  'Below 4th Class', '4th Class', '5th Class', '6th Class', '7th Class',
  '8th Class', '9th Class', '10th Class',
];

type Recipient = 'entire_class' | 'students';

const AdminDailyLearnings = () => {
  const { tenantId } = useAdmin();
  const { selectedYearId } = useAcademicYear();


  const [learnings, setLearnings] = useState<DailyLearning[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form — new order: Class → Student(s) → Title → Description → Date
  const [logClass, setLogClass] = useState('');
  const [recipient, setRecipient] = useState<Recipient>('entire_class');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState<Date>(startOfDay(new Date()));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [filterClass, setFilterClass] = useState('all');

  const fetchData = async () => {
    if (!tenantId) { setLearnings([]); setStudents([]); setLoading(false); return; }
    if (!selectedYearId) { setLearnings([]); setStudents([]); setLoading(false); return; }
    setLoading(true);
    const [{ data: lData }, { data: sData }] = await Promise.all([
      supabase.from('daily_learnings').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }).order('created_at', { ascending: false }),
      (supabase as any).from('students').select('id, student_name, class').eq('tenant_id', tenantId).eq('academic_year_id', selectedYearId).eq('status', 'active').order('student_name'),
    ]);
    setLearnings((lData as DailyLearning[]) || []);
    setStudents((sData as Student[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tenantId, selectedYearId]);


  const resetForm = () => {
    setLogClass('');
    setRecipient('entire_class');
    setSelectedStudents([]);
    setTitle('');
    setNotes('');
    setLogDate(startOfDay(new Date()));
  };

  const studentsForClass = useMemo(
    () => (logClass ? students.filter(s => s.class === logClass) : []),
    [logClass, students]
  );

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      return;
    }
    if (!logClass) {
      toast({ title: 'Validation Error', description: 'Class is required', variant: 'destructive' });
      return;
    }
    if (recipient === 'students' && selectedStudents.length === 0) {
      toast({ title: 'Validation Error', description: 'Select at least one student', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const dateStr = format(logDate, 'yyyy-MM-dd');
    try {
      if (recipient === 'students') {
        const { data: existing } = await supabase
          .from('daily_learnings')
          .select('student_id')
          .eq('tenant_id', tenantId)
          .eq('date', dateStr)
          .in('student_id', selectedStudents);
        const dupIds = new Set((existing || []).map((r: any) => r.student_id));
        if (dupIds.size > 0) {
          const names = students.filter(s => dupIds.has(s.id)).map(s => s.student_name).join(', ');
          toast({
            title: 'Duplicate Daily Learning',
            description: `Daily Learning already exists for this student on the selected date: ${names}`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
        const rows = selectedStudents.map(sid => ({
          tenant_id: tenantId,
          date: dateStr,
          class: logClass,
          topic: title.trim(),
          notes: notes.trim() || null,
          student_id: sid,
        }));
        const { error } = await supabase.from('daily_learnings').insert(rows);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('daily_learnings').insert({
          tenant_id: tenantId,
          date: dateStr,
          class: logClass,
          topic: title.trim(),
          notes: notes.trim() || null,
          student_id: null,
        });
        if (error) throw error;
      }
      toast({ title: 'Learning logged!' });
      resetForm();
      setFormOpen(false);
      fetchData();
    } catch (e: any) {
      toast({ title: 'Failed to log', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!tenantId) return;
    await supabase.from('daily_learnings').delete().eq('id', id).eq('tenant_id', tenantId);
    toast({ title: 'Entry deleted' });
    fetchData();
  };

  const filtered = useMemo(() => {
    if (filterClass === 'all') return learnings;
    return learnings.filter(l => l.class === filterClass);
  }, [learnings, filterClass]);

  const studentMap = useMemo(() => {
    const m: Record<string, string> = {};
    students.forEach(s => { m[s.id] = s.student_name; });
    return m;
  }, [students]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Learnings</h1>
          <p className="text-sm text-muted-foreground">Log topics covered each day</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Log Learning
        </Button>
      </div>

      <div className="w-40">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No learnings logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(l => (
            <div key={l.id} className="bg-card border border-border rounded-lg p-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground text-sm">{l.topic}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{l.class}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteEntry(l.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {l.notes && <p className="text-sm text-muted-foreground line-clamp-2">{l.notes}</p>}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{format(new Date(l.date), 'dd MMM yyyy')}</span>
                {l.student_id ? (
                  <Badge variant="secondary" className="text-xs">{studentMap[l.student_id] || 'Student'}</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Entire Class</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Daily Learning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 1. Class */}
            <div>
              <Label>Class *</Label>
              <Select value={logClass} onValueChange={v => { setLogClass(v); setSelectedStudents([]); }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Student(s) */}
            <div className="space-y-2">
              <Label>Recipients *</Label>
              <RadioGroup
                value={recipient}
                onValueChange={(v) => { setRecipient(v as Recipient); setSelectedStudents([]); }}
                className="flex flex-wrap gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="entire_class" id="dl-r-class" />
                  <span className="text-sm">Entire Class</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="students" id="dl-r-students" />
                  <span className="text-sm">Select Student(s)</span>
                </label>
              </RadioGroup>

              {recipient === 'students' && (
                <div className="border border-border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                  {!logClass ? (
                    <p className="text-xs text-muted-foreground p-2">Select a class first.</p>
                  ) : studentsForClass.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">No active students in this class.</p>
                  ) : (
                    studentsForClass.map(s => (
                      <label key={s.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer">
                        <Checkbox
                          checked={selectedStudents.includes(s.id)}
                          onCheckedChange={() => toggleStudent(s.id)}
                        />
                        <span className="text-sm">{s.student_name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 3. Title */}
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Newton's Laws of Motion" />
            </div>

            {/* 4. Description */}
            <div>
              <Label>Description</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Topics covered, details..." rows={3} />
            </div>

            {/* 5. Learning Date */}
            <div>
              <Label>Learning Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !logDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {logDate ? format(logDate, 'dd MMM yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={logDate}
                    onSelect={(d) => { if (d) { setLogDate(startOfDay(d)); setDatePickerOpen(false); } }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Log Learning'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDailyLearnings;
