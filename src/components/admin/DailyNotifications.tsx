import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Copy, Check, Loader2, Send, Download, RefreshCw, History } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

import {
  buildMessage,
  isValidMobile,
  sendInBatches,
  NotificationKind,
  NotificationChannel,
  GeneratedNotification,
  HomeworkItem,
  LearningItem,
  StudentRecipient,
  SendProgress,
} from '@/lib/notificationService';

type Audience = 'single' | 'multiple' | 'class' | 'institute';

interface Props {
  instituteName: string;
  tenantId: string;
}

interface SkippedEntry {
  studentId: string;
  studentName: string;
  reason: string;
}

const DailyNotifications = ({ instituteName, tenantId }: Props) => {
  const queryClient = useQueryClient();
  const { selectedYearId } = useAcademicYear();


  const [kind, setKind] = useState<NotificationKind>('both');
  const [audience, setAudience] = useState<Audience>('institute');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [singleStudent, setSingleStudent] = useState('');
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [dateOpen, setDateOpen] = useState(false);

  // Channels (SMS active, WhatsApp/Email future)
  const [smsChannel, setSmsChannel] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedNotification[]>([]);
  const [skipped, setSkipped] = useState<SkippedEntry[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<SendProgress | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');
  const dateLabel = format(date, 'dd MMM yyyy');

  const { data: students = [] } = useQuery({
    queryKey: ['dn-students', tenantId, selectedYearId],
    enabled: !!selectedYearId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('students')
        .select('id, student_name, class, parent_name, parent_mobile, gender, parent_relation')
        .eq('tenant_id', tenantId)
        .eq('academic_year_id', selectedYearId)
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
    [students],
  );

  const studentsForClass = useMemo(
    () => (selectedClass ? students.filter(s => s.class === selectedClass) : []),
    [selectedClass, students],
  );

  const toggleStudent = (id: string) =>
    setSelectedStudents(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const resolveRecipients = (): StudentRecipient[] => {
    if (audience === 'single') return students.filter(s => s.id === singleStudent);
    if (audience === 'multiple') return students.filter(s => selectedStudents.includes(s.id));
    if (audience === 'class') return students.filter(s => s.class === selectedClass);
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
    if (audience === 'single' && !singleStudent) return toast.error('Select a student');
    if (audience === 'multiple' && selectedStudents.length === 0)
      return toast.error('Select at least one student');
    if (audience === 'class' && !selectedClass) return toast.error('Select a class');

    setGenerating(true);
    try {
      const recipients = resolveRecipients();
      setSelectedCount(recipients.length);
      if (!recipients.length) {
        toast.error('No students match the selection');
        setGenerated([]);
        setSkipped([]);
        return;
      }

      const okList: GeneratedNotification[] = [];
      const skipList: SkippedEntry[] = [];

      recipients.forEach(s => {
        const { hw, learn } = itemsForStudent(s);
        const hasHw = hw.length > 0;
        const hasLearn = learn.length > 0;

        let effectiveKind: NotificationKind | null = null;
        if (kind === 'homework') {
          if (!hasHw) { skipList.push({ studentId: s.id, studentName: s.student_name, reason: 'No Homework' }); return; }
          effectiveKind = 'homework';
        } else if (kind === 'learning') {
          if (!hasLearn) { skipList.push({ studentId: s.id, studentName: s.student_name, reason: 'No Daily Learning' }); return; }
          effectiveKind = 'learning';
        } else {
          if (!hasHw && !hasLearn) { skipList.push({ studentId: s.id, studentName: s.student_name, reason: 'No Homework & No Daily Learning' }); return; }
          if (hasHw && hasLearn) effectiveKind = 'both';
          else if (hasHw) effectiveKind = 'homework';
          else effectiveKind = 'learning';
        }

        const message = buildMessage(effectiveKind, s, {
          instituteName,
          dateLabel,
          homework: effectiveKind === 'learning' ? [] : hw,
          learning: effectiveKind === 'homework' ? [] : learn,
        });

        okList.push({
          studentId: s.id,
          studentName: s.student_name,
          gender: s.gender,
          parentName: s.parent_name,
          parentRelation: s.parent_relation,
          parentMobile: s.parent_mobile,
          className: s.class,
          kind: effectiveKind,
          message,
        });
      });

      setGenerated(okList);
      setSkipped(skipList);

      if (okList.length === 0) toast.warning('No notifications generated. All students skipped.');
      else toast.success(`Generated ${okList.length} • Skipped ${skipList.length}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const copyBody = useMemo(
    () =>
      generated
        .map(n => `─── ${n.studentName} (${n.className || ''}) ───\n${n.message}`)
        .join('\n\n'),
    [generated],
  );

  const handleCopy = useCallback(async () => {
    if (!generated.length) return;
    try {
      await navigator.clipboard.writeText(copyBody);
      setCopied(true);
      toast.success('Messages copied');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Copy failed');
    }
  }, [generated.length, copyBody]);

  const writeHistory = async (
    notifications: GeneratedNotification[],
    results: { studentId: string; success: boolean; failureReason?: string; provider: string }[],
    channel: NotificationChannel,
  ) => {
    const batch_id = (globalThis.crypto as any)?.randomUUID?.() ?? `${Date.now()}`;
    const rows = notifications.map(n => {
      const r = results.find(x => x.studentId === n.studentId);
      return {
        tenant_id: tenantId,
        batch_id,
        student_id: n.studentId,
        student_name: n.studentName,
        gender: n.gender || null,
        parent_name: n.parentName || null,
        parent_relation: n.parentRelation || null,
        parent_mobile: n.parentMobile || null,
        class: n.className || null,
        notification_type: n.kind,
        message: n.message,
        channel,
        provider: r?.provider || 'development',
        status: r?.success ? 'sent' : 'failed',
        failure_reason: r?.success ? null : r?.failureReason || 'Unknown error',
      };
    });
    if (!rows.length) return;
    const { error } = await supabase.from('notification_history' as any).insert(rows);
    if (error) console.error('[notification_history] insert failed', error);
  };

  const handleConfirmSend = () => {
    if (!generated.length) return toast.error('Generate notifications first');
    if (!smsChannel) return toast.error('Select at least one channel');
    setConfirmOpen(true);
  };

  const doSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setProgress({ total: generated.length, done: 0 });
    try {
      // pre-validate mobiles → mark invalid as skipped (do not send)
      const valid: GeneratedNotification[] = [];
      const invalidResults: { studentId: string; success: boolean; failureReason: string; provider: string }[] = [];
      generated.forEach(n => {
        if (isValidMobile(n.parentMobile)) valid.push(n);
        else invalidResults.push({
          studentId: n.studentId,
          success: false,
          provider: 'development',
          failureReason: 'Invalid mobile number',
        });
      });

      const results = await sendInBatches(
        valid,
        'sms',
        (p) => setProgress(p),
      );
      const allResults = [...invalidResults, ...results];

      await writeHistory(generated, allResults, 'sms');

      const okCount = allResults.filter(r => r.success).length;
      const failCount = allResults.length - okCount;
      toast.success(`Sent ${okCount} • Failed ${failCount} (Development Mode)`);
      queryClient.invalidateQueries({ queryKey: ['notification-history', tenantId] });
    } catch (e: any) {
      toast.error(e.message || 'Send failed');
    } finally {
      setSending(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-5">
          {/* Notification Type */}
          <div className="space-y-2">
            <Label>Notification Type *</Label>
            <RadioGroup value={kind} onValueChange={(v) => setKind(v as NotificationKind)} className="flex flex-wrap gap-4">
              {(['homework','learning','both'] as NotificationKind[]).map(k => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={k} id={`k-${k}`} />
                  <span className="text-sm capitalize">{k === 'both' ? 'Both' : k === 'learning' ? 'Daily Learning' : 'Homework'}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label>Recipients *</Label>
            <RadioGroup
              value={audience}
              onValueChange={(v) => { setAudience(v as Audience); setSelectedStudents([]); setSingleStudent(''); }}
              className="grid grid-cols-2 gap-2"
            >
              {[['single','Single Student'],['multiple','Multiple Students'],['class','Entire Class'],['institute','Entire Institute']].map(([v,l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={v} id={`a-${v}`} />
                  <span className="text-sm">{l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={smsChannel} onCheckedChange={(c) => setSmsChannel(!!c)} />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                <Checkbox checked={false} disabled />
                <span className="text-sm">WhatsApp <Badge variant="outline" className="ml-1 text-[10px]">Soon</Badge></span>
              </label>
              <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                <Checkbox checked={false} disabled />
                <span className="text-sm">Email <Badge variant="outline" className="ml-1 text-[10px]">Soon</Badge></span>
              </label>
            </div>
          </div>

          {(audience === 'class' || audience === 'multiple') && (
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudents([]); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          {audience === 'single' && (
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={singleStudent} onValueChange={setSingleStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.student_name} • {s.class}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {audience === 'multiple' && selectedClass && (
            <div className="space-y-2">
              <Label>Students *</Label>
              <div className="border border-border rounded-md p-2 max-h-44 overflow-y-auto space-y-1">
                {studentsForClass.length === 0
                  ? <p className="text-xs text-muted-foreground p-2">No active students in this class.</p>
                  : studentsForClass.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer">
                      <Checkbox checked={selectedStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                      <span className="text-sm">{s.student_name}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />{format(date, 'dd MMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date}
                  onSelect={(d) => { if (d) { setDate(startOfDay(d)); setDateOpen(false); } }}
                  disabled={(d) => d > new Date()}
                  className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</> : 'Generate Notifications'}
          </Button>

          {(generated.length > 0 || skipped.length > 0) && (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Selected</div><div className="font-semibold">{selectedCount}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Eligible</div><div className="font-semibold text-primary">{generated.length}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Skipped</div><div className="font-semibold text-amber-600">{skipped.length}</div></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {generated.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <Label className="text-sm font-medium">Preview ({generated.length})</Label>
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {generated.map(n => (
                <div key={n.studentId} className="rounded-md border p-3 bg-card text-sm">
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Student</div>
                      <div className="font-medium">{n.studentName} {n.gender ? `| ${n.gender}` : ''}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Parent</div>
                      <div className="font-medium">{n.parentName || '—'} {n.parentRelation ? `| ${n.parentRelation}` : ''}</div>
                    </div>
                  </div>
                  <Textarea
                    value={n.message}
                    readOnly
                    className="min-h-[140px] text-xs font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleCopy} variant="outline" disabled={!generated.length} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Message'}
              </Button>
              <Button onClick={handleConfirmSend} disabled={!generated.length || sending} className="gap-2">
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {progress ? `Sending ${progress.done}/${progress.total}` : 'Sending...'}</>
                  : <><Send className="w-4 h-4" /> Send SMS</>}
              </Button>
            </div>

            {skipped.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">Skipped ({skipped.length})</div>
                <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                  {skipped.map(s => <li key={s.studentId}>{s.studentName} — {s.reason}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {generated.length === 0 && (
        <Card>
          <CardContent className="pt-4 text-center text-sm text-muted-foreground">
            No notifications available. Generate to preview.
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardContent className="pt-4">
          <Button variant="ghost" className="w-full justify-between" onClick={() => setShowHistory(s => !s)}>
            <span className="flex items-center gap-2 text-sm font-medium"><History className="w-4 h-4" /> Notification History</span>
            <span className="text-xs text-muted-foreground">{showHistory ? 'Hide' : 'Show'}</span>
          </Button>
          {showHistory && <NotificationHistoryPanel tenantId={tenantId} retrying={retrying} setRetrying={setRetrying} />}
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Confirm SMS Send</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Selected</div><div className="font-semibold">{selectedCount}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Eligible</div><div className="font-semibold text-primary">{generated.length}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Skipped</div><div className="font-semibold text-amber-600">{skipped.length}</div></div>
            </div>
            {skipped.length > 0 && (
              <div className="text-xs">
                <div className="font-medium">Skipped reasons</div>
                <ul className="list-disc pl-4 space-y-0.5 max-h-28 overflow-y-auto">
                  {skipped.map(s => <li key={s.studentId}>{s.studentName} — {s.reason}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Provider: <span className="font-medium">Development</span> — SMS will be simulated. Plug in MSG91 later
              without UI changes.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={doSend}>Send {generated.length} SMS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ---------------- History panel ----------------

const NotificationHistoryPanel = ({
  tenantId,
  retrying,
  setRetrying,
}: { tenantId: string; retrying: boolean; setRetrying: (b: boolean) => void }) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [downloading, setDownloading] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['notification-history', tenantId, statusFilter, typeFilter],
    queryFn: async () => {
      let q = supabase
        .from('notification_history' as any)
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (typeFilter !== 'all') q = q.eq('notification_type', typeFilter);
      const { data } = await q;
      return (data || []) as any[];
    },
  });

  const failedRows = useMemo(() => rows.filter(r => r.status === 'failed'), [rows]);

  const handleRetry = async () => {
    if (!failedRows.length) return toast.error('No failed messages to retry');
    setRetrying(true);
    try {
      const notes: GeneratedNotification[] = failedRows.map(r => ({
        studentId: r.student_id,
        studentName: r.student_name,
        gender: r.gender,
        parentName: r.parent_name,
        parentRelation: r.parent_relation,
        parentMobile: r.parent_mobile,
        className: r.class,
        kind: r.notification_type,
        message: r.message,
      }));
      const valid = notes.filter(n => isValidMobile(n.parentMobile));
      const invalid = notes
        .filter(n => !isValidMobile(n.parentMobile))
        .map(n => ({ studentId: n.studentId, success: false, provider: 'development', failureReason: 'Invalid mobile number' }));
      const results = await sendInBatches(valid, 'sms', () => {});
      const all = [...invalid, ...results];
      const batch_id = (globalThis.crypto as any)?.randomUUID?.() ?? `${Date.now()}`;
      const inserts = notes.map(n => {
        const r = all.find(x => x.studentId === n.studentId);
        return {
          tenant_id: tenantId,
          batch_id,
          student_id: n.studentId,
          student_name: n.studentName,
          gender: n.gender || null,
          parent_name: n.parentName || null,
          parent_relation: n.parentRelation || null,
          parent_mobile: n.parentMobile || null,
          class: n.className || null,
          notification_type: n.kind,
          message: n.message,
          channel: 'sms',
          provider: r?.provider || 'development',
          status: r?.success ? 'sent' : 'failed',
          failure_reason: r?.success ? null : r?.failureReason || 'Unknown',
        };
      });
      await supabase.from('notification_history' as any).insert(inserts);
      toast.success(`Retried ${notes.length} — ${all.filter(a => a.success).length} delivered`);
      queryClient.invalidateQueries({ queryKey: ['notification-history', tenantId] });
    } catch (e: any) {
      toast.error(e.message || 'Retry failed');
    } finally {
      setRetrying(false);
    }
  };

  const handleDownload = () => {
    if (!rows.length) return toast.error('Nothing to download');
    setDownloading(true);
    try {
      const headers = ['Student','Gender','Parent','Relation','Class','Mobile','Notification Type','Status','Reason','Timestamp'];
      const escape = (v: any) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [headers.join(',')];
      rows.forEach(r => lines.push([
        r.student_name, r.gender, r.parent_name, r.parent_relation, r.class,
        r.parent_mobile, r.notification_type, r.status, r.failure_reason,
        new Date(r.created_at).toLocaleString(),
      ].map(escape).join(',')));
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `notifications-${format(new Date(),'yyyyMMdd-HHmm')}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="homework">Homework</SelectItem>
            <SelectItem value="learning">Daily Learning</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying || !failedRows.length} className="gap-2">
          {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Retry Failed ({failedRows.length})
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading || !rows.length} className="gap-2">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download CSV
        </Button>
      </div>

      <div className="border rounded-md max-h-72 overflow-y-auto divide-y">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No history yet.</div>
        ) : rows.map(r => (
          <div key={r.id} className="p-2 text-xs flex items-start gap-2">
            <Badge variant={r.status === 'sent' ? 'default' : 'destructive'} className="text-[10px]">{r.status}</Badge>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.student_name} <span className="text-muted-foreground">• {r.class}</span></div>
              <div className="text-muted-foreground truncate">{r.notification_type} • {r.parent_mobile || '—'} • {format(new Date(r.created_at),'dd MMM HH:mm')}</div>
              {r.failure_reason && <div className="text-destructive truncate">{r.failure_reason}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyNotifications;
