import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import FeeTracker from '@/components/admin/FeeTracker';

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

const AdminFees = () => {
  const { config, tr } = useTenant();
  const { language } = useLanguage();
  const tenantId = config.id;
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
    setLoading(true);
    const { data: allStudents, error } = await supabase
      .from('students')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('student_name');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!allStudents?.length) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const { data: feeData } = await supabase
      .from('fee_records')
      .select('student_id, status')
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

    if (statusFilter !== 'all') {
      setStudents(result.filter(s => s.fee_status === statusFilter));
    } else {
      setStudents(result);
    }
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Fee Tracking</h1>

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Monthly Fee</TableHead>
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
                  <TableCell>{s.class}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm">{getPackageName(s.package_id)}</TableCell>
                  <TableCell>₹{s.monthly_fee}</TableCell>
                  <TableCell>
                    <Badge variant={s.fee_status === 'paid' ? 'default' : 'destructive'} className={s.fee_status === 'paid' ? 'bg-secondary text-secondary-foreground' : ''}>
                      {s.fee_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setViewingFees(s)}>View Fees</Button>
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

export default AdminFees;
