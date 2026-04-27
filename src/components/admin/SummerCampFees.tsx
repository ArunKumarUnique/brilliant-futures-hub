import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Search, Check, Undo2 } from 'lucide-react';

interface Row {
  student_id: string;
  student_name: string;
  parent_name: string | null;
  parent_mobile: string;
  class: string;
  payment_id: string | null;
  status: 'paid' | 'pending';
  paid_date: string | null;
  payment_method: string | null;
  amount: number;
}

const SUMMER_CAMP_FEE_DEFAULT = 1500;

const SummerCampFees = () => {
  const { config } = useTenant();
  const tenantId = config.id;
  const summerPkg = config.packages?.items.find(p => p.id === 'summer-camp');
  const defaultFee = summerPkg?.flatFee ?? SUMMER_CAMP_FEE_DEFAULT;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [markStudent, setMarkStudent] = useState<Row | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [revertId, setRevertId] = useState<string | null>(null);

  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState<string>(String(defaultFee));

  const fetchRows = async () => {
    setLoading(true);
    const { data: students, error } = await supabase
      .from('students')
      .select('id, student_name, parent_name, parent_mobile, class, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setLoading(false); return; }

    const { data: payments } = await supabase
      .from('summer_camp_payments')
      .select('*')
      .eq('tenant_id', tenantId);

    const payMap: Record<string, any> = {};
    payments?.forEach(p => { payMap[p.student_id] = p; });

    const result: Row[] = (students || []).map(s => {
      const p = payMap[s.id];
      return {
        student_id: s.id,
        student_name: s.student_name,
        parent_name: s.parent_name,
        parent_mobile: s.parent_mobile,
        class: s.class,
        payment_id: p?.id ?? null,
        status: (p?.status as 'paid' | 'pending') ?? 'pending',
        paid_date: p?.paid_date ?? null,
        payment_method: p?.payment_method ?? null,
        amount: p?.amount ? Number(p.amount) : defaultFee,
      };
    });
    setRows(result);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [tenantId]);

  const filtered = useMemo(() => rows.filter(r => {
    if (search && !r.student_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  }), [rows, search, statusFilter]);

  const pendingSelected = useMemo(
    () => filtered.filter(r => r.status === 'pending' && selected.has(r.student_id)),
    [filtered, selected],
  );

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(filtered.filter(r => r.status === 'pending').map(r => r.student_id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id); else next.delete(id);
    setSelected(next);
  };

  const upsertPayment = async (row: Row, status: 'paid' | 'pending', amount: number) => {
    const payload: any = {
      tenant_id: tenantId,
      student_id: row.student_id,
      amount,
      status,
      paid_date: status === 'paid' ? paidDate : null,
      payment_method: status === 'paid' ? paymentMethod : null,
    };
    if (row.payment_id) {
      const { error } = await supabase
        .from('summer_camp_payments')
        .update({ status, amount, paid_date: payload.paid_date, payment_method: payload.payment_method })
        .eq('id', row.payment_id);
      return error;
    }
    const { error } = await supabase.from('summer_camp_payments').insert(payload);
    return error;
  };

  const handleMarkPaid = async () => {
    if (!markStudent) return;
    const amt = Number(amountPaid);
    if (!amountPaid || isNaN(amt) || amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount must be greater than 0', variant: 'destructive' });
      return;
    }
    const error = await upsertPayment(markStudent, 'paid', amt);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Payment marked as paid', description: `${markStudent.student_name} – ₹${amt.toLocaleString('en-IN')}` });
    setMarkStudent(null);
    fetchRows();
  };

  const handleBulkPaid = async () => {
    if (pendingSelected.length === 0) return;
    const inserts = pendingSelected
      .filter(r => !r.payment_id)
      .map(r => ({
        tenant_id: tenantId,
        student_id: r.student_id,
        amount: defaultFee,
        status: 'paid',
        paid_date: paidDate,
        payment_method: paymentMethod,
      }));
    const updates = pendingSelected.filter(r => r.payment_id);

    if (inserts.length) {
      const { error } = await supabase.from('summer_camp_payments').insert(inserts);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    for (const r of updates) {
      await supabase.from('summer_camp_payments')
        .update({ status: 'paid', paid_date: paidDate, payment_method: paymentMethod })
        .eq('id', r.payment_id!);
    }
    toast({ title: `${pendingSelected.length} payments marked as paid` });
    setBulkOpen(false);
    fetchRows();
  };

  const handleRevert = async () => {
    if (!revertId) return;
    const { error } = await supabase
      .from('summer_camp_payments')
      .update({ status: 'pending', paid_date: null, payment_method: null })
      .eq('id', revertId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else toast({ title: 'Payment reverted to pending' });
    setRevertId(null);
    fetchRows();
  };

  const paidCount = rows.filter(r => r.status === 'paid').length;
  const pendingCount = rows.length - paidCount;
  const totalCollected = rows.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-lg font-bold text-secondary">{paidCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-lg font-bold text-destructive">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Collected</p>
          <p className="text-lg font-bold text-foreground">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {pendingSelected.length > 0 && (
          <Button onClick={() => { setPaidDate(new Date().toISOString().split('T')[0]); setBulkOpen(true); }}>
            Mark {pendingSelected.length} as Paid
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pendingSelected.length > 0 && pendingSelected.length === filtered.filter(r => r.status === 'pending').length}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="hidden sm:table-cell">Parent</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Paid Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.student_id}>
                <TableCell>
                  {r.status === 'pending' && (
                    <Checkbox
                      checked={selected.has(r.student_id)}
                      onCheckedChange={(v) => toggleOne(r.student_id, !!v)}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {r.student_name}
                  <div className="text-xs text-muted-foreground">{r.class}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{r.parent_name || '—'}</TableCell>
                <TableCell className="text-sm">{r.parent_mobile}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'paid' ? 'default' : 'destructive'} className={r.status === 'paid' ? 'bg-secondary text-secondary-foreground' : ''}>
                    {r.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.paid_date || '—'}</TableCell>
                <TableCell>
                  {r.status === 'paid' ? (
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setRevertId(r.payment_id!)}>
                      <Undo2 className="w-3 h-3 mr-1" /> Revert
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setMarkStudent(r); setPaidDate(new Date().toISOString().split('T')[0]); setAmountPaid(String(defaultFee)); }}>
                      <Check className="w-3 h-3 mr-1" /> Mark Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mark single paid */}
      <Dialog open={!!markStudent} onOpenChange={v => !v && setMarkStudent(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark as Paid – {markStudent?.student_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount Paid (₹) *</Label>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                placeholder={String(defaultFee)}
              />
              <p className="text-xs text-muted-foreground">Default: ₹{defaultFee.toLocaleString('en-IN')} • Edit for partial payments</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMarkStudent(null)}>Cancel</Button>
              <Button onClick={handleMarkPaid}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk mark paid */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark {pendingSelected.length} students as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkPaid}>Mark All Paid</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revertId} onOpenChange={v => !v && setRevertId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert this Summer Camp payment?</AlertDialogTitle>
            <AlertDialogDescription>The payment will move back to pending and the date/method will be cleared.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevert} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Revert</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SummerCampFees;
