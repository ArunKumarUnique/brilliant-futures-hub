import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Save, Users, UserX, UserCheck, Bell, Send, MessageCircle, Mail, Phone, CheckCheck } from 'lucide-react';

interface Student {
  id: string;
  student_name: string;
  class: string;
  parent_mobile: string;
  parent_email: string | null;
}

const AdminAttendance = () => {
  const { config } = useTenant();
  const tenantId = config.id;

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<Student[]>([]);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('all');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [messageTemplate, setMessageTemplate] = useState(
    `Dear Parent, your child {student_name} was absent today ({date}) at {institute_name}. Please contact us for details.`
  );

  const fetchData = async () => {
    setLoading(true);
    setSaved(false);

    const { data: studentData } = await supabase
      .from('students')
      .select('id, student_name, class, parent_mobile, parent_email')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');

    const allStudents = (studentData || []) as Student[];
    setStudents(allStudents);

    // Load existing attendance for this date
    if (allStudents.length > 0) {
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('tenant_id', tenantId)
        .eq('date', date);

      const present = new Set<string>();
      attendanceData?.forEach((a: any) => {
        if (a.status === 'present') present.add(a.student_id);
      });
      setPresentIds(present);

      // If there's existing data, mark as already saved
      if (attendanceData && attendanceData.length > 0) {
        setSaved(true);
      }
    } else {
      setPresentIds(new Set());
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tenantId, date]);

  const togglePresent = (id: string) => {
    setSaved(false);
    setPresentIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markAllPresent = () => {
    setSaved(false);
    setPresentIds(new Set(students.map(s => s.id)));
  };

  const absentStudents = useMemo(() => students.filter(s => !presentIds.has(s.id)), [students, presentIds]);
  const presentStudents = useMemo(() => students.filter(s => presentIds.has(s.id)), [students, presentIds]);

  const displayedStudents = useMemo(() => {
    if (tab === 'present') return presentStudents;
    if (tab === 'absent') return absentStudents;
    return students;
  }, [tab, students, presentStudents, absentStudents]);

  const saveAttendance = async () => {
    setSaving(true);
    try {
      // Delete existing records for this date + tenant
      await supabase
        .from('attendance')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('date', date);

      // Insert all records in bulk
      const records = students.map(s => ({
        student_id: s.id,
        tenant_id: tenantId,
        date,
        status: presentIds.has(s.id) ? 'present' : 'absent',
      }));

      if (records.length > 0) {
        const { error } = await supabase.from('attendance').insert(records);
        if (error) throw error;
      }

      setSaved(true);
      toast({ title: 'Attendance saved', description: `${presentIds.size} present, ${students.length - presentIds.size} absent` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const generateMessage = (student: Student) => {
    return messageTemplate
      .replace(/{student_name}/g, student.student_name)
      .replace(/{date}/g, new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))
      .replace(/{institute_name}/g, config.instituteName);
  };

  const handleNotify = () => {
    if (absentStudents.length === 0) return;

    if (sendMethod === 'whatsapp') {
      absentStudents.forEach((student, idx) => {
        const msg = encodeURIComponent(generateMessage(student));
        const phone = student.parent_mobile.replace(/[^0-9]/g, '');
        const url = `https://wa.me/91${phone}?text=${msg}`;
        setTimeout(() => window.open(url, '_blank'), idx * 500);
      });
    } else if (sendMethod === 'email') {
      absentStudents.forEach((student, idx) => {
        if (student.parent_email) {
          const msg = encodeURIComponent(generateMessage(student));
          const subject = encodeURIComponent(`Absence Notice – ${config.instituteName}`);
          setTimeout(() => window.open(`mailto:${student.parent_email}?subject=${subject}&body=${msg}`, '_blank'), idx * 300);
        }
      });
    } else if (sendMethod === 'sms') {
      absentStudents.forEach((student, idx) => {
        const msg = encodeURIComponent(generateMessage(student));
        const phone = student.parent_mobile.replace(/[^0-9]/g, '');
        setTimeout(() => window.open(`sms:${phone}?body=${msg}`, '_blank'), idx * 300);
      });
    }

    toast({ title: 'Notifications sent', description: `Notifying ${absentStudents.length} parent(s)` });
    setNotifyOpen(false);
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
              <Bell className="w-4 h-4 mr-1" /> Notify Absent
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
              <button
                key={s.id}
                onClick={() => togglePresent(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                  isPresent
                    ? 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                {isPresent ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{s.student_name}</p>
                  <p className="text-xs text-muted-foreground">{s.class}</p>
                </div>
                <Badge variant={isPresent ? 'default' : 'secondary'} className={isPresent ? 'bg-green-600 text-white' : ''}>
                  {isPresent ? 'Present' : 'Absent'}
                </Badge>
              </button>
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

      {/* Notify Dialog */}
      <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notify Absent Parents ({absentStudents.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Send via</Label>
              <div className="flex gap-2 mt-1.5">
                <Button size="sm" variant={sendMethod === 'whatsapp' ? 'default' : 'outline'} onClick={() => setSendMethod('whatsapp')}>
                  <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                </Button>
                <Button size="sm" variant={sendMethod === 'sms' ? 'default' : 'outline'} onClick={() => setSendMethod('sms')}>
                  <Phone className="w-4 h-4 mr-1" /> SMS
                </Button>
                <Button size="sm" variant={sendMethod === 'email' ? 'default' : 'outline'} onClick={() => setSendMethod('email')}>
                  <Mail className="w-4 h-4 mr-1" /> Email
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message Template</Label>
              <Textarea value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} rows={3} />
              <p className="text-xs text-muted-foreground">Placeholders: {'{student_name}'}, {'{date}'}, {'{institute_name}'}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm text-foreground">
                {absentStudents[0] ? generateMessage(absentStudents[0]) : '—'}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setNotifyOpen(false)}>Cancel</Button>
              <Button onClick={handleNotify}>
                <Send className="w-4 h-4 mr-1" /> Notify All ({absentStudents.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendance;
