import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Pencil, Trash2, Users, Sparkles } from 'lucide-react';
import StudentForm, { StudentFormData, StudentType } from '@/components/admin/StudentForm';
import FeeTracker from '@/components/admin/FeeTracker';

interface Student {
  id: string;
  student_name: string;
  parent_name: string | null;
  student_mobile: string | null;
  parent_mobile: string;
  student_email: string | null;
  parent_email: string | null;
  class: string;
  package_id: string;
  monthly_fee: number;
  admission_date: string | null;
  status: string;
  student_type: StudentType;
  notes: string | null;
}

const CLASS_OPTIONS = [
  'Below 4th Class', '4th Class', '5th Class', '6th Class', '7th Class',
  '8th Class', '9th Class', '10th Class',
];

const AdminStudents = () => {
  const { config, tr } = useTenant();
  const { language } = useLanguage();
  const tenantId = config.id;
  const packages = config.packages?.items || [];

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fee tracker view
  const [viewingFees, setViewingFees] = useState<Student | null>(null);
  const currentYear = new Date().getFullYear();

  // Current month fee status cache
  const [feeStatuses, setFeeStatuses] = useState<Record<string, string>>({});

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('student_name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setStudents((data || []) as Student[]);
      // Fetch current month fee statuses
      if (data && data.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const { data: feeData } = await supabase
          .from('fee_records')
          .select('student_id, status')
          .in('student_id', data.map(s => s.id))
          .eq('month', currentMonth)
          .eq('year', currentYear);
        const statusMap: Record<string, string> = {};
        feeData?.forEach(f => { statusMap[f.student_id] = f.status; });
        setFeeStatuses(statusMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [tenantId]);

  const handleAdd = async (data: StudentFormData) => {
    const { error } = await supabase.from('students').insert({
      tenant_id: tenantId,
      student_name: data.student_name.trim(),
      parent_name: data.parent_name.trim() || null,
      student_mobile: data.student_mobile.trim() || null,
      parent_mobile: data.parent_mobile.trim(),
      student_email: data.student_email.trim() || null,
      parent_email: data.parent_email.trim() || null,
      class: data.class,
      package_id: data.package_id,
      monthly_fee: data.monthly_fee,
      admission_date: data.admission_date || null,
      status: data.status,
      notes: data.notes.trim() || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Student added successfully' });
      setFormOpen(false);
      fetchStudents();
    }
  };

  const handleEdit = async (data: StudentFormData) => {
    if (!editingStudent) return;
    const { error } = await supabase.from('students').update({
      student_name: data.student_name.trim(),
      parent_name: data.parent_name.trim() || null,
      student_mobile: data.student_mobile.trim() || null,
      parent_mobile: data.parent_mobile.trim(),
      student_email: data.student_email.trim() || null,
      parent_email: data.parent_email.trim() || null,
      class: data.class,
      package_id: data.package_id,
      monthly_fee: data.monthly_fee,
      admission_date: data.admission_date || null,
      status: data.status,
      notes: data.notes.trim() || null,
    }).eq('id', editingStudent.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Student updated successfully' });
      setEditingStudent(null);
      fetchStudents();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('students').delete().eq('id', deleteId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Student deleted' });
      setDeleteId(null);
      fetchStudents();
    }
  };

  const getPackageName = (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return id;
    return typeof pkg.title === 'string' ? pkg.title : tr(pkg.title, language);
  };

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (search && !s.student_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterClass !== 'all' && s.class !== filterClass) return false;
      if (filterPackage !== 'all' && s.package_id !== filterPackage) return false;
      return true;
    });
  }, [students, search, filterClass, filterPackage]);

  if (viewingFees) {
    return (
      <FeeTracker
        studentId={viewingFees.id}
        studentName={viewingFees.student_name}
        monthlyFee={viewingFees.monthly_fee}
        year={currentYear}
        onBack={() => { setViewingFees(null); fetchStudents(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by student name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPackage} onValueChange={setFilterPackage}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Packages" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Packages</SelectItem>
            {packages.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {typeof p.title === 'string' ? p.title : tr(p.title, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Parent Mobile</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
            ) : (
              filtered.map(s => {
                const feeStatus = feeStatuses[s.id] || 'pending';
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm">{getPackageName(s.package_id)}</TableCell>
                    <TableCell>{s.parent_mobile}</TableCell>
                    <TableCell>₹{s.monthly_fee}</TableCell>
                    <TableCell>
                      <Badge variant={feeStatus === 'paid' ? 'default' : 'destructive'} className={feeStatus === 'paid' ? 'bg-secondary text-secondary-foreground' : ''}>
                        {feeStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewingFees(s)} title="View Fees">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingStudent(s)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} title="Delete" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Form */}
      <StudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Form */}
      <StudentForm
        open={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSubmit={handleEdit}
        isEditing
        initialData={editingStudent ? {
          student_name: editingStudent.student_name,
          parent_name: editingStudent.parent_name || '',
          student_mobile: editingStudent.student_mobile || '',
          parent_mobile: editingStudent.parent_mobile,
          student_email: editingStudent.student_email || '',
          parent_email: editingStudent.parent_email || '',
          class: editingStudent.class,
          package_id: editingStudent.package_id,
          monthly_fee: editingStudent.monthly_fee,
          admission_date: editingStudent.admission_date || '',
          status: editingStudent.status,
          notes: editingStudent.notes || '',
        } : null}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this student?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All fee records for this student will also be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStudents;
