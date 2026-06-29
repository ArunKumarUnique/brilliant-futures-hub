import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
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

type Recipient = 'entire_class' | 'students';

const AdminHomework = () => {
  const { tenantId } = useAdmin();

  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Form state — new order: Class → Student(s) → Title → Description → Date → Due
  const [selectedClass, setSelectedClass] = useState('');
  const [recipient, setRecipient] = useState<Recipient>('entire_class');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedDate, setAssignedDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assignedDateOpen, setAssignedDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  // Filters
  const [filterClass, setFilterClass] = useState('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterDateOpen, setFilterDateOpen] = useState(false);

  const fetchHomework = async () => {
    if (!tenantId) { setHomework([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('homework')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('assigned_date', { ascending: false })
      .order('created_at', { ascending: false });
    setHomework(data || []);
    setLoading(false);
  };

  const fetchStudents = async () => {
    if (!tenantId) { setStudents([]); return; }
    const { data } = await supabase
      .from('students')
      .select('id, student_name, class')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');
    setStudents(data || []);
  };

  useEffect(() => {
    fetchHomework();
    fetchStudents();
  }, [tenantId]);

  const resetForm = () => {
    setSelectedClass('');
    setRecipient('entire_class');
    setSelectedStudents([]);
    setTitle('');
    setDescription('');
    setAssignedDate(new Date());
    setDueDate(undefined);
  };

  const studentsForClass = useMemo(
    () => (selectedClass ? students.filter(s => s.class === selectedClass) : []),
    [selectedClass, students]
  );

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      return;
    }
    if (!selectedClass) {
      toast({ title: 'Validation Error', description: 'Class is required', variant: 'destructive' });
      return;
    }
    if (recipient === 'students' && selectedStudents.length === 0) {
      toast({ title: 'Validation Error', description: 'Select at least one student', variant: 'destructive' });
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast({ title: 'Validation Error', description: 'Title and Description are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const assignedStr = format(assignedDate, 'yyyy-MM-dd');
    const dueStr = dueDate ? format(dueDate, 'yyyy-MM-dd') : null;

    try {
      if (recipient === 'students') {
        // Duplicate check per student
        const { data: existing } = await supabase
          .from('homework')
          .select('student_id')
          .eq('tenant_id', tenantId)
          .eq('assigned_date', assignedStr)
          .in('student_id', selectedStudents);
        const dupIds = new Set((existing || []).map((r: any) => r.student_id));
        if (dupIds.size > 0) {
          const names = students.filter(s => dupIds.has(s.id)).map(s => s.student_name).join(', ');
          toast({
            title: 'Duplicate Homework',
            description: `Homework already exists for this student on the selected date: ${names}`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
        const rows = selectedStudents.map(sid => ({
          tenant_id: tenantId,
          title: title.trim(),
          description: description.trim(),
          class: selectedClass,
          student_id: sid,
          assigned_date: assignedStr,
          due_date: dueStr,
        }));
        const { error } = await supabase.from('homework').insert(rows as any);
        if (error) throw error;
      } else {
        // entire class — single row, student_id null
        const { error } = await supabase.from('homework').insert({
          tenant_id: tenantId,
          title: title.trim(),
          description: description.trim(),
          class: selectedClass,
          student_id: null,
          assigned_date: assignedStr,
          due_date: dueStr,
        } as any);
        if (error) throw error;
      }

      toast({ title: 'Homework assigned successfully!' });
      resetForm();
      setFormOpen(false);
      fetchHomework();
    } catch (e: any) {
      toast({ title: 'Failed to assign homework', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
        <Popover open={filterDateOpen} onOpenChange={setFilterDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-2", filterDate && "text-primary")}>
              <Filter className="w-4 h-4" />
              {filterDate ? format(filterDate, 'dd MMM') : 'Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={(d) => { setFilterDate(d); setFilterDateOpen(false); }}
              disabled={(d) => d > new Date()}
              className="p-3 pointer-events-auto"
            />
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
                <span>Assigned: {format(new Date(hw.assigned_date), 'dd MMM yyyy')}</span>
                {hw.due_date && <span>Due: {format(new Date(hw.due_date), 'dd MMM yyyy')}</span>}
                {hw.student_id ? (
                  <Badge variant="secondary" className="text-xs">
                    {studentNameMap[hw.student_id] || 'Student'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Entire Class</Badge>
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
            {/* 1. Class */}
            <div>
              <Label>Class *</Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudents([]); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
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
                  <RadioGroupItem value="entire_class" id="r-class" />
                  <span className="text-sm">Entire Class</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="students" id="r-students" />
                  <span className="text-sm">Select Student(s)</span>
                </label>
              </RadioGroup>

              {recipient === 'students' && (
                <div className="border border-border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                  {!selectedClass ? (
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
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 exercises" />
            </div>

            {/* 4. Description */}
            <div>
              <Label>Description *</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Homework details..." rows={3} />
            </div>

            {/* 5 & 6. Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Homework Date</Label>
                <Popover open={assignedDateOpen} onOpenChange={setAssignedDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(assignedDate, 'dd MMM')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={assignedDate}
                      onSelect={d => { if (d) { setAssignedDate(d); setAssignedDateOpen(false); } }}
                      disabled={(d) => d > new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'dd MMM') : 'Optional'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={d => { setDueDate(d); setDueDateOpen(false); }}
                      className="p-3 pointer-events-auto"
                    />
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
