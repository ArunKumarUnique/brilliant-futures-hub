import { TenantConfig } from '@/types/tenant';

const config: TenantConfig = {
  id: 'brilliant-tutorials',
  instituteName: 'Brilliant Tutorials',
  instituteNameParts: ['Brilliant', 'Tutorials'],
  academicYear: '2026–27',

  theme: {
    primary: '221 83% 53%',
    primaryForeground: '210 40% 98%',
    secondary: '160 84% 39%',
    secondaryForeground: '210 40% 98%',
    accent: '160 84% 39%',
    accentForeground: '210 40% 98%',
    background: '210 40% 98%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    destructive: '0 84% 60%',
    destructiveForeground: '210 40% 98%',
    border: '214 32% 91%',
    input: '214 32% 91%',
    ring: '221 83% 53%',
    radius: '0.5rem',
    fontFamily: "'Poppins', 'Noto Sans Telugu', sans-serif",
    fontImportUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap',
  },

  languages: {
    enabled: ['en', 'te'],
    default: 'en',
    labels: { en: 'EN', te: 'తెలుగు' },
  },

  translations: {
    'nav.home': { en: 'Home', te: 'హోమ్' },
    'nav.faculty': { en: 'Faculty', te: 'ఫ్యాకల్టీ' },
    'nav.admissions': { en: 'Admissions', te: 'ప్రవేశాలు' },
    'nav.media': { en: 'Media', te: 'మీడియా' },
    'nav.contact': { en: 'Contact', te: 'సంప్రదించండి' },
    'hero.enquire': { en: 'Enquire Now', te: 'ఇప్పుడు విచారించండి' },
    'hero.admissions': { en: 'Admissions Open 2026–27', te: 'ప్రవేశాలు 2026–27' },
    'why.title': { en: 'Why Brilliant Tutorials?', te: 'బ్రిలియంట్ ట్యుటోరియల్స్ ఎందుకు?' },
    'faculty.title': { en: 'Founder & Lead Faculty', te: 'వ్యవస్థాపకుడు & లీడ్ ఫ్యాకల్టీ' },
    'faculty.specializations': { en: 'Specializations', te: 'స్పెషలైజేషన్స్' },
    'admissions.title': { en: 'Admissions Open', te: 'ప్రవేశాలు ప్రారంభం' },
    'admissions.year': { en: 'Academic Year 2026–27', te: 'అకడమిక్ సంవత్సరం 2026–27' },
    'admissions.classes': { en: 'Classes Offered', te: 'అందించే క్లాసులు' },
    'admissions.methodology': { en: 'Teaching Methodology', te: 'బోధన విధానం' },
    'admissions.cta': { en: 'Contact Us for Admission Enquiry', te: 'ప్రవేశ విచారణ కోసం సంప్రదించండి' },
    'media.title': { en: 'Media Gallery', te: 'మీడియా గ్యాలరీ' },
    'media.photos': { en: 'Photo Gallery', te: 'ఫోటో గ్యాలరీ' },
    'media.videos': { en: 'Videos', te: 'వీడియోలు' },
    'media.achievements': { en: 'Achievements', te: 'విజయాలు' },
    'contact.title': { en: 'Get In Touch', te: 'సంప్రదించండి' },
    'contact.form.student': { en: 'Student Name', te: 'విద్యార్థి పేరు' },
    'contact.form.parent': { en: 'Parent Name', te: 'తల్లిదండ్రుల పేరు' },
    'contact.form.class': { en: 'Class', te: 'క్లాస్' },
    'contact.form.phone': { en: 'Phone Number', te: 'ఫోన్ నంబర్' },
    'contact.form.message': { en: 'Message / Concern', te: 'మెసేజ్ / ఆందోళన' },
    'contact.form.submit': { en: 'Send Enquiry', te: 'విచారణ పంపండి' },
    'contact.whatsapp': { en: 'Chat on WhatsApp', te: 'WhatsApp లో చాట్' },
    'contact.address': { en: 'Our Location', te: 'మా లొకేషన్' },
    'footer.experience': { en: '5+ Years of Teaching Experience', te: '5+ సంవత్సరాల బోధన అనుభవం' },
    'footer.copyright': { en: '© 2025 Brilliant Tutorials. All rights reserved.', te: '© 2025 బ్రిలియంట్ ట్యుటోరియల్స్. అన్ని హక్కులు రిజర్వ్.' },
    'quick.links': { en: 'Quick Links', te: 'క్విక్ లింక్స్' },
    'contact.info': { en: 'Contact', te: 'సంప్రదింపు' },
    'send.enquiry': { en: 'Send an Enquiry', te: 'విచారణ పంపండి' },
    'contact.information': { en: 'Contact Information', te: 'సంప్రదింపు సమాచారం' },
    'coming.soon': { en: 'Coming Soon', te: 'త్వరలో' },
    'send.another': { en: 'Send Another Enquiry', te: 'మరొక విచారణ పంపండి' },
  },

  pages: {
    home: true,
    faculty: true,
    admissions: true,
    media: true,
    contact: true,
  },

  hero: {
    images: [
      '/tenants/brilliant-tutorials/hero-1.jpeg',
      '/tenants/brilliant-tutorials/hero-2.jpeg',
      '/tenants/brilliant-tutorials/hero-3.jpeg',
      '/tenants/brilliant-tutorials/hero-4.jpeg',
      '/tenants/brilliant-tutorials/hero-5.jpeg',
      '/tenants/brilliant-tutorials/hero-6.jpeg',
    ],
    tagline: { en: 'Building Strong Concepts. Shaping Bright Futures.', te: 'బలమైన కాన్సెప్ట్‌లు. ఉజ్వల భవిష్యత్తు.' },
    ctaButtons: [
      { label: { en: 'Enquire Now', te: 'ఇప్పుడు విచారించండి' }, link: '/contact', variant: 'primary' },
      { label: { en: 'Admissions Open 2026–27', te: 'ప్రవేశాలు 2026–27' }, link: '/admissions', variant: 'outline' },
    ],
  },

  expertise: {
    title: { en: 'Faculty Expertise', te: 'నిపుణత' },
    subtitle: { en: 'Expert guidance with strong conceptual clarity and result-oriented teaching.', te: 'బలమైన concept స్పష్టత మరియు ఫలిత ఆధారిత బోధనతో నిపుణుల మార్గదర్శకత్వం.' },
    items: [
      { icon: 'Atom', label: { en: 'Physics – E-Techno', te: 'ఫిజిక్స్ – E-Techno' }, color: 'primary' },
      { icon: 'Trophy', label: { en: 'Olympiad Physics', te: 'ఒలింపియాడ్ ఫిజిక్స్' }, color: 'secondary' },
      { icon: 'Lightbulb', label: { en: 'IIT Physics', te: 'IIT ఫిజిక్స్' }, color: 'primary' },
      { icon: 'FlaskConical', label: { en: 'IIT Chemistry', te: 'IIT కెమిస్ట్రీ' }, color: 'secondary' },
    ],
  },

  whyChooseUs: {
    title: { en: 'Why Brilliant Tutorials?', te: 'బ్రిలియంట్ ట్యుటోరియల్స్ ఎందుకు?' },
    items: [
      { icon: 'Brain', label: { en: 'Conceptual Understanding', te: 'కాన్సెప్చువల్ అవగాహన' } },
      { icon: 'BookOpen', label: { en: 'Subject Knowledge', te: 'సబ్జెక్ట్ నాలెడ్జ్' } },
      { icon: 'Target', label: { en: 'Skill Implementing Techniques', te: 'స్కిల్ టెక్నిక్స్' } },
      { icon: 'PenTool', label: { en: 'Handwriting Improvement', te: 'హ్యాండ్‌రైటింగ్' } },
      { icon: 'MessageCircle', label: { en: 'Communication Skills', te: 'కమ్యూనికేషన్ స్కిల్స్' } },
      { icon: 'Heart', label: { en: 'Stress Management', te: 'స్ట్రెస్ మేనేజ్‌మెంట్' } },
    ],
  },

  faculty: [
    {
      id: 'karthik',
      name: { en: 'Mr. Karthik Ananthoju', te: 'శ్రీ కార్తీక్ అనంతోజు' },
      image: '/tenants/brilliant-tutorials/faculty-profile.jpeg',
      qualification: { en: 'B.Tech – Electrical Engineering', te: 'B.Tech – ఎలక్ట్రికల్ ఇంజనీరింగ్' },
      experience: { en: '5+ Years of Teaching Experience', te: '5+ సంవత్సరాల బోధన అనుభవం' },
      institution: { en: 'Narayana Educational Academy', te: 'నారాయణ ఎడ్యుకేషనల్ అకాడమీ' },
      specializations: [
        'Physics (E-Techno, Olympiad, IIT)',
        'IIT Chemistry',
        'Concept-based Teaching',
        'Exam-oriented Preparation',
        'Student Mentoring',
      ],
      quote: {
        en: 'My goal is to build strong conceptual foundations that empower students to excel in any examination and beyond.',
        te: 'ప్రతి పరీక్షలో విజయం సాధించడానికి బలమైన మూలాధార అవగాహన నిర్మించడమే నా లక్ష్యం.',
      },
      priority: 1,
    },
  ],

  teachingPhilosophy: {
    title: { en: 'Teaching Philosophy', te: 'బోధన తత్వం' },
    items: [
      {
        icon: 'Brain',
        title: { en: 'Conceptual Clarity', te: 'కాన్సెప్చువల్ స్పష్టత' },
        description: { en: 'Building deep understanding of fundamentals that last a lifetime.', te: 'జీవితాంతం నిలిచే ఫండమెంటల్స్ యొక్క లోతైన అవగాహన.' },
        color: 'primary',
      },
      {
        icon: 'Target',
        title: { en: 'Result Oriented', te: 'ఫలిత ఆధారిత' },
        description: { en: 'Focused preparation strategies for competitive exams and board success.', te: 'పోటీ పరీక్షలు మరియు బోర్డ్ విజయం కోసం ఫోకస్డ్ ప్రిపరేషన్.' },
        color: 'secondary',
      },
      {
        icon: 'Users',
        title: { en: 'Personal Mentoring', te: 'వ్యక్తిగత మెంటారింగ్' },
        description: { en: "Individual attention to address each student's unique learning needs.", te: 'ప్రతి విద్యార్థి అవసరాలకు వ్యక్తిగత శ్రద్ధ.' },
        color: 'primary',
      },
    ],
  },

  admissions: {
    heroDescription: {
      en: 'Enroll now for expert coaching in Physics, Chemistry, and competitive exam preparation.',
      te: 'ఫిజిక్స్, కెమిస్ట్రీ మరియు పోటీ పరీక్ష ప్రిపరేషన్ కోసం ఇప్పుడే నమోదు చేసుకోండి.',
    },
    classesSubtitle: {
      en: 'Comprehensive coaching programs designed for students at every level',
      te: 'ప్రతి స్థాయి విద్యార్థుల కోసం రూపొందించబడిన సమగ్ర కోచింగ్ ప్రోగ్రామ్‌లు',
    },
    classes: [
      { grade: 'Classes 5–7', label: 'Upper Primary', description: 'Strong foundation building with conceptual approach' },
      { grade: 'Classes 8–10', label: 'High School', description: 'Board exam preparation with competitive edge' },
      { grade: 'Olympiad', label: 'Olympiad Preparation', description: 'Physics Olympiad specialized coaching' },
      { grade: 'IIT Foundation', label: 'IIT Aspirants', description: 'Physics & Chemistry for JEE preparation' },
    ],
    methodology: [
      'Concept-first approach to build strong fundamentals',
      'Regular assessments and performance tracking',
      'Doubt clearing sessions',
      'Focus on problem-solving techniques',
      'Exam-oriented preparation strategies',
      'Individual attention to each student',
    ],
    methodologyDescription: {
      en: 'Our teaching approach combines conceptual understanding with practical application, ensuring students are well-prepared for both board exams and competitive tests.',
      te: 'మా బోధన విధానం కాన్సెప్చువల్ అవగాహన మరియు ఆచరణాత్మక అనువర్తనాన్ని కలుపుతుంది.',
    },
    stats: [
      { value: '5+', label: 'Years Experience' },
      { value: '100+', label: 'Students Taught' },
      { value: '4', label: 'Subjects' },
      { value: '1:10', label: 'Teacher Ratio' },
    ],
    ctaDescription: {
      en: 'Take the first step towards academic excellence. Contact us today for admission details.',
      te: 'అకడమిక్ ఎక్సలెన్స్ వైపు మొదటి అడుగు వేయండి.',
    },
  },

  media: {
    subtitle: { en: 'Explore our journey and achievements', te: 'మా ప్రయాణం మరియు విజయాలను అన్వేషించండి' },
    photos: [
      { src: '/tenants/brilliant-tutorials/gallery-1.jpeg', caption: { en: 'Parent-Teacher Meeting', te: 'తల్లిదండ్రులు-ఉపాధ్యాయుల సమావేశం' } },
      { src: '/tenants/brilliant-tutorials/faculty-profile.jpeg', caption: { en: 'Mr. Karthik Ananthoju', te: 'శ్రీ కార్తీక్ అనంతోజు' } },
      { src: '/tenants/brilliant-tutorials/gallery-2.jpeg', caption: { en: 'Certificate Distribution', te: 'సర్టిఫికేట్ పంపిణీ' } },
      { src: '/tenants/brilliant-tutorials/gallery-3.jpeg', caption: { en: 'Classroom Teaching', te: 'తరగతి గది బోధన' } },
      { src: '/tenants/brilliant-tutorials/gallery-5.jpeg', caption: { en: 'Mr. Karthik at Narayana Educational Academy', te: 'నారాయణ ఎడ్యుకేషనల్ అకాడమీలో కార్తీక్' } },
      { src: '/tenants/brilliant-tutorials/gallery-6.jpeg', caption: { en: 'One-on-One Doubt Clearing Session', te: 'వ్యక్తిగత డౌట్ క్లియరింగ్ సెషన్' } },
      { src: '/tenants/brilliant-tutorials/gallery-7.jpeg', caption: { en: 'Students Engaged in Group Study', te: 'గ్రూప్ స్టడీలో విద్యార్థులు' } },
      { src: '/tenants/brilliant-tutorials/gallery-12.jpeg', caption: { en: 'Physics Class – Explaining Ohm\'s Law', te: 'ఫిజిక్స్ క్లాస్ – ఓమ్ నియమం వివరణ' } },
      { src: '/tenants/brilliant-tutorials/gallery-13.jpeg', caption: { en: 'Interactive Smart Board Teaching', te: 'ఇంటరాక్టివ్ స్మార్ట్ బోర్డ్ బోధన' } },
      { src: '/tenants/brilliant-tutorials/gallery-14.jpeg', caption: { en: 'Chemistry – Periodic Table Session for JEE Aspirants', te: 'కెమిస్ట్రీ – JEE విద్యార్థులకు పీరియాడిక్ టేబుల్ సెషన్' } },
      { src: '/tenants/brilliant-tutorials/gallery-8.jpeg', caption: { en: 'Brilliant Tutorials – Smart Teaching Poster', te: 'బ్రిలియంట్ ట్యుటోరియల్స్ – స్మార్ట్ టీచింగ్ పోస్టర్' } },
      { src: '/tenants/brilliant-tutorials/gallery-9.jpeg', caption: { en: 'Physics, Mathematics & Science – Subject Focus', te: 'ఫిజిక్స్, మ్యాథమెటిక్స్ & సైన్స్ – సబ్జెక్ట్ ఫోకస్' } },
      { src: '/tenants/brilliant-tutorials/gallery-10.jpeg', caption: { en: 'Brilliant Tutorials – Nursery to XII, 100% Results', te: 'బ్రిలియంట్ ట్యుటోరియల్స్ – నర్సరీ నుండి XII, 100% ఫలితాలు' } },
      { src: '/tenants/brilliant-tutorials/gallery-11.jpeg', caption: { en: 'Special Focus – All Subjects, All Classes', te: 'స్పెషల్ ఫోకస్ – అన్ని సబ్జెక్ట్‌లు, అన్ని క్లాసులు' } },
    ],
    achievements: [
      { title: 'Narayana Educational Academy', description: 'Former faculty member with extensive experience' },
      { title: 'B.Tech Graduate', description: 'Electrical Engineering background' },
      { title: 'Concept-based Teaching', description: 'Pioneer in fundamental-focused education' },
    ],
  },

  contact: {
    subtitle: { en: "We're here to help you with admission enquiries", te: 'ప్రవేశ విచారణల కోసం మేము ఇక్కడ ఉన్నాము' },
    email: 'karthikananthoju71@gmail.com',
    phone: '9398224736',
    whatsappNumber: '919398224736',
    address: {
      en: 'MN Reddy Nagar, Near Hanuman Temple, Chintal, Suchitra, Quthbullapur, Hyderabad, Telangana – 500067',
      te: 'MN రెడ్డి నగర్, హనుమాన్ టెంపుల్ సమీపంలో, చింతల్, హైదరాబాద్ – 500067',
    },
    addressHtml: 'MN Reddy Nagar, Near Hanuman Temple,<br />Chintal, Suchitra, Quthbullapur,<br />Hyderabad, Telangana – 500067',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.0!2d78.4!3d17.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDMwJzAwLjAiTiA3OMKwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
    mapLink: 'https://maps.app.goo.gl/mWbjUNuJiaqAQn4P6',
    enableEmail: true,
    enableWhatsapp: true,
    enableSms: false,
    classOptions: ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Olympiad', 'IIT Foundation'],
    successMessage: {
      en: 'Thank you for contacting Brilliant Tutorials. We will get back to you shortly.',
      te: 'బ్రిలియంట్ ట్యుటోరియల్స్‌ను సంప్రదించినందుకు ధన్యవాదాలు. మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.',
    },
  },

  seo: {
    title: 'Brilliant Tutorials | Expert Physics & Chemistry Coaching in Hyderabad',
    description: 'Brilliant Tutorials offers expert coaching for Physics, Chemistry, IIT, and Olympiad preparation in Chintal, Hyderabad. 5+ years experience. Admissions open 2026-27.',
    keywords: 'tuition, physics tuition, chemistry coaching, IIT coaching, Olympiad preparation, Hyderabad, Chintal, Suchitra, Quthbullapur',
    ogTitle: 'Brilliant Tutorials | Expert Physics & Chemistry Coaching',
    ogDescription: 'Building Strong Concepts. Shaping Bright Futures. Expert coaching for classes 5-10, IIT, and Olympiad preparation in Hyderabad.',
    canonical: 'https://brillianttutorials.in',
  },

  footer: {
    subtext: 'Narayana Educational Academy',
  },

  ctaSection: {
    description: {
      en: 'Join Brilliant Tutorials for expert guidance in Physics, Chemistry, and competitive exam preparation.',
      te: 'ఫిజిక్స్, కెమిస్ట్రీ మరియు పోటీ పరీక్ష ప్రిపరేషన్ కోసం బ్రిలియంట్ ట్యుటోరియల్స్‌లో చేరండి.',
    },
    secondaryButtonLabel: { en: 'Meet Our Faculty', te: 'ఫ్యాకల్టీని కలవండి' },
    secondaryButtonLink: '/faculty',
  },
};

export default config;
