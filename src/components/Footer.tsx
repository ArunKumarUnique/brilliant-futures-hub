import { Phone, Mail, MapPin, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-custom section-padding">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Brilliant Tutorials</span>
            </div>
            <p className="text-primary-foreground/80 mb-2">{t('footer.experience')}</p>
            <p className="text-primary-foreground/60 text-sm">Narayana Educational Academy</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.home')}</Link>
              <Link to="/faculty" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.faculty')}</Link>
              <Link to="/admissions" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.admissions')}</Link>
              <Link to="/contact" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="tel:9398224736" className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Phone className="h-5 w-5" />
                <span>9398224736</span>
              </a>
              <a href="mailto:karthikananthoju71@gmail.com" className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span>karthikananthoju71@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <span>MN Reddy Nagar, Near Hanuman Temple, Chintal, Hyderabad - 500067</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">{t('footer.copyright')}</p>
          <div className="flex rounded-full overflow-hidden border border-primary-foreground/30">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground' : 'text-primary-foreground/60 hover:text-primary-foreground'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-3 py-1 text-sm transition-colors ${language === 'te' ? 'bg-primary text-primary-foreground' : 'text-primary-foreground/60 hover:text-primary-foreground'}`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
