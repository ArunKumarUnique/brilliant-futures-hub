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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Plus, CalendarIcon, BookOpen, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  class: string;
  student_id: string | null;
  assigned_date: string;
  due_date: string | null;
  status: string;
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

const SUBJECT_OPTIONS = [
  'Telugu', 'Hindi', 'English', 'Maths', 'Science', 'Social', 'Physics', 'Chemistry', 'Other',
];

const AdminHomework = () => {
  const { config } = useTenant();
  const tenantId = config.id;

  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assignedDate, setAssignedDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Filters
  const [filterClass, setFilterClass] = useState('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>();

  const fetchHomework = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('assigned_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error && data) setHomework(data);
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('id, student_name, class')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');
    if (data) setStudents(data);
  };

  useEffect(() => {
    fetchHomework();
    fetchStudents();
  }, [tenantId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setSelectedClass('');
    setSelectedStudent('');
    setAssignedDate(new Date());
    setDueDate(undefined);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: 'Title and Description are required', variant: 'destructive' });
      return;
    }
    const hwClass = selectedStudent
      ? students.find(s => s.id === selectedStudent)?.class || selectedClass
      : selectedClass;

    if (!hwClass) {
      toast({ title: 'Please select a class or student', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('homework').insert({
      tenant_id: tenantId,
      title: title.trim(),
      description: description.trim(),
      subject: subject || null,
      class: hwClass,
      student_id: selectedStudent || null,
      assigned_date: format(assignedDate, 'yyyy-MM-dd'),
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
    });

    setSaving(false);
    if (error) {
      toast({ title: 'Failed to assign homework', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Homework assigned successfully!' });
      resetForm();
      setFormOpen(false);
      fetchHomework();
    }
  };

  const studentsForClass = useMemo(() =>
    selectedClass ? students.filter(s => s.class === selectedClass) : students,
    [selectedClass, students]
  );

  const filtered = useMemo(() => {
    let list = homework;
    if (filterClass !== 'all') list = list.filter(h => h.class === filterClass);
    if (filterDate) {
      const fd = format(filterDate, 'yyyy-MM-dd');
      list = list.filter(h => h.assigned_date === fd);
    }
    return list;
  }, [homework, filterClass, filterDate]);

  const studentNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    students.forEach(s => { m[s.id] = s.student_name; });
    return m;
  }, [students]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Homework</h1>
          <p className="text-sm text-muted-foreground">Assign and track homework</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Assign Homework
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="w-40">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-2", filterDate && "text-primary")}>
              <Filter className="w-4 h-4" />
              {filterDate ? format(filterDate, 'dd MMM') : 'Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        {filterDate && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate(undefined)}>Clear</Button>
        )}
      </div>

      {/* Homework List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No homework found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(hw => (
            <div key={hw.id} className="bg-card border border-border rounded-lg p-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground text-sm">{hw.title}</h3>
                <Badge variant="outline" className="shrink-0 text-xs">{hw.class}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{hw.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {hw.subject && <span className="bg-muted px-2 py-0.5 rounded">{hw.subject}</span>}
                <span>Assigned: {format(new Date(hw.assigned_date), 'dd MMM yyyy')}</span>
                {hw.due_date && <span>Due: {format(new Date(hw.due_date), 'dd MMM yyyy')}</span>}
                {hw.student_id && (
                  <Badge variant="secondary" className="text-xs">
                    {studentNameMap[hw.student_id] || 'Student'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Homework Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Homework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 exercises" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Homework details..." rows={3} />
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudent(''); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student (optional – overrides class)</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="All students in class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All students in class</SelectItem>
                  {studentsForClass.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.student_name} ({s.class})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(assignedDate, 'dd MMM')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={assignedDate} onSelect={d => d && setAssignedDate(d)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'dd MMM') : 'Optional'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={saving} className="w-full sticky bottom-0">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Assigning...</> : 'Assign Homework'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomework;
