import { TenantConfig } from '@/types/tenant';

const config: TenantConfig = {
  id: 'demo-academy',
  instituteName: 'Excel Academy',
  instituteNameParts: ['Excel', 'Academy'],
  academicYear: '2026–27',

  theme: {
    primary: '262 83% 58%',
    primaryForeground: '0 0% 100%',
    secondary: '38 92% 50%',
    secondaryForeground: '0 0% 100%',
    accent: '262 83% 58%',
    accentForeground: '0 0% 100%',
    background: '270 20% 98%',
    foreground: '262 40% 11%',
    card: '0 0% 100%',
    cardForeground: '262 40% 11%',
    muted: '270 20% 96%',
    mutedForeground: '262 16% 47%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    border: '270 20% 91%',
    input: '270 20% 91%',
    ring: '262 83% 58%',
    radius: '0.75rem',
    fontFamily: "'Inter', sans-serif",
    fontImportUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },

  languages: {
    enabled: ['en'],
    default: 'en',
    labels: { en: 'EN' },
  },

  translations: {
    'nav.home': 'Home',
    'nav.faculty': 'Our Team',
    'nav.admissions': 'Enroll',
    'nav.media': 'Gallery',
    'nav.contact': 'Contact',
    'nav.brochure': 'Brochure',
    'hero.enquire': 'Get Started',
    'hero.admissions': 'Enrollment Open 2026–27',
    'why.title': 'Why Excel Academy?',
    'faculty.title': 'Our Teaching Team',
    'faculty.specializations': 'Areas of Expertise',
    'admissions.title': 'Enrollment Open',
    'admissions.year': 'Session 2026–27',
    'admissions.classes': 'Programs Available',
    'admissions.methodology': 'Our Approach',
    'admissions.cta': 'Start Your Journey Today',
    'media.title': 'Gallery',
    'media.photos': 'Photos',
    'media.videos': 'Videos',
    'media.achievements': 'Milestones',
    'contact.title': 'Reach Out',
    'contact.form.student': 'Student Name',
    'contact.form.parent': 'Guardian Name',
    'contact.form.class': 'Program',
    'contact.form.phone': 'Phone',
    'contact.form.message': 'Your Message',
    'contact.form.submit': 'Submit',
    'contact.whatsapp': 'WhatsApp Us',
    'contact.address': 'Find Us',
    'footer.experience': '8+ Years of Academic Excellence',
    'footer.copyright': '© 2025 Excel Academy. All rights reserved.',
    'quick.links': 'Quick Links',
    'contact.info': 'Contact',
    'send.enquiry': 'Send a Message',
    'contact.information': 'Contact Details',
    'coming.soon': 'Coming Soon',
    'send.another': 'Send Another Message',
  },

  pages: {
    home: true,
    faculty: true,
    admissions: true,
    media: true,
    contact: true,
    brochureBuilder: true,
  },

  hero: {
    images: [
      '/tenants/brilliant-tutorials/gallery-1.jpeg',
      '/tenants/brilliant-tutorials/gallery-2.jpeg',
    ],
    tagline: 'Excellence in Education. Success in Every Exam.',
    ctaButtons: [
      { label: 'Get Started', link: '/contact', variant: 'primary' },
      { label: 'View Programs', link: '/admissions', variant: 'outline' },
    ],
  },

  expertise: {
    title: 'Our Expertise',
    subtitle: 'Comprehensive coaching with modern teaching methods and proven results.',
    items: [
      { icon: 'Calculator', label: 'Mathematics', color: 'primary' },
      { icon: 'Atom', label: 'Science', color: 'secondary' },
      { icon: 'Globe', label: 'English', color: 'primary' },
      { icon: 'BookOpen', label: 'Social Studies', color: 'secondary' },
    ],
  },

  whyChooseUs: {
    title: 'Why Excel Academy?',
    items: [
      { icon: 'Brain', label: 'Smart Learning' },
      { icon: 'Target', label: 'Goal-oriented Teaching' },
      { icon: 'BookOpen', label: 'Updated Curriculum' },
      { icon: 'Users', label: 'Small Batch Size' },
      { icon: 'Star', label: 'Proven Track Record' },
      { icon: 'Rocket', label: 'Career Guidance' },
    ],
  },

  faculty: [
    {
      id: 'demo-faculty',
      name: 'Dr. Priya Sharma',
      image: '/tenants/brilliant-tutorials/faculty-profile.jpeg',
      role: 'Director & Lead Educator',
      qualification: 'M.Sc, Ph.D – Mathematics',
      experience: '8+ Years of Teaching Experience',
      institution: 'Former Professor, Delhi University',
      specializations: [
        'Advanced Mathematics',
        'Vedic Maths',
        'CBSE & ICSE Boards',
        'Competitive Exam Prep',
        'Career Counseling',
      ],
      quote: 'Every student has unlimited potential. Our job is to unlock it.',
      priority: 1,
    },
  ],

  teachingPhilosophy: {
    title: 'Our Approach',
    items: [
      {
        icon: 'Lightbulb',
        title: 'Innovation',
        description: 'Modern teaching tools and interactive learning methods.',
        color: 'primary',
      },
      {
        icon: 'Target',
        title: 'Goal Setting',
        description: 'Clear milestones and structured study plans for every student.',
        color: 'secondary',
      },
      {
        icon: 'Heart',
        title: 'Student Wellbeing',
        description: 'Holistic development focusing on mental health and confidence.',
        color: 'primary',
      },
    ],
  },

  admissions: {
    heroDescription: 'Join our award-winning programs for academic excellence.',
    classesSubtitle: 'Programs designed for every learning stage',
    classes: [
      { grade: 'Classes 1–5', label: 'Primary', description: 'Foundation building with fun learning' },
      { grade: 'Classes 6–8', label: 'Middle School', description: 'Conceptual learning with practical exposure' },
      { grade: 'Classes 9–10', label: 'Board Prep', description: 'Intensive board exam preparation' },
      { grade: 'Classes 11–12', label: 'Senior Secondary', description: 'Stream-specific advanced coaching' },
    ],
    methodology: [
      'Interactive classroom sessions',
      'Weekly tests and feedback',
      'Parent-teacher meetings',
      'Digital learning resources',
      'Personalized study plans',
      'Regular progress reports',
    ],
    methodologyDescription: 'We blend traditional teaching excellence with modern technology to create an engaging learning environment.',
    stats: [
      { value: '8+', label: 'Years' },
      { value: '500+', label: 'Students' },
      { value: '6', label: 'Subjects' },
      { value: '1:15', label: 'Ratio' },
    ],
    ctaDescription: 'Give your child the best education. Enroll today!',
  },

  media: {
    subtitle: 'Moments from our academy',
    photos: [
      { src: '/tenants/brilliant-tutorials/gallery-1.jpeg', caption: 'Annual Day' },
      { src: '/tenants/brilliant-tutorials/gallery-2.jpeg', caption: 'Science Exhibition' },
      { src: '/tenants/brilliant-tutorials/gallery-3.jpeg', caption: 'Sports Day' },
    ],
    achievements: [
      { title: '100% Board Results', description: 'All students passed with distinction' },
      { title: 'Best Academy Award', description: 'Regional education excellence award 2024' },
    ],
  },

  contact: {
    subtitle: 'We would love to hear from you',
    email: 'info@excelacademy.com',
    phone: '9876543210',
    whatsappNumber: '919876543210',
    address: '123 Education Street, Koramangala, Bangalore, Karnataka – 560034',
    addressHtml: '123 Education Street,<br />Koramangala,<br />Bangalore, Karnataka – 560034',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.6!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU0JzAwLjAiTiA3N8KwMzYnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
    mapLink: 'https://maps.app.goo.gl/example',
    enableEmail: true,
    enableWhatsapp: true,
    enableSms: false,
    classOptions: ['Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12'],
    successMessage: 'Thank you for your interest in Excel Academy. Our team will contact you within 24 hours.',
  },

  seo: {
    title: 'Excel Academy | Premium Coaching in Bangalore',
    description: 'Excel Academy offers comprehensive coaching for all subjects, board exams, and competitive preparation in Bangalore.',
    keywords: 'coaching, tuition, Bangalore, CBSE, ICSE, board exams',
    ogTitle: 'Excel Academy | Premium Coaching',
    ogDescription: 'Excellence in Education. Success in Every Exam.',
  },

  footer: {
    subtext: 'A Unit of Excel Education Pvt. Ltd.',
  },

  ctaSection: {
    description: 'Join Excel Academy for comprehensive, personalized education that delivers results.',
    secondaryButtonLabel: 'Meet Our Team',
    secondaryButtonLink: '/faculty',
  },
};

export default config;
