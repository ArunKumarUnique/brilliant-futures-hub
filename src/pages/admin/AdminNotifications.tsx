import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Mail, Phone } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface StudentRow {
  id: string;
  student_name: string;
  parent_mobile: string;
  parent_email: string | null;
  monthly_fee: number;
  class: string;
  fee_status: string;
}

const DEFAULT_TEMPLATE = `Dear Parent, the tuition fee for {student_name} for the month of {month} is pending. Kindly clear the dues. – {institute_name}`;

const AdminNotifications = () => {
  const { config } = useTenant();
  const { tenantId } = useAdmin();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');

  const fetchPendingStudents = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      setStudents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: allStudents } = await supabase
      .from('students')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');

    if (!allStudents?.length) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const { data: feeData } = await supabase
      .from('fee_records')
      .select('student_id, status')
      .eq('tenant_id', tenantId)
      .in('student_id', allStudents.map(s => s.id))
      .eq('month', Number(month))
      .eq('year', Number(year));

    const paidSet = new Set(feeData?.filter(f => f.status === 'paid').map(f => f.student_id));

    const pendingStudents: StudentRow[] = allStudents
      .filter(s => !paidSet.has(s.id))
      .map(s => ({
        id: s.id,
        student_name: s.student_name,
        parent_mobile: s.parent_mobile,
        parent_email: s.parent_email,
        monthly_fee: s.monthly_fee,
        class: s.class,
        fee_status: 'pending',
      }));

    setStudents(pendingStudents);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => { fetchPendingStudents(); }, [tenantId, month, year]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map(s => s.id)));
    }
  };

  const generateMessage = (student: StudentRow) => {
    return messageTemplate
      .replace(/{student_name}/g, student.student_name)
      .replace(/{month}/g, MONTHS[Number(month) - 1])
      .replace(/{fee_amount}/g, `₹${student.monthly_fee}`)
      .replace(/{institute_name}/g, config.instituteName);
  };

  const handleSend = () => {
    const selectedStudents = students.filter(s => selected.has(s.id));
    if (selectedStudents.length === 0) return;

    if (sendMethod === 'whatsapp') {
      // Open WhatsApp for each student (one at a time for now)
      selectedStudents.forEach((student, idx) => {
        const msg = encodeURIComponent(generateMessage(student));
        const phone = student.parent_mobile.replace(/[^0-9]/g, '');
        const url = `https://wa.me/91${phone}?text=${msg}`;
        setTimeout(() => window.open(url, '_blank'), idx * 500);
      });
      toast({ title: 'WhatsApp opened', description: `Opening WhatsApp for ${selectedStudents.length} student(s)` });
    } else if (sendMethod === 'email') {
      selectedStudents.forEach((student, idx) => {
        if (student.parent_email) {
          const msg = encodeURIComponent(generateMessage(student));
          const subject = encodeURIComponent(`Fee Reminder – ${config.instituteName}`);
          const url = `mailto:${student.parent_email}?subject=${subject}&body=${msg}`;
          setTimeout(() => window.open(url, '_blank'), idx * 300);
        }
      });
      toast({ title: 'Email opened', description: `Opening email for ${selectedStudents.length} student(s)` });
    } else if (sendMethod === 'sms') {
      selectedStudents.forEach((student, idx) => {
        const msg = encodeURIComponent(generateMessage(student));
        const phone = student.parent_mobile.replace(/[^0-9]/g, '');
        const url = `sms:${phone}?body=${msg}`;
        setTimeout(() => window.open(url, '_blank'), idx * 300);
      });
      toast({ title: 'SMS opened', description: `Opening SMS for ${selectedStudents.length} student(s)` });
    }

    setSendDialogOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Bulk Fee Reminders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <Button onClick={() => setSendDialogOpen(true)}>
            <Send className="w-4 h-4 mr-1" /> Send Reminder ({selected.size})
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={students.length > 0 && selected.size === students.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent Mobile</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : students.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending fees for {MONTHS[Number(month) - 1]} {year}</TableCell></TableRow>
            ) : (
              students.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{s.student_name}</TableCell>
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.parent_mobile}</TableCell>
                  <TableCell>₹{s.monthly_fee}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Pending</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Fee Reminder</DialogTitle>
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
              <Textarea value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} rows={4} />
              <p className="text-xs text-muted-foreground">
                Placeholders: {'{student_name}'}, {'{month}'}, {'{fee_amount}'}, {'{institute_name}'}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm text-foreground">
                {students.find(s => selected.has(s.id))
                  ? generateMessage(students.find(s => selected.has(s.id))!)
                  : 'Select a student to preview'}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSend}>
                <Send className="w-4 h-4 mr-1" /> Send to {selected.size} Student(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;
