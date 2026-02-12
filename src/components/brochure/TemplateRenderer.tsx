import { TenantConfig } from '@/types/tenant';
import { BrochureContent, BrochureTemplateId } from '@/types/brochure';
import AdmissionPoster from './templates/AdmissionPoster';
import FacultyCard from './templates/FacultyCard';
import PromoCard from './templates/PromoCard';
import InstagramStory from './templates/InstagramStory';
import WhatsAppCard from './templates/WhatsAppCard';
import AchievementBanner from './templates/AchievementBanner';
import CoursePromo from './templates/CoursePromo';

interface Props {
  templateId: BrochureTemplateId;
  config: TenantConfig;
  content: BrochureContent;
}

const TemplateRenderer = ({ templateId, config, content }: Props) => {
  const props = { config, content };

  switch (templateId) {
    case 'admission-poster': return <AdmissionPoster {...props} />;
    case 'faculty-card': return <FacultyCard {...props} />;
    case 'promo-card': return <PromoCard {...props} />;
    case 'instagram-story': return <InstagramStory {...props} />;
    case 'whatsapp-card': return <WhatsAppCard {...props} />;
    case 'achievement-banner': return <AchievementBanner {...props} />;
    case 'course-promo': return <CoursePromo {...props} />;
    default: return null;
  }
};

export default TemplateRenderer;
