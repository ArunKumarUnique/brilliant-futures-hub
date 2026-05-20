import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Download, Award, Share2 } from 'lucide-react';
import { generateCertificatePdf } from '@/lib/pdf-generators';
import LoaderOverlay from '@/components/admin/LoaderOverlay';

interface Student {
  id: string;
  student_name: string;
  parent_mobile: string;
  class: string;
}

const CertificateGenerator = () => {
  const { config } = useTenant();
  const { tenantId } = useAdmin();

  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatory, setSignatory] = useState(() => {
    const facultyMember = config.faculty?.[0];
    if (!facultyMember) return '';
    if (typeof facultyMember.name === 'string') return facultyMember.name;
    return (facultyMember.name as any)?.en || Object.values(facultyMember.name)[0] || '';
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) {
        setStudents([]);
        return;
      }
      const { data } = await supabase
        .from('students')
        .select('id, student_name, parent_mobile, class')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .eq('student_type', 'summer_camp')
        .order('student_name');
      setStudents(data || []);
    };
    load();
  }, [tenantId]);

  const selectedStudent = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

  useEffect(() => { setPreviewUrl(null); }, [studentId, date, signatory]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return iso; }
  };

  const generate = async () => {
    if (!selectedStudent) { toast({ title: 'Select a student', variant: 'destructive' }); return; }
    if (!tenantId) { toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' }); return; }
    setGenerating(true);
    try {
      const doc = await generateCertificatePdf({
        studentName: selectedStudent.student_name,
        instituteName: config.instituteName,
        logoUrl: config.logo,
        date: formatDate(date),
        signatoryName: signatory || 'Authorized Signatory',
        signatoryRole: 'Director',
      });
      const blob = doc.output('blob');
      setPreviewUrl(URL.createObjectURL(blob));
      toast({ title: 'Certificate generated' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!previewUrl || !selectedStudent) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const safeName = selectedStudent.student_name.trim().replace(/\s+/g, '_');
    a.download = `${safeName}_summer_camp_certificate.pdf`;
    a.click();
  };

  const shareWhatsApp = () => {
    if (!selectedStudent) return;
    const phone = selectedStudent.parent_mobile.replace(/\D/g, '');
    const fullPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = `Dear Parent,\n\nCongratulations! ${selectedStudent.student_name} has successfully completed our Summer Camp Program. Certificate attached.\n\n${config.instituteName}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      <LoaderOverlay open={generating} message="Generating document..." />
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Award className="w-5 h-5" /> Generate Summer Camp Certificate</h2>

        <div className="space-y-1.5">
          <Label>Student *</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.student_name} – {s.class}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Signatory Name</Label>
            <Input value={signatory} onChange={e => setSignatory(e.target.value)} placeholder="e.g. Mr. Karthik" />
          </div>
        </div>

        <Button className="w-full sm:w-auto" onClick={generate} disabled={generating || !studentId}>
          {generating ? 'Generating…' : 'Generate Certificate'}
        </Button>
      </div>

      {previewUrl && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>
              <Button size="sm" onClick={shareWhatsApp}><Share2 className="w-4 h-4 mr-1" /> WhatsApp</Button>
            </div>
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-muted">
            <iframe src={previewUrl} className="w-full h-[500px]" title="Certificate preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;
