import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { config } = useTenant();
  const location = useLocation();

  const allLinks = [
    { path: '/', label: t('nav.home'), enabled: config.pages.home },
    { path: '/faculty', label: t('nav.faculty'), enabled: config.pages.faculty },
    { path: '/admissions', label: t('nav.admissions'), enabled: config.pages.admissions },
    { path: '/media', label: t('nav.media'), enabled: config.pages.media },
    { path: '/contact', label: t('nav.contact'), enabled: config.pages.contact },
    { path: '/packages', label: t('nav.packages'), enabled: config.pages.packages },
    
  ];

  const navLinks = allLinks.filter((l) => l.enabled);
  const isActive = (path: string) => location.pathname === path;
  const hasMultipleLanguages = config.languages.enabled.length > 1;

  return (
    <header className="bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {config.logo ? (
              <img src={config.logo} alt={config.instituteName} className="h-10 md:h-14 w-auto" />
            ) : (
              <div className="bg-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <div>
              {config.instituteNameParts ? (
                <>
                  <span className="font-bold text-lg md:text-xl text-foreground">{config.instituteNameParts[0]}</span>
                  <span className="font-bold text-lg md:text-xl text-primary"> {config.instituteNameParts[1]}</span>
                </>
              ) : (
                <span className="font-bold text-lg md:text-xl text-foreground">{config.instituteName}</span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={isActive(link.path) ? 'nav-link-active' : 'nav-link'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            {hasMultipleLanguages && (
              <div className="flex rounded-full overflow-hidden border border-border">
                {config.languages.enabled.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`lang-toggle ${language === lang ? 'lang-toggle-active' : 'lang-toggle-inactive'}`}
                  >
                    {config.languages.labels[lang]}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 px-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 ${isActive(link.path) ? 'nav-link-active' : 'nav-link'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
