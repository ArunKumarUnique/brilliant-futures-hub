export type Translatable = string | Record<string, string>;

export interface TenantTheme {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  fontFamily: string;
  fontImportUrl?: string;
}

export interface FacultyMember {
  id: string;
  name: Translatable;
  image: string;
  role?: Translatable;
  qualification: Translatable;
  experience: Translatable;
  institution?: Translatable;
  specializations: Translatable[];
  quote?: Translatable;
  priority: number;
}

export interface TeachingPhilosophyItem {
  icon: string;
  title: Translatable;
  description: Translatable;
  color: 'primary' | 'secondary';
}

export interface ExpertiseItem {
  icon: string;
  label: Translatable;
  color: 'primary' | 'secondary';
}

export interface WhyChooseItem {
  icon: string;
  label: Translatable;
}

export interface ClassOffering {
  grade: Translatable;
  label: Translatable;
  description: Translatable;
}

export interface StatItem {
  value: string;
  label: Translatable;
}

export interface PhotoItem {
  src: string;
  caption: Translatable;
}

export interface AchievementItem {
  title: Translatable;
  description: Translatable;
}

export interface TenantConfig {
  id: string;
  instituteName: string;
  instituteNameParts?: [string, string];
  academicYear: string;

  theme: TenantTheme;

  languages: {
    enabled: string[];
    default: string;
    labels: Record<string, string>;
  };

  translations: Record<string, Translatable>;

  pages: {
    home: boolean;
    faculty: boolean;
    admissions: boolean;
    media: boolean;
    contact: boolean;
  };

  hero: {
    images: string[];
    tagline: Translatable;
    ctaButtons: { label: Translatable; link: string; variant: 'primary' | 'outline' }[];
  };

  expertise: {
    title: Translatable;
    subtitle: Translatable;
    items: ExpertiseItem[];
  };

  whyChooseUs: {
    title: Translatable;
    items: WhyChooseItem[];
  };

  faculty: FacultyMember[];

  teachingPhilosophy: {
    title: Translatable;
    items: TeachingPhilosophyItem[];
  };

  admissions: {
    heroDescription: Translatable;
    classesSubtitle: Translatable;
    classes: ClassOffering[];
    methodology: Translatable[];
    methodologyDescription: Translatable;
    stats: StatItem[];
    ctaDescription: Translatable;
  };

  media: {
    subtitle: Translatable;
    photos: PhotoItem[];
    achievements: AchievementItem[];
  };

  contact: {
    subtitle: Translatable;
    email: string;
    phone: string;
    whatsappNumber: string;
    address: Translatable;
    addressHtml: string;
    mapEmbedUrl: string;
    mapLink: string;
    enableEmail: boolean;
    enableWhatsapp: boolean;
    enableSms: boolean;
    classOptions: string[];
    successMessage: Translatable;
    followUpMessage?: Translatable;
  };

  seo: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    canonical?: string;
  };

  footer: {
    subtext?: string;
  };

  ctaSection: {
    description: Translatable;
    secondaryButtonLabel: Translatable;
    secondaryButtonLink: string;
  };
}
