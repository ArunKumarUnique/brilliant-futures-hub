import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { GraduationCap, Award } from 'lucide-react';
import { getIcon } from '@/lib/icon-registry';

const Faculty = () => {
  const { t, tr } = useLanguage();
  const { config } = useTenant();

  const sortedFaculty = [...config.faculty].sort((a, b) => a.priority - b.priority);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('faculty.title')}</h1>
          <p className="text-muted-foreground text-center">{config.instituteName}</p>
        </div>
      </section>

      {/* Faculty Profiles */}
      {sortedFaculty.map((member) => (
        <section key={member.id} className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden card-elevated">
                  <img src={member.image} alt={tr(member.name)} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg">
                  <span className="font-semibold">{tr(member.experience)}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{tr(member.name)}</h2>
                  {member.role && <p className="text-primary font-medium mb-1">{tr(member.role)}</p>}
                  <p className="text-muted-foreground text-lg">{tr(member.qualification)}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-medium">{tr(member.experience)}</span>
                  </div>
                  {member.institution && (
                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                      <GraduationCap className="w-5 h-5 text-secondary" />
                      <span className="font-medium">{tr(member.institution)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('faculty.specializations')}</h3>
                  <ul className="space-y-3">
                    {member.specializations.map((spec, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground">{tr(spec)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {member.quote && (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "{tr(member.quote)}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Teaching Philosophy */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{tr(config.teachingPhilosophy.title)}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {config.teachingPhilosophy.items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={index} className="feature-card">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${item.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'} mb-4`}>
                    <Icon className={`w-7 h-7 ${item.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{tr(item.title)}</h3>
                  <p className="text-muted-foreground text-sm">{tr(item.description)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faculty;
