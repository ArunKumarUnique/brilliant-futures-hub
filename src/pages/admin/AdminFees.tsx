import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import FeeTracker from '@/components/admin/FeeTracker';
import SummerCampFees from '@/components/admin/SummerCampFees';
import ReceiptGenerator from '@/components/admin/ReceiptGenerator';
import CertificateGenerator from '@/components/admin/CertificateGenerator';
import { Receipt, Sparkles, FileText, Award } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface StudentWithFee {
  id: string;
  student_name: string;
  class: string;
  package_id: string;
  monthly_fee: number;
  parent_mobile: string;
  fee_status: string;
}

const MonthlyFeesTab = () => {
  const { config, tr } = useTenant();
  const { tenantId } = useAdmin();
  const { language } = useLanguage();
  const packages = config.packages?.items || [];

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<StudentWithFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingFees, setViewingFees] = useState<StudentWithFee | null>(null);

  const fetchStudentsWithFees = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      setStudents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: allStudents, error } = await supabase
      .from('students')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .or('student_type.eq.regular,student_type.is.null')
      .order('student_name');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    if (!allStudents?.length) { setStudents([]); setLoading(false); return; }

    const { data: feeData } = await supabase
      .from('fee_records')
      .select('student_id, status')
      .eq('tenant_id', tenantId)
      .in('student_id', allStudents.map(s => s.id))
      .eq('month', Number(month))
      .eq('year', Number(year));

    const feeMap: Record<string, string> = {};
    feeData?.forEach(f => { feeMap[f.student_id] = f.status; });

    const result: StudentWithFee[] = allStudents.map(s => ({
      id: s.id,
      student_name: s.student_name,
      class: s.class,
      package_id: s.package_id,
      monthly_fee: s.monthly_fee,
      parent_mobile: s.parent_mobile,
      fee_status: feeMap[s.id] || 'pending',
    }));

    if (statusFilter !== 'all') setStudents(result.filter(s => s.fee_status === statusFilter));
    else setStudents(result);
    setLoading(false);
  };

  useEffect(() => { fetchStudentsWithFees(); }, [tenantId, month, year, statusFilter]);

  const getPackageName = (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return id;
    return typeof pkg.title === 'string' ? pkg.title : tr(pkg.title, language);
  };

  if (viewingFees) {
    return (
      <FeeTracker
        studentId={viewingFees.id}
        studentName={viewingFees.student_name}
        monthlyFee={viewingFees.monthly_fee}
        year={Number(year)}
        onBack={() => { setViewingFees(null); fetchStudentsWithFees(); }}
      />
    );
  }

  return (
    <div>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead className="hidden sm:table-cell">Class</TableHead>
              <TableHead className="hidden md:table-cell">Package</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status ({MONTHS[Number(month) - 1]})</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : students.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
            ) : (
              students.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.class}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[150px] truncate text-sm">{getPackageName(s.package_id)}</TableCell>
                  <TableCell>₹{s.monthly_fee}</TableCell>
                  <TableCell>
                    <Badge variant={s.fee_status === 'paid' ? 'default' : 'destructive'} className={s.fee_status === 'paid' ? 'bg-secondary text-secondary-foreground' : ''}>
                      {s.fee_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setViewingFees(s)}>View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const AdminFees = () => {
  const [tab, setTab] = useState('monthly');

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Fee Tracking</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="monthly" className="flex-col sm:flex-row gap-1 py-2.5 text-xs sm:text-sm">
            <Receipt className="w-4 h-4" /> Monthly
          </TabsTrigger>
          <TabsTrigger value="summer" className="flex-col sm:flex-row gap-1 py-2.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" /> Summer Camp
          </TabsTrigger>
          <TabsTrigger value="receipt" className="flex-col sm:flex-row gap-1 py-2.5 text-xs sm:text-sm">
            <FileText className="w-4 h-4" /> Receipt
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex-col sm:flex-row gap-1 py-2.5 text-xs sm:text-sm">
            <Award className="w-4 h-4" /> Certificate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-5"><MonthlyFeesTab /></TabsContent>
        <TabsContent value="summer" className="mt-5"><SummerCampFees /></TabsContent>
        <TabsContent value="receipt" className="mt-5"><ReceiptGenerator /></TabsContent>
        <TabsContent value="certificate" className="mt-5"><CertificateGenerator /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFees;
