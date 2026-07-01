import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Save, Users, UserX, UserCheck, Bell, Copy, CheckCheck, Clock, FileText, Sparkles } from 'lucide-react';

type StudentType = 'regular' | 'summer_camp';

interface Student {
  id: string;
  student_name: string;
  class: string;
  parent_mobile: string;
  parent_email: string | null;
}

interface ArrivalTimes {
  [studentId: string]: string; // HH:MM format
}

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const AdminAttendance = () => {
  const { config } = useTenant();
  const { tenantId, summerCampEnabled } = useAdmin();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [studentType, setStudentType] = useState<StudentType>('regular');
  useEffect(() => { if (!summerCampEnabled && studentType === 'summer_camp') setStudentType('regular'); }, [summerCampEnabled, studentType]);
  const [students, setStudents] = useState<Student[]>([]);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [arrivalTimes, setArrivalTimes] = useState<ArrivalTimes>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('all');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  const fetchData = async () => {
    if (!tenantId) {
      toast.error('Tenant missing. Please log in again.');
      setStudents([]);
      setPresentIds(new Set());
      setArrivalTimes({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setSaved(false);

    let query = supabase
      .from('students')
      .select('id, student_name, class, parent_mobile, parent_email, student_type')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');
    if (studentType === 'summer_camp') {
      query = query.eq('student_type', 'summer_camp');
    } else {
      query = query.or('student_type.eq.regular,student_type.is.null');
    }
    const { data: studentData } = await query.order('student_name');

    const allStudents = (studentData || []) as Student[];
    setStudents(allStudents);

    if (allStudents.length > 0) {
      const studentIdSet = new Set(allStudents.map(s => s.id));
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status, arrival_time')
        .eq('tenant_id', tenantId)
        .eq('date', date)
        .in('student_id', allStudents.map(s => s.id));

      const present = new Set<string>();
      const times: ArrivalTimes = {};
      attendanceData?.forEach((a: any) => {
        if (!studentIdSet.has(a.student_id)) return;
        if (a.status === 'present') {
          present.add(a.student_id);
          if (a.arrival_time) times[a.student_id] = a.arrival_time.slice(0, 5);
        }
      });
      setPresentIds(present);
      setArrivalTimes(times);

      if (attendanceData && attendanceData.length > 0) {
        setSaved(true);
      }
    } else {
      setPresentIds(new Set());
      setArrivalTimes({});
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tenantId, date, studentType]);

  const togglePresent = (id: string) => {
    setSaved(false);
    setPresentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setArrivalTimes(t => { const n = { ...t }; delete n[id]; return n; });
      } else {
        next.add(id);
        setArrivalTimes(t => ({ ...t, [id]: getCurrentTime() }));
      }
      return next;
    });
  };

  const updateArrivalTime = (id: string, time: string) => {
    setSaved(false);
    setArrivalTimes(t => ({ ...t, [id]: time }));
  };

  const markAllPresent = () => {
    setSaved(false);
    const now = getCurrentTime();
    const newTimes: ArrivalTimes = {};
    students.forEach(s => { newTimes[s.id] = arrivalTimes[s.id] || now; });
    setPresentIds(new Set(students.map(s => s.id)));
    setArrivalTimes(newTimes);
  };

  const absentStudents = useMemo(() => students.filter(s => !presentIds.has(s.id)), [students, presentIds]);
  const presentStudents = useMemo(() => students.filter(s => presentIds.has(s.id)), [students, presentIds]);

  const displayedStudents = useMemo(() => {
    if (tab === 'present') return presentStudents;
    if (tab === 'absent') return absentStudents;
    return students;
  }, [tab, students, presentStudents, absentStudents]);

  const saveAttendance = async () => {
    if (!tenantId) {
      toast.error('Tenant missing. Please log in again.');
      return;
    }
    setSaving(true);
    try {
      const studentIds = students.map(s => s.id);
      if (studentIds.length > 0) {
        await supabase
          .from('attendance')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('date', date)
          .in('student_id', studentIds);
      }

      const records = students.map(s => ({
        student_id: s.id,
        tenant_id: tenantId,
        date,
        status: presentIds.has(s.id) ? 'present' : 'absent',
        arrival_time: presentIds.has(s.id) ? (arrivalTimes[s.id] || null) : null,
        marked_at: new Date().toISOString(),
      }));

      if (records.length > 0) {
        const { error } = await supabase.from('attendance').insert(records);
        if (error) throw error;
      }

      setSaved(true);
      toast.success(`Attendance saved — ${presentIds.size} present, ${students.length - presentIds.size} absent`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const combinedAbsentMessage = useMemo(() => {
    if (absentStudents.length === 0) return '';
    const lines = absentStudents.map((s, i) => `${i + 1}. ${s.student_name} (${s.class})`);
    return `Absent Students Today (${formattedDate}) – ${config.instituteName}:\n\n${lines.join('\n')}\n\nPlease ensure regular attendance. Contact us for any concerns.`;
  }, [absentStudents, formattedDate, config.instituteName]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(combinedAbsentMessage);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(combinedAbsentMessage);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setNotifyOpen(false);
  };

  const dailyReport = useMemo(() => {
    const presentLines = presentStudents.map((s, i) => {
      const time = arrivalTimes[s.id];
      const timeStr = time ? ` – ${formatTime12(time)}` : '';
      return `${i + 1}. ${s.student_name}${timeStr}`;
    });
    const absentLines = absentStudents.map((s, i) => `${i + 1}. ${s.student_name}`);

    let report = `Attendance Report – ${formattedDate}\n\n`;
    if (presentLines.length > 0) {
      report += `Present Students (${presentLines.length}):\n${presentLines.join('\n')}\n\n`;
    }
    if (absentLines.length > 0) {
      report += `Absent Students (${absentLines.length}):\n${absentLines.join('\n')}\n\n`;
    }
    report += `– ${config.instituteName}`;
    return report;
  }, [presentStudents, absentStudents, arrivalTimes, formattedDate, config.instituteName]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(dailyReport);
      setReportCopied(true);
      toast.success('Report copied successfully');
      setTimeout(() => setReportCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
      </div>

      {/* Type Toggle */}
      {summerCampEnabled && (
        <Tabs value={studentType} onValueChange={(v) => setStudentType(v as StudentType)} className="mb-4">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="regular" className="gap-1.5 py-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" /> Regular
            </TabsTrigger>
            <TabsTrigger value="summer_camp" className="gap-1.5 py-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4" /> Summer Camp
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <UserCheck className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p className="text-xl font-bold text-green-600">{presentIds.size}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <UserX className="w-5 h-5 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{students.length - presentIds.size}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({students.length})</TabsTrigger>
            <TabsTrigger value="present">Present ({presentIds.size})</TabsTrigger>
            <TabsTrigger value="absent">Absent ({absentStudents.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllPresent}>
            <CheckCheck className="w-4 h-4 mr-1" /> All Present
          </Button>
          {saved && absentStudents.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setNotifyOpen(true)}>
              <Bell className="w-4 h-4 mr-1" /> Notify
            </Button>
          )}
          {saved && students.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
              <FileText className="w-4 h-4 mr-1" /> Report
            </Button>
          )}
        </div>
      </div>

      {/* Student list */}
      <div className="space-y-1.5 mb-24">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading students...</div>
        ) : displayedStudents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {tab === 'present' ? 'No students marked present' : tab === 'absent' ? 'No absent students' : 'No active students found'}
          </div>
        ) : (
          displayedStudents.map(s => {
            const isPresent = presentIds.has(s.id);
            return (
              <div
                key={s.id}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isPresent
                    ? 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800'
                    : 'bg-card border-border'
                }`}
              >
                <button
                  onClick={() => togglePresent(s.id)}
                  className="shrink-0 active:scale-90 transition-transform"
                >
                  {isPresent ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0" onClick={() => togglePresent(s.id)}>
                  <p className="font-medium text-foreground text-sm truncate">{s.student_name}</p>
                  <p className="text-xs text-muted-foreground">{s.class}</p>
                </div>
                {isPresent && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="time"
                      value={arrivalTimes[s.id] || ''}
                      onChange={e => updateArrivalTime(s.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-[90px] h-7 text-xs px-1.5 py-0 border-input"
                    />
                  </div>
                )}
                <Badge variant={isPresent ? 'default' : 'secondary'} className={isPresent ? 'bg-green-600 text-white shrink-0' : 'shrink-0'}>
                  {isPresent ? 'P' : 'A'}
                </Badge>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Save */}
      {!loading && students.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-50 flex justify-center">
          <Button
            onClick={saveAttendance}
            disabled={saving || saved}
            className="w-full max-w-md h-12 text-base"
            size="lg"
          >
            {saving ? (
              'Saving...'
            ) : saved ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Saved</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Save Attendance</>
            )}
          </Button>
        </div>
      )}

      {/* Notify Dialog — Combined Message */}
      <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Absent Students ({absentStudents.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Absent list */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {absentStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="font-medium text-foreground">{s.student_name}</span>
                  <Badge variant="outline" className="text-xs">{s.class}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{s.parent_mobile}</span>
                </div>
              ))}
            </div>

            {/* Combined message */}
            <div>
              <Label>Combined Message</Label>
              <Textarea value={combinedAbsentMessage} readOnly rows={5} className="mt-1.5 text-sm" />
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleCopyMessage} variant={copied ? 'default' : 'outline'} className="w-full">
                {copied ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Full Message</>}
              </Button>
              <Button onClick={handleShareWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Daily Attendance Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={dailyReport} readOnly rows={10} className="text-sm" />
            <Button onClick={handleCopyReport} variant={reportCopied ? 'default' : 'outline'} className="w-full h-12 text-base">
              {reportCopied ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Copied!</> : <><Copy className="w-5 h-5 mr-2" /> Copy Report</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendance;
