import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdmin } from '@/contexts/AdminContext';
import usePackages from '@/hooks/usePackages';
import { toast } from '@/hooks/use-toast';

interface PackageOption {
  id: string;
  name: string;
  type: 'regular' | 'summer_camp';
  fee: number;
}

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
  gender: string;
  parent_relation: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  initialData?: StudentFormData | null;
  isEditing?: boolean;
  defaultStudentType?: StudentType;
}

const CLASS_OPTIONS = [
  'Below 4th Class', '4th Class', '5th Class', '6th Class', '7th Class',
  '8th Class', '9th Class', '10th Class',
];

const StudentForm = ({ open, onClose, onSubmit, initialData, isEditing, defaultStudentType }: StudentFormProps) => {
  const { tenantId, summerCampEnabled } = useAdmin();
  const { packages: allPackages } = usePackages(tenantId || null, { status: 'active' });
  const [monthlyFeeInput, setMonthlyFeeInput] = useState<string>('0');
  // Tracks whether the user manually edited the fee; if so, we stop auto-filling on package change.
  const [feeManuallyEdited, setFeeManuallyEdited] = useState(false);

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
    student_type: defaultStudentType || 'regular',
    notes: '',
    gender: '',
    parent_relation: '',
  };

  const [form, setForm] = useState<StudentFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      const next = initialData
        ? { ...emptyForm, ...initialData }
        : { ...emptyForm, student_type: defaultStudentType || 'regular' };
      setForm(next);
      setMonthlyFeeInput(initialData ? String(initialData.monthly_fee ?? 0) : '0');
      setFeeManuallyEdited(!!initialData); // editing existing → preserve fee, don't auto-overwrite
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, defaultStudentType]);

  // derive grouped lists (after form exists)
  const regularPackages = allPackages.filter((p) => p.type === 'regular');
  const summerPackages = allPackages.filter((p) => p.type === 'summer_camp');
  // Show only groups relevant to current student type (default to regular)
  const packages = form?.student_type === 'summer_camp' ? summerPackages : regularPackages;

  const sanitizeMobile = (v: string) => v.replace(/\D/g, '').slice(0, 10);

  const handleChange = (field: keyof StudentFormData, value: string | number) => {
    setForm(prev => {
      let v = value;
      if ((field === 'student_mobile' || field === 'parent_mobile') && typeof v === 'string') {
        v = sanitizeMobile(v);
      }
      const next = { ...prev, [field]: v } as StudentFormData;
      // Auto-sync student type + monthly fee when package is selected/changed
      if (field === 'package_id' && typeof v === 'string') {
        const pkg = allPackages.find((p) => p.id === v);
        if (pkg) {
          next.student_type = pkg.type === 'summer_camp' ? 'summer_camp' : 'regular';
          if (!feeManuallyEdited) {
            next.monthly_fee = pkg.fee;
            setMonthlyFeeInput(String(pkg.fee));
          }
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!form.package_id) return;
    const selectedPkg = allPackages.find((p) => p.id === form.package_id);
    if (selectedPkg && selectedPkg.type !== form.student_type) {
      setForm(prev => ({ ...prev, package_id: '' }));
    }
  }, [form.student_type, form.package_id, allPackages]);


  const isValidMobile = (m: string) => /^\d{10}$/.test(m);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_name.trim()) {
      toast({ title: 'Validation Error', description: 'Student Name is required', variant: 'destructive' });
      return;
    }
    if (!form.parent_name.trim()) {
      toast({ title: 'Validation Error', description: 'Parent Name is required', variant: 'destructive' });
      return;
    }
    if (!form.parent_mobile.trim()) {
      toast({ title: 'Validation Error', description: 'Parent Mobile is required', variant: 'destructive' });
      return;
    }
    if (!isValidMobile(form.parent_mobile.trim())) {
      toast({ title: 'Validation Error', description: 'Enter valid 10-digit mobile number', variant: 'destructive' });
      return;
    }
    if (form.student_mobile.trim() && !isValidMobile(form.student_mobile.trim())) {
      toast({ title: 'Validation Error', description: 'Enter valid 10-digit mobile number', variant: 'destructive' });
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
    if (!/^[0-9]*$/.test(monthlyFeeInput)) {
      toast({ title: 'Validation Error', description: 'Monthly Fee must contain only digits', variant: 'destructive' });
      return;
    }
    const monthlyFeeValue = monthlyFeeInput.trim() === '' ? 0 : Number(monthlyFeeInput);
    if (Number.isNaN(monthlyFeeValue) || monthlyFeeValue < 0) {
      toast({ title: 'Validation Error', description: 'Monthly Fee must be a valid number', variant: 'destructive' });
      return;
    }
    // Validate selected package belongs to tenant and matches student_type
    const selectedPkg = allPackages.find(p => p.id === form.package_id) || null;
    if (!selectedPkg) {
      toast({ title: 'Validation Error', description: 'Selected package not found for this tenant', variant: 'destructive' });
      return;
    }
    if (selectedPkg.type !== form.student_type) {
      toast({ title: 'Validation Error', description: 'Selected package type does not match student type', variant: 'destructive' });
      return;
    }
    if (!form.student_type || (form.student_type !== 'regular' && form.student_type !== 'summer_camp')) {
      toast({ title: 'Validation Error', description: 'Student Type is required', variant: 'destructive' });
      return;
    }
    onSubmit({ ...form, monthly_fee: monthlyFeeValue });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student Type *</Label>
            <RadioGroup
              value={form.student_type}
              onValueChange={(v) => handleChange('student_type', v as 'regular' | 'summer_camp')}
              className="flex flex-wrap gap-4 pt-1"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="regular" id="type-regular" />
                <span className="text-sm">Regular Student</span>
              </label>
              {summerCampEnabled && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="summer_camp" id="type-summer" />
                  <span className="text-sm">Summer Camp Student</span>
                </label>
              )}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Student Name *</Label>
              <Input value={form.student_name} onChange={e => handleChange('student_name', e.target.value)} placeholder="Enter student name" />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Name *</Label>
              <Input value={form.parent_name} onChange={e => handleChange('parent_name', e.target.value)} placeholder="Enter parent name" />
            </div>
            <div className="space-y-1.5">
              <Label>Student Mobile</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={form.student_mobile}
                onChange={e => handleChange('student_mobile', e.target.value)}
                placeholder="10-digit mobile"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Mobile *</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={form.parent_mobile}
                onChange={e => handleChange('parent_mobile', e.target.value)}
                placeholder="10-digit mobile"
              />
              {form.parent_mobile && !/^\d{10}$/.test(form.parent_mobile) && (
                <p className="text-xs text-destructive">Enter valid 10-digit mobile number</p>
              )}
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
              <Select value={form.package_id} onValueChange={v => handleChange('package_id', v)} disabled={packages.length === 0}>
                <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>
                  {packages.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Create a package first</div>
                  ) : (
                    <>
                    {/* Grouped package display based on selected student type */}
                    {form.student_type === 'regular' && regularPackages.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Regular Packages</div>
                        {regularPackages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                    {form.student_type === 'summer_camp' && summerPackages.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Summer Camp Packages</div>
                        {summerPackages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                    {/* No fallback packages shown for new tenants */}
                    {packages.length > 0 && form.package_id && !packages.some(p => p.id === form.package_id) && (
                      <div className="px-3 py-2 text-sm text-destructive">Selected package is unavailable</div>
                    )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Fee (₹)</Label>
              <Input
                type="number"
                value={monthlyFeeInput}
                onChange={(e) => setMonthlyFeeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
              />
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
