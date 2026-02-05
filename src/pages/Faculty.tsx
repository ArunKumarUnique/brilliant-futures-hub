import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, Award, BookOpen, Users, Target, Brain } from 'lucide-react';
import facultyProfile from '@/assets/faculty-profile.jpeg';

const Faculty = () => {
  const { t } = useLanguage();

  const specializations = [
    'Physics (E-Techno, Olympiad, IIT)',
    'IIT Chemistry',
    'Concept-based Teaching',
    'Exam-oriented Preparation',
    'Student Mentoring',
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('faculty.title')}</h1>
          <p className="text-muted-foreground text-center">Brilliant Tutorials</p>
        </div>
      </section>

      {/* Faculty Profile */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden card-elevated">
                <img
                  src={facultyProfile}
                  alt="Mr. Karthik Ananthoju"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg">
                <span className="font-semibold">5+ Years Experience</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t('faculty.name')}</h2>
                <p className="text-muted-foreground text-lg">{t('faculty.qualification')}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium">{t('faculty.experience')}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  <span className="font-medium">{t('faculty.narayana')}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">{t('faculty.specializations')}</h3>
                <ul className="space-y-3">
                  {specializations.map((spec, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-muted-foreground">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "My goal is to build strong conceptual foundations that empower students to excel in any examination and beyond."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Teaching Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Conceptual Clarity</h3>
              <p className="text-muted-foreground text-sm">Building deep understanding of fundamentals that last a lifetime.</p>
            </div>
            <div className="feature-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 mb-4">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Result Oriented</h3>
              <p className="text-muted-foreground text-sm">Focused preparation strategies for competitive exams and board success.</p>
            </div>
            <div className="feature-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Personal Mentoring</h3>
              <p className="text-muted-foreground text-sm">Individual attention to address each student's unique learning needs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faculty;
