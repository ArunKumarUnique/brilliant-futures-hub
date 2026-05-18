import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Download, Image, FileImage, ChevronLeft } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateRenderer from '@/components/brochure/TemplateRenderer';
import { BrochureContent, BrochureTemplateId, BROCHURE_TEMPLATES, BrochureTemplate } from '@/types/brochure';
import type { TenantConfig } from '@/types/tenant';

const defaultContent: BrochureContent = {
  title: '',
  subtitle: '',
  highlights: ['', '', '', ''],
  ctaText: '',
  academicYear: '',
  featuredSubject: '',
  selectedFacultyId: '',
  selectedGalleryImage: '',
  showFounderImage: true,
};

const BrochureBuilder = () => {
  const { config: baseConfig } = useTenant();
  const { tenantId } = useAdmin();
  const { tr } = useLanguage();
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BrochureTemplate | null>(null);
  const [tenantOverrides, setTenantOverrides] = useState<Partial<TenantConfig> | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const { data: reg } = await supabase
        .from('tenants_registry')
        .select('institute_name, logo_url, email, mobile, address, city, state, pincode')
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (!reg) return;
      const addressLine = [reg.address, reg.city, reg.state, reg.pincode].filter(Boolean).join(', ');
      setTenantOverrides({
        instituteName: reg.institute_name || baseConfig.instituteName,
        logo: reg.logo_url || baseConfig.logo,
        contact: {
          ...baseConfig.contact,
          email: reg.email || baseConfig.contact.email,
          phone: reg.mobile || baseConfig.contact.phone,
          whatsappNumber: reg.mobile || baseConfig.contact.whatsappNumber,
          address: addressLine || baseConfig.contact.address,
          addressHtml: addressLine ? addressLine.replace(/, /g, '<br/>') : baseConfig.contact.addressHtml,
        },
      });
    })();
  }, [tenantId]);

  const config = useMemo<TenantConfig>(
    () => (tenantOverrides ? { ...baseConfig, ...tenantOverrides } as TenantConfig : baseConfig),
    [baseConfig, tenantOverrides]
  );

  const [content, setContent] = useState<BrochureContent>({
    ...defaultContent,
    academicYear: baseConfig.academicYear,
    selectedFacultyId: baseConfig.faculty[0]?.id || '',
    selectedGalleryImage: baseConfig.hero.images[0] || '',
  });
  const [exporting, setExporting] = useState(false);

  const updateContent = (field: keyof BrochureContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const updateHighlight = (index: number, value: string) => {
    setContent(prev => {
      const highlights = [...prev.highlights];
      highlights[index] = value;
      return { ...prev, highlights };
    });
  };

  const handleExport = useCallback(async (format: 'png' | 'jpg') => {
    if (!previewRef.current || !selectedTemplate) return;
    setExporting(true);
    try {
      const fn = format === 'png' ? toPng : toJpeg;
      const dataUrl = await fn(previewRef.current, {
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        pixelRatio: 2,
        quality: 0.95,
      });
      const link = document.createElement('a');
      link.download = `${config.id}-${selectedTemplate.id}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [selectedTemplate, config.id]);

  // Template selection view
  if (!selectedTemplate) {
    return (
      <div className="animate-fade-in py-12">
        <div className="container-custom px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Brochure Builder</h1>
            <p className="text-muted-foreground">Create stunning promotional creatives using your institute data</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {BROCHURE_TEMPLATES.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-5">
                  <div
                    className="rounded-lg mb-3 flex items-center justify-center text-2xl"
                    style={{
                      aspectRatio: template.aspectRatio.replace(':', '/'),
                      background: `linear-gradient(135deg, hsl(${config.theme.primary} / 0.1), hsl(${config.theme.secondary} / 0.1))`,
                      maxHeight: '160px',
                    }}
                  >
                    <FileImage className="w-8 h-8 text-primary/40 group-hover:text-primary/70 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  <span className="text-[10px] text-muted-foreground/70 mt-1 block">{template.aspectRatio} • {template.width}×{template.height}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Editor + Preview view
  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="sticky top-16 md:top-20 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container-custom px-4 py-3 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Templates
          </Button>
          <h2 className="font-semibold text-sm hidden sm:block">{selectedTemplate.name}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleExport('jpg')} disabled={exporting}>
              <Image className="w-4 h-4 mr-1" /> JPG
            </Button>
            <Button size="sm" onClick={() => handleExport('png')} disabled={exporting}>
              <Download className="w-4 h-4 mr-1" /> PNG
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={content.title} onChange={e => updateContent('title', e.target.value)} placeholder="e.g. Admissions Open 2026-27" />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" value={content.subtitle} onChange={e => updateContent('subtitle', e.target.value)} placeholder="e.g. Expert coaching for all classes" />
                </div>
                <div>
                  <Label htmlFor="cta">CTA Text</Label>
                  <Input id="cta" value={content.ctaText} onChange={e => updateContent('ctaText', e.target.value)} placeholder="e.g. Enroll Now" />
                </div>
                <div>
                  <Label htmlFor="year">Academic Year</Label>
                  <Input id="year" value={content.academicYear} onChange={e => updateContent('academicYear', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="subject">Featured Subject</Label>
                  <Input id="subject" value={content.featuredSubject} onChange={e => updateContent('featuredSubject', e.target.value)} placeholder="e.g. Physics" />
                </div>

                <div className="space-y-2">
                  <Label>Highlights (up to 4)</Label>
                  {content.highlights.map((h, i) => (
                    <Input key={i} value={h} onChange={e => updateHighlight(i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                {config.founderImage && (
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <img src={config.founderImage} alt="Founder" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-medium">Show Founder Image</p>
                        <p className="text-xs text-muted-foreground">{config.founderLabel || 'Expert Faculty'}</p>
                      </div>
                    </div>
                    <Button
                      variant={content.showFounderImage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContent(prev => ({ ...prev, showFounderImage: !prev.showFounderImage }))}
                    >
                      {content.showFounderImage ? 'On' : 'Off'}
                    </Button>
                  </div>
                )}

                {config.faculty.length > 0 && (
                  <div>
                    <Label>Faculty Member</Label>
                    <Select value={content.selectedFacultyId} onValueChange={v => updateContent('selectedFacultyId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                      <SelectContent>
                        {config.faculty.map(f => {
                          const name = typeof f.name === 'string' ? f.name : f.name.en || Object.values(f.name)[0];
                          return <SelectItem key={f.id} value={f.id}>{name}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Background Image</Label>
                  <Select value={content.selectedGalleryImage} onValueChange={v => updateContent('selectedGalleryImage', v)}>
                    <SelectTrigger><SelectValue placeholder="Select image" /></SelectTrigger>
                    <SelectContent>
                      {[...config.hero.images, ...config.media.photos.map(p => p.src)].map((src, i) => (
                        <SelectItem key={i} value={src}>Image {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {content.selectedGalleryImage && (
                    <img src={content.selectedGalleryImage} alt="Selected" className="mt-2 rounded-lg h-24 w-auto object-cover" />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-3">Live Preview • {selectedTemplate.width}×{selectedTemplate.height}</p>
            <div
              className="border border-border rounded-lg overflow-hidden shadow-lg"
              style={{
                width: '100%',
                maxWidth: `${selectedTemplate.width}px`,
                aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
              }}
            >
              <div
                ref={previewRef}
                style={{
                  width: `${selectedTemplate.width}px`,
                  height: `${selectedTemplate.height}px`,
                  transform: `scale(${1})`,
                  transformOrigin: 'top left',
                }}
                className="origin-top-left"
              >
                <TemplateRenderer
                  templateId={selectedTemplate.id}
                  config={config}
                  content={content}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrochureBuilder;
