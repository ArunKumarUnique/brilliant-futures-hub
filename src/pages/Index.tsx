import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Brain, Target, PenTool, MessageCircle, Heart, Atom, FlaskConical, Trophy, Lightbulb } from 'lucide-react';

import gallery1 from '@/assets/gallery-1.jpeg';
import gallery2 from '@/assets/gallery-2.jpeg';
import gallery3 from '@/assets/gallery-3.jpeg';
import facultyProfile from '@/assets/faculty-profile.jpeg';

const heroImages = [gallery1, gallery2, gallery3, facultyProfile];

const Index = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const expertiseItems = [
    { icon: Atom, label: t('expertise.physics'), color: 'text-primary' },
    { icon: Trophy, label: t('expertise.olympiad'), color: 'text-secondary' },
    { icon: Lightbulb, label: t('expertise.iit.physics'), color: 'text-primary' },
    { icon: FlaskConical, label: t('expertise.iit.chemistry'), color: 'text-secondary' },
  ];

  const whyChooseUs = [
    { icon: Brain, label: t('why.conceptual') },
    { icon: BookOpen, label: t('why.subject') },
    { icon: Target, label: t('why.skill') },
    { icon: PenTool, label: t('why.handwriting') },
    { icon: MessageCircle, label: t('why.communication') },
    { icon: Heart, label: t('why.stress') },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Slideshow */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img}
              alt={`Brilliant Tutorials ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl animate-slide-up">
            {t('hero.tagline')}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link to="/contact" className="btn-primary bg-white text-primary hover:bg-white/90">
              {t('hero.enquire')}
            </Link>
            <Link to="/admissions" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              {t('hero.admissions')}
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Faculty Expertise */}
      <section className="section-padding bg-card">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('expertise.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">{t('expertise.subtitle')}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {expertiseItems.map((item, index) => (
              <div key={index} className="feature-card group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-foreground">{item.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gradient">{t('why.title')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="feature-card">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-medium text-foreground">{item.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('hero.admissions')}</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">
            Join Brilliant Tutorials for expert guidance in Physics, Chemistry, and competitive exam preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary bg-white text-primary hover:bg-white/90">
              {t('hero.enquire')}
            </Link>
            <Link to="/faculty" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              Meet Our Faculty
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
