import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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

const AdminDailyLearnings = () => {
  const { config } = useTenant();
  const tenantId = config.id;

  const [learnings, setLearnings] = useState<DailyLearning[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logClass, setLogClass] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [studentId, setStudentId] = useState('');

  // Filter
  const [filterClass, setFilterClass] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    const [{ data: lData }, { data: sData }] = await Promise.all([
      supabase.from('daily_learnings').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('students').select('id, student_name, class').eq('tenant_id', tenantId).eq('status', 'active').order('student_name'),
    ]);
    setLearnings((lData as DailyLearning[]) || []);
    setStudents((sData as Student[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tenantId]);

  const resetForm = () => {
    setLogDate(new Date().toISOString().slice(0, 10));
    setLogClass('');
    setTopic('');
    setNotes('');
    setStudentId('');
  };

  const handleSubmit = async () => {
    if (!logClass || !topic.trim()) {
      toast({ title: 'Class and Topic are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('daily_learnings').insert({
      tenant_id: tenantId,
      date: logDate,
      class: logClass,
      topic: topic.trim(),
      notes: notes.trim() || null,
      student_id: studentId || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Failed to log', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Learning logged!' });
      resetForm();
      setFormOpen(false);
      fetchData();
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('daily_learnings').delete().eq('id', id);
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

  const studentsForClass = useMemo(() =>
    logClass ? students.filter(s => s.class === logClass) : students,
    [logClass, students]
  );

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

      {/* Filter */}
      <div className="w-40">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
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
                {l.student_id && (
                  <Badge variant="secondary" className="text-xs">
                    {studentMap[l.student_id] || 'Student'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Daily Learning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
              </div>
              <div>
                <Label>Class *</Label>
                <Select value={logClass} onValueChange={v => { setLogClass(v); setStudentId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Topic Covered *</Label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Newton's Laws of Motion" />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." rows={2} />
            </div>
            <div>
              <Label>Student (optional)</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="All students" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All students</SelectItem>
                  {studentsForClass.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.student_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
