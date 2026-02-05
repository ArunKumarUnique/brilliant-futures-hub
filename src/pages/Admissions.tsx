import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Users, BookOpen, Award, Calendar } from 'lucide-react';

const Admissions = () => {
  const { t } = useLanguage();

  const classesOffered = [
    { grade: 'Classes 5–7', label: 'Upper Primary', description: 'Strong foundation building with conceptual approach' },
    { grade: 'Classes 8–10', label: 'High School', description: 'Board exam preparation with competitive edge' },
    { grade: 'Olympiad', label: 'Olympiad Preparation', description: 'Physics Olympiad specialized coaching' },
    { grade: 'IIT Foundation', label: 'IIT Aspirants', description: 'Physics & Chemistry for JEE preparation' },
  ];

  const methodology = [
    'Concept-first approach to build strong fundamentals',
    'Regular assessments and performance tracking',
    'Doubt clearing sessions',
    'Focus on problem-solving techniques',
    'Exam-oriented preparation strategies',
    'Individual attention to each student',
  ];

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
          <p className="text-white/90 max-w-2xl mx-auto text-lg">
            Enroll now for expert coaching in Physics, Chemistry, and competitive exam preparation.
          </p>
        </div>
      </section>

      {/* Classes Offered */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('admissions.classes')}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Comprehensive coaching programs designed for students at every level
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {classesOffered.map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-xl card-elevated border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{item.grade}</h3>
                    <p className="text-primary font-medium mb-2">{item.label}</p>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
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
              <p className="text-muted-foreground mb-8">
                Our teaching approach combines conceptual understanding with practical application, 
                ensuring students are well-prepared for both board exams and competitive tests.
              </p>
              <ul className="space-y-4">
                {methodology.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">5+</div>
                  <div className="text-muted-foreground text-sm">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary">100+</div>
                  <div className="text-muted-foreground text-sm">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">4</div>
                  <div className="text-muted-foreground text-sm">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary">1:10</div>
                  <div className="text-muted-foreground text-sm">Teacher Ratio</div>
                </div>
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
          <p className="text-white/90 max-w-xl mx-auto mb-8">
            Take the first step towards academic excellence. Contact us today for admission details.
          </p>
          <Link to="/contact" className="btn-primary bg-white text-primary hover:bg-white/90 inline-flex items-center gap-2">
            {t('hero.enquire')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Admissions;
