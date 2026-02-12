import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { getIcon } from '@/lib/icon-registry';

const Index = () => {
  const { t, tr } = useLanguage();
  const { config } = useTenant();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = config.hero.images;

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={img}
              alt={`${config.instituteName} ${index + 1}`}
              className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="absolute inset-0 flex flex-col items-end justify-end text-center px-4 pb-24 md:pb-32">
          <div className="w-full">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-4 max-w-3xl mx-auto animate-slide-up drop-shadow-lg">
              {tr(config.hero.tagline)}
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 justify-center">
              {config.hero.ctaButtons.map((btn, i) => (
                <Link
                  key={i}
                  to={btn.link}
                  className={
                    btn.variant === 'primary'
                      ? 'btn-primary bg-white/95 text-primary hover:bg-white text-sm md:text-base px-5 py-2.5'
                      : 'btn-outline border-white/80 text-white hover:bg-white hover:text-primary text-sm md:text-base px-5 py-2.5'
                  }
                >
                  {tr(btn.label)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/70'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Faculty Expertise */}
      <section className="section-padding bg-card">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{tr(config.expertise.title)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">{tr(config.expertise.subtitle)}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {config.expertise.items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={index} className="feature-card group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-8 h-8 ${item.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{tr(item.label)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gradient">{tr(config.whyChooseUs.title)}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {config.whyChooseUs.items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={index} className="feature-card">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-medium text-foreground">{tr(item.label)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('hero.admissions')}</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">{tr(config.ctaSection.description)}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.pages.contact && (
              <Link to="/contact" className="btn-primary bg-white text-primary hover:bg-white/90">
                {t('hero.enquire')}
              </Link>
            )}
            <Link to={config.ctaSection.secondaryButtonLink} className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              {tr(config.ctaSection.secondaryButtonLabel)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
