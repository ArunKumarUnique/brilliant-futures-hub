export type BrochureTemplateId =
  | 'admission-poster'
  | 'faculty-card'
  | 'promo-card'
  | 'instagram-story'
  | 'whatsapp-card'
  | 'achievement-banner'
  | 'course-promo';

export interface BrochureTemplate {
  id: BrochureTemplateId;
  name: string;
  description: string;
  aspectRatio: string; // e.g. "1:1", "9:16", "16:9"
  width: number;
  height: number;
}

export interface BrochureContent {
  title: string;
  subtitle: string;
  highlights: string[];
  ctaText: string;
  academicYear: string;
  featuredSubject: string;
  selectedFacultyId: string;
  selectedGalleryImage: string;
}

export const BROCHURE_TEMPLATES: BrochureTemplate[] = [
  { id: 'admission-poster', name: 'Admission Open Poster', description: 'Announce admissions with branding & QR', aspectRatio: '3:4', width: 600, height: 800 },
  { id: 'faculty-card', name: 'Faculty Introduction', description: 'Showcase a faculty member\'s profile', aspectRatio: '1:1', width: 600, height: 600 },
  { id: 'promo-card', name: 'Promo Card', description: 'General social media promotional card', aspectRatio: '1:1', width: 600, height: 600 },
  { id: 'instagram-story', name: 'Instagram Story', description: 'Vertical story format for Instagram', aspectRatio: '9:16', width: 540, height: 960 },
  { id: 'whatsapp-card', name: 'WhatsApp Share Card', description: 'Compact card for WhatsApp sharing', aspectRatio: '16:9', width: 800, height: 450 },
  { id: 'achievement-banner', name: 'Achievement Banner', description: 'Highlight milestones and results', aspectRatio: '16:9', width: 800, height: 450 },
  { id: 'course-promo', name: 'Course Promotion', description: 'Promote specific courses or subjects', aspectRatio: '1:1', width: 600, height: 600 },
];
