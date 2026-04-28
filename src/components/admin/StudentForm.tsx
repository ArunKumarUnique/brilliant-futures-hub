import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

export type StudentType = 'regular' | 'summer_camp';

export interface StudentFormData {
  student_name: string;
  parent_name: string;
  student_mobile: string;
  parent_mobile: string;
  student_email: string;
  parent_email: string;
  class: string;
  package_id: string;
  monthly_fee: number;
  admission_date: string;
  status: string;
  student_type: StudentType;
  notes: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  initialData?: StudentFormData | null;
  isEditing?: boolean;
}

const CLASS_OPTIONS = [
  'Below 4th Class', '4th Class', '5th Class', '6th Class', '7th Class',
  '8th Class', '9th Class', '10th Class',
];

const StudentForm = ({ open, onClose, onSubmit, initialData, isEditing }: StudentFormProps) => {
  const { config, tr } = useTenant();
  const { language } = useLanguage();
  const packages = config.packages?.items || [];

  const emptyForm: StudentFormData = {
    student_name: '',
    parent_name: '',
    student_mobile: '',
    parent_mobile: '',
    student_email: '',
    parent_email: '',
    class: '',
    package_id: '',
    monthly_fee: 0,
    admission_date: new Date().toISOString().split('T')[0],
    status: 'active',
    student_type: 'regular',
    notes: '',
  };

  const [form, setForm] = useState<StudentFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyForm);
    }
  }, [open, initialData]);

  const handleChange = (field: keyof StudentFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_name.trim()) {
      toast({ title: 'Validation Error', description: 'Student Name is required', variant: 'destructive' });
      return;
    }
    if (!form.parent_mobile.trim()) {
      toast({ title: 'Validation Error', description: 'Parent Mobile is required', variant: 'destructive' });
      return;
    }
    if (!form.class) {
      toast({ title: 'Validation Error', description: 'Class is required', variant: 'destructive' });
      return;
    }
    if (!form.package_id) {
      toast({ title: 'Validation Error', description: 'Package is required', variant: 'destructive' });
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Student Name *</Label>
              <Input value={form.student_name} onChange={e => handleChange('student_name', e.target.value)} placeholder="Enter student name" />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Name</Label>
              <Input value={form.parent_name} onChange={e => handleChange('parent_name', e.target.value)} placeholder="Enter parent name" />
            </div>
            <div className="space-y-1.5">
              <Label>Student Mobile</Label>
              <Input value={form.student_mobile} onChange={e => handleChange('student_mobile', e.target.value)} placeholder="Student mobile" />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Mobile *</Label>
              <Input value={form.parent_mobile} onChange={e => handleChange('parent_mobile', e.target.value)} placeholder="Parent mobile" />
            </div>
            <div className="space-y-1.5">
              <Label>Student Email</Label>
              <Input type="email" value={form.student_email} onChange={e => handleChange('student_email', e.target.value)} placeholder="Student email" />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Email</Label>
              <Input type="email" value={form.parent_email} onChange={e => handleChange('parent_email', e.target.value)} placeholder="Parent email" />
            </div>
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={v => handleChange('class', v)}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Package *</Label>
              <Select value={form.package_id} onValueChange={v => handleChange('package_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>
                  {packages.map(p => (
                    <SelectItem key={p.id} value={p.id}>{typeof p.title === 'string' ? p.title : tr(p.title, language)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Fee (₹)</Label>
              <Input type="number" value={form.monthly_fee} onChange={e => handleChange('monthly_fee', Number(e.target.value))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Admission Date</Label>
              <Input type="date" value={form.admission_date} onChange={e => handleChange('admission_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Any additional notes..." rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Student'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
