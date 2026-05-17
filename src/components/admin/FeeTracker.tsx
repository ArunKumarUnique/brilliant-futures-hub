import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Check, Undo2, ArrowLeft } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface FeeRecord {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
}

interface FeeTrackerProps {
  studentId: string;
  studentName: string;
  monthlyFee: number;
  year: number;
  onBack: () => void;
}

const FeeTracker = ({ studentId, studentName, monthlyFee, year, onBack }: FeeTrackerProps) => {
  const { tenantId } = useAdmin();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markPaidMonth, setMarkPaidMonth] = useState<number | null>(null);
  const [revertMonth, setRevertMonth] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<string>(String(monthlyFee));

  const fetchFees = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      setFees([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('student_id', studentId)
      .eq('year', year)
      .order('month');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setFees(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFees(); }, [studentId, year, tenantId]);

  const getFeeForMonth = (month: number) => fees.find(f => f.month === month);

  const handleMarkPaid = async () => {
    if (markPaidMonth === null || !tenantId) return;
    const amt = Number(amountPaid);
    if (!amountPaid || isNaN(amt) || amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount Paid is required and must be greater than 0', variant: 'destructive' });
      return;
    }
    const existing = getFeeForMonth(markPaidMonth);

    if (existing) {
      const { error } = await supabase
        .from('fee_records')
        .update({ status: 'paid', paid_date: paidDate, payment_method: paymentMethod, amount: amt })
        .eq('id', existing.id)
        .eq('tenant_id', tenantId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase
        .from('fee_records')
        .insert({ tenant_id: tenantId, student_id: studentId, month: markPaidMonth, year, amount: amt, status: 'paid', paid_date: paidDate, payment_method: paymentMethod });
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }

    toast({ title: 'Fee marked as paid', description: `${MONTHS[markPaidMonth - 1]} ${year} – ₹${amt.toLocaleString('en-IN')}` });
    setMarkPaidMonth(null);
    fetchFees();
  };

  const handleRevert = async () => {
    if (revertMonth === null || !tenantId) return;
    const existing = getFeeForMonth(revertMonth);
    if (!existing) return;

    const { error } = await supabase
      .from('fee_records')
      .update({ status: 'pending', paid_date: null, payment_method: null })
      .eq('id', existing.id)
      .eq('tenant_id', tenantId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Fee reverted to pending', description: `${MONTHS[revertMonth - 1]} ${year}` });
    }
    setRevertMonth(null);
    fetchFees();
  };

  const paidCount = fees.filter(f => f.status === 'paid').length;
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{studentName} – Fee Tracker</h2>
          <p className="text-sm text-muted-foreground">Year: {year} | Monthly Fee: ₹{monthlyFee} | Paid: {paidCount}/12 (₹{totalPaid.toLocaleString()})</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Paid Date</TableHead>
              <TableHead className="hidden sm:table-cell">Method</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : (
              MONTHS.map((m, idx) => {
                const fee = getFeeForMonth(idx + 1);
                const isPaid = fee?.status === 'paid';
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{m}</TableCell>
                    <TableCell>₹{fee?.amount ?? monthlyFee}</TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? 'default' : 'destructive'} className={isPaid ? 'bg-secondary text-secondary-foreground' : ''}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{fee?.paid_date || '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground capitalize">{fee?.payment_method || '—'}</TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setRevertMonth(idx + 1)}>
                          <Undo2 className="w-3 h-3 mr-1" /> Revert
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => {
                          setMarkPaidMonth(idx + 1);
                          setPaidDate(new Date().toISOString().split('T')[0]);
                          setAmountPaid(String(fee?.amount ?? monthlyFee));
                        }}>
                          <Check className="w-3 h-3 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mark Paid Dialog */}
      <Dialog open={markPaidMonth !== null} onOpenChange={v => !v && setMarkPaidMonth(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark {markPaidMonth ? MONTHS[markPaidMonth - 1] : ''} as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} />
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
                placeholder={String(monthlyFee)}
              />
              <p className="text-xs text-muted-foreground">Default: ₹{monthlyFee.toLocaleString('en-IN')} • Edit for partial payments</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMarkPaidMonth(null)}>Cancel</Button>
              <Button onClick={handleMarkPaid}>Confirm Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation */}
      <AlertDialog open={revertMonth !== null} onOpenChange={v => !v && setRevertMonth(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert payment for {revertMonth ? MONTHS[revertMonth - 1] : ''}?</AlertDialogTitle>
            <AlertDialogDescription>This will mark the fee as pending and remove the payment date and method.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevert} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Revert to Pending</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeeTracker;
