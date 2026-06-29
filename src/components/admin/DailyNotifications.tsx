import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Copy, Check, Loader2 } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  generateNotification,
  sendBulkNotifications,
  NotificationKind,
  GeneratedNotification,
  HomeworkItem,
  LearningItem,
  StudentRecipient,
} from '@/lib/notificationService';

type Audience = 'single' | 'multiple' | 'class' | 'institute';

interface Props {
  instituteName: string;
  tenantId: string;
}

const DailyNotifications = ({ instituteName, tenantId }: Props) => {
  const [kind, setKind] = useState<NotificationKind>('both');
  const [audience, setAudience] = useState<Audience>('institute');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [singleStudent, setSingleStudent] = useState('');
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [dateOpen, setDateOpen] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [generated, setGenerated] = useState<GeneratedNotification[]>([]);
  const [preview, setPreview] = useState('');
  const [copied, setCopied] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data: students = [] } = useQuery({
    queryKey: ['dn-students', tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id, student_name, class, parent_name, parent_mobile, gender, parent_relation')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('student_name');
      return (data || []) as any[];
    },
  });

  const { data: homework = [] } = useQuery({
    queryKey: ['dn-homework', tenantId, dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from('homework')
        .select('class, title, description, due_date, student_id')
        .eq('tenant_id', tenantId)
        .eq('assigned_date', dateStr);
      return (data || []) as any[];
    },
  });

  const { data: learnings = [] } = useQuery({
    queryKey: ['dn-learnings', tenantId, dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_learnings')
        .select('class, topic, notes, student_id')
        .eq('tenant_id', tenantId)
        .eq('date', dateStr);
      return (data || []) as any[];
    },
  });

  const classes = useMemo(
    () => Array.from(new Set(students.map(s => s.class).filter(Boolean))).sort(),
    [students]
  );

  const studentsForClass = useMemo(
    () => (selectedClass ? students.filter(s => s.class === selectedClass) : []),
    [selectedClass, students]
  );

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const resolveRecipients = (): StudentRecipient[] => {
    if (audience === 'single') {
      return students.filter(s => s.id === singleStudent);
    }
    if (audience === 'multiple') {
      return students.filter(s => selectedStudents.includes(s.id));
    }
    if (audience === 'class') {
      return students.filter(s => s.class === selectedClass);
    }
    return students;
  };

  const itemsForStudent = (s: StudentRecipient) => {
    const hw: HomeworkItem[] = homework
      .filter(h => h.student_id === s.id || (!h.student_id && h.class === s.class))
      .map(h => ({ title: h.title, description: h.description, due_date: h.due_date }));
    const learn: LearningItem[] = learnings
      .filter(l => l.student_id === s.id || (!l.student_id && l.class === s.class))
      .map(l => ({ title: l.topic, topics: l.notes || l.topic }));
    return { hw, learn };
  };

  const handleGenerate = async () => {
    if (audience === 'single' && !singleStudent) {
      toast.error('Select a student');
      return;
    }
    if (audience === 'multiple' && selectedStudents.length === 0) {
      toast.error('Select at least one student');
      return;
    }
    if (audience === 'class' && !selectedClass) {
      toast.error('Select a class');
      return;
    }

    setGenerating(true);
    try {
      const recipients = resolveRecipients();
      if (recipients.length === 0) {
        toast.error('No students match the selection');
        setGenerating(false);
        return;
      }

      const dateLabel = format(date, 'dd MMM yyyy');
      const notes: GeneratedNotification[] = recipients.map(s => {
        const { hw, learn } = itemsForStudent(s);
        const message = generateNotification(kind, s, {
          instituteName,
          dateLabel,
          homework: kind === 'learning' ? [] : hw,
          learning: kind === 'homework' ? [] : learn,
        });
        return {
          studentId: s.id,
          studentName: s.student_name,
          parentMobile: s.parent_mobile,
          message,
        };
      });

      setGenerated(notes);
      const combinedPreview = notes
        .map(n => `─── ${n.studentName} ───\n${n.message}`)
        .join('\n\n');
      setPreview(combinedPreview);
      toast.success(`Generated ${notes.length} notification${notes.length > 1 ? 's' : ''}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      toast.success('Message copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }, [preview]);

  const handleSend = async () => {
    if (generated.length === 0) {
      toast.error('Generate notifications first');
      return;
    }
    setSending(true);
    try {
      const res = await sendBulkNotifications(generated);
      const okCount = res.filter(r => r.success).length;
      toast.success(`Simulated send: ${okCount}/${res.length} delivered (no SMS provider configured)`);
    } catch (e: any) {
      toast.error(e.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-5">
        {/* Notification Type */}
        <div className="space-y-2">
          <Label>Notification Type *</Label>
          <RadioGroup value={kind} onValueChange={(v) => setKind(v as NotificationKind)} className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="homework" id="kind-hw" />
              <span className="text-sm">Homework</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="learning" id="kind-l" />
              <span className="text-sm">Daily Learning</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="both" id="kind-b" />
              <span className="text-sm">Both</span>
            </label>
          </RadioGroup>
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <Label>Recipients *</Label>
          <RadioGroup
            value={audience}
            onValueChange={(v) => {
              setAudience(v as Audience);
              setSelectedStudents([]);
              setSingleStudent('');
            }}
            className="grid grid-cols-2 gap-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="single" id="a-single" />
              <span className="text-sm">Single Student</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="multiple" id="a-multi" />
              <span className="text-sm">Multiple Students</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="class" id="a-class" />
              <span className="text-sm">Entire Class</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="institute" id="a-inst" />
              <span className="text-sm">Entire Institute</span>
            </label>
          </RadioGroup>
        </div>

        {/* Class selector (for class & multiple) */}
        {(audience === 'class' || audience === 'multiple') && (
          <div className="space-y-2">
            <Label>Class *</Label>
            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudents([]); }}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Single student */}
        {audience === 'single' && (
          <div className="space-y-2">
            <Label>Student *</Label>
            <Select value={singleStudent} onValueChange={setSingleStudent}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.student_name} • {s.class}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Multiple students */}
        {audience === 'multiple' && selectedClass && (
          <div className="space-y-2">
            <Label>Students *</Label>
            <div className="border border-border rounded-md p-2 max-h-44 overflow-y-auto space-y-1">
              {studentsForClass.length === 0 ? (
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
          </div>
        )}

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'dd MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { if (d) { setDate(startOfDay(d)); setDateOpen(false); } }}
                disabled={(d) => d > new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Generate */}
        <Button onClick={handleGenerate} disabled={generating} className="w-full">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</> : 'Generate Notifications'}
        </Button>

        {/* Preview */}
        {preview && (
          <div className="space-y-3 mt-2">
            <Label className="text-sm font-medium">
              Preview ({generated.length} message{generated.length > 1 ? 's' : ''})
            </Label>
            <Textarea
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              className="min-h-[200px] text-sm font-mono"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Message'}
              </Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Notifications'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send is currently simulated. SMS providers (MSG91, Twilio, TextLocal, Exotel) can be plugged in later
              by replacing the NotificationService implementation – no UI changes required.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyNotifications;
