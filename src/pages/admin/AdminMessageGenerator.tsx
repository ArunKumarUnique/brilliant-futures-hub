import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isAfter, startOfDay } from 'date-fns';

const AdminMessageGenerator = () => {
  const { config } = useTenant();
  const name = config.instituteName;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Message Generator</h1>
      <Tabs defaultValue="fee" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="fee" className="text-xs px-1 py-2">Fee Reminder</TabsTrigger>
          <TabsTrigger value="closed" className="text-xs px-1 py-2">Closed</TabsTrigger>
          <TabsTrigger value="timings" className="text-xs px-1 py-2">Timings</TabsTrigger>
          <TabsTrigger value="occasion" className="text-xs px-1 py-2">Occasion</TabsTrigger>
        </TabsList>

        <TabsContent value="fee"><FeeReminder instituteName={name} tenantId={config.id} /></TabsContent>
        <TabsContent value="closed"><TuitionClosed instituteName={name} /></TabsContent>
        <TabsContent value="timings"><TimingsUpdate instituteName={name} /></TabsContent>
        <TabsContent value="occasion"><OccasionWishes instituteName={name} /></TabsContent>
      </Tabs>
    </div>
  );
};

const CopyableMessage = ({ message }: { message: string }) => {
  const [edited, setEdited] = useState(message);
  const [copied, setCopied] = useState(false);

  // Sync when generated message changes
  if (message !== edited && !copied) {
    // only reset if the base message changed
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(edited);
      setCopied(true);
      toast.success('Message copied successfully');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <Label className="text-sm font-medium">Message Preview (editable)</Label>
      <Textarea
        value={edited}
        onChange={(e) => setEdited(e.target.value)}
        className="min-h-[120px] text-sm"
      />
      <Button onClick={handleCopy} className="w-full sticky bottom-4 h-12 text-base gap-2">
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? 'Copied!' : 'Copy Message'}
      </Button>
    </div>
  );
};

/* ── Fee Reminder ── */
const FeeReminder = ({ instituteName, tenantId }: { instituteName: string; tenantId: string }) => {
  const [studentId, setStudentId] = useState('');
  const [month, setMonth] = useState(new Date().toLocaleString('en', { month: 'long' }));
  const [generated, setGenerated] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students-msg', tenantId],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, student_name').eq('tenant_id', tenantId).eq('status', 'active');
      return data || [];
    },
  });

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const generate = () => {
    if (studentId === 'all') {
      const pending = students.map((s, i) => `${i + 1}. ${s.student_name}`).join('\n');
      setGenerated(`Dear Parents,\n\nThis is a reminder that the tuition fee for the month of ${month} is pending. Kindly make the payment at the earliest.\n\nPending Students:\n${pending}\n\n– ${instituteName}`);
    } else {
      const s = students.find(x => x.id === studentId);
      setGenerated(`Dear Parent,\n\nThis is a reminder that the tuition fee for ${s?.student_name || 'your child'} for the month of ${month} is pending. Kindly make the payment at the earliest.\n\n– ${instituteName}`);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label>Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students (Bulk)</SelectItem>
              {students.map(s => <SelectItem key={s.id} value={s.id}>{s.student_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={generate} variant="secondary" className="w-full">Generate Message</Button>
        {generated && <CopyableMessage message={generated} />}
      </CardContent>
    </Card>
  );
};

/* ── Tuition Closed ── */
const TuitionClosed = ({ instituteName }: { instituteName: string }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [generated, setGenerated] = useState('');

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const generate = () => {
    const r = reason.trim() ? ` Reason: ${reason.trim()}.` : '';
    setGenerated(`Dear Parents,\n\nTuition will remain closed on ${formatDate(date)}.${r}\n\n– ${instituteName}`);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Reason (optional)</Label>
          <Input placeholder="e.g. Sri Rama Navami" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <Button onClick={generate} variant="secondary" className="w-full">Generate Message</Button>
        {generated && <CopyableMessage message={generated} />}
      </CardContent>
    </Card>
  );
};

/* ── Timings Update ── */
const TimingsUpdate = ({ instituteName }: { instituteName: string }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [generated, setGenerated] = useState('');

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t: string) => { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`; };

  const generate = () => {
    setGenerated(`Dear Parents,\n\nTuition timings for today (${formatDate(date)}) are from ${formatTime(startTime)} to ${formatTime(endTime)}.\n\n– ${instituteName}`);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>
        <Button onClick={generate} variant="secondary" className="w-full">Generate Message</Button>
        {generated && <CopyableMessage message={generated} />}
      </CardContent>
    </Card>
  );
};

/* ── Occasion Wishes ── */
const OccasionWishes = ({ instituteName }: { instituteName: string }) => {
  const [occasion, setOccasion] = useState('');
  const [closed, setClosed] = useState(true);
  const [generated, setGenerated] = useState('');

  const generate = () => {
    if (!occasion.trim()) { toast.error('Enter occasion name'); return; }
    const closedLine = closed ? ' Tuition will remain closed today on the occasion.' : '';
    setGenerated(`Dear Parents,\n\nWishing you all a very Happy ${occasion.trim()}!${closedLine}\n\n– ${instituteName}`);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label>Occasion Name</Label>
          <Input placeholder="e.g. Ugadi, Diwali" value={occasion} onChange={e => setOccasion(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Tuition Closed?</Label>
          <Switch checked={closed} onCheckedChange={setClosed} />
        </div>
        <Button onClick={generate} variant="secondary" className="w-full">Generate Message</Button>
        {generated && <CopyableMessage message={generated} />}
      </CardContent>
    </Card>
  );
};

export default AdminMessageGenerator;
