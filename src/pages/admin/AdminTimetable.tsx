import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Calendar, Trash2, Eye, Loader2 } from 'lucide-react';

interface Timetable {
  id: string;
  title: string;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminTimetable = () => {
  const { config } = useTenant();
  const { tenantId } = useAdmin();

  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchTimetables = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      setTimetables([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('timetables')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    setTimetables((data as Timetable[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTimetables(); }, [tenantId]);

  const handleSubmit = async () => {
    if (!tenantId) {
      toast({ title: 'Tenant missing', description: 'Please log in again.', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    let imageUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${tenantId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('timetables')
        .upload(path, file);

      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('timetables').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('timetables').insert({
      tenant_id: tenantId,
      title: title.trim(),
      image_url: imageUrl,
      start_date: startDate || null,
      end_date: endDate || null,
      is_active: true,
    });

    setSaving(false);
    if (error) {
      toast({ title: 'Failed to add timetable', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Timetable added!' });
      setTitle(''); setStartDate(''); setEndDate(''); setFile(null);
      setFormOpen(false);
      fetchTimetables();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!tenantId) return;
    await supabase.from('timetables').update({ is_active: !current }).eq('id', id).eq('tenant_id', tenantId);
    fetchTimetables();
  };

  const deleteTimetable = async (id: string) => {
    if (!tenantId) return;
    await supabase.from('timetables').delete().eq('id', id).eq('tenant_id', tenantId);
    toast({ title: 'Timetable deleted' });
    fetchTimetables();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Timetable</h1>
          <p className="text-sm text-muted-foreground">Manage class timetables</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Timetable
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : timetables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No timetables yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timetables.map(tt => (
            <div key={tt.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{tt.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                    {tt.start_date && <span>From: {tt.start_date}</span>}
                    {tt.end_date && <span>To: {tt.end_date}</span>}
                  </div>
                </div>
                <Badge variant={tt.is_active ? 'default' : 'secondary'}>
                  {tt.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-2">
                {tt.image_url && (
                  <Button variant="outline" size="sm" onClick={() => setPreviewUrl(tt.image_url)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => toggleActive(tt.id, tt.is_active)}>
                  {tt.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteTimetable(tt.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Schedule – June 2026" />
            </div>
            <div>
              <Label>Upload Image / PDF</Label>
              <Input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : 'Add Timetable'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Timetable Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[70vh] rounded" />
            ) : (
              <img src={previewUrl} alt="Timetable" className="w-full rounded" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTimetable;
