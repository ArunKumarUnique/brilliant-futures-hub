import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Download, Share2, FileText, AlertCircle } from 'lucide-react';
import { generateReceiptPdf, ReceiptData } from '@/lib/pdf-generators';
import LoaderOverlay from '@/components/admin/LoaderOverlay';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Student {
  id: string;
  student_name: string;
  parent_name: string | null;
  parent_mobile: string;
  class: string;
  package_id: string;
  monthly_fee: number;
  student_type: 'regular' | 'summer_camp';
}

const generateReceiptNo = (tenantId: string) => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const prefix = tenantId.substring(0, 3).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
};

const ReceiptGenerator = () => {
  const { config, tr } = useTenant();
  const { language } = useLanguage();
  const tenantId = config.id;
  const packages = config.packages?.items || [];

  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [paymentStatus, setPaymentStatus] = useState<'unknown' | 'paid' | 'pending'>('unknown');
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastReceiptNo, setLastReceiptNo] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('students')
        .select('id, student_name, parent_name, parent_mobile, class, package_id, monthly_fee, student_type')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('student_name');
      setStudents((data || []) as Student[]);
    };
    load();
  }, [tenantId]);

  const selectedStudent = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  const selectedPackage = useMemo(() => packages.find(p => p.id === packageId), [packages, packageId]);
  const isSummerCamp = packageId === 'summer-camp';

  // Filter students by selected package type so the wrong cohort never appears
  const filteredStudents = useMemo(() => {
    if (!packageId) return students;
    if (isSummerCamp) return students.filter(s => s.student_type === 'summer_camp');
    return students.filter(s => (s.student_type || 'regular') === 'regular');
  }, [students, packageId, isSummerCamp]);

  // Reset student selection when package changes if it no longer matches the cohort
  useEffect(() => {
    if (!studentId || !packageId) return;
    if (!filteredStudents.some(s => s.id === studentId)) {
      setStudentId('');
    }
  }, [packageId, filteredStudents, studentId]);

  // Verify payment when key fields change
  useEffect(() => {
    const verify = async () => {
      if (!studentId || !packageId) { setPaymentStatus('unknown'); return; }
      if (isSummerCamp) {
        const { data } = await supabase
          .from('summer_camp_payments')
          .select('status, paid_date, payment_method, amount')
          .eq('tenant_id', tenantId)
          .eq('student_id', studentId)
          .maybeSingle();
        setPaymentStatus(data?.status === 'paid' ? 'paid' : 'pending');
      } else {
        if (!month || !year) { setPaymentStatus('unknown'); return; }
        const { data } = await supabase
          .from('fee_records')
          .select('status, paid_date, payment_method, amount')
          .eq('student_id', studentId)
          .eq('month', Number(month))
          .eq('year', Number(year))
          .maybeSingle();
        setPaymentStatus(data?.status === 'paid' ? 'paid' : 'pending');
      }
    };
    verify();
    setPreviewUrl(null);
    setLastReceiptNo(null);
  }, [studentId, packageId, month, year, isSummerCamp, tenantId]);

  const generate = async () => {
    if (!selectedStudent || !selectedPackage) {
      toast({ title: 'Select student & package', variant: 'destructive' });
      return;
    }
    if (paymentStatus !== 'paid') {
      toast({ title: 'Payment not marked as Paid', description: 'Mark the payment as paid first to generate a receipt.', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      // Fetch authoritative payment details
      let amount = selectedStudent.monthly_fee;
      let paidDate = new Date().toISOString().split('T')[0];
      let paymentMethod = 'cash';
      let monthLabel: string | undefined;

      if (isSummerCamp) {
        const { data } = await supabase
          .from('summer_camp_payments')
          .select('amount, paid_date, payment_method')
          .eq('tenant_id', tenantId).eq('student_id', studentId).maybeSingle();
        amount = data?.amount ? Number(data.amount) : (selectedPackage.flatFee ?? 1500);
        paidDate = data?.paid_date || paidDate;
        paymentMethod = data?.payment_method || paymentMethod;
      } else {
        const { data } = await supabase
          .from('fee_records')
          .select('amount, paid_date, payment_method')
          .eq('student_id', studentId).eq('month', Number(month)).eq('year', Number(year)).maybeSingle();
        amount = data?.amount ? Number(data.amount) : selectedStudent.monthly_fee;
        paidDate = data?.paid_date || paidDate;
        paymentMethod = data?.payment_method || paymentMethod;
        monthLabel = `${MONTHS[Number(month) - 1]} ${year}`;
      }

      const packageName = typeof selectedPackage.title === 'string' ? selectedPackage.title : tr(selectedPackage.title, language);
      const receiptNo = generateReceiptNo(tenantId);

      const data: ReceiptData = {
        receiptNo,
        instituteName: config.instituteName,
        instituteAddress: typeof config.contact.address === 'string' ? config.contact.address : tr(config.contact.address, language),
        institutePhone: config.contact.phone,
        instituteEmail: config.contact.email,
        logoUrl: config.logo,
        studentName: selectedStudent.student_name,
        parentName: selectedStudent.parent_name || '',
        mobile: selectedStudent.parent_mobile,
        packageName,
        amount,
        paidDate,
        paymentMethod,
        monthLabel,
        isSummerCamp,
      };

      const doc = await generateReceiptPdf(data);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setLastReceiptNo(receiptNo);

      // Log receipt
      await supabase.from('fee_receipts').insert({
        receipt_no: receiptNo,
        tenant_id: tenantId,
        student_id: studentId,
        package_id: packageId,
        package_name: packageName,
        amount,
        month: isSummerCamp ? null : Number(month),
        year: isSummerCamp ? null : Number(year),
        paid_date: paidDate,
        payment_method: paymentMethod,
        is_summer_camp: isSummerCamp,
      });

      toast({ title: 'Receipt generated', description: receiptNo });
    } catch (e: any) {
      toast({ title: 'Failed to generate', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!previewUrl || !lastReceiptNo || !selectedStudent) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const safeName = selectedStudent.student_name.trim().replace(/\s+/g, '_');
    a.download = isSummerCamp
      ? `${safeName}_summer_camp_payment.pdf`
      : `${safeName}_fee_receipt_${lastReceiptNo}.pdf`;
    a.click();
  };

  const shareWhatsApp = () => {
    if (!selectedStudent || !lastReceiptNo) return;
    const phone = selectedStudent.parent_mobile.replace(/\D/g, '');
    const fullPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = `Dear ${selectedStudent.parent_name || 'Parent'},\n\nFee receipt for ${selectedStudent.student_name} has been generated.\nReceipt No: ${lastReceiptNo}\n\nThanks,\n${config.instituteName}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <LoaderOverlay open={generating} message="Generating document..." />
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Generate Fee Receipt</h2>

        <div className="space-y-1.5">
          <Label>Student *</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder={packageId ? 'Select student' : 'Pick a package first'} /></SelectTrigger>
            <SelectContent>
              {filteredStudents.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">No matching students</div>
              ) : filteredStudents.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.student_name} – {s.class}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Package *</Label>
          <Select value={packageId} onValueChange={setPackageId}>
            <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
            <SelectContent>
              {packages.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {typeof p.title === 'string' ? p.title : tr(p.title, language)}
                  {p.special ? ' ★' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isSummerCamp && packageId && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {studentId && packageId && paymentStatus === 'pending' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Payment not marked as Paid. Please mark it as paid first in {isSummerCamp ? 'Summer Camp Fees' : 'Monthly Fees'} tab.</span>
          </div>
        )}

        <Button
          className="w-full sm:w-auto"
          onClick={generate}
          disabled={generating || !studentId || !packageId || paymentStatus !== 'paid'}
        >
          {generating ? 'Generating…' : 'Generate Receipt'}
        </Button>
      </div>

      {previewUrl && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold">Preview</h3>
              <p className="text-xs text-muted-foreground">Receipt No: {lastReceiptNo}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>
              <Button size="sm" onClick={shareWhatsApp}><Share2 className="w-4 h-4 mr-1" /> WhatsApp</Button>
            </div>
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-muted">
            <iframe src={previewUrl} className="w-full h-[500px]" title="Receipt preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerator;
