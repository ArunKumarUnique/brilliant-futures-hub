import { Phone, Mail, MapPin, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';

const Footer = () => {
  const { t, language, setLanguage } = useLanguage();
  const { config } = useTenant();
  const hasMultipleLanguages = config.languages.enabled.length > 1;

  const navLinks = [
    { path: '/', label: t('nav.home'), enabled: config.pages.home },
    { path: '/faculty', label: t('nav.faculty'), enabled: config.pages.faculty },
    { path: '/admissions', label: t('nav.admissions'), enabled: config.pages.admissions },
    { path: '/contact', label: t('nav.contact'), enabled: config.pages.contact },
  ].filter((l) => l.enabled);

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
              <span className="font-bold text-xl">{config.instituteName}</span>
            </div>
            <p className="text-primary-foreground/80 mb-2">{t('footer.experience')}</p>
            {config.footer.subtext && (
              <p className="text-primary-foreground/60 text-sm">{config.footer.subtext}</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('quick.links')}</h4>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('contact.info')}</h4>
            <div className="space-y-3">
              <a href={`tel:${config.contact.phone}`} className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Phone className="h-5 w-5" />
                <span>{config.contact.phone}</span>
              </a>
              <a href={`mailto:${config.contact.email}`} className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span>{config.contact.email}</span>
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: config.contact.addressHtml }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">{t('footer.copyright')}</p>
          {hasMultipleLanguages && (
            <div className="flex rounded-full overflow-hidden border border-primary-foreground/30">
              {config.languages.enabled.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-sm transition-colors ${language === lang ? 'bg-primary text-primary-foreground' : 'text-primary-foreground/60 hover:text-primary-foreground'}`}
                >
                  {config.languages.labels[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
