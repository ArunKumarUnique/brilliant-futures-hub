import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', te: 'హోమ్' },
  'nav.faculty': { en: 'Faculty', te: 'ఫ్యాకల్టీ' },
  'nav.admissions': { en: 'Admissions', te: 'ప్రవేశాలు' },
  'nav.media': { en: 'Media', te: 'మీడియా' },
  'nav.contact': { en: 'Contact', te: 'సంప్రదించండి' },

  // Hero
  'hero.tagline': { en: 'Building Strong Concepts. Shaping Bright Futures.', te: 'బలమైన కాన్సెప్ట్‌లు. ఉజ్వల భవిష్యత్తు.' },
  'hero.enquire': { en: 'Enquire Now', te: 'ఇప్పుడు విచారించండి' },
  'hero.admissions': { en: 'Admissions Open 2026–27', te: 'ప్రవేశాలు 2026–27' },

  // Faculty Expertise
  'expertise.title': { en: 'Faculty Expertise', te: 'నిపుణత' },
  'expertise.subtitle': { en: 'Expert guidance with strong conceptual clarity and result-oriented teaching.', te: 'బలమైన concept స్పష్టత మరియు ఫలిత ఆధారిత బోధనతో నిపుణుల మార్గదర్శకత్వం.' },
  'expertise.physics': { en: 'Physics – E-Techno', te: 'ఫిజిక్స్ – E-Techno' },
  'expertise.olympiad': { en: 'Olympiad Physics', te: 'ఒలింపియాడ్ ఫిజిక్స్' },
  'expertise.iit.physics': { en: 'IIT Physics', te: 'IIT ఫిజిక్స్' },
  'expertise.iit.chemistry': { en: 'IIT Chemistry', te: 'IIT కెమిస్ట్రీ' },

  // Why Choose Us
  'why.title': { en: 'Why Brilliant Tutorials?', te: 'బ్రిలియంట్ ట్యుటోరియల్స్ ఎందుకు?' },
  'why.conceptual': { en: 'Conceptual Understanding', te: 'కాన్సెప్చువల్ అవగాహన' },
  'why.subject': { en: 'Subject Knowledge', te: 'సబ్జెక్ట్ నాలెడ్జ్' },
  'why.skill': { en: 'Skill Implementing Techniques', te: 'స్కిల్ టెక్నిక్స్' },
  'why.handwriting': { en: 'Handwriting Improvement', te: 'హ్యాండ్‌రైటింగ్' },
  'why.communication': { en: 'Communication Skills', te: 'కమ్యూనికేషన్ స్కిల్స్' },
  'why.stress': { en: 'Stress Management', te: 'స్ట్రెస్ మేనేజ్‌మెంట్' },

  // Faculty Page
  'faculty.title': { en: 'Founder & Lead Faculty', te: 'వ్యవస్థాపకుడు & లీడ్ ఫ్యాకల్టీ' },
  'faculty.name': { en: 'Mr. Karthik Ananthoju', te: 'శ్రీ కార్తీక్ అనంతోజు' },
  'faculty.qualification': { en: 'B.Tech – Electrical Engineering', te: 'B.Tech – ఎలక్ట్రికల్ ఇంజనీరింగ్' },
  'faculty.experience': { en: '5+ Years of Teaching Experience', te: '5+ సంవత్సరాల బోధన అనుభవం' },
  'faculty.narayana': { en: 'Narayana Educational Academy', te: 'నారాయణ ఎడ్యుకేషనల్ అకాడమీ' },
  'faculty.specializations': { en: 'Specializations', te: 'స్పెషలైజేషన్స్' },

  // Admissions
  'admissions.title': { en: 'Admissions Open', te: 'ప్రవేశాలు ప్రారంభం' },
  'admissions.year': { en: 'Academic Year 2026–27', te: 'అకడమిక్ సంవత్సరం 2026–27' },
  'admissions.classes': { en: 'Classes Offered', te: 'అందించే క్లాసులు' },
  'admissions.methodology': { en: 'Teaching Methodology', te: 'బోధన విధానం' },
  'admissions.cta': { en: 'Contact Us for Admission Enquiry', te: 'ప్రవేశ విచారణ కోసం సంప్రదించండి' },

  // Media
  'media.title': { en: 'Media Gallery', te: 'మీడియా గ్యాలరీ' },
  'media.photos': { en: 'Photo Gallery', te: 'ఫోటో గ్యాలరీ' },
  'media.videos': { en: 'Videos', te: 'వీడియోలు' },
  'media.achievements': { en: 'Achievements', te: 'విజయాలు' },

  // Contact
  'contact.title': { en: 'Get In Touch', te: 'సంప్రదించండి' },
  'contact.form.student': { en: 'Student Name', te: 'విద్యార్థి పేరు' },
  'contact.form.parent': { en: 'Parent Name', te: 'తల్లిదండ్రుల పేరు' },
  'contact.form.class': { en: 'Class', te: 'క్లాస్' },
  'contact.form.phone': { en: 'Phone Number', te: 'ఫోన్ నంబర్' },
  'contact.form.message': { en: 'Message / Concern', te: 'మెసేజ్ / ఆందోళన' },
  'contact.form.submit': { en: 'Send Enquiry', te: 'విచారణ పంపండి' },
  'contact.success': { en: 'Thank you for contacting Brilliant Tutorials. We will get back to you shortly.', te: 'బ్రిలియంట్ ట్యుటోరియల్స్‌ను సంప్రదించినందుకు ధన్యవాదాలు. మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.' },
  'contact.whatsapp': { en: 'Chat on WhatsApp', te: 'WhatsApp లో చాట్' },
  'contact.address': { en: 'Our Location', te: 'మా లొకేషన్' },

  // Footer
  'footer.experience': { en: '5+ Years of Teaching Experience', te: '5+ సంవత్సరాల బోధన అనుభవం' },
  'footer.copyright': { en: '© 2025 Brilliant Tutorials. All rights reserved.', te: '© 2025 బ్రిలియంట్ ట్యుటోరియల్స్. అన్ని హక్కులు రిజర్వ్.' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
