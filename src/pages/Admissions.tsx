import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { CheckCircle, Users, Award, Calendar } from 'lucide-react';

const Admissions = () => {
  const { t, tr } = useLanguage();
  const { config } = useTenant();
  const { admissions } = config;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding hero-overlay text-white">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{t('admissions.title')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('admissions.year')}</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">{tr(admissions.heroDescription)}</p>
        </div>
      </section>

      {/* Classes Offered */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('admissions.classes')}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {tr(admissions.classesSubtitle)}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {admissions.classes.map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-xl card-elevated border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{tr(item.grade)}</h3>
                    <p className="text-primary font-medium mb-2">{tr(item.label)}</p>
                    <p className="text-muted-foreground text-sm">{tr(item.description)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('admissions.methodology')}</h2>
              <p className="text-muted-foreground mb-8">{tr(admissions.methodologyDescription)}</p>
              <ul className="space-y-4">
                {admissions.methodology.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{tr(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                {admissions.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-4xl font-bold ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>{stat.value}</div>
                    <div className="text-muted-foreground text-sm">{tr(stat.label)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <Award className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('admissions.cta')}</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">{tr(admissions.ctaDescription)}</p>
          {config.pages.contact && (
            <Link to="/contact" className="btn-primary bg-white text-primary hover:bg-white/90 inline-flex items-center gap-2">
              {t('hero.enquire')}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admissions;
